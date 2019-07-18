# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from boto3.dynamodb.conditions import Key, Attr
from copy import deepcopy
from flask import request, make_response, jsonify
from utility import err_message, message, VOTES, USERS, ROASTS, ARTICLES,check_user_write_access
import uuid
import requests
import json
import copy


def votes_votes(user):
    body = request.get_json()

    #check nulls and types
    if(not "db_id" in body):
        return message(400,"no db_id")

    if(not isinstance(body["db_id"],str)):
        return message(400,"db_id should be a string")

    if(not "db_type" in body):
        return message(400,"no db_type")

    if((not isinstance(body["db_type"],str)) or (not body["db_type"] in ["ARTICLES","ROASTS"])):
        return message(400,"db_type should be str and should be in ARTICLES, ROASTS")        

    if(not "vote_id" in body):
        return message(400,"no vote_id")        

    if(not isinstance(body["vote_id"],str)):
        return message(400,"vote_id should be str")        

    if(not "checkedOptions" in body):
        return message(400,"no checkedOptions")

    if(not all(isinstance(item, int) for item in body["checkedOptions"])):
        return message(400,"all checkedOptions should be integers")

    if(len(body["checkedOptions"]) == 0):
        return message(404,"empty checkedOptions")
    
    #assign variables
    db_id = body["db_id"]
    db_type = body["db_type"]
    vote_id = body["vote_id"]
    checkedOptions = body["checkedOptions"]
    
    #check if the user has already voted
    response = VOTES.get_item(
        Key={
            'vote_id_uid': vote_id + "_" +user["uid"],
        }
    )

    #if is, return 409
    if "Item" in response:
        return message(409,"conflict: you have voted")
        
    #else, check if the article still valid
    

    if db_type == "ROASTS":
        rid = db_id
        try:
            response = ROASTS.get_item(
                    Key={
                        "visible":"True",
                        "rid":rid
                    }
                )
        except Exception as e:
            return err_message(e)   
        if "Item" not in response:
            return message(400,"roast does not exist")
        else: 
            cur_content = copy.deepcopy(response["Item"]["content"])
        
        for content in cur_content:
            if content["type"] == "vote":
                vote_counts = copy.deepcopy(content["counts"])
                for checked in checkedOptions:
                    content["counts"][checked] += 1
                    vote_counts[checked] += 1
        try:
            result = ROASTS.update_item(
                    Key={
                        "visible":"True",
                        "rid":rid
                    },
                    UpdateExpression="SET content = :j",
                    ExpressionAttributeValues={
                        ':j': cur_content
                    },
                )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ROASTS, please try again.")

    elif db_type == "ARTICLES":
        result = check_user_write_access(user)
        if result != True:
            return result
        aid = db_id
        try:
            response = ARTICLES.get_item(
                    Key={
                        "partial_visible":"True",
                        "aid":aid
                    }
                )
        except Exception as e:
                return err_message(e)
        if "Item" not in response:
            return message(400,"article does not exist")

        else: 
            cur_content = copy.deepcopy(response["Item"]["content"])

        for content in cur_content:
            if content["type"] == "vote":
                vote_counts = copy.deepcopy(content["counts"])
                for checked in checkedOptions:
                    content["counts"][checked] += 1
                    vote_counts[checked] += 1

        try:
            result = ARTICLES.update_item(
                Key={
                    "partial_visible":"True",
                    "aid":aid
                },
                UpdateExpression="SET content = :j",
                ExpressionAttributeValues={
                    ':j': cur_content
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ARTICLES, please try again.")  

    try:
        VOTES.put_item(
            Item={
            'vote_id_uid': vote_id + "_" +user["uid"],
            }
        )
    except Exception as e:
        return err_message(e)
    vote_counts = [int(item) for item in vote_counts]
    return make_response(jsonify({"message":"vote success!",
                                  "counts":vote_counts}),200)

