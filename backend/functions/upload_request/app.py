"""Main entry point for presigned url generation"""

import json
import logging
import mimetypes
import os

import boto3
from botocore.config import Config
from botocore.exceptions import ClientError
from mypy_boto3_s3.client import S3Client

BUCKET = os.environ.get("BUCKET_NAME")

s3_client: S3Client = boto3.client("s3", config=Config(signature_version="v4"))


def lambda_handler(event, _):
    """Main function for presigned url function generation"""
    try:
        body = json.loads(event["body"])
        file_name = body["file_name"]

        user_id = 1
        expiration = 300
        key = f"{user_id}/{file_name}"
        (mime, _) = mimetypes.guess_type(file_name)

        response = s3_client.generate_presigned_url(
            ClientMethod="put_object",
            Params={
                "Bucket": BUCKET,
                "Key": key,
                "ContentType": mime,
                # "Expiration": expiration,
            },
        )

        return {
            "statusCode": 200,
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
                "Access-Control-Allow-Methods": "POST",
            },
            "body": json.dumps({"url": response}),
        }
    except ClientError as e:
        logging.error(e)
        return {
            "statusCode": 500,
            "body": e,
        }
