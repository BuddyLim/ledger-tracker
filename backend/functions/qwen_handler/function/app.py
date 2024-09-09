"""Main file for Qwen2 to do LLM stuff"""

import json
import logging
from typing import List, TypedDict
from botocore.exceptions import ClientError

from llama_cpp import Llama

LOCAL_PATH = "./qwen2-1_5b-instruct-q5_k_m.gguf"

llm = Llama(
    model_path=LOCAL_PATH,
    flash_attn=True,
)


class CatListType(TypedDict):
    id: str
    name: str


class LLMResponseType(TypedDict):
    categories: List[str]


def get_category_suggestion_format(transaction: str, cat_list: List[str]):
    """Formats messages and response json to suggest categories to user"""

    messages = [
        {
            "role": "system",
            "content": "You are a helpful assistant that outputs in JSON.",
        },
        {
            "role": "user",
            "content": f"""
                #Context 1:
                Transaction: "{transaction}",

                #Context 2:
                List of categories {json.dumps(cat_list)}

                #Question:
                What is the 3 most possible categories from the transaction
                """,
        },
    ]

    response_format = {
        "type": "json_object",
        "schema": {
            "type": "object",
            "properties": {
                "categories": {
                    "type": "array",
                    "items": {"type": "string", "enum": cat_list},
                }
            },
            "required": ["categories"],
        },
    }

    return (messages, response_format)


def lambda_handler(event, _):
    """Lambda handler for Qwen2 to perform allowed operation"""
    try:
        body = json.loads(event["body"])
        operation: str = body["operation"]
        logging.info("Performing %s", operation)

        if operation == "category_suggestion":
            transaction: str = body["transaction"]
            cat_obj_list: List[CatListType] = body["cat_list"]
            cat_list = list(map(lambda obj: obj["name"], cat_obj_list))

            logging.info(
                "Transaction: %s, ori cat_list: %s cat_list: %s",
                transaction,
                cat_obj_list,
                cat_list,
            )

            messages, response_format = get_category_suggestion_format(
                transaction=transaction, cat_list=cat_list
            )

            response: LLMResponseType = llm.create_chat_completion(
                messages=messages,
                response_format=response_format,
                temperature=0,
            )["choices"][0]["message"]["content"]

            logging.info("Response: %s, type: %s", response, type(response))

            suggestion_list: List[str] = json.loads(response)["categories"]

            filtered_cat_list = [
                d for d in cat_obj_list if d["name"] in suggestion_list
            ]

            logging.info(
                "Suggestion List: %s, Filtered List: %s",
                suggestion_list,
                filtered_cat_list,
            )
        return {
            "statusCode": 200,
            "body": json.dumps(filtered_cat_list),
            "headers": {
                "Access-Control-Allow-Origin": "*",  # Required for CORS support to work
                "Access-Control-Allow-Methods": "POST",
            },
        }
    except ClientError as e:
        return {
            "statusCode": 500,
            "body": e,
        }
