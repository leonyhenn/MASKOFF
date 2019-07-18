# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from boto3.dynamodb.conditions import Key, Attr
from copy import deepcopy
from flask import request, make_response, jsonify
from utility import encrypt, err_message, generateAccessToken, message,s3, USERS,ARTICLES, ROASTS, BUCKET_NAME, COMMENTS, DYNAMODB, DecimalEncoder, utility_get_roasts_by_coor, mask_email
from frontpage import frontpage_get_front_page
import uuid
import requests
import json
from PIL import Image
import io
import sys, os
from leancloud import cloud
import leancloud
from datetime import datetime
from lans import getLans
from random import randint

def users_read_access(user):
    '''
    check if the access_token exists and valid. 
    if true, return true so app can enter to footer.
    if not, return false so app can go to login page.

    used in welcome.js
    '''

    
    info = request.get_json()        
    if (not "coordinates" in info):
        return message(400,"lack of coordinates")
    if (not isinstance(info["coordinates"],list)):
        return message(400,"wrong type of coordinate")
    if (not (len(info['coordinates']) == 2 )):
        return message(400,"coordinates is incomplete")
    if (not all(isinstance(n, float) for n in info['coordinates']) ):
        return message(400,"coordinates has wrong element type")
    if (not "visibleBounds" in info):
        return message(400,"lack of visibleBounds")
    if (not (isinstance(info['visibleBounds'],list) or 
             isinstance(info['visibleBounds'][0],list) or
             (len(info['visibleBounds'][0]) == 2 ) or
             all(isinstance(n, float) for n in info['visibleBounds'][0]) or
             isinstance(info['visibleBounds'][1],list) or 
             (len(info['visibleBounds'][0]) == 2 ) or
             all(isinstance(n, float) for n in info['visibleBounds'][1])
        )):
        return message(400,"wrong type of visibleBounds")
    longitude = info["coordinates"][0]
    latitude = info["coordinates"][1]
    visibleBounds = info["visibleBounds"]
    roasts_around = utility_get_roasts_by_coor(user,visibleBounds)


    # due to user existence has already been verified in function wrapper, so just return true.
    return make_response(jsonify({"message":"register successful, access granted",
                                      "token_valid":True,
                                      "uid":user["uid"],
                                      "ruid":user["ruid"],
                                      "roast_thumbnail":user["roast_thumbnail"],
                                      "front_page":frontpage_get_front_page(user),
                                      "roast":roasts_around}),200)

def users_write_access(user):
    '''
    check if user has write access. if not, return false to let app enter phone verification page.

    used before enter post procedure
    '''

    # verify if user has registered with phone number
    
    if user["phone_number_verified"]:

        # if user has, return true
        return message(200,True,"write_access")

    # otherwise return false
    return message(200,False,"write_access")


def users_write_access_upgrade(user):
    '''
    upgrade user from read access to write access by recording their encryted phone number.
    
    return if this process complete or failed.

    used before enter post procedure
    '''
    body = request.get_json()
    # check input and type

    ## TEST version
    if (not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)):
        return message(400,"No phone number attached or phone number or vcode has wrong type")
    ## TEST version

    # FORMAL version
    # if (not body
    #     or not "phone_number" in body 
    #     or not isinstance(body["phone_number"],str)
    #     or not "vcode" in body
    #     or not isinstance(body["vcode"],str)):
    #     return message(400,"No phone number attached or phone number or vcode has wrong type")

    # vcode = body["vcode"]
    # phone_number = body["phone_number"]
    # print(vcode)
    # verification_result = requests.post("https://leancloud.cn/1.1/verifySmsCode/" + vcode,headers={"X-LC-Id":"PLACEHOLDER_FOR_GITHUB",
    #                                                                                                     "X-LC-Key":"PLACEHOLDER_FOR_GITHUB",
    #                                                                                                     "Content-Type":"application/json"},
    #                                                                                       json={"mobilePhoneNumber":phone_number})
    # verification_result_json = json.loads(verification_result.content)
    # print(verification_result_json)
    # if not any(verification_result_json.values()):
    #     pass
    # else:
    #     return message(429,"Verification code is invalid, please try again")
    # FORMAL version

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
    phone_number
    password

    if user never registered, register; else send a verification text message
    '''

    # check input and type
    # possible error code: 
    #   422 insufficient info in request
    #   500 Dynamodb failure
    #   429 Leancloud often SMS request
    body = request.get_json()
    if( not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)
        or not body["phone_number"] != "" 
        or not "idd" in body 
        or not isinstance(body["idd"],str)
        or not body["idd"] != "" 
        or not "password" in body 
        or not isinstance(body["password"],str)
        or not body["password"] != ""
        or not "purpose" in body 
        or not isinstance(body["purpose"],str)
        or not body["purpose"] in ["login","register"]
        or not "language" in body
        or not body["language"] in ["Eng","Chi"]
        or not "GFW" in body
        or not isinstance(body["GFW"],bool)):
        return message(422,"insufficient info in request")
    GFW = body["GFW"]
    if (GFW):
        leancloud.init("PLACEHOLDER_FOR_GITHUB", "PLACEHOLDER_FOR_GITHUB")
    else:
        leancloud.init("PLACEHOLDER_FOR_GITHUB", "PLACEHOLDER_FOR_GITHUB")
    # assign input
    idd = body["idd"]
    if(idd[0] != "+"):
        idd = "+"+idd
    phone_number = body["phone_number"]
    encrypted_phone_number = encrypt(idd+phone_number)
    password = encrypt(body["password"])
    purpose = body["purpose"]
    language = body["language"]

    if(purpose == "register"):
        if(not "email" in body
           or not isinstance(body["email"],str)
           or body["email"] == ""):
            return message(422,"insufficient info in request")
        email = body["email"]
    # check if user already exist in database
    try:
        response = USERS.scan(
            FilterExpression=Attr('phone_number').eq(encrypted_phone_number) 
        )
    except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))

    # if SHA-256ed phone_number and password fits database, login, send a text to user for two factor verification
    if(purpose == "login"):
        if response["Count"] > 0:
            user_id = response["Items"][0]["uid"]
            if(response["Items"][0]["password"] == password):
            #太慢了 美东节点可能快一些
                try:
                    cloud.request_sms_code(phone_number,idd=idd)
                except Exception as e:
                    print(e)
                    if(e.code == 601):
                        return message(429,getLans("SMS request too often, please request a few minutes later \U0001f642",language=language))
                    return message(429,getLans("Something is wrong with our SMS service, please request a few minutes later",language=language))
                # return make_response(jsonify({"message":"user registered, access granted",
                #                               "access_token":generateAccessToken(response["Items"][0]["uid"]),
                #                               "uid":user_id,
                #                               "ruid":response["Items"][0]["ruid"],
                #                               "roast_thumbnail":response["Items"][0]["roast_thumbnail"],
                #                               "front_page":frontpage_get_front_page(response["Items"][0])}),200)
                return message(200,getLans("Verification code sent! \U0001f600",language=language))
            else:
                return message(401,getLans("Wrong password \U0001f61e",language=language))
        return message(401,getLans("User does not exist \U0001f61e",language=language))
    # if not, register this user as new user
    else:
        if response["Count"] > 0: 
            return message(200,getLans("User does not exist \U0001f61e",language=language))
        uid = str(uuid.uuid4())
        ruid = str(uuid.uuid4())
        new_user = {
            "uid":uid,
            "ruid":ruid,
            "MASKOFF":None,
            "MASKOFF_changed":0,
            "password":password,
            "phone_number":encrypted_phone_number,
            "maskers_exposed":[],
            "roasts":[],
            "comments":[],
            "friends":[],
            "blocked":[],
            "articles":[],
            "liked":0,
            "roast_thumbnail":"empty_profile_picture.png",
            "register_time":datetime.utcnow().isoformat(),
            "phone_number_verified":False,
            "email":email,
            "email_verification_code":None
        }
        try:
            USERS.put_item(
                Item=new_user
            )
        except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
        # return make_response(jsonify({"message":"register successful, access granted",
        #                               "access_token":generateAccessToken(uid),
        #                               "uid":uid,
        #                               "ruid":ruid,
        #                               "roast_thumbnail":"empty_profile_picture.png",
        #                               "front_page":frontpage_get_front_page(new_user)}),200)
        try:
            cloud.request_sms_code(phone_number,idd=idd)
        except Exception as e:
            if(e.code == 601):
                return message(429,getLans("SMS request too often, please request a few minutes later \U0001f642",language=language))
            return message(429,getLans("Something is wrong with our SMS service, please request a few minutes later",language=language))
        return message(200,getLans("Verification code sent! \U0001f600",language=language))
        
def users_verification_confirm():
    # possible error code: 
    #   422 insufficient info in request
    #   500 Dynamodb failure
    #   429 Leancloud often SMS request
    #   424 Leancloud Wrong verification code
    #   401 User has some issue in the database
    body = request.get_json()
    #!!!!!! 这是maskoff, 不是maskoff2, 换回去!!!
    
    #!!!!!! 这是maskoff, 不是maskoff2, 换回去!!!
    if (not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)
        or not "idd" in body 
        or not isinstance(body["idd"],str)
        or not body["idd"] != ""
        or not "purpose" in body 
        or not isinstance(body["purpose"],str)
        or not body["purpose"] in ["login","register","forget","resend_email","verify_email_verification_code"]
        or not "language" in body
        or not body["language"] in ["Eng","Chi"]
        or not "GFW" in body
        or not isinstance(body["GFW"],bool)):
        return message(422,"No phone number attached or phone number or vcode has wrong type")
    GFW = body["GFW"]
    if(GFW):
        leancloud.init("PLACEHOLDER_FOR_GITHUB", "PLACEHOLDER_FOR_GITHUB")
    else:
        leancloud.init("PLACEHOLDER_FOR_GITHUB", "PLACEHOLDER_FOR_GITHUB")
    idd = body["idd"]
    if(idd[0] != "+"):
        idd = "+"+idd
    phone_number = body["phone_number"]
    encrypted_phone_number = encrypt(idd+phone_number)
    purpose = body["purpose"]
    language=body["language"]
    verification_done = False
    # FORMAL version
    if (not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)
        or not "vcode" in body
        or not isinstance(body["vcode"],str)):
        return message(422,"No phone number attached or phone number or vcode has wrong type")

    vcode = body["vcode"]
    phone_number = body["phone_number"]
    print(vcode)
    try:
        response = USERS.scan(
            FilterExpression=Attr('phone_number').eq(encrypted_phone_number) 
        )
    except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
    if(purpose == "resend_email"):
        if response["Count"] == 0: 
            return message(401,getLans("User does not exist \U0001f61e",language=language))
        user_id = response["Items"][0]["uid"]
        # generate a verification code
        # 测试用
        email_verification = "123456"
        # 测试用

        # 正式用
        # email_verification = randint(100000, 999999)
        # 正式用
        # send an email to user
        # set user email verification code to email_verification
        user_id = response["Items"][0]["uid"]
        try:
            USERS.update_item(
                Key={
                    "uid":user_id
                },
                UpdateExpression='SET email_verification_code = :val1',
                ExpressionAttributeValues={
                    ':val1': email_verification
                }
            )
        except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
        return make_response(jsonify({"message":getLans("EmailSent_1",language=language) + "+ " + idd + " " + phone_number + getLans("EmailSent_2",language=language)}),200)
    elif(purpose == "verify_email_verification_code"):
        if ( not "email_verification_code" in body 
             or not isinstance(body["email_verification_code"],str)
             or not "new_password" in body 
             or not isinstance(body["new_password"],str)):
            return message(422,"No email_verification_code or new_password attached or email_verification_code or new_password has wrong type")
        new_password = encrypt(body["new_password"])
        if response["Count"] == 0: 
            return message(401,getLans("User does not exist \U0001f61e",language=language))
        if (response["Items"][0]["email_verification_code"] == body["email_verification_code"]):
            user_id = response["Items"][0]["uid"]
            try:
                USERS.update_item(
                    Key={
                        "uid":user_id
                    },
                    UpdateExpression='SET email_verification_code = :val1, password = :val2',
                    ExpressionAttributeValues={
                        ':val1': None,
                        ':val2':new_password
                    }
                )
            except Exception as e:
                print(e)
                return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
            user_id = response["Items"][0]["uid"]
            return make_response(jsonify({"message":getLans("Verification succeed, access granted \U0001f600",language=language),
                                          "access_token":generateAccessToken(response["Items"][0]["uid"]),
                                          "uid":user_id,
                                          "ruid":response["Items"][0]["ruid"],
                                          "roast_thumbnail":response["Items"][0]["roast_thumbnail"],
                                          "front_page":frontpage_get_front_page(response["Items"][0])}),200)
        else:
            return message(424,getLans("Verification_failed",language=language))
    # FORMAL version
    # try:
    #     cloud.verify_sms_code(idd + phone_number,vcode)
    # except Exception as e:
    #     if(e.code == 601):
    #         return message(429,"request too often")
    #     if(e.code == 603):
    #         return message(424,"wrong verification code")
    #     return err_message(e)
    
    # FORMAL version
    # TEST VERSION

    # TEST VERSION

    if(purpose == "login"):
        if response["Count"] > 0: 
            user_id = response["Items"][0]["uid"]
            return make_response(jsonify({"message":getLans("Verification succeed, access granted \U0001f600",language=language),
                                          "access_token":generateAccessToken(response["Items"][0]["uid"]),
                                          "uid":user_id,
                                          "ruid":response["Items"][0]["ruid"],
                                          "roast_thumbnail":response["Items"][0]["roast_thumbnail"],
                                          "front_page":frontpage_get_front_page(response["Items"][0])}),200)
        else:
            return message(401,getLans("User does not exist \U0001f61e",language=language))
    elif(purpose == "register"):
        if response["Count"] == 0: 
            return message(401,getLans("User does not exist \U0001f61e",language=language))
        user_id = response["Items"][0]["uid"]
        try:
            USERS.update_item(
                Key={
                    "uid":user_id
                },
                UpdateExpression='SET phone_number_verified = :val1',
                ExpressionAttributeValues={
                    ':val1': True
                }
            )
        except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
        return make_response(jsonify({"message":getLans("Verification succeed, access granted \U0001f600",language=language),
                                          "access_token":generateAccessToken(response["Items"][0]["uid"]),
                                          "uid":user_id,
                                          "ruid":response["Items"][0]["ruid"],
                                          "roast_thumbnail":response["Items"][0]["roast_thumbnail"],
                                          "front_page":frontpage_get_front_page(response["Items"][0])}),200)
    elif(purpose == "forget"):
        if response["Count"] > 0: 
            user_id = response["Items"][0]["uid"]
            email = response["Items"][0]["email"]
            email_mask = mask_email(email,getLans("Mulformed_Email_Address",language=language)) 
            if email_mask[0] == False:
                return (500,getLans("Mulformed_Email_Address",language=language))

            # generate a verification code
            # 测试用
            email_verification = "123456"
            # 测试用
            # 正式用
            # email_verification = randint(100000, 999999)
            # 正式用
            # send an email to user
            # set user email verification code to email_verification
            user_id = response["Items"][0]["uid"]
            try:
                USERS.update_item(
                    Key={
                        "uid":user_id
                    },
                    UpdateExpression='SET email_verification_code = :val1',
                    ExpressionAttributeValues={
                        ':val1': email_verification
                    }
                )
            except Exception as e:
                print(e)
                return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))
        else:
            return message(401,getLans("User does not exist \U0001f61e",language=language))
        return make_response(jsonify({"message":getLans("EmailSent_1",language=language) + " " + email_mask[1] + " " + getLans("EmailSent_2",language=language),
                                      "email_mask":email_mask[1]}),200)
    return message(422,"Something is wrong")
    

def users_forget_password():
    '''
    used in login.js

    need:
    phone_number
    idd

    send a verification text message to user
    '''
    # possible error code: 
    #   422 insufficient info in request
    #   500 Dynamodb failure
    #   429 Leancloud often SMS request
    #   424 Leancloud Wrong verification code
    # check input and type

    body = request.get_json()
    #!!!!!! 这是maskoff, 不是maskoff2, 换回去!!!
    leancloud.init("PLACEHOLDER_FOR_GITHUB", "PLACEHOLDER_FOR_GITHUB")
    #!!!!!! 这是maskoff, 不是maskoff2, 换回去!!!
    if( not body
        or not "phone_number" in body 
        or not isinstance(body["phone_number"],str)
        or not body["phone_number"] != "" 
        or not "idd" in body 
        or not isinstance(body["idd"],str)
        or not body["idd"] != ""
        or not "language" in body
        or not body["language"] in ["Eng","Chi"] ):
        return message(422,"insufficient info in request")
    # assign input
    idd = body["idd"]
    if(idd[0] != "+"):
        idd = "+"+idd
    phone_number = body["phone_number"]
    language = body["language"]
    encrypted_phone_number = encrypt(idd+phone_number)

    # check if user already exist in database
    try:
        response = USERS.scan(
            FilterExpression=Attr('phone_number').eq(encrypted_phone_number) 
        )
    except Exception as e:
            print(e)
            return message(500,getLans("Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",language=language))

    if response["Count"] > 0: 
        try:
            cloud.request_sms_code(phone_number,idd=idd)
        except Exception as e:
            if(e.code == 601):
                return message(429,getLans("SMS request too often, please request a few minutes later \U0001f642",language=language))
            return err_message(e)
    else:
        return message(401,getLans("User does not exist \U0001f61e",language=language))
    return message(200,"verification text sent")


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

def users_check_user_info(user,info_type,info_id):
    if (info_type == "masker_posted"):
        if(info_id in user["maskers_exposed"]):
            return message(400,"masker already exist")   
        return message(200,"masker not posted")   
    return message(400,"info type DNE")    

def users_get_user_articles_roasts(user):
    articles = []
    for i in range(len(user["articles"])):
        response = ARTICLES.get_item(
            Key={
                'partial_visible':"True",
                'aid': user["articles"][i]   
            }
        )
        if 'Item' in response:
            response['Item']['contributed'] = int(response['Item']['contributed'])
            response['Item']['liked'] = int(response['Item']['liked'])
            response['Item']['comments_count'] = int(response['Item']['comments_count'])
            articles.append(response["Item"])

    roasts = []

    for i in range(len(user["roasts"])):
        response = ROASTS.get_item(
            Key={
                'visible':"True",
                'rid': user["roasts"][i]   
            }
        )
        if 'Item' in response:
            response['Item']['liked'] = int(response['Item']['liked'])
            response['Item']['comments_count'] = int(response['Item']['comments_count'])
            roasts.append(response["Item"])
    return make_response(jsonify({"articles":articles,
                                  "roasts":roasts}),200)
def users_change_roast_thumbnail(user):
    
    try:
        new_thumbnail = request.files["0"]
        if (not "pack" in request.form):
            return message(400,"no pack found in request")
        
        pack = json.loads(request.form["pack"])
        if(not pack
            or "filename" not in pack
            or not isinstance(pack["filename"],str)):
            return message(400,"wrong filename or filename dne")
        
        filename = pack["filename"]
        new_filename = str(uuid.uuid4())
        file_extension = filename.split(".")[-1]
        new_filename += "." + file_extension
        
        im = Image.open(new_thumbnail)
        img_width, img_height = im.size
        if im.mode in ("RGBA", "P"):
            im = im.convert("RGB")
        if(img_height > 2048 and img_width > 2048):
            size = 2048,2048
            im.thumbnail(size, Image.ANTIALIAS)
            in_mem_file = io.BytesIO()
            im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
            print(response)
        else:
            in_mem_file = io.BytesIO()
            im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
    
        USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression='SET roast_thumbnail = :val1',
            ExpressionAttributeValues={
                ':val1': new_filename
            }
        )

        table = DYNAMODB.Table('comments')

        fe = Key('author_id').eq(user["uid"])
        pe = "cid"
        esk = None
    
        related_cids = []
        response = table.scan(
            FilterExpression=fe,
            ProjectionExpression=pe,
            )
        
        for i in response['Items']:
            related_cids.append(i["cid"])
        
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ProjectionExpression=pe,
                FilterExpression=fe,
                # ExpressionAttributeNames= ean,
                ExclusiveStartKey=response['LastEvaluatedKey']
                )
        
            for i in response['Items']:
                related_cids.append(i["cid"])

        fe = Key('author_id').eq(user["ruid"])
        pe = "cid"
        esk = None
    
        
        response = table.scan(
            FilterExpression=fe,
            ProjectionExpression=pe,
            )
        
        for i in response['Items']:
            
            related_cids.append(i["cid"])
    
        while 'LastEvaluatedKey' in response:
            response = table.scan(
                ProjectionExpression=pe,
                FilterExpression=fe,
                # ExpressionAttributeNames= ean,
                ExclusiveStartKey=response['LastEvaluatedKey']
                )
        
            for i in response['Items']:
                related_cids.append(i["cid"])
        
        for cid in related_cids:
            COMMENTS.update_item(
                Key={
                    "cid":cid,
                    "visible":"True"
                },
                UpdateExpression='SET user_info.user_thumbnail = :val1',
                ExpressionAttributeValues={
                    ':val1': new_filename
                }
            )
    except Exception as e:
        return err_message(e)
    return make_response(jsonify({"message":"thumbnail successfully changed.",
                                  "new_thumbnail":new_filename}),200)


# testing purpose code
def users_test_batch_update_comments():
    
    table = DYNAMODB.Table('comments')

    fe = Key('author_id').eq("56fa4f04-bc75-4dc5-8590-d3c20705b15f")
    pe = "cid"
    # ean = { "#yr": "year", }
    esk = None


    response = table.scan(
        FilterExpression=fe,
        ProjectionExpression=pe,
        # ExpressionAttributeNames=ean
        )
    
    for i in response['Items']:
        print(json.dumps(i, cls=DecimalEncoder))

    while 'LastEvaluatedKey' in response:
        response = table.scan(
            ProjectionExpression=pe,
            FilterExpression=fe,
            # ExpressionAttributeNames= ean,
            ExclusiveStartKey=response['LastEvaluatedKey']
            )
    
        for i in response['Items']:
            print(json.dumps(i, cls=DecimalEncoder))
    return message(200,"check print")    
    # testing purpose code  


def users_get_user_count(user):
    articles = {
        "count":0,
        "likes":0,
        "comments":0
    }

    roasts = {
        "count":0,
        "likes":0,
        "comments":0
    }

    for i in range(len(user["articles"])):
        response = ARTICLES.get_item(
            Key={
                'partial_visible':"True",
                'aid': user["articles"][i]   
            }
        )
        if 'Item' in response:
            response['Item']['contributed'] = int(response['Item']['contributed'])
            response['Item']['liked'] = int(response['Item']['liked'])
            response['Item']['comments_count'] = int(response['Item']['comments_count'])
            articles["count"] += 1
            articles["likes"] += response['Item']["liked"]
            articles["comments"] += response['Item']["comments_count"]

    for i in range(len(user["roasts"])):
        response = ROASTS.get_item(
            Key={
                'visible':"True",
                'rid': user["roasts"][i]   
            }
        )
        if 'Item' in response:
            response['Item']['liked'] = int(response['Item']['liked'])
            response['Item']['comments_count'] = int(response['Item']['comments_count'])
            roasts["count"] += 1
            roasts["likes"] += response['Item']["liked"]
            roasts["comments"] += response['Item']["comments_count"]

    return make_response(jsonify({"articles":articles,
                                  "roasts":roasts}),200)