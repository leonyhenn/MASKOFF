# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from multiprocessing.dummy import Pool as ThreadPool 
from elasticsearch import Elasticsearch, RequestsHttpConnection
import random

COMMENTS_CHRONO_BATCH_SIZE = 15
COMMENTS_HOT_BATCH_SIZE = 5

def es_get_comments(get_id,get_db,index,sort_field,order,size):
    # order in ["desc","asc"]
    # sort_field in ["date","liked"]
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    if(sort_field == "liked"):
        query_body = {
            "query": {
                "bool": {
                    "must": [
                        { "match_phrase": { "db_id": get_id }},
                        { "match_phrase": { "db_type": get_db}},
                        { "match_phrase": { "parent_id": "0"}},
                        { "match_phrase": { "reply_id": "0"}},
                    ],
                    "must_not": {
                        "term": {
                            "liked": "0"
                        }
                    },
                }
            },
            "sort" : [
                {sort_field : {"order" : order}}
            ]
        }
    elif(sort_field == "date"):
        query_body = {
            "size" : size,
            "from" : index,
            "query": {
                "bool": {
                    "must": [
                        { "match_phrase": { "db_id": get_id }},
                        { "match_phrase": { "db_type": get_db}},
                        { "match_phrase": { "parent_id": "0"}},
                        { "match_phrase": { "reply_id": "0"}},
                    ],
                }
            },
            "sort" : [
                {sort_field : {"order" : order}}
            ]
        }
    try:
      query_results = es.search(index="comments",body=query_body)
    except Exception as e:
      print(e)
      return []
    return [result["_source"] for result in query_results["hits"]["hits"]]

def get_subcomments(info):
    get_id = info["get_id"]
    get_db = info["get_db"]
    parent_id = info["parent_id"]
    size = info["size"]
    index = info["index"]
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    query_body = {
        "size" : size,
        "from" : index,
        "query": {
            "bool": {
                "must": [
                    { "match_phrase": { "db_id": get_id }},
                    { "match_phrase": { "db_type": get_db}},
                    { "match_phrase": { "parent_id": parent_id}}
                ]
            }
        },
        "sort" : [
            {"date" : {"order" : "asc"}}
        ]
    }
    try:
        query_results = es.search(index="comments",body=query_body)
    except Exception as e:
        print(e)
        return []
    return [result["_source"] for result in query_results["hits"]["hits"]]
def get_like_follow_by_user(info):
    cid = info["cid"]
    uid = info["uid"]
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    query_body = {
        "query": {
            "bool": {
                "must": [
                    { "match_phrase": { "db_id_uid": cid + "_" + uid }},
                ]
            }
        }
    }
    try:
        query_results = es.search(index="db_id_to_user",body=query_body)
    except Exception as e:
        print(e)
        return "False"
    if(len(query_results["hits"]["hits"]) > 0):
        return query_results["hits"]["hits"][0]["_source"]["to_user"]["like"]["like"]
    else:
      return "False"

def mp_get_comments_helper(info):
    comment = info["comment"]
    pool = ThreadPool(2)
    # info = {"get_id":get_id,"get_db":get_db,"parent_id":parent_id,"size":size,"index":index,"cid":cid,"uid":uid,"size":size}
    # in this use purpose, cid = parent_id
    subcomments_results = pool.map_async(get_subcomments,[info])
    like_follow_by_user_result = pool.map_async(get_like_follow_by_user,[info])
    subcomments_results = subcomments_results.get()[0]
    like_follow_by_user_result = like_follow_by_user_result.get()[0]
    # print(subcomments_results)
    # print(like_follow_by_user_result)
    pool.close() 
    pool.join()
    comment["sub_comments"] = subcomments_results
    comment["user_liked"] = like_follow_by_user_result
    return comment