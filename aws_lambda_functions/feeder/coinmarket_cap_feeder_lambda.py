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

    # Parse Event info if provided
    number_of_results = coin_market_cap_api_config.coin_market_cap_limit_number_of_results
    if event is not None:
        number_of_results = event.get('number_of_results', coin_market_cap_api_config.coin_market_cap_limit_number_of_results)

    url = coin_market_cap_api_config.coin_market_cap_url
    parameters = {
        'start': '1',
        'limit': number_of_results,
        'convert': 'CAD'
    }
    headers = {
        'Accepts': 'application/json',
        'X-CMC_PRO_API_KEY': coin_market_cap_api_config.coin_market_cap_api_key,
    }

    session = Session()
    session.headers.update(headers)

    try:
        response = session.get(url, params=parameters)
        data = json.loads(response.text)
        
        if data.get('status', {}).get('error_code', None) is not None and data.get('status', {}).get('error_code', 0) != 0:
            return "Error: Connecting to coin_market_cap_api. API Request Failure"

        if data.get('data', None) is None:
            return "Error: Connecting to coin_market_cap_api. No data returned"

        stock_data = data.get('data', [])
        for json_stock_data in stock_data:
            coin_name = json_stock_data.get('name', "")
            coin_symbol = json_stock_data.get('symbol', "")
            coin_price = json_stock_data.get(
                'quote', {}).get('CAD', {}).get('price', 0)
            coin_market_cap = json_stock_data.get(
                'quote', {}).get('CAD', {}).get('market_cap', 0)
            coin_volume = json_stock_data.get(
                'quote', {}).get('CAD', {}).get('volume_24h', 0)
            coin_last_updated = json_stock_data.get(
                'quote', {}).get('CAD', {}).get('last_updated', 0)

            with conn.cursor() as cur:
                cur.execute(
                    f'insert into coin_data (Name, Symbol, Price, MarketCap, Volume, Last_Updated) values("{coin_name}", "{coin_symbol}", {coin_price}, {coin_market_cap}, {coin_volume}, "{coin_last_updated}")')

            conn.commit()

    except (ConnectionError, Timeout, TooManyRedirects) as e:
        print(e)

    return "Complete"
