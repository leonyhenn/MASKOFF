# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from flask import request, make_response, jsonify
from elasticsearch import Elasticsearch, RequestsHttpConnection
from utility import err_message, message, check_file_exist_in_s3_n_sanitize_text, check_user_write_access, ARTICLES, MASKERS, USERS, remove_dup, COMMENTS_NICKNAMES, get_nickname, DB_ID_TO_USER, similar, calculate_update_delete_date
from mosaic import is_cjk, cjk_substrings, cjk_mosaic, mosaic_contacts, process_name_contacts
from requests_aws4auth import AWS4Auth
from upload import upload_multi
from copy import deepcopy
import uuid
import json
import re

def maskers_post_masker(user):
    
    if (not "masker" in request.form):
        return message(400,"no masker found in request")
    
    masker = json.loads(request.form["masker"])

    # check input
    if (not isinstance(masker,dict)
        or not "name" in masker 
        or not "tags" in masker 
        or not "alias" in masker 
        or not "content" in masker
        or not "contacts" in masker):
        return message(400,"lack of essential info")
    
    # assign input
    name = masker["name"]
    content = masker["content"]
    tags = masker["tags"]
    alias = masker["alias"]
    contacts = masker["contacts"]
    files = request.files

    # check input type
    if (not isinstance(name,str) 
        or not isinstance(content,list) 
        or not isinstance(tags,list) 
        or not isinstance(alias,list)
        or not isinstance(contacts,dict)):
        return message(400,"wrong type of essential information")
    
    for item in tags+alias:
        if not isinstance(item,str):
            return message(400,"wrong type of tags or alias")
    
    # if alias is an empty list, assign it to null to avoid Dynamodb bugs
    if len(alias) == 1 and alias[0] == "":
        alias = None


    if not ((set(list(contacts.keys())) == set(["wechat","cellphone","other_key","other_value"])) and (len(list(contacts.keys())) == len(["wechat","cellphone","other_key","other_value"]))):
        return message(400,"wrong type of contact")


    if not (isinstance(contacts["other_key"],str) and isinstance(contacts["other_value"],str)):
        return message(400,"wrong type of contact['other_key'] or ['other_value']")        

    # upload all files contained
    content = upload_multi(content,files)
    if not isinstance(content,list):
            return content

    #check user post perm
    result = check_user_write_access(user)
    if result != True:
        return result

    #article
    mid = str(uuid.uuid4())
    aid = str(uuid.uuid4())
    nickname = get_nickname("Chinese")

    # calculate_update_delete_date(mid,contributed,first_post_date,articles=None):
    live_until = calculate_update_delete_date(mid,0,datetime.utcnow().isoformat(),articles=None)
    
    article = {
            "aid":aid,
            "mid":mid,
            "author_uid":user["uid"],
            "tags":tags,
            "alias":alias,
            "content":content,
            "partial_visible":"True",
            "post_date":datetime.utcnow().isoformat(),
            "name":name,
            "liked":0,
            "followed":0,
            "comments_count":0,
            "contributed":1,
            "author_nickname":nickname,
            "contacts":contacts,
            "live_until":live_until
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
        "articles":[aid],
        "total_visible":"True",
        "liked":0,
        "followed":0,
        "comments_count":0,
        "contributed":1,
        "first_post_date":datetime.utcnow().isoformat(),
        "live_until":live_until
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
    
    # comments_nicknames
    try:
        result = COMMENTS_NICKNAMES.put_item(
            Item={
                'parent_id':mid,
                'visible':"True",
                'uid_nickname_pair':{user["uid"]:nickname}
            }
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating COMMENTS_NICKNAMES, please try again.")

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
        "size" : 10,
        "query": {
            "bool": {
                    "must": {
                        "multi_match" : {
                            "query": keyword, 
                            "type": "cross_fields",
                            "fields": ["name^3","alias^3","tags^3","content.filename","contacts.wechat^3","contacts.cellphone^3","contacts.other_value^3"],
                            "operator": "and"
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
    results = es.search(index="articles",body=body)
    #results = [item["_source"]["aid"] for item in results["hits"]["hits"]]
    masker_results = results["hits"]["hits"]
    for article in masker_results:
        article['_source']["liked"] = str(article['_source']["liked"])
        response = DB_ID_TO_USER.get_item(
            Key={
                'db_id_uid': article['_source']["aid"] + "_" + user["uid"]
            }
        )
        if "Item" not in response:
            article['_source']["user_liked"] = False
            article['_source']["user_followed"] = False
        else:
            article['_source']["user_liked"] = response["Item"]["to_user"]["like"]["like"]
            article['_source']["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]
        
        masker_name = article['_source']["name"]
        mosaic_name = ""
        for sub in cjk_substrings(masker_name):
            mosaic_name += cjk_mosaic(sub,is_cjk(sub[0]))
        article['_source']["name_similarity"] = similar(keyword,article['_source']["name"])
        article['_source']["name"] = mosaic_name
        article['_source']["contacts_similarity"] = {"wechat":similar(keyword,article['_source']["contacts"]["wechat"]),
                                                  "cellphone":similar(keyword,article['_source']["contacts"]["cellphone"]),
                                                  "other":similar(keyword,article['_source']["contacts"]["other_value"])}
        contacts = article['_source']["contacts"]
        mo_contacts = mosaic_contacts(contacts)
        article['_source']["contacts"] = mo_contacts
        
        # for item in article['_source']["content"]:
        #     if item["type"] == "text":
        #         process_name_contacts(masker_name,mosaic_name,contacts,mo_contacts)
    results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name','liked','followed','comments_count','contributed','author_nickname','post_date','user_liked','user_followed','contacts','contacts_similarity','name_similarity','live_until']} for item in masker_results]
    return make_response(jsonify({"message":"search success","results":results,"keyword":keyword,"index":index}),200)

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
        article = response["Item"]
        article["liked"] = str(article["liked"])
        article["followed"] = str(article["followed"])
        article["comments_count"] = str(article["comments_count"])
        article["contributed"] = str(article["contributed"])
        
        masker_name = article["name"]
        mosaic_name = ""
        for sub in cjk_substrings(article["name"]):
            mosaic_name += cjk_mosaic(sub,is_cjk(sub[0]))
        article["name"] = mosaic_name

        contacts = article["contacts"]
        mo_contacts = mosaic_contacts(contacts)
        article["contacts"] = mo_contacts

        for item in article["content"]:
            if item["type"] == "location":
                item["latitude"] = float(item["latitude"])
                item["longitude"] = float(item["longitude"])
            if item["type"] == "vote":
                for i in range(len(item["counts"])):
                    item["counts"][i]=float(item["counts"][i])
            if item["type"] == "text":
                process_name_contacts(masker_name,mosaic_name,contacts,mo_contacts)
        masker["articles"].append(article)

    masker["contributed"] = str(masker["contributed"])
    masker["liked"] = str(masker["liked"])
    masker["followed"] = str(masker["followed"])
    masker["comments_count"] = str(masker["comments_count"])
    response = DB_ID_TO_USER.get_item(
            Key={
                'db_id_uid': masker["mid"] + "_" + user["uid"]
            }
        )
    if "Item" not in response:
        article["user_liked"] = False
        article["user_followed"] = False
    else:
        article["user_liked"] = response["Item"]["to_user"]["like"]["like"]
        article["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]
    return make_response(jsonify({"message":"get success","masker":masker}),200)
