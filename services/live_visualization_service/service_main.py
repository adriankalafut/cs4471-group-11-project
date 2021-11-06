import flask
import rds_config
import pymysql
import json
from flask import request

app = flask.Flask(__name__)
app.config["DEBUG"] = True

name = rds_config.db_username
password = rds_config.db_password
db_name = rds_config.db_name

@app.route('/example_route_get_btc', methods=['GET'])
def example_route_get_btc():
    try:
        conn = pymysql.connect(host=rds_config.rds_host, user=name,
                           passwd=password, db=db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor)
    except pymysql.MySQLError as e:
        # This should be an actual error
        return str({"Error": "Can't Connect To DB" })

    with conn.cursor() as cur:
        cur.execute("SELECT * FROM coin_data.coin_data WHERE Symbol=\"BTC\" LIMIT 10;")
        query_result = cur.fetchall()
        return str(query_result)
    return str({"Error": "Bad Query"})

@app.route('/example_get_coin_query_parameters', methods=['GET'])
def example_get_coin_query_parameters():
    try:
        conn = pymysql.connect(host=rds_config.rds_host, user=name,
                           passwd=password, db=db_name, connect_timeout=5, cursorclass=pymysql.cursors.DictCursor)
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
        return str(query_result)
    return str({"Error": "Bad Query"})


app.run(debug=True, host='0.0.0.0')