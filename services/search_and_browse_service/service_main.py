import flask
import rds_config
import iot_config
import redis_config
import pymysql
import sys
import json
import datetime
import redis
from awscrt import io, mqtt, auth, http
from awsiot import mqtt_connection_builder
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

IOT_ENDPOINT= iot_config.IOT_ENDPOINT
ROOT_CA_PATH=iot_config.ROOT_CA_PATH
PUBLIC_KEY_PATH=iot_config.PUBLIC_KEY_PATH
PRIVATE_KEY_PATH=iot_config.PRIVATE_KEY_PATH
CLIENT_ID=iot_config.CLIENT_ID

# Note - Redis cannot be externally accessed outside of AWS.
# You must run a local instance of redis while developing

redis_host = redis_config.redis_host

if isDevRegion:
    redis_host = 'localhost'

@app.route('/coins/all', methods=['GET'])
def get_all_coin_names():
    return get_all_coin_names_resolver()

def get_all_coin_names_resolver():
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
                f"SELECT coin_data.Name, coin_data.Symbol, coin_data.Price FROM coin_data.coin_data WHERE Last_Updated = (SELECT Last_Updated FROM coin_data ORDER BY Last_Updated DESC LIMIT 1);")
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

def helper_lookup_all_coins_info_for_lambda():
    try:
        redisConnection = None
        try:
            conv=pymysql.converters.conversions.copy()
            conv[32]=str       # convert dates to strings
            conn = pymysql.connect(host=rds_host, user=rds_username,
                                passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
        except pymysql.MySQLError as e:
            # This should be an actual error
            return str({"Error": "Can't Connect To DB"})

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT * FROM coin_data.coin_data WHERE Last_Updated = (SELECT Last_Updated FROM coin_data ORDER BY Last_Updated DESC LIMIT 1);")
            query_result = cur.fetchall()

            return query_result
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

@app.route('/coins/lambda_invoke_update', methods=['GET'])
def lambda_invoke_update():
    try:
        event_loop_group = io.EventLoopGroup(1)
        host_resolver = io.DefaultHostResolver(event_loop_group)
        client_bootstrap = io.ClientBootstrap(event_loop_group, host_resolver)
        mqtt_connection = mqtt_connection_builder.mtls_from_path(
                    endpoint=IOT_ENDPOINT,
                    cert_filepath=PUBLIC_KEY_PATH,
                    pri_key_filepath=PRIVATE_KEY_PATH,
                    client_bootstrap=client_bootstrap,
                    ca_filepath=ROOT_CA_PATH,
                    client_id=CLIENT_ID,
                    clean_session=False,
                    keep_alive_secs=6,
                    port=8883
                    )
        connect_future = mqtt_connection.connect()
        
        # Re-Issue Any Calls which the frontend might want 
        browse_CoinsResult = get_all_coin_names()
        search_CoinResult = helper_lookup_all_coins_info_for_lambda()

        # Future.result() waits until a result is available
        connect_future.result()
        
        # For 'Search'
        mqtt_connection.publish(topic="Search_and_Browse_Pub_Sub_Update", payload="{\"AllCoinsData\": " + browse_CoinsResult + "}" , qos=mqtt.QoS.AT_LEAST_ONCE)

        # For 'Browse'
        for element in search_CoinResult:
            mqtt_connection.publish(topic=f"Search_and_Browse_{element.get('Symbol', '')}", payload="{\"Single_Coin_Data\": " + json.dumps(element, indent=4, default=str) + "}" , qos=mqtt.QoS.AT_LEAST_ONCE)
        

        disconnect_future = mqtt_connection.disconnect()
        disconnect_future.result()
    except BaseException as error:
        return str({"Error": f"Bad Call {error}"})
    return "Success"

app.run(debug=True, host='0.0.0.0')
