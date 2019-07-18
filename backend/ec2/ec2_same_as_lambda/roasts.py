# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import err_message, message, check_file_exist_in_s3_n_sanitize_text, check_user_write_access, ARTICLES, MASKERS, USERS, ROASTS, COMMENTS_NICKNAMES,get_nickname,LIKES
from requests_aws4auth import AWS4Auth
from comments_nicknames import archive_comments_nicknames
from upload import upload_multi
import uuid
import json

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
                        "type": "phrase",
                        "fields": ["title^3","tags^3","content.filename"] 
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

        response = LIKES.get_item(
            Key={
                'object_type_id_userid': "ROASTS" + "_" + roast['_source']["rid"] + "_" + user["ruid"]
            }
        )
        if "Item" not in response:
            roast['_source']["user_liked"] = False
        else:
            roast['_source']["user_liked"] = True
    
    results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked']} for item in roast_results]
    
    
    
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


