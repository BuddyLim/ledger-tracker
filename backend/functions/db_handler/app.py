"""Main entry point for db CRUD functions"""

import json
import logging
import os

from botocore.exceptions import ClientError
from sqlalchemy import create_engine
from sqlalchemy.sql import text

USER = os.environ.get("DB_USER")
PWD = os.environ.get("DB_PWD")
IP = os.environ.get("DB_IP")
DB_NAME = os.environ.get("DB_NAME")

engine = create_engine(f"postgresql://{USER}:{PWD}@{IP}/{DB_NAME}")


def lambda_handler(event, _):
    """Main function for presigned url function generation"""
    try:
        sql = """
        SELECT *
        FROM user_table

        """

        with engine.connect() as con:
            statement = text(sql)
            res = con.execute(statement)

            print(res.all())

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
                "Access-Control-Allow-Methods": "POST",
            },
            "body": json.dumps({"res": res.all()}),
        }
    except ClientError as e:
        logging.error(e)
        return {
            "statusCode": 500,
            "body": e,
        }
