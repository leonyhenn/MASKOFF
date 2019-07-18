# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from boto3.dynamodb.conditions import Key, Attr
from multiprocessing.dummy import Pool as ThreadPool 
from elasticsearch import Elasticsearch, RequestsHttpConnection
import json
from follows import follows_mp_get_roast, follows_mp_get_article
from utility import FRONT_PAGE_MASKER_BATCH_SIZE, FRONT_PAGE_ROAST_BATCH_SIZE, USERS, DB_ID_TO_USER, ARTICLES, ROASTS
from mosaic import is_cjk, cjk_substrings, cjk_mosaic, mosaic_contacts, process_name_contacts
import time
def get_front_page_maskers_recommend(user,start):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    masker_keyword = "章文"
    masker_body = {
        "size" : FRONT_PAGE_MASKER_BATCH_SIZE,
        "from" : start,
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
        article['_source']["name"] = mosaic_name

        contacts = article['_source']["contacts"]
        mo_contacts = mosaic_contacts(contacts)
        article['_source']["contacts"] = mo_contacts

        # for item in article['_source']["content"]:
        #     if item["type"] == "text":
        #         process_name_contacts(masker_name,mosaic_name,contacts,mo_contacts)
    masker_results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name','liked','followed','comments_count','contributed','author_nickname','post_date','user_liked','user_followed','contacts','live_until']} for item in masker_results]
    
    return masker_results

def get_front_page_maskers_follow(user):
    follow_list = follows_mp_get_article(user["uid"],0)
    return follow_list

def get_front_page_roasts_recommend(user,start):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    
    roast_keyword = "舒适"
    roast_body = {
      "size" : FRONT_PAGE_ROAST_BATCH_SIZE,
      "from" : start,
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
        
        response = USERS.scan(
            FilterExpression=Attr('ruid').eq(roast['_source']["author_ruid"])
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

    roast_results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_ruid','liked','followed','comments_count','author_nickname','roast_thumbnail','timestamp','user_liked','user_followed']} for item in roast_results]
    return roast_results

def get_front_page_roasts_follow(user):
    follow_list = follows_mp_get_roast(user["ruid"],0)
    return follow_list

def get_front_page_helper(info):
    user = info[0]
    info_type = info[1]
    if(info_type == "maskers_recommend"):
        return get_front_page_maskers_recommend(user,0)
    elif(info_type == "maskers_follow"):
        return get_front_page_maskers_follow(user)["results"]
    elif(info_type == "roasts_recommend"):
        return get_front_page_roasts_recommend(user,0)
    elif(info_type == "roasts_follow"):
        return get_front_page_roasts_follow(user)["results"]

def frontpage_get_front_page(user):
    start = time.time()
    get_front_page_helper_input = [(user,"maskers_recommend"),(user,"maskers_follow"),(user,"roasts_recommend"),(user,"roasts_follow")]
    pool = ThreadPool(4)
    follow_list = pool.map(get_front_page_helper, get_front_page_helper_input)
    pool.close() 
    pool.join()
    
    front_page = {"Roast":{
                         "Recommend":follow_list[2],
                         "Follow":follow_list[3],
                         "Keywords":[{"content":"舒适","type":"hot"}]
                         },
                  "Masker":{
                         "Recommend":follow_list[0],
                         "Follow":follow_list[1],
                         "Keywords":[{"content":"章文","type":"hot"},{"content":"刘宇辰","type":"search"}]
                  }}
    print(time.time() - start)
    return front_page
