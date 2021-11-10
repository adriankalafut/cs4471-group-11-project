# CS4471 -- add-service-to-service-registry_lambda
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
                           passwd=password, db=db_name, connect_timeout=5)
except pymysql.MySQLError as e:
    logger.error(
        "ERROR: Unexpected error: Could not connect to MySQL instance.")
    logger.error(e)
    sys.exit()

logger.info("SUCCESS: Connection to RDS MySQL instance succeeded")


def lambda_handler(event, context):
    
    #This function updates the service registry with the information passed in the event object
    try:
        serviceName = event['Service-Name']
        with conn.cursor() as cur:

            #Check if the service-name exists
            cur.execute(
                f'SELECT * FROM service_registry WHERE service_name="' + serviceName + '";')
            result = cur.fetchone()

            #If it does not exist, add the service record into the service_registry table
            if result is None:
                cur.execute(f'INSERT INTO service_registry (service_name,active) VALUES ("' + serviceName + '","TRUE");')
            
            #Otherwise, update the service record in the service_registry table
            else:
                cur.execute(f'UPDATE service_registry SET active="TRUE" WHERE service_name="' + serviceName + '";')
            
            conn.commit()

    except Exception as e:
        print(e)


    
