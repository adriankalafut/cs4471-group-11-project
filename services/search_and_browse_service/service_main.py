import flask
import rds_config
import redis_config
import pymysql
import sys
import json
import datetime
import redis
from dateutil import parser
from flask import request
from pymysql.converters import conversions

app = flask.Flask(__name__)
app.config["DEBUG"] = True


isDevRegion = False

rds_host = rds_config.rds_host
rds_username = rds_config.db_username
rds_password = rds_config.db_password
rds_db_name = rds_config.db_name

# Note - Redis cannot be externally accessed outside of AWS.
# You must run a local instance of redis while developing

redis_host = redis_config.redis_host

if isDevRegion:
    redis_host = 'localhost'

@app.route('/coins/all', methods=['GET'])
def get_all_coin_names():
    try:
        redisConnection = None
        try:
            conv=pymysql.converters.conversions.copy()
            conv[32]=str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
            redisConnection = redis.Redis(host=redis_host, port=6379, db=0, decode_responses=True)
        except pymysql.MySQLError as e:
            # This should be an actual error
            return str({"Error": "Can't Connect To DB"})

        symbol = request.args.get('symbol', "")
        symbol.strip()
        symbol = conn.escape_string(symbol)

        # Check if in redis already (under 5 mins)
        coin_names = redisConnection.get('Coin_Names')
        if coin_names:
            coin_names = eval(coin_names)
        current_time = datetime.datetime.now()
        
        if coin_names and coin_names.get('time', None) and (current_time - parser.parse(coin_names.get('time', ""))) < datetime.timedelta(minutes=1):
            return str(coin_names.get('data', {"Error": "Bad Redis Data"}))

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT DISTINCT coin_data.Name, coin_data.Symbol FROM coin_data.coin_data;")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                        "time": str(datetime.datetime.now())}
            redisConnection.set('Coin_Names', str(redisObject))
            return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})


@app.route('/coins', methods=['GET'])
def get_specific_coin():
    try:
        redisConnection = None
        try:
            conv=pymysql.converters.conversions.copy()
            conv[32]=str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
            redisConnection = redis.Redis(host=redis_host, port=6379, db=0, decode_responses=True)
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
                f"SELECT * FROM coin_data.coin_data where coin_data.Symbol='{symbol}' order by coin_id desc LIMIT 1;")
            query_result = cur.fetchone()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                        "time": str(datetime.datetime.now())}
            redisConnection.set(f"Current_{symbol}", str(redisObject))
            return json.dumps(query_result, indent=4, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

app.run(debug=True, host='0.0.0.0')
