# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import LIKES, ROASTS, MASKERS, ARTICLES,COMMENTS, err_message, message, COMMENTS
import uuid
import json
from datetime import datetime

def likes_operation_on_a_post(user):
    body = request.get_json()


    if(not "object_type" in body or
       not body["object_type"] in ["MASKERS","ARTICLES","COMMENTS","ROASTS"] or
       not "object_id" in body or
       not isinstance(body["object_id"], str) or
       not "operation" in body or
       not body["operation"] in ["like","dislike"]):
        return message(400,"lack of object info")

    object_type = body["object_type"]
    object_id = body["object_id"]
    operation = body["operation"]
    new_liked_count = 0
    object_type_id_userid = object_type+"_"+object_id+"_"+(user["uid"] if (object_type in ["MASKERS","ARTICLES"]) else user["ruid"])
    if(object_type == "COMMENTS"):
        try:
            response = COMMENTS.get_item(
                Key={
                    'visible':"True",
                    'cid': object_id
                }
            )
            
            # check if comment exist and visible
            if "Item" not in response:
                return message(400,"comment does not exist")
            else:
                object_type_id_userid = object_type+"_"+object_id+"_"+(user["uid"] if (response["Item"]["db_type"] in ["MASKERS","ARTICLES"]) else user["ruid"])
        except Exception as e:
            return err_message(e)

    

    if(operation == "like"):

        try:
            response = LIKES.get_item(
                Key={
                    "object_type_id_userid":object_type_id_userid
                }
            )
            if "Item" in response:
                return make_response(jsonify({"message":"like successfully","new_liked_count": str(-1)}),200)
        except Exception as e:
            return err_message(e)
    elif(operation == "dislike"):
        
        try:
            response = LIKES.get_item(
                Key={
                    "object_type_id_userid":object_type_id_userid
                }
            )
            if "Item" not in response:
                return make_response(jsonify({"message":"dislike successfully","new_liked_count":str(-1)}),200)
        except Exception as e:
            return err_message(e)

    if(object_type == "MASKERS"):
        try:
            response = MASKERS.get_item(
                Key={
                    'total_visible': "True",
                    'mid':object_id
                }
            )
            if "Item" not in response:
                if operation == "like":
                    return message(400,"masker dne")
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    UpdateExpression = "SET liked = liked + :j"
                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    UpdateExpression = "SET liked = liked - :j"
                result = MASKERS.update_item(
                    Key={
                        "total_visible":"True",
                        "mid":object_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
                if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                    return message(400,"server has error updating MASKERS, please try again.")
        except Exception as e:
            return err_message(e)
    elif(object_type == "ARTICLES"):
        try:
            response = ARTICLES.get_item(
                Key={
                    'partial_visible': "True",
                    'aid':object_id
                }
            )
            if "Item" not in response:
                if operation == "like":
                    return message(400,"artile dne")
        
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    UpdateExpression = "SET liked = liked + :j"
                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    UpdateExpression = "SET liked = liked - :j"
                result = ARTICLES.update_item(
                    Key={
                        "partial_visible":"True",
                        "aid":object_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
                if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                    return message(400,"server has error updating ARTICLES, please try again.")  
        except Exception as e:
                    return err_message(e)
    elif(object_type == "COMMENTS"):
        try:
            response = COMMENTS.get_item(
                Key={
                    "visible":"True",
                    "cid":object_id
                }
            )
            if "Item" not in response:
                if operation == "like":
                    return message(400,"comment dne")
        
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    UpdateExpression = "SET liked = liked + :j"
                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    UpdateExpression = "SET liked = liked - :j"
                result = COMMENTS.update_item(
                    Key={
                        "visible":"True",
                        "cid":object_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
        
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating ARTICLES, please try again.")  
        except Exception as e:
            return err_message(e)
    elif(object_type == "ROASTS"):
        try:
            response = ROASTS.get_item(
                Key={
                    'visible': "True",
                    'rid':object_id
                }
            )
            if "Item" not in response:
                if operation == "like":
                    return message(400,"comment dne")
        
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    UpdateExpression = "SET liked = liked + :j"
                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    UpdateExpression = "SET liked = liked - :j"
                result = ROASTS.update_item(
                        Key={
                            "visible":"True",
                            "rid":object_id
                        },
                        UpdateExpression=UpdateExpression,
                        ExpressionAttributeValues={
                            ':j': 1
                        },
                    )
        
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating ROASTS, please try again.")
        except Exception as e:
            return err_message(e)
    if(operation == "like"):
        #check object exist in db
        
        #put new item

        new_like = {
            "object_type_id_userid":object_type_id_userid,
            "timestamp":datetime.utcnow().isoformat()
        }
        try:
            result = LIKES.put_item(
                Item=new_like
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ARTICLES, please try again.")
        return make_response(jsonify({"message":"like successfully","new_liked_count":str(new_liked_count) }),200)
    elif(operation == "dislike"):
        
        try:
            result = LIKES.delete_item(
                Key={
                    "object_type_id_userid":object_type_id_userid
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating, please try again.")
        return make_response(jsonify({"message":"like successfully","new_liked_count":str(new_liked_count) }),200)

    

