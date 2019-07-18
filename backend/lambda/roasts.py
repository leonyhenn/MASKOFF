# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from boto3.dynamodb.conditions import Key, Attr
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import err_message, message, \
                    check_file_exist_in_s3_n_sanitize_text, \
                    check_user_write_access, \
                    ARTICLES, MASKERS, USERS, ROASTS, COMMENTS_NICKNAMES, DB_ID_TO_USER,\
                    get_nickname, \
                    utility_get_roasts_by_coor, \
                    FRONT_PAGE_ROAST_BATCH_SIZE
from requests_aws4auth import AWS4Auth
from comments_nicknames import archive_comments_nicknames
from upload import upload_multi
from lans import getLans
import uuid
import json
from decimal import *
from elasticsearch import Elasticsearch, RequestsHttpConnection
from multiprocessing.dummy import Pool as ThreadPool 
from urllib.request import urlopen
import time
import sys
from follows import follows_mp_get_roast
from frontpage import get_front_page_roasts_recommend

def roasts_post_roast(user):
    if (not "roast" in request.form):
        return message(400,"no roast found in request")
    
    roast = json.loads(request.form["roast"])

    # check input exsistence
    if (not isinstance(roast,dict)
        or not "content" in roast
        or not "title" in roast
        or not "tags" in roast):
        return message(400,"lack of content")
    # assign input
    tags = roast["tags"]
    title = roast["title"]
    content = roast["content"]
    files = request.files
    
    # check input type
    if (not isinstance(content,list)
        or not isinstance(title,str)
        or not isinstance(tags,list)):
        return message(400,"wrong type of content")

    if(len(tags) == 1 and tags[0] == ""):
        tags = None
    else:
        for item in tags:
            if not isinstance(item,str):
                return message(400,"wrong type of tags")
    
    # upload all files contained
    content = upload_multi(content,files)
    if not isinstance(content,list):
            return content
    
    # roast
    rid = str(uuid.uuid4())
    nickname = get_nickname("Chinese")
    new_roast = {
            "rid":rid,
            "author_ruid":user["ruid"],
            "title":title,
            "content":content,
            "visible":"True",
            "tags":tags,
            "liked":0,
            "followed":0,
            "comments_count":0,
            "author_nickname":nickname,
            "timestamp":datetime.utcnow().isoformat()
        }
    # post new roast
    try:
        result = ROASTS.put_item(
            Item=new_roast
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating ROASTS, please try again.")

    # comments_nicknames
    try:
        result = COMMENTS_NICKNAMES.put_item(
            Item={
                'parent_id':rid,
                'visible':"True",
                'uid_nickname_pair':{user["uid"]:nickname}
            }
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating COMMENTS_NICKNAMES, please try again.")

    # user
    # add roast to user
    try:
        result = USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression="SET roasts = list_append(roasts, :i)",
            ExpressionAttributeValues={
                ':i': [rid],
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating USERS, please try again.")
    #callback to user
    return make_response(jsonify({"message":"roast successful","rid":rid}),200)

def roasts_get_roasts(user):
    json = request.get_json()
    if (not json
        or "keyword" not in json
        or not isinstance(json["keyword"],str)
        or json["keyword"] == ""
        or "index" not in json
        or not isinstance(json["index"],int)
        ):
        return message(400,"bad request parameter")
    keyword = json["keyword"]

    index = json["index"]
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    body = {
        "from" : index,
        "size" : 5,
        "query": {
            "bool": {
                "must": {
                    "multi_match" : {
                        "query": keyword, 
                        "type": "cross_fields",
                        "fields": ["title^3","tags^3","content.filename"],
                        "operator": "and"
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
    results = es.search(index="roasts",body=body)
    #results = [item["_source"]["aid"] for item in results["hits"]["hits"]]
    roast_results = results["hits"]["hits"]
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
                'db_id_uid': roast['_source']["rid"] + "_" + user["ruid"]
            }
        )
        if "Item" not in response:
            roast['_source']["user_liked"] = False
            roast['_source']["user_followed"] = False
        else:
            roast['_source']["user_liked"] = response["Item"]["to_user"]["like"]["like"]
            roast['_source']["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]
    
    results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','followed','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked','user_followed']} for item in roast_results]
    
    
    
    return make_response(jsonify({"message":"search success","results":results,"keyword":keyword,"index":index}),200)

def roasts_update_roast(user):
    # check input existence
    if (not "roast" in request.form):
        return message(400,"no roast found in request")
    
    roast = json.loads(request.form["roast"])

    if (not "content" in roast
        or not "title" in roast
        or not "tags" in roast
        or not "rid" in roast):
        return message(400,"lack of essential parts")
    
    # assign input
    tags = roast["tags"]
    title = roast["title"]
    content = roast["content"]
    rid = roast["rid"]
    files = request.files
    # check input type
    if (not isinstance(content,list)
        or not isinstance(title,str)
        or not isinstance(tags,list)
        or not isinstance(rid,str)):
        return message(400,"wrong type of request body parts")

    for item in tags:
        if not isinstance(item,str):
            return message(400,"wrong type of tags")
    
    # check file exists in s3
    content = upload_multi(content,files)
    if not isinstance(content,list):
            return content
    
    # check if user has ownership of this roast
    if rid not in user["roasts"]:
        return message(400,"you have no ownership of this roast")

    #roast
    try:
        response = ROASTS.get_item(
            Key={
                'visible':"True",
                'rid': rid
            }
        )
        #check if roast exist and visible
        if "Item" not in response:
            return message(400,"roast does not exist")
        #check if user has this roast
    except Exception as e:
        return message(400,"something wrong when looking up roast")
    #update roast
    try:
        result = ROASTS.update_item(
            Key={
                "visible":"True",
                "rid":rid
            },
            UpdateExpression="SET tags = :i, content = :j, title = :k",
            ExpressionAttributeValues={
                ':i':tags,
                ':j':content,
                ':k':title
            },
        )
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ROASTS, please try again.")
    except Exception as e:
        return message(400,"something wrong when looking up roast")
    #callback to user
    return message(200,"update successful")

def roasts_delete_roast(user):

    # check input existence and type
    roast = request.get_json()
    if ("rid" not in roast 
        or not isinstance(roast["rid"],str)):
        return message(400,"rid not exist or has wrong format")
    rid = roast["rid"]
    
    # check roast ownership
    if rid not in user["roasts"]:
        return message(400,"you have no ownership of this roast")
    
    # check roast exist
    try:
        response = ROASTS.get_item(
            Key={
                'visible':"True",
                'rid': rid
            }
        )
        if "Item" not in response:
            return message(400,"roast does not exist")
        new_roast = response["Item"]
        new_roast["visible"] = "False"
    except Exception as e:
        return message(400,"something wrong when looking up roast")
    #delete from user["roasts"]
    try:
        response = USERS.get_item(
            Key={
                'uid': user["uid"]
            }
        )
        if not response['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")
        if "Item" not in response:
            return message(400,"roast does not exist")
        roast_list = response["Item"]["roasts"]
        roast_list.remove(rid)

        result = USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression="SET roasts = :i",
            ExpressionAttributeValues={
                ':i': roast_list,
            },
        )
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")
    except Exception as e:
        return err_message(e)

    # comments_nicknames
    result = archive_comments_nicknames(rid)
    if result != True:
        return result

    #delete roast
    try:
        result = ROASTS.delete_item(
            Key={
                'visible':"True",
                'rid':rid
            },
        )
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ROASTS, please try again.")

        #archive roast
        result = ROASTS.put_item(
                Item=new_roast
            )        
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ROASTS, please try again.")
    except Exception as e:
        return err_message(e)
    #callback to user
    return message(200,"delete successful")


# def roasts_search_roasts_by_coor(user):
#     json = request.get_json()
#     if (not json
#         or "coordinate" not in json
#         or not isinstance(json["coordinate"],dict)
#         or not (len(json["coordinate"]) == 2)
#         or "index" not in json
#         or not isinstance(json["index"],int)
#         ):
#         return message(400,"bad request parameter")
#     coordinate = json["coordinate"]

#     index = json["index"]
#     es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
#     body = {
#         "from" : index,
#         "size" : 5,
#         "query": {
#             "bool": {
#                 "must": {
#                     "range" : {
#                         "content.latitude" : {
#                             "gte" : coordinate["latitude"] - 1,
#                             "lte" : coordinate["latitude"] + 1,
#                             "boost" : 2.0
#                         },
#                         "content.longitude" : {
#                             "gte" : coordinate["longitude"] - 1,
#                             "lte" : coordinate["longitude"] + 1,
#                             "boost" : 2.0
#                         },
#                     }
#                 },
#                 "filter": {
#                     "term": {
#                         "visible": "true"
#                     }
#                 }
#             }
#         }
#     }
#     results = es.search(index="roasts",body=body)
#     #results = [item["_source"]["aid"] for item in results["hits"]["hits"]]
#     roast_results = results["hits"]["hits"]
#     for roast in roast_results:
#         response = USERS.get_item(
#             Key={
#                 'uid': roast['_source']["author_ruid"]
#             }
#         )
#         if "Item" not in response:
#             roast['_source']["roast_thumbnail"] = "empty_profile_picture.png"
#         else:
#             roast['_source']["roast_thumbnail"] = response["Item"]["roast_thumbnail"]

#         response = DB_ID_TO_USER.get_item(
#             Key={
#                 'db_id_uid': roast['_source']["rid"] + "_" + user["ruid"]
#             }
#         )
#         if "Item" not in response:
#             roast['_source']["user_liked"] = False
#             roast['_source']["user_followed"] = False
#         else:
#             roast['_source']["user_liked"] = response["Item"]["to_user"]["like"]["like"]
#             roast['_source']["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]
    
#     results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','followed','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked','user_followed']} for item in roast_results]
    
#     return make_response(jsonify({"message":"search success","results":results,"keyword":keyword,"index":index}),200)

def roasts_get_roasts_by_coor(user):
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

    

    roast_results = utility_get_roasts_by_coor(user,visibleBounds)

    return make_response(jsonify({"message":"serch success","roast":roast_results,"info":info}))

def roasts_get_followed_roasts_by_user(user):
    body = request.get_json()
    print(not body)
    print(not "language" in body)
    print(not body["language"] in ["Eng","Chi"])
    print(not "start" in body)
    print(not isinstance(body["start"],int))
    if( not body
        or not "language" in body
        or not body["language"] in ["Eng","Chi"]
        or not "start" in body
        or not isinstance(body["start"],int)):
        return message(422,"insufficient info in request")
    ruid = user["ruid"]
    start = body["start"]
    language = body["language"]
    follow_list = follows_mp_get_roast(ruid,start)
    if follow_list["empty"] and start == 0:
        return make_response(jsonify({"message":getLans("No_followed",language=language),"follow_list":follow_list["results"]}),200)
    else:
        index = start + len(follow_list["results"])
        return make_response(jsonify({"message":"search success","follow_list":follow_list["results"],"index":index}),200)

def roasts_get_recommend_roasts_by_user(user):
    body = request.get_json()
    if( not body
        or not "start" in body
        or not isinstance(body["start"],int)):
        return message(422,"insufficient info in request")
    start = body["start"] 
    results = get_front_page_roasts_recommend(user,start)
    index = start + len(results)
    if(len(results) == 0):
        index = 0
    return make_response(jsonify({"message":"search success","recommend_list":results,"index":index}),200)

