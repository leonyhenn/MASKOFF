# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import err_message, message, check_file_exist_in_s3_n_sanitize_text, check_user_write_access, ARTICLES, MASKERS, USERS, remove_dup
from requests_aws4auth import AWS4Auth
from copy import deepcopy
import uuid




def maskers_post_masker(user):
    
    # check input
    masker = request.get_json() 
    if (not "name" in masker 
        or not "tags" in masker 
        or not "alias" in masker 
        or not "content" in masker):
        return message(400,"lack of essential info")
    
    # assign input
    name = masker["name"]
    content = masker["content"]
    tags = masker["tags"]
    alias = masker["alias"]

    # check input type
    if (not isinstance(name,str) 
        or not isinstance(content,list) 
        or not isinstance(tags,list) 
        or not isinstance(alias,list)):
        return message(400,"wrong type of essential information")
    for item in tags+alias:
        if not isinstance(item,str):
            return message(400,"wrong type of tags or alias")
    
    #check file exists in s3
    result = check_file_exist_in_s3_n_sanitize_text(content)
    if result != True:
        return result

    #check user post perm
    result = check_user_write_access(user)
    if result != True:
        return result

    #article
    mid = str(uuid.uuid4())
    aid = str(uuid.uuid4())
    article = {
            "aid":aid,
            "mid":mid,
            "author_uid":user["uid"],
            "tags":tags,
            "alias":alias,
            "content":content,
            "partial_visible":"True",
            "name":name
        }
    
    # post new article
    try:
        result = ARTICLES.put_item(
            Item=article
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating ARTICLES, please try again.")
    
    # masker
    new_masker = {
        "mid":mid,
        "name":name,
        "contributed":1,
        "articles":[aid],
        "total_visible":"True",
        "comments":[]
    }
    
    # post new masker
    try:
        result = MASKERS.put_item(
            Item=new_masker
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating ARTICLES, please try again.")
    
    # user
    # add article masker to user
    try:
        result = USERS.update_item(
            Key={
                "uid":user["uid"]
            },
            UpdateExpression="SET maskers_exposed = list_append(maskers_exposed, :i), articles = list_append(articles, :j)",
            ExpressionAttributeValues={
                ':i': [mid],
                ':j': [aid],
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating USERS, please try again.")
    #callback to user
    return make_response(jsonify({"message":"post success","mid":mid,"aid":aid}),200)


def maskers_get_masker_by_search(user):
    json = request.get_json()
    if (not json
        or "keyword" not in json
        or not isinstance(json["keyword"],str)
        or json["keyword"] == ""):
        return message(400,"bad request parameter")
    keyword = json["keyword"]
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    body = {
      "query": {
        "multi_match" : {
          "query": keyword, 
          "type": "most_fields",
          "fields": ["name^3","alias^3","tags^3","content.filename"] 
        }
      },
    }
    results = es.search(index="articles",body=body)
    #results = [item["_source"]["aid"] for item in results["hits"]["hits"]]

    results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name']} for item in results["hits"]["hits"]]
        
        
    return make_response(jsonify({"message":"search success","results":results}),200)

def maskers_get_masker(user,mid):
    try:
        response = MASKERS.get_item(
            Key={
                'total_visible':"True",
                'mid': mid
            }
        )
        #check if article exist and visible
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"masker does not exist")
    masker = deepcopy(response["Item"])
    articles = deepcopy(masker["articles"])
    masker["articles"] = []
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
            return err_message(e)
        if "Item" not in response:
            continue
        masker["articles"].append(response["Item"])
    masker["contributed"] = str(masker["contributed"])
    return make_response(jsonify({"message":"get success","masker":masker}),200)
