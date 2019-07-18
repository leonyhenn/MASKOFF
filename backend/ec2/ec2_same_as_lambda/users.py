from boto3.dynamodb.conditions import Key, Attr
from copy import deepcopy
from flask import request, make_response, jsonify
from utility import encrypt, err_message, generateAccessToken, message,s3, USERS,utility_get_front_page,ARTICLES, ROASTS, BUCKET_NAME
import uuid
import requests
import json
from PIL import Image
import io
def users_read_access(user):
    '''
    check if the access_token exists and valid. 
    if true, return true so app can enter to footer.
    if not, return false so app can go to login page.

    used in welcome.js
    '''

    
    body = request.get_json()

    if(not body or 
       "coordinate" not in body or
       "latitude" not in body["coordinate"] or
       "longitude" not in body["coordinate"] or
       not isinstance(body["coordinate"]["latitude"],float) or
       not isinstance(body["coordinate"]["longitude"],float)):
        return message(400,"wrong type of coor info")

    # due to user existence has already been verified in function wrapper, so just return true.
    return make_response(jsonify({"message":"register successful, access granted",
                                      "token_valid":True,
                                      "uid":user["uid"],
                                      "ruid":user["ruid"],
                                      "roast_thumbnail":user["roast_thumbnail"],
                                      "front_page":utility_get_front_page(user)}),200)

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
    #     return message(601,"Verification code is invalid, please try again")
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
    
    if(not body or 
       "coordinate" not in body or
       "latitude" not in body["coordinate"] or
       "longitude" not in body["coordinate"] or
       not isinstance(body["coordinate"]["latitude"],float) or
       not isinstance(body["coordinate"]["longitude"],float)):
        return message(400,"wrong type of coor info")

    try:
        expo_token = "None"
        if("expo_token" in body):
            if(isinstance(body["expo_token"],str)):
                expo_token = body["expo_token"]        
            else:
                return message(400,"expo token malformed")
    except Exception as e:
        return err_message(e)
    
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
        try:
            USERS.update_item(
                Key={
                    "uid":user_id
                },
                UpdateExpression='SET expo_token = :val1',
                ExpressionAttributeValues={
                    ':val1': expo_token
                }
            )
        except Exception as e:
            return err_message(e)
        return make_response(jsonify({"message":"user registered, access granted",
                                      "access_token":generateAccessToken(response["Items"][0]["uid"]),
                                      "uid":user_id,
                                      "ruid":response["Items"][0]["ruid"],
                                      "roast_thumbnail":response["Items"][0]["roast_thumbnail"],
                                      "front_page":utility_get_front_page(response["Items"][0])}),200)
    # if not, register this user as new user
    else:
        uid = str(uuid.uuid4())
        ruid = str(uuid.uuid4())
        new_user = {
            "uid":uid,
            "ruid":ruid,
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
            "articles":[],
            "liked":0,
            "roast_thumbnail":"empty_profile_picture.png",
            "expo_token":expo_token
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
                                      "ruid":ruid,
                                      "roast_thumbnail":"empty_profile_picture.png",
                                      "front_page":utility_get_front_page(new_user)}),200)
    
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
        if(img_height > 2048 and img_width > 2048):
            size = 2048,2048
            im.thumbnail(size, Image.ANTIALIAS)
            in_mem_file = io.BytesIO()
            im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
            
        else:
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=new_thumbnail,ACL='public-read')
    
    
        USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression='SET roast_thumbnail = :val1',
            ExpressionAttributeValues={
                ':val1': new_filename
            }
        )
    except Exception as e:
        return err_message(e)
    return make_response(jsonify({"message":"thumbnail successfully changed.",
                                  "new_thumbnail":new_filename}),200)

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