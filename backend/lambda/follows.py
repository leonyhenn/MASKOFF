# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from multiprocessing.dummy import Pool as ThreadPool 
from boto3.dynamodb.conditions import Key, Attr
from elasticsearch import Elasticsearch, RequestsHttpConnection
import json
from utility import FRONT_PAGE_MASKER_BATCH_SIZE, FRONT_PAGE_ROAST_BATCH_SIZE, USERS, DB_ID_TO_USER, ARTICLES, ROASTS,replace_decimals
def follows_mp_get_author_thumbnail(info):
    uid_ruid = info["uid/ruid"]
    db_type = info["db_type"]
    if(db_type == "MASKERS" or db_type == "ARTICLES"):
        try:
            response = USERS.get_item(
            Key={
                'uid': uid_ruid
                }
            )
            if "Item" not in response:
                pass
            else:
                return replace_decimals(response["Item"]["roast_thumbnail"])
        except Exception as e:
            print(e)
            pass
    elif(db_type == "ROASTS"):
        try:
            response = USERS.scan(
                FilterExpression=Attr('ruid').eq(uid_ruid)
            )   
            if "Items" not in response:
                pass
            else:
                return replace_decimals(response["Items"][0]["roast_thumbnail"])
        except Exception as e:
            print(e)
            pass
            
            
def follows_mp_get_article_db_helper(aid):
    try:
        response = ARTICLES.get_item(
        Key={
            'partial_visible':"True",
            'aid': aid
            }
        )
        if "Item" not in response:
            pass
        else:
            return replace_decimals(response["Item"])
    except Exception as e:
        print(e)
        pass

def follows_mp_get_article(uid,start):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    
    follow_body = {
        "size" : FRONT_PAGE_ROAST_BATCH_SIZE,
        "from" : start,
        "query": {
            "bool": {
                "must": [
                    { "match_phrase": { "uid/ruid": uid }},
                    { "match_phrase": { "db_type": "ARTICLES"}},
                    { "match_phrase": { "to_user.follow.follow": "True"}}
                ]
            }
        },
        "sort" : [
            {"to_user.follow.timestamp" : {"order" : "desc"}}
        ]
    }
    follow_results = es.search(index="db_id_to_user",body=follow_body)
    follow_results = follow_results["hits"]["hits"]
    follow_results = [item["_source"]["db_id"] for item in follow_results]
    if(len(follow_results) == 0):
        return {"empty":True,"results":[]}
    pool = ThreadPool(len(follow_results))
    follow_list = pool.map(follows_mp_get_article_db_helper, follow_results)
    pool.close() 
    pool.join()
    return {"empty":False,"results":follow_list}
def follows_mp_get_roast_db_helper(rid):
    try:
        response = ROASTS.get_item(
        Key={
            'visible':"True",
            'rid': rid
            }
        )
        if "Item" not in response:
            pass
        else:
            return replace_decimals(response["Item"])
    except Exception as e:
        print(e)
        pass

def follows_mp_general_helper(info):
    rid = info["rid"]
    ruid = info["ruid"]
    pool = ThreadPool(2)
    result_user_thumbnail = pool.map_async(follows_mp_get_author_thumbnail,[{"uid/ruid":ruid,"db_type":"ROASTS"}])
    result_roast = pool.map_async(follows_mp_get_roast_db_helper,[rid])
    result_user_thumbnail = result_user_thumbnail.get()
    result_roast = result_roast.get()
    if(len(result_roast) == 1 and result_roast[0] != None):
        result_roast[0]["roast_thumbnail"] = "empty_profile_picture.png"
        if(len(result_user_thumbnail) == 1 and result_user_thumbnail[0] != None):
            result_roast[0]["roast_thumbnail"] = result_user_thumbnail[0]
        return result_roast[0]
    pool.close() 
    pool.join()
    return None



def follows_mp_get_roast(ruid,start):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    
    follow_body = {
        "size" : FRONT_PAGE_ROAST_BATCH_SIZE,
        "from" : start,
        "query": {
            "bool": {
                "must": [
                    { "match_phrase": { "uid/ruid": ruid }},
                    { "match_phrase": { "db_type": "ROASTS"}},
                    { "match_phrase": { "to_user.follow.follow": "True"}}
                ]
            }
        },
        "sort" : [
            {"to_user.follow.timestamp" : {"order" : "desc"}}
        ]
    }
    follow_results = es.search(index="db_id_to_user",body=follow_body)
    follow_results = follow_results["hits"]["hits"]
    follow_results = [{"rid":item["_source"]["db_id"],"ruid":item["_source"]["uid/ruid"]} for item in follow_results]
    if(len(follow_results) == 0):
        return {"empty":True,"results":[]}
    pool = ThreadPool(len(follow_results))
    follow_list = pool.map(follows_mp_general_helper, follow_results)
    # handle null situation
    return_list = list(filter(None, follow_list)) 

    pool.close() 
    pool.join()
    return {"empty":False,"results":return_list}
