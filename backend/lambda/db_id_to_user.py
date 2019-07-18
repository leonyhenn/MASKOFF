# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import ROASTS, MASKERS, ARTICLES,COMMENTS, err_message, message, COMMENTS, DB_ID_TO_USER
import uuid
import json
from datetime import datetime
import copy

def likes_operation_on_a_post(user):
    body = request.get_json()


    if(not "db_type" in body or
       not body["db_type"] in ["MASKERS","ARTICLES","COMMENTS","ROASTS"] or
       not "db_id" in body or
       not isinstance(body["db_id"], str) or
       not "operation" in body or
       not body["operation"] in ["like","dislike","follow","unfollow"]):
        return message(400,"lack of object info")

    db_type = body["db_type"]
    db_id = body["db_id"]
    operation = body["operation"]
    new_liked_count = 0
    new_followed_count = 0
    
    db_id_uid = db_id+"_"+(user["uid"] if (db_type in ["MASKERS","ARTICLES"]) else user["ruid"])
    to_user = True
    if(db_type == "COMMENTS" and operation in ["like","dislike"]):
        try:
            response = COMMENTS.get_item(
                Key={
                    'visible':"True",
                    'cid': db_id
                }
            )
            
            # check if comment exist and visible
            if "Item" not in response:
                return message(400,"comment does not exist")
            else:
                db_id_uid = db_id+"_"+(user["uid"] if (response["Item"]["db_type"] in ["MASKERS","ARTICLES"]) else user["ruid"])
        except Exception as e:
            print("1",e)
            return err_message(e)
    
    try:
        response = DB_ID_TO_USER.get_item(
            Key={
                "db_id_uid":db_id_uid
            }
        )
        if "Item" in response:
            to_user = copy.deepcopy(response["Item"]["to_user"])

            if(operation == "like"):
                if (to_user["like"]["like"] == "True"):
                    return make_response(jsonify({"message":"like successfully","new_liked_count": str(-1)}),200)
            elif(operation == "dislike"):
                if (to_user["like"]["like"] == "False"):
                    return make_response(jsonify({"message":"dislike successfully","new_liked_count":str(-1)}),200)
            elif(operation == "follow"):
                if (to_user["follow"]["follow"] == "True"):
                    return make_response(jsonify({"message":"follow successfully","new_liked_count":str(-1)}),200)
            elif(operation == "dislike"):
                if (to_user["follow"]["follow"] == "False"):
                    return make_response(jsonify({"message":"unfollow successfully","new_liked_count":str(-1)}),200)
        elif "Item" not in response:
            to_user = False
    except Exception as e:
        print("2",e)
        return err_message(e)

    if(db_type == "MASKERS"):
        try:
            response = MASKERS.get_item(
                Key={
                    'total_visible': "True",
                    'mid':db_id
                }
            )
            if "Item" not in response:
                return message(400,"masker dne")
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked + :j"
                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked - :j"
                elif(operation == "follow"):
                    new_followed_count = response["Item"]["followed"] + 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed + :j"
                elif(operation == "unfollow"):
                    new_followed_count = response["Item"]["followed"] - 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed - :j"
                
                result = MASKERS.update_item(
                    Key={
                        "total_visible":"True",
                        "mid":db_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
                if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                    return message(400,"server has error updating MASKERS, please try again.")
        except Exception as e:
            print("3",e)
            return err_message(e)
    elif(db_type == "ARTICLES"):
        try:
            response = ARTICLES.get_item(
                Key={
                    'partial_visible': "True",
                    'aid':db_id
                }
            )
            if "Item" not in response:
                return message(400,"artile dne")
        
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked + :j"

                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked - :j"

                elif(operation == "follow"):
                    new_followed_count = response["Item"]["followed"] + 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed + :j"

                elif(operation == "unfollow"):
                    new_followed_count = response["Item"]["followed"] - 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed - :j"

                result = ARTICLES.update_item(
                    Key={
                        "partial_visible":"True",
                        "aid":db_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
                if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                    return message(400,"server has error updating ARTICLES, please try again.")  
        except Exception as e:
            print("4",e)
            return err_message(e)
    elif(db_type == "COMMENTS"):
        try:
            response = COMMENTS.get_item(
                Key={
                    "visible":"True",
                    "cid":db_id
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
                        "cid":db_id
                    },
                    UpdateExpression=UpdateExpression,
                    ExpressionAttributeValues={
                        ':j': 1
                    },
                )
        
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating ARTICLES, please try again.")  
        except Exception as e:
            print("5",e)
            return err_message(e)
    elif(db_type == "ROASTS"):
        try:
            response = ROASTS.get_item(
                Key={
                    'visible': "True",
                    'rid':db_id
                }
            )
            if "Item" not in response:
                return message(400,"ROAST dne")
        
            else:
                if(operation == "like"):
                    new_liked_count = response["Item"]["liked"] + 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked + :j"

                elif(operation == "dislike"):
                    new_liked_count = response["Item"]["liked"] - 1
                    new_followed_count = response["Item"]["followed"]
                    UpdateExpression = "SET liked = liked - :j"

                elif(operation == "follow"):
                    new_followed_count = response["Item"]["followed"] + 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed + :j"

                elif(operation == "unfollow"):
                    new_followed_count = response["Item"]["followed"] - 1
                    new_liked_count = response["Item"]["liked"]
                    UpdateExpression = "SET followed = followed - :j"

                result = ROASTS.update_item(
                        Key={
                            "visible":"True",
                            "rid":db_id
                        },
                        UpdateExpression=UpdateExpression,
                        ExpressionAttributeValues={
                            ':j': 1
                        },
                    )
        
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating ROASTS, please try again.")
        except Exception as e:
            print("6",e)
            return err_message(e)

    if (not to_user):
        #put new item
        new_like = {
            "db_id_uid":db_id_uid,
            "db_type":db_type,
            "db_id":db_id,
            "uid/ruid":user["uid"] if (db_type in ["MASKERS","ARTICLES"]) else user["ruid"],
            "to_user":{
                "like":{
                    "like":"True" if(operation == "like") else "False",
                    "timestamp":datetime.utcnow().isoformat()
                },
                "follow":{
                    "follow":"True" if(operation == "follow") else "False",
                    "timestamp":datetime.utcnow().isoformat()
                }
            }
        }
        try:
            result = DB_ID_TO_USER.put_item(
                Item=new_like
            )
        except Exception as e:
            print("7",e)
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ARTICLES, please try again.")
        return make_response(jsonify({"message":operation + " successfully" ,"new_liked_count":str(new_liked_count),"new_followed_count":str(new_followed_count)}),200)

    else:
        if operation in ["like","dislike"]:
            to_user["like"]["like"] = "True" if(operation == "like") else "False"
        if operation in ["follow","unfollow"]:
            to_user["follow"]["follow"] = "True" if(operation == "follow") else "False"
        try:
            response = DB_ID_TO_USER.update_item(
                        Key={
                            "db_id_uid":db_id_uid
                        },
                        UpdateExpression='SET to_user = :val1',
                        ExpressionAttributeValues={
                            ':val1': to_user
                        }
                    )
        except Exception as e:
            print("8",e)
            return err_message(e) 


        return make_response(jsonify({"message":operation + " successfully" ,"new_liked_count":str(new_liked_count),"new_followed_count":str(new_followed_count)}),200)    

    
    

