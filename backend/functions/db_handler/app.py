"""Main entry point for db CRUD functions"""

import json
import logging
import os

from botocore.exceptions import ClientError
from sqlalchemy import create_engine, Table, Column, Integer, String
from sqlalchemy.sql import text
from uuid import uuid4

USER = os.environ.get("DB_USER")
PWD = os.environ.get("DB_PWD")
IP = os.environ.get("DB_IP")
DB_NAME = os.environ.get("DB_NAME")

engine = create_engine(f"postgresql://{USER}:{PWD}@{IP}/{DB_NAME}")


def add_new_transaction():
    """Handles adding new transaction for users"""
    try:
        print("Add new table")
    except ClientError as e:
        raise (e)


def add_new_user():
    try:
        
    except ClientError as e:

    pass


def lambda_handler(event, _):
    """Main function for database handling"""
    body = json.loads(event["body"])
    name = body["name"]
    pswd = body["password"]
    email = body["email"]
    # path = event["requestContext"]["http"]["path"]
    # print(event["requestContext"])
    print(engine)
    if event["requestContext"]["path"] == "/transactions/add":
        print("Add new transaction here")
    try:
        # stm = text("SELECT * FROM public.ledger_user")

        stm = text("""
        INSERT INTO public.ledger_user (id, name, hash_password, email)
        VALUES (:id, :name, :hash_password, :email);
        """).bindparams(id=uuid4(), name=name, hash_password=pswd, email=email)

        with engine.connect() as con:
            con.execute(stm)
            con.commit()

            # print(res.all())

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
                "Access-Control-Allow-Methods": "POST",
            },
            "body": json.dumps({"res": True}),
        }
    except ClientError as e:
        logging.error(e)
        return {
            "statusCode": 500,
            "body": e,
        }
