# CS4471 -- update-service-in-service-registry
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

#This function updates the service registry with the information passed in the event object
def lambda_handler(event, context):
    print(">>>>> Entering update-service-to-service-registry lambda function")

    #Make sure that the event is formatted correctly and is an ECS Task Event
    if isEcsTaskEvent(event) is False:
        print('(">>>>> Leaving lambda function.')
        return

    detail = event['detail']

    # Get the targetted status
    desiredStatus = getDesiredStatus(detail)

    #Get the previous status
    lastStatus = getLastStatus(detail)

    #Get the service name
    serviceName = getServiceName(detail)


    #Return if any value is None
    if lastStatus is None or desiredStatus is None or serviceName is None:
        print('(">>>>> Leaving lambda function.')
        return

    #Trim the prefix of the service name
    if 'service:'in serviceName:
        serviceName = serviceName[len('service:'):]

    #The service is in a STOPPED state
    if lastStatus == 'STOPPED' and desiredStatus == 'STOPPED':
        print(">>>>> " + serviceName + " is in a STOPPED state.\n>>>>> Remove service from service registry.")
        removeServiceFromServiceRegistry(conn, serviceName)

    #The service is in a RUNNING state
    elif lastStatus == 'RUNNING' and desiredStatus == 'RUNNING':
        print(">>>>> " + serviceName + " is in a RUNNING state.\n>>>>> Add service to service registry.")
        addServiceToServiceRegistry(conn, serviceName)

"""
    Esure that the passed event param is an ECS Task Event
    @param event the JSON event object
    @return True if the event is an ECS Task Event, otherwise False
"""
def isEcsTaskEvent(event):
    if 'source' not in event or 'detail-type' not in event:
        print ('(">>>>> source/detail-type is NOT in the event.')
        return False

    if 'detail' not in event:
        print ('(">>>>> detail is NOT in the event.')
        return False

    if event['source'] != 'aws.ecs':
        print ('(">>>>> source is NOT aws.ecs.')
        return False

    if event['detail-type'] !=  "ECS Task State Change":
        print ('(">>>>> event detail type is NOT ECS Task State.')
        return False
    return True


""" 
    Get desiredStatus value from passed JSON object
    @param detail the 'detail' object in event JSON
    @return desiredStatus value, otherwise None
"""
def getDesiredStatus(detail):
    if 'desiredStatus' not in detail:
        print('(">>>>> desiredStatus is NOT in event[detail].')
        return None
    return detail['desiredStatus']


""" 
    Get lastStatus value from passed JSON object
    @param detail the 'detail' object in event JSON
    @return lastStatus value, otherwise None
"""
def getLastStatus(detail):
    if 'lastStatus' not in detail:
        print('(">>>>> lastStatus is NOT in event[detail].')
        return None
    return detail['lastStatus']

""" 
    Get service name value from the passed JSON object
    @param detail the 'detail' object in event JSON
    @return service name value, otherwise None
"""
def getServiceName(detail):
    if 'group' not in detail:
        print('(">>>>> group is NOT in event[detail].')
        return None
    return detail['group'] 


"""
    Add the specified serviceName to the service registry (via conn)
    @param conn the connection to our mysql table
    @param serviceName the service to add to the service registry
"""
def addServiceToServiceRegistry(conn,serviceName):
    try:

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

"""
    Remove the specified serviceName from the service registry (via conn)
    @param conn the connection to our mysql table
    @param serviceName the service to remove from the service registry
"""
def removeServiceFromServiceRegistry(conn,serviceName):
    try:

        with conn.cursor() as cur:

            #Check if the service-name exists
            cur.execute(
                f'SELECT * FROM service_registry WHERE service_name="' + serviceName + '";')
            result = cur.fetchone()

            #If it does not exist, add the service record into the service_registry table
            if result is None:
                cur.execute(f'INSERT INTO service_registry (service_name,active) VALUES ("' + serviceName + '","FALSE");')
            
            #Otherwise, update the service record in the service_registry table
            else:
                cur.execute(f'UPDATE service_registry SET active="FALSE" WHERE service_name="' + serviceName + '";')
            
            conn.commit()

    except Exception as e:
        print(e)
