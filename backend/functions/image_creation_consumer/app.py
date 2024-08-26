"""Main entry point for presigned url generation"""

import base64
import json
import logging
import mimetypes
import os

from datetime import date
import boto3
from botocore.exceptions import ClientError
from mypy_boto3_s3.client import S3Client

BUCKET_NAME = os.environ.get("BUCKET_NAME")
MODEL_ID = "anthropic.claude-3-haiku-20240307-v1:0"
s3_client: S3Client = boto3.client("s3")
bedrock_runtime = boto3.client(
    service_name="bedrock-runtime",  # see sample code below for how I used Claude 3.5 Sonnet model
    region_name="ap-northeast-1",  # check docs - not all models are available in all regions
)


def convert_s3_image_to_b64(key: str) -> str:
    """Converts s3 object to b64 for bedrock"""
    if BUCKET_NAME is None:
        logging.error(msg=f"BUCKET_NAME is not set: {BUCKET_NAME}")
        raise EnvironmentError("BUCKET_NAME environement variable is not set!")

    logging.info(msg=f"Converting image from {BUCKET_NAME}, {key}")
    obj = s3_client.get_object(Bucket=BUCKET_NAME, Key=key)
    object_content = obj["Body"].read()
    b64_image = base64.b64encode(object_content).decode("ASCII")
    return b64_image


def query_llm_response(b64_img: str, file_type: str):
    """Queries C3H for data extection"""

    try:
        today = date.today()
        formatted_today = today.strftime("%d/%m/%Y")
        cat_list = ["transportation", "shopping", "dining", "grocery"]
        output_format = json.dumps(
            {"category": "string", "amount": "number", "date": "date", "name": "name"}
        )

        prompt = f"""
        You are a data extractor for images that outputs only json array objects. Produce only a json array output and do not put any text outside of the json array. Make sure you capture all the information provided.
        
        Use the image provided to extract information

        <instructions>
        1. Extract the transactions based on user's specified category: {json.dumps(cat_list)}
        2. Provide the transaction date with the format of DD-MM-YYYY based on the date of {formatted_today}
        </instructions>

        Make sure you do not include anything that is not inside the image and return your response only in JSON format:
        <formatting_example>
        {output_format}
        </formatting_example>
        """

        request_body = json.dumps(
            {
                "anthropic_version": "bedrock-2023-05-31",
                "max_tokens": 3000,
                "temperature": 0,
                "messages": [
                    {
                        "role": "user",
                        "content": [
                            {
                                "type": "image",
                                "source": {
                                    "type": "base64",
                                    "media_type": file_type,
                                    "data": b64_img,
                                },
                            },
                            {"type": "text", "text": prompt},
                        ],
                    }
                ],
            }
        )

        response = bedrock_runtime.invoke_model(modelId=MODEL_ID, body=request_body)
        response_body = json.loads(response["body"].read())
        generated_text = response_body["content"][0]["text"]

        logging.info(generated_text)
    except ClientError as e:
        logging.error("An error occurred: %s", e.response["Error"]["Message"])  # type: ignore


def lambda_handler(event, _):
    """Main function for presigned url function generation"""
    try:
        s3_notification = json.loads(event["Records"][0]["body"])
        s3_object_data = s3_notification["Records"][0]["s3"]
        key = s3_object_data["object"]["key"]

        b64_img = convert_s3_image_to_b64(key=key)
        (mime, _) = mimetypes.guess_type(key)

        if mime is None:
            raise RuntimeError(f"Invalid extension found for {key}!")

        query_llm_response(b64_img=b64_img, file_type=mime)

        return {"statusCode": 200}
    except ClientError as e:
        logging.error(e)
        return {
            "statusCode": 500,
            "body": e,
        }
