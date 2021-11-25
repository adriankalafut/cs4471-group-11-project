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

"""
    Return all service subscriptions of the user specified via param
    Expected parameters: 'user=<name_of_user>'
"""
@app.route('/subscriptions', methods=['GET'])
def get_user_subscriptions():
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

        # Get the username 
        user = request.args.get("user")
        user.strip()
        user = conn.escape_string(user)

        # Check if in redis already (under 5 mins)
        subscriptions = redisConnection.get(user +"_subscriptions")
        if subscriptions:
            subscriptions = eval(subscriptions)
        current_time = datetime.datetime.now()
        
        if subscriptions and subscriptions.get('time', None) and (current_time - parser.parse(subscriptions.get('time', ""))) < datetime.timedelta(minutes=1):
            return str(subscriptions.get('data', {"Error": "Bad Redis Data"}))

        with conn.cursor() as cur:
            cur.execute(
                f"SELECT subscribed_service FROM user_prefs WHERE user_name='{user}'")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                        "time": str(datetime.datetime.now())}
            redisConnection.set(user +"_subscriptions", str(redisObject))
            return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

"""
    Create app route for subscribing services to a user
    Expected parameters: 'service=<service_name> user=<name_of_user>'
"""
@app.route('/subscribe', methods=['GET'])
def subscribe_to_service():
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

        # Get the user that is subscribing
        user = request.args.get("user")
        # Get the service that will be subscribed to
        service = request.args.get("service")

        if(user is None or service is None):
            user.strip()
            service.strip()

        user = conn.escape_string(user)
        service = conn.escape_string(service)

        # Modify db table to specify the new service that the user is subscribed to
        with conn.cursor() as cur:

            # --------------  Add subscription to table -------------- 
            cur.execute(
                f"INSERT INTO coin_data.user_prefs VALUES ('{user}','{service}');")
            query_result = conn.commit();


            # --------------  Ensure subscription has been added -------------- 
            # Look in the db table to ensure that the new service has been added for user
            cur.execute(
                f"SELECT * FROM user_prefs WHERE user_name='{user}' AND subscribed_service='{service}';")
            query_result = cur.fetchall()

            # Check if the record was not added to the table
            if(cur.rowcount == 0):
                return json.dumps('{"Status": "False"}', indent=4, sort_keys=True, default=str)


            # --------------  Update redis with recent changes -------------- 
            # Grab services subscribed to user
            cur.execute(
                f"SELECT subscribed_service FROM user_prefs WHERE user_name='{user}'")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                        "time": str(datetime.datetime.now())}
            redisConnection.set(user +"_subscriptions", str(redisObject))

        return json.dumps('{"Status":"True"}', indent=4, sort_keys=True, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

"""
    Create app route for unsubscribing a service to a user
    Expected parameters: 'service=<service_name> user=<name_of_user>'
"""
@app.route('/unsubscribe', methods=['GET'])
def unsubscribe_to_service():
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

        # Get the user that is unsubscribing
        user = request.args.get("user")
        # Get the service that will be unsubscribed to
        service = request.args.get("service")

        if(user is None or service is None):
            user.strip()
            service.strip()

        user = conn.escape_string(user)
        service = conn.escape_string(service)

        with conn.cursor() as cur:

            # --------------  Remove subscription from table -------------- 
            cur.execute(
                f"DELETE FROM coin_data.user_prefs WHERE user_name='{user}' AND subscribed_service='{service}';")
            query_result = conn.commit();
            

            # --------------  Ensure subscription has been removed -------------- 
            # Look in the db table to ensure that the new service has been removed for user
            cur.execute(
                f"SELECT * FROM user_prefs WHERE user_name='{user}' AND subscribed_service='{service}';")
            query_result = cur.fetchall()

            # Check if the record was deleted from the table
            if(cur.rowcount == 0):
                return json.dumps('{"Status":"True"}', indent=4, sort_keys=True, default=str)


            # --------------  Update redis with recent changes -------------- 
            # Grab services subscribed to user
            cur.execute(
                f"SELECT subscribed_service FROM user_prefs WHERE user_name='{user}'")
            query_result = cur.fetchall()

            # Add To Redis
            redisObject = {"data": json.dumps(query_result, indent=4, default=str),
                        "time": str(datetime.datetime.now())}
            redisConnection.set(user +"_subscriptions", str(redisObject))

        return json.dumps('{"Status": "False"}', indent=4, sort_keys=True, default=str)
    except BaseException as error:
        return str({"Error": f"Bad Query {error}"})

app.run(debug=True, host='0.0.0.0')
