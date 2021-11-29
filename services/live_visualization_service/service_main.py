import flask
import rds_config
import pymysql
import json
import datetime
from flask import request
import redis
import redis_config
from dateutil import parser


app = flask.Flask(__name__)
app.config["DEBUG"] = True

isDevRegion = True

rds_host = rds_config.rds_host
rds_username = rds_config.db_username
rds_password = rds_config.db_password
rds_db_name = rds_config.db_name

# Note - Redis cannot be externally accessed outside of AWS.
# You must run a local instance of redis while developing

redis_host = redis_config.redis_host

if isDevRegion:
    redis_host = 'localhost'


@app.route('/example_route_get_btc', methods=['GET'])
def example_route_get_btc():
    try:
        conv = pymysql.converters.conversions.copy()
        conv[32] = str       # convert dates to strings
        conn = pymysql.connect(host=rds_host, user=rds_username,
                               passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
    except pymysql.MySQLError as e:
        # This should be an actual error
        return str({"Error": "Can't Connect To DB"})

    with conn.cursor() as cur:
        cur.execute(
            "SELECT * FROM coin_data.coin_data WHERE Symbol=\"BTC\" LIMIT 10;")
        query_result = cur.fetchall()
        return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    return str({"Error": "Bad Query"})


@app.route('/example_get_coin_query_parameters', methods=['GET'])
def example_get_coin_query_parameters():
    try:
        conv = pymysql.converters.conversions.copy()
        conv[32] = str       # convert dates to strings
        conn = pymysql.connect(host=rds_host, user=rds_username,
                               passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
    except pymysql.MySQLError as e:
        # This should be an actual error
        return str({"Error": "Can't Connect To DB"})

    symbol = request.args.get('symbol', "")
    symbol.strip()
    symbol = conn.escape_string(symbol)

    # This is hardcore SQL injection, ignore for now, just wanna test query parameters
    with conn.cursor() as cur:
        cur.execute(
            f"SELECT * FROM coin_data.coin_data WHERE Symbol=\"{symbol}\" LIMIT 10;")
        query_result = cur.fetchall()
        return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    return str({"Error": "Bad Query"})

# get last 30 days data


@app.route('/coins/history/onemonth', methods=['GET'])
def coins_history_onemonth():
    try:
        redisConnection = None
        try:
            conv = pymysql.converters.conversions.copy()
            conv[32] = str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                   passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
            redisConnection = redis.Redis(
                host=redis_host, port=6379, db=0, decode_responses=True)
        except pymysql.MySQLError as e:
            # This should be an actual error
            return str({"Error": "Can't Connect To DB"})

        symbol = request.args.get('symbol', "")
        symbol.strip()
        symbol = conn.escape_string(symbol)

        # Check if in redis already (under 5 mins)
        coin_data = redisConnection.get(f"Current_{symbol}")
        if coin_data:
            coin_data = eval(coin_data)
        current_time = datetime.datetime.now()

        if coin_data and coin_data.get('time', None) and (current_time - parser.parse(coin_data.get('time', ""))) < datetime.timedelta(minutes=1):
            return str(coin_data.get('data', {"Error": "Bad Redis Data"}))

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT * FROM coin_data.coin_data c INNER JOIN ( SELECT MAX(Price) AS max_price FROM coin_data WHERE Symbol=\"{symbol}\" AND DATE(Last_Updated) BETWEEN NOW() - INTERVAL 30 DAY AND NOW() GROUP BY DAY(Last_Updated)) t ON t.max_price = c.Price")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                           "time": str(datetime.datetime.now())}
            redisConnection.set(f"Current_{symbol}", str(redisObject))
            return json.dumps(query_result, indent=4, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

# get last 7 days data


@app.route('/coins/history/sevendays', methods=['GET'])
def coins_history_sevendays():
    try:
        redisConnection = None
        try:
            conv = pymysql.converters.conversions.copy()
            conv[32] = str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                   passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
            redisConnection = redis.Redis(
                host=redis_host, port=6379, db=0, decode_responses=True)
        except pymysql.MySQLError as e:
            # This should be an actual error
            return str({"Error": "Can't Connect To DB"})

        symbol = request.args.get('symbol', "")
        symbol.strip()
        symbol = conn.escape_string(symbol)

        # Check if in redis already (under 5 mins)
        coin_data = redisConnection.get(f"Current_{symbol}")
        if coin_data:
            coin_data = eval(coin_data)
        current_time = datetime.datetime.now()

        if coin_data and coin_data.get('time', None) and (current_time - parser.parse(coin_data.get('time', ""))) < datetime.timedelta(minutes=1):
            return str(coin_data.get('data', {"Error": "Bad Redis Data"}))

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT * FROM coin_data.coin_data c INNER JOIN ( SELECT MAX(Price) AS max_price FROM coin_data WHERE Symbol=\"{symbol}\" AND DATE(Last_Updated) BETWEEN NOW() - INTERVAL 7 DAY AND NOW() GROUP BY DAY(Last_Updated)) t ON t.max_price = c.Price")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                           "time": str(datetime.datetime.now())}
            redisConnection.set(f"Current_{symbol}", str(redisObject))
            return json.dumps(query_result, indent=4, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

# get last 24 hours data


@app.route('/coins/history/today', methods=['GET'])
def coins_history_today():
    try:
        redisConnection = None
        try:
            conv = pymysql.converters.conversions.copy()
            conv[32] = str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                   passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
            redisConnection = redis.Redis(
                host=redis_host, port=6379, db=0, decode_responses=True)
        except pymysql.MySQLError as e:
            # This should be an actual error
            return str({"Error": "Can't Connect To DB"})

        symbol = request.args.get('symbol', "")
        symbol.strip()
        symbol = conn.escape_string(symbol)

        # Check if in redis already (under 5 mins)
        coin_data = redisConnection.get(f"Current_{symbol}")
        if coin_data:
            coin_data = eval(coin_data)
        current_time = datetime.datetime.now()

        if coin_data and coin_data.get('time', None) and (current_time - parser.parse(coin_data.get('time', ""))) < datetime.timedelta(minutes=1):
            return str(coin_data.get('data', {"Error": "Bad Redis Data"}))

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT * FROM coin_data.coin_data c INNER JOIN ( SELECT MAX(Price) AS max_price FROM coin_data WHERE Symbol=\"{symbol}\" AND DATE(Last_Updated) >= DATE(NOW() - INTERVAL 1 DAY) GROUP BY HOUR(Last_Updated)) t ON t.max_price = c.Price")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                           "time": str(datetime.datetime.now())}
            redisConnection.set(f"Current_{symbol}", str(redisObject))
            return json.dumps(query_result, indent=4, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})


app.run(debug=True, host='0.0.0.0')
