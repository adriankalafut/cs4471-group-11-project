import flask
import rds_config
import pymysql
import json
from flask import request

app = flask.Flask(__name__)
app.config["DEBUG"] = True

rds_host = rds_config.rds_host
rds_username = rds_config.db_username
rds_password = rds_config.db_password
rds_db_name = rds_config.db_name

@app.route('/example_route_get_btc', methods=['GET'])
def example_route_get_btc():
    try:
        conv=pymysql.converters.conversions.copy()
        conv[32]=str       # convert dates to strings
        conn = pymysql.connect(host=rds_host, user=rds_username,
                                passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
    except pymysql.MySQLError as e:
        # This should be an actual error
        return str({"Error": "Can't Connect To DB" })

    with conn.cursor() as cur:
        cur.execute("SELECT * FROM coin_data.coin_data WHERE Symbol=\"BTC\" LIMIT 10;")
        query_result = cur.fetchall()
        return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    return str({"Error": "Bad Query"})

@app.route('/example_get_coin_query_parameters', methods=['GET'])
def example_get_coin_query_parameters():
    try:
        conv=pymysql.converters.conversions.copy()
        conv[32]=str       # convert dates to strings
        conn = pymysql.connect(host=rds_host, user=rds_username,
                                passwd=rds_password, db=rds_db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor, conv=conv)
    except pymysql.MySQLError as e:
        # This should be an actual error
        return str({"Error": "Can't Connect To DB" })

    symbol = request.args.get('symbol', "")
    symbol.strip()
    symbol = conn.escape_string(symbol)
    
    # This is hardcore SQL injection, ignore for now, just wanna test query parameters
    with conn.cursor() as cur:
        cur.execute(f"SELECT * FROM coin_data.coin_data WHERE Symbol=\"{symbol}\" LIMIT 10;")
        query_result = cur.fetchall()
        return json.dumps(query_result, indent=4, sort_keys=True, default=str)
    return str({"Error": "Bad Query"})


app.run(debug=True, host='0.0.0.0')