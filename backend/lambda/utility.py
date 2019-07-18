# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
import botocore
from functools import wraps
from flask import jsonify, request, make_response
import hashlib
import jwt
import time
from elasticsearch import Elasticsearch, RequestsHttpConnection
import random
import json
import decimal
import math
import re
from Chinese_nickname import Chinese_nickname 
from English_nickname import English_nickname
from exponent_server_sdk import DeviceNotRegisteredError
from exponent_server_sdk import PushClient
from exponent_server_sdk import PushMessage
from exponent_server_sdk import PushResponseError
from exponent_server_sdk import PushServerError
from requests.exceptions import ConnectionError
from requests.exceptions import HTTPError
import hashlib
from difflib import SequenceMatcher
from decimal import *
import datetime
import dateutil.parser
from datetime import timedelta
from multiprocessing.dummy import Pool as ThreadPool 

FRONT_PAGE_ROAST_BATCH_SIZE = 5
FRONT_PAGE_MASKER_BATCH_SIZE = 5
# s3,dynamoDB permission
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

SALT = 'PLACEHOLDER_FOR_GITHUB'
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# dynamodb tables
DYNAMODB = boto3.resource('dynamodb',region_name='ca-central-1')
USERS = DYNAMODB.Table('users')
MASKERS = DYNAMODB.Table('maskers')
ARTICLES = DYNAMODB.Table('articles')
ROASTS = DYNAMODB.Table('roasts')
COMMENTS = DYNAMODB.Table('comments')
COMMENTS_NICKNAMES = DYNAMODB.Table('comments_nicknames')

VOTES = DYNAMODB.Table('votes')
DB_ID_TO_USER = DYNAMODB.Table('db_id_to_user')
# s3 bucket config
s3 = boto3.resource(
        's3'
    )
BUCKET_NAME = 'maskoff'


# check token
SECRET = "PLACEHOLDER_FOR_GITHUB"
EXPIRE_ELAPSE = 86400 * 365 * 10

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            if o % 1 > 0:
                return float(o)
            else:
                return int(o)
        return super(DecimalEncoder, self).default(o)

dynamodb = boto3.resource('dynamodb', region_name='us-west-2', endpoint_url="http://localhost:8000")


def token_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token = None
        if "access-token" in request.headers and isinstance(request.headers['access-token'],str):
            token = request.headers["access-token"]
        if not token:
            return message(401,"token is missing")
        if not isinstance(request.headers['access-token'],str):
            return message(401,"token has wrong type")
        try:
            token = jwt.decode(token, SECRET,algorithms=['HS256'])
            response = USERS.get_item(
                Key={
                    'uid': token["uid"],   
                }
            )
            if "Item" in response:
                user = response["Item"]
                if user["phone_number_verified"] == False:
                    return message(401,"unverified user")
            else:
                return message(401,"no such user")
        except Exception as e:
            return message(401,False,"token_valid")
        return f(user, *args, **kwargs)
    return decorated


# sending out response
def message(statusCode,message_text,message_title="message"):
    return make_response(jsonify({message_title:message_text}),statusCode)

def err_message(e):
    return make_response(jsonify({"error":str(e)}),500)


# check user post permission
def check_user_write_access(user):
    if "phone_number" in user:
        if not user["phone_number"]:
            return message(401,"No permission to write")
    else:
        return message(401,"No permission to write")
    return True
def encrypt(info):
    '''
    SHA512 + const salt now.

    how to check password:
    bcrypt.checkpw(password, hashed)
    '''
    return hashlib.sha512(bytes(info,'utf-8')+bytes(SALT,'utf-8')).hexdigest()

def generateAccessToken(uid):
    '''
    compute and send a unique access token to user
    '''
    #jwt.decode(access_token, 'secret', algorithms=['HS256'])
    now = time.time()
    access_token = jwt.encode({"uid":str(uid),
                               "exp":now+EXPIRE_ELAPSE},SECRET,algorithm='HS256')
    return access_token.decode('ascii')

def check_file_exist_in_s3_n_sanitize_text(content):
    
    for item in content:

        if not isinstance(item,dict):
            return message(400,"wrong type of items in content")
        if "type" not in item or not isinstance(item["type"],str):
            return message(400,"item has no type or type format is wrong")
        #if it is rich media file,check its availability in S3
        if item["type"] != "text/plain":
            if "filename" not in item or not isinstance(item["filename"],list):
                return message(400,"item has no filename or filename is wrong")
            for piece in item["filename"]:
                s3 = boto3.resource('s3')
                try:
                    s3.Object(BUCKET_NAME, piece).load()
                except botocore.exceptions.ClientError as e:
                    if e.response['Error']['Code'] == "404":
                        #if some file missing, reject
                        return message(400,"file " + piece + " DNE.")
                    else:
                        return message(400,"something went wrong when posting article")
        
        # print("if it is text input, clean it")
        # print("#######!!! NOT DONE !!!#######")
    return True

def remove_dup(seq):
    # remove duplicates from a list whilst preserving order
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]

def welcome_to_maskoff():
    # loop = asyncio.get_event_loop()
    # loop.run_until_complete(asyncio.gather(coroutine_1(), coroutine_2()))
    return message(200,"welcome to maskoff")


def send_push_message(token,title,message, extra=None):
    try:
        response = PushClient().publish(
            PushMessage(to=token,
                        title=title,
                        body=message,
                        data=extra,
                        sound="default",
                        badge=1))
    except PushServerError as exc:
        # Encountered some likely formatting/validation error.
        extra_data={
            'token': token,
            'message': message,
            'title':title,
            'extra': extra,
            'errors': exc.errors,
            'response_data': exc.response_data,
        }
        
        raise
    except (ConnectionError, HTTPError) as exc:
        # Encountered some Connection or HTTP error - retry a few times in
        # case it is transient.
        
        extra_data={'token': token, 'message': message, 'extra': extra}
        
        raise self.retry(exc=exc)

    try:
        # We got a response back, but we don't know whether it's an error yet.
        # This call raises errors so we can handle them with normal exception
        # flows.
        response.validate_response()
    except DeviceNotRegisteredError:
        # Mark the push token as inactive
        from notifications.models import PushToken
        PushToken.objects.filter(token=token).update(active=False)
    except PushResponseError as exc:
        # Encountered some other per-notification error.
        
        extra_data={
            'token': token,
            'message': message,
            'extra': extra,
            'push_response': exc.push_response._asdict(),
        }
        
        raise self.retry(exc=exc)


def get_nickname(lan="Chinese"):
    if lan == "Chinese":
        output = random.sample(Chinese_nickname, 1)[0]
    elif lan == "English":
        output = random.sample(English_nickname, 1)[0]
    return output

def similar(a, b):
    return SequenceMatcher(None, a, b).ratio()

def utility_get_roasts_by_coor(user,visibleBounds):
    top = visibleBounds[0][0]
    right = visibleBounds[0][1]
    bottom = visibleBounds[1][0]
    left = visibleBounds[1][1]

    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])

    query_body = {
        "query": {
            "bool": {
                "must": [
                    {
                        "range" : {
                            "content.latitude" : {
                                "gte" : min(Decimal(left),Decimal(right)),
                                "lte" : max(Decimal(left),Decimal(right)),
                                "boost" : 2.0
                            }
                        }
                    },
                    {
                        "range" : {
                            "content.longitude" : {
                                "gte" : min(Decimal(bottom),Decimal(top)),
                                "lte" : max(Decimal(bottom),Decimal(top)),
                                "boost" : 2.0
                            }
                        }
                    }
                ],
                "filter": {
                    "term": {
                        "visible": "true"
                    }
                }
            }
        }
    }
    roast_results = es.search(index="roasts",body=query_body)

    roast_results = roast_results["hits"]["hits"]
    # for i in range(len(masker_results)):
    #     for file in masker_results[i]["_source"]["content"]:
    #         if file["type"] == "location":
    #             print(file["latitude"]<= right and file["latitude"] >= left,file["longitude"] >= bottom and file["longitude"] <= top )
    for roast in roast_results:
        response = USERS.get_item(
            Key={
                'uid': roast['_source']["author_ruid"]
            }
        )
        if "Item" not in response:
            roast['_source']["roast_thumbnail"] = "empty_profile_picture.png"
        else:
            roast['_source']["roast_thumbnail"] = response["Item"]["roast_thumbnail"]

        response = DB_ID_TO_USER.get_item(
            Key={
                'db_id_uid':  roast['_source']["rid"] + "_" + user["ruid"]
            }
        )
        if "Item" not in response:
            roast['_source']["user_liked"] = False
            roast['_source']["user_followed"] = False
        else:
            roast['_source']["user_liked"] = response["Item"]["to_user"]["like"]["like"]
            roast['_source']["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]

    roast_results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','followed','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked','user_followed']} for item in roast_results]
    return roast_results

def calculate_update_delete_date(mid,contributed,first_post_date,articles=None):
    #一个->半年,每多一个加三个月?
    ALIVE_TIME = 0
    FIRST_TIME = 180
    AFTER_FIRST_TIME = 90
    contributed = int(contributed)
    contributed += 1
    ALIVE_TIME += FIRST_TIME
    if contributed > 1:
        ALIVE_TIME += AFTER_FIRST_TIME * (contributed - 1)
    start_date = dateutil.parser.parse(first_post_date)
    print(start_date)
    end_date = start_date + timedelta(days=ALIVE_TIME)
    print(end_date)
    end_date_iso = end_date.isoformat()
    if(articles != None):
        for aid in articles:
            try:
                response = ARTICLES.get_item(
                    Key={
                        'partial_visible':"True",
                        'aid': aid
                    }
                )
                #check if article exist and visible
            except Exception as e:
                return (False,e)
            if "Item" not in response:
                continue
            try:
                result = ARTICLES.update_item(
                    Key={
                        "partial_visible":"True",
                        "aid":aid
                    },
                    UpdateExpression="SET live_until = :j ",
                    ExpressionAttributeValues={
                        ':j':end_date_iso,
                    },
                )
            except Exception as e:
                return (False,e)
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return (False,"MASKERS updating error")
        try:
            result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
                    "mid":mid
                },
                UpdateExpression="SET live_until = :j ",
                ExpressionAttributeValues={
                    ':j':end_date_iso,
                },
            )
        except Exception as e:
            return (False,e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return (False,"MASKERS updating error")
    return end_date_iso


def mask_email(email,mulformed_error):
    try:
        at_index =  email.index("@")
    except ValueError:
        return (False,mulformed_error)
    pref = email[:at_index]
    if (len(email) == at_index + 1):
        return (False,mulformed_error)
    suf = email[at_index + 1:]

    if(len(pref) < 2):
        pref = "*"
    else:
        pref = pref[0] + (len(pref) - 2) * "*" + pref[-1]

    if(len(suf) < 2):
        suf = "*"
    else:
        suf = suf[0] + (len(suf) - 2) * "*" + suf[-1]

    return (True,pref + "@" + suf)
def replace_decimals(obj):
    if isinstance(obj, list):
        for i in range(len(obj)):
            obj[i] = replace_decimals(obj[i])
        return obj
    elif isinstance(obj, dict):
        for k, v in obj.items():
            obj[k] = replace_decimals(v)
        return obj
    elif isinstance(obj, set):
        return set(replace_decimals(i) for i in obj)
    elif isinstance(obj, decimal.Decimal):
        if obj % 1 == 0:
            return int(obj)
        else:
            return float(obj)
    else:
        return obj