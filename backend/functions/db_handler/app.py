"""Main entry point for db CRUD functions"""

import json
import logging
import os

from botocore.exceptions import ClientError
from sqlalchemy import create_engine, Connection
from sqlalchemy.sql import text
from uuid import uuid4, UUID
from datetime import datetime

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


#  There should be functions should be handle new users creation flow where they define``
#     their:
#         - Initial user data
#         - Initial accounts
#         - Initial categories and subcategories


def create_new_account(account_name: str, currency: str, description: str, uid: str):
    aid = uuid4()

    stm = text("""
    INSERT INTO public.account (id, name, currency, description, creation_date, user_id)
    VALUES (:id, :name, :currency, :description, :creation_date, :user_id);
    """).bindparams(
        id=aid,
        name=account_name,
        currency=currency,
        description=description,
        creation_date=datetime.now(),
        user_id=uid,
    )

    pass


def create_new_categories(cat_name: str, uid: UUID, tid: UUID):
    cid = uuid4()

    stm = text("""
    INSERT INTO public.category (id, category_name, user_id, type_id)
    VALUES (:id, :category_name, :user_id, :type_id);
    """).bindparams(id=cid, category_name=cat_name, user_id=uid, type_id=tid)

    return (stm, cid)


def create_new_subcateogries(subcat_name: str, uid: UUID, cid: UUID, tid: UUID):
    scid = uuid4()

    stm = text("""
    INSERT INTO public.sub_category (id, category_id, sub_category_name, user_id, type_id)
    VALUES (:id, :category_id, :sub_category_name, :user_id, :type_id); """).bindparams(
        id=scid,
        category_id=cid,
        sub_category_name=subcat_name,
        user_id=uid,
        type_id=tid,
    )

    return stm


# def create_new_user():
#     pass


def onboard_new_user(con: Connection, cat_data_list):
    uid = "852c2d4a-2d80-4a69-88a6-268e6e50b885"
    cat_data_list = [
        {
            "type_id": "7b4f9d21-f711-4756-92d0-dec4488e0895",
            "name": "Dining Out",
            "sub_categories": [
                {"name": "Lunch"},
                {"name": "Dinner"},
                {"name": "Supper"},
            ],
        },
        {
            "type_id": "7b4f9d21-f711-4756-92d0-dec4488e0895",
            "name": "Retail",
            "sub_categories": [
                {"name": "House"},
                {"name": "Clothes"},
            ],
        },
    ]

    for cat_data in cat_data_list:
        cat_name = cat_data["name"]
        tid = cat_data["type_id"]
        # create_new_user()
        (stm, cid) = create_new_categories(uid=uid, tid=tid, cat_name=cat_name)
        con.execute(stm)
        con.commit()

        for sub_cat_data in cat_data["sub_categories"]:
            subcat_name = sub_cat_data["name"]
            stm = create_new_subcateogries(
                subcat_name=subcat_name, uid=uid, cid=cid, tid=tid
            )
            con.execute(stm)
        con.commit()


def lambda_handler(event, _):
    """Main function for database handling"""
    body = json.loads(event["body"])
    cat_data_list = body["cat_data_list"]
    path = event["requestContext"]["path"]
    try:
        with engine.connect() as con:
            if path == "/users/new":
                onboard_new_user(con, cat_data_list)

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
                "Content-Type": "application/json",
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
