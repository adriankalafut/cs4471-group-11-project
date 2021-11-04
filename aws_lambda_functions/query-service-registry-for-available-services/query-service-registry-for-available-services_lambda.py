# CS4471 -- coinmarket-cap-feeder-lambda
# 2021-10-28
# Group 11

import sys
import logging
import rds_config
import coin_market_cap_api_config
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
                           passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error(
        "ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")


def lambda_handler(event, context):
    """
    This function fetches content from MySQL RDS instance
    """
    result = {}
    # Query RDS Database and return list of services as a JSON.

    return result
