# CS4471 -- coinmarket-cap-feeder-lambda
# 2021-10-28
# Group 11

import sys
import logging
import rds_config
import pymysql
from requests import Request, Session
from requests.exceptions import ConnectionError, Timeout, TooManyRedirects
import json

# rds settings
name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

logger = logging.getLogger()
logger.setLevel(logging.INFO)


try:
    conn = pymysql.connect(host=rds_config.rds_host, user=name,
                           passwd=password, db=db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor)
except pymysql.MySQLError as e:
    logger.error(
        "ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

def lambda_handler(event, context):
    """
    This function fetches content from MySQL RDS instance
    """
    result = {}
    # Query RDS Database and return list of services as a JSON.
    try:

        with conn.cursor() as cur:

            #Check if the service-name exists
            cur.execute(
                f'SELECT service_name FROM service_registry.service_registry where active = "TRUE";')
            query_result = cur.fetchall()
            return json.dumps(query_result, indent=4, sort_keys=True, default=str)     
    except Exception as e:
        print(e)
    
    return str({"Error": "Bad Query"})