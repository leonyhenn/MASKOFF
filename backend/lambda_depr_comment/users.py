# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from boto3.dynamodb.conditions import Key, Attr
from copy import deepcopy
from flask import request, make_response, jsonify
from utility import encrypt, err_message, generateAccessToken, message, USERS,front_page
import uuid

def users_read_access(user):
    '''
    check if the access_token exists and valid. 
    if true, return true so app can enter to footer.
    if not, return false so app can go to login page.

    used in welcome.js
    '''

    # due to user existence has already been verified in function wrapper, so just return true.
    return make_response(jsonify({"message":"register successful, access granted",
                                      "token_valid":True,
                                      "uid":user["uid"],
                                      "front_page":front_page}),200)

def users_write_access(user):
    '''
    check if user has write access. if not, return false to let app enter phone verification page.

    used before enter post procedure
    '''

    # verify if user has registered with phone number
    if "phone_number" in user:
        if user["phone_number"]:

            # if user has, return true
            return message(200,True,"write_access")

    # otherwise return false
    return message(401,False,"write_access")


def users_write_access_upgrade(user):
    '''
    upgrade user from read access to write access by recording their encryted phone number.
    
    return if this process complete or failed.

    used before enter post procedure
    '''
    body = request.get_json()
    # check input and type
    if (not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)):
        return message(400,"No phone number attached or phone number has wrong type")

    # assign input
    phone_number = encrypt(body["phone_number"])
    # check if this phone number has ever been registered
    try:
        response = USERS.scan(
            FilterExpression=Attr('phone_number').eq(phone_number)
        )
    except Exception as e:
        return err_message(e)

    # if registered return rejection
    if response["Count"] > 0:
        return message(400,"This phone number already exists. If you recently changed your phone number, please contact customer service.")
    else:
        # check if user exists and has never been upgraded to write access
        if "phone_number" in user:
            if user["phone_number"]:
                return message(400,"You already registered with another phone number. If you recently changed your phone number, please contact customer service.")            
            # if never, upgrade; else rejected
            else:
                try:
                    USERS.update_item(
                        Key={
                            "uid":user["uid"]
                        },
                        UpdateExpression='SET phone_number = :val1',
                        ExpressionAttributeValues={
                            ':val1': phone_number
                        }
                    )
                except Exception as e:
                    return err_message(e)
                return message(200,"successfully upgraded.")


def users_register_relogin():
    '''
    used in login.js

    need:
    smacc str
    smacc_type str
    gender str

    if user never registered, register; else send a new token
    '''

    # check input and type

    body = request.get_json()
    
    if( not body
        or not "smacc" in body 
        or not isinstance(body["smacc"],str)
        or not body["smacc"] != "" 
        or not "smacc_type" in body 
        or not body["smacc_type"] in ["WeChat","Facebook"] 
        or not "gender" in body 
        or not body["gender"] in ["0","1"]):
        return message(400,"insufficient social account info in request")
    
    # assign input
    gender = body["gender"] 
    smacc = body["smacc"]
    smacc = encrypt(smacc)
    smacc_type = body["smacc_type"]

    # check if user already exist in database
    try:
        response = USERS.scan(
            FilterExpression=Attr('smacc').eq(smacc) & Attr('smacc_type').eq(smacc_type)
        )
    except Exception as e:
            return err_message(e)

    # if smacc account and smacc type fits database, login
    if response["Count"] > 0: 
        user_id = response["Items"][0]["uid"]
        return make_response(jsonify({"message":"user registered, access granted",
                                      "access_token":generateAccessToken(response["Items"][0]["uid"]),
                                      "uid":user_id,
                                      "front_page":front_page}),200)
    # if not, register this user as new user
    else:
        uid = str(uuid.uuid4())
        new_user = {
            "uid":uid,
            "MASKOFF":None,
            "MASKOFF_changed":0,
            "smacc":smacc,
            "smacc_type":smacc_type,
            "gender":gender,
            "phone_number":None,
            "maskers_exposed":[],
            "roasts":[],
            "comments":[],
            "friends":[],
            "blocked":[],
            "articles":[]
        }
        try:
            USERS.put_item(
                Item=new_user
            )
        except Exception as e:
            return err_message(e)
        return make_response(jsonify({"message":"register successful, access granted",
                                      "access_token":generateAccessToken(uid),
                                      "uid":uid,
                                      "front_page":front_page}),200)
    
def users_add_blocked_user(user,blocked_uid):
    #check block uid valid and exist
    if (not isinstance(blocked_uid,str)):
        return message(400,"wrong type of blocked uid")

    try:
        response = USERS.get_item(
            Key={
                'uid': blocked_uid
            }
        )
        if "Item" not in response:
            return message(400,"blocked user DNE.")
    except Exception as e:
            return err_message(e)

    #if blocked uid valid and exist, then update blocked list
    new_blocked = deepcopy(user["blocked"])
    if blocked_uid in new_blocked:
        return message(400,"blocked user already in your blocked list")
    else:
        new_blocked.append(blocked_uid)
    try:
        USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression='SET blocked = :val1',
            ExpressionAttributeValues={
                ':val1': new_blocked
            }
        )
    except Exception as e:
        return err_message(e)
    return message(200,"successfully add block_uid to blocked list")
    

def users_get_blocked_users(user):
    return make_response(jsonify({"blocked":user["blocked"]}),200)
def users_remove_blocked_user(user,blocked_uid):
    #check block uid valid and exist
    if (not isinstance(blocked_uid,str)):
        return message(400,"wrong type of blocked uid")

    try:
        response = USERS.get_item(
            Key={
                'uid': blocked_uid
            }
        )
        if "Item" not in response:
            return message(400,"blocked user DNE.")
    except Exception as e:
            return err_message(e)

    #if blocked uid valid and exist, then update blocked list
    new_blocked = deepcopy(user["blocked"])
    if blocked_uid not in new_blocked:
        return message(400,"blocked user not in your blocked list")
    else:
        new_blocked.remove(blocked_uid)
    try:
        USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression='SET blocked = :val1',
            ExpressionAttributeValues={
                ':val1': new_blocked
            }
        )
    except Exception as e:
        return err_message(e)
    return message(200,"successfully add block_uid to blocked list")



