import boto3
import botocore
from functools import wraps
from flask import jsonify, request, make_response
import hashlib
import jwt
import time
from elasticsearch import Elasticsearch, RequestsHttpConnection
import random
from Chinese_nickname import Chinese_nickname 
from English_nickname import English_nickname
from exponent_server_sdk import DeviceNotRegisteredError
from exponent_server_sdk import PushClient
from exponent_server_sdk import PushMessage
from exponent_server_sdk import PushResponseError
from exponent_server_sdk import PushServerError
from requests.exceptions import ConnectionError
from requests.exceptions import HTTPError
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
LIKES = DYNAMODB.Table('likes')
# s3 bucket config
s3 = boto3.resource(
        's3'
    )
BUCKET_NAME = 'maskoff'


# check token
SECRET = "PLACEHOLDER_FOR_GITHUB"
EXPIRE_ELAPSE = 86400 * 365 * 10
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

    return message(200,"welcome to maskoff")

def utility_get_front_page(user):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    
    roast_keyword = "舒适"
    roast_body = {
      "size" : 15,
      "query": {
            "bool": {
                "must": {
                    "multi_match" : {
                    "query": roast_keyword, 
                    "type": "most_fields",
                    "fields": ["title^5","tags^5","content.filename^3"] 
                    }
                },
                "filter": {
                    "term": {
                        "visible": "true"
                    }
                }
            }
        }
    }
    roast_results = es.search(index="roasts",body=roast_body)


    roast_results = roast_results["hits"]["hits"]

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

        response = LIKES.get_item(
            Key={
                'object_type_id_userid': "ROASTS" + "_" + roast['_source']["rid"] + "_" + user["ruid"]
            }
        )
        if "Item" not in response:
            roast['_source']["user_liked"] = False
        else:
            roast['_source']["user_liked"] = True

    roast_results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked']} for item in roast_results]
    
    masker_keyword = "章文"
    masker_body = {
        "query": {
            "bool": {
                "must": {
                    "multi_match" : {
                        "query": masker_keyword, 
                        "type": "most_fields",
                        "fields": ["name^3","alias^3","tags^3","content.filename"] 
                    }
                },
                "filter": {
                    "term": {
                        "partial_visible": "true"
                    }
                }
            }
        }
    }
    masker_results = es.search(index="articles",body=masker_body)

    masker_results = masker_results["hits"]["hits"]


    for article in masker_results:

        response = LIKES.get_item(
            Key={
                'object_type_id_userid': "ARTICLES" + "_" + article['_source']["aid"] + "_" + user["uid"]
            }
        )
        if "Item" not in response:
            article['_source']["user_liked"] = False
        else:
            article['_source']["user_liked"] = True

    masker_results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name','liked','comments_count','contributed','author_nickname','post_date','user_liked']} for item in masker_results]
    
    front_page = {"Roast":{
                         "Recommend":roast_results,
                         "Follow":roast_results,
                         "Trending":roast_results,
                         "Keywords":[{"content":"舒适","type":"hot"}]
                         },
                  "Masker":{
                         "Recommend":masker_results,
                         "Follow":masker_results,
                         "Trending":masker_results,
                         "Keywords":[{"content":"章文","type":"hot"},{"content":"刘宇辰","type":"search"}]
                  }}
    return front_page
    
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




