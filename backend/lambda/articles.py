# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from flask import request, make_response, jsonify
from utility import check_file_exist_in_s3_n_sanitize_text,\
                    check_user_write_access,\
                    err_message, \
                    get_nickname,\
                    message,\
                    MASKERS, ARTICLES, USERS, COMMENTS_NICKNAMES,DB_ID_TO_USER, \
                    calculate_update_delete_date,\
                    FRONT_PAGE_MASKER_BATCH_SIZE
from mosaic import is_cjk, cjk_substrings, cjk_mosaic, mosaic_contacts, process_name_contacts
from follows import follows_mp_get_article
from comments_nicknames import archive_comments_nicknames
from upload import upload_multi
import uuid
import json
from decimal import *
from elasticsearch import Elasticsearch, RequestsHttpConnection
from frontpage import get_front_page_maskers_recommend

def articles_post_article(user):
    try:
        if (not "masker" in request.form):
            return message(400,"no file found in request")

        masker = json.loads(request.form["masker"])

        # check input type
        if (not isinstance(masker,dict)
            or "mid" not in masker 
            or not isinstance(masker["mid"],str)
            or "content" not in masker
            or not isinstance(masker["content"],list)
            or "alias" not in masker
            or not isinstance(masker["alias"],list)
            or "tags" not in masker
            or not isinstance(masker["tags"],list)
            or "contacts" not in masker
            or not isinstance(masker['contacts'],dict)):
            return message(400,"lack of mid or content, or their type is wrong")
        # assign input
        contacts = masker['contacts']
        mid = masker["mid"]
        content = masker["content"]
        tags = masker["tags"]
        alias = masker["alias"]
        files = request.files

        if not ((set(list(contacts.keys())) == set(["wechat","cellphone","other_key","other_value"])) and (len(list(contacts.keys())) == len(["wechat","cellphone","other_key","other_value"]))):
            return message(400,"wrong type of contact")

        if not (isinstance(contacts["other_key"],str) and isinstance(contacts["other_key"],str)):
            return message(400,"wrong type of contact['others']") 

        # upload all files contained
        content = upload_multi(content,files)
        if not isinstance(content,list):
            return content
        
        # for items in tags and alias, check each's type
        for item in masker["alias"] + masker["tags"]:
            if not isinstance(item,str):
                return message(400,"wrong type for alias or tag info")
        
        # if alias is an empty list, assign it to null to avoid Dynamodb bugs
        if len(alias) == 1 and alias[0] == "":
            alias = None

        #check user perm to post
        result = check_user_write_access(user)
        if result != True:
            return result
    
        # check if user is exposing same makser again
        if mid in user["maskers_exposed"]:
            return message(400,"You have already exposed this masker. please use update masker to update your article")
    
        #check if the masker exist
        try:
            response = MASKERS.get_item(
                Key={
                    'total_visible':"True",
                    'mid': mid,
                }
            )
        except Exception as e:
            return err_message(e)
        if "Item" not in response:
            return message(400,"masker do not exist")
        masker_in_db = response["Item"] 
        # otherwise
        # generate an id for this article
        aid = str(uuid.uuid4())
        nickname = get_nickname("Chinese")

        # calculate_update_delete_date(mid,contributed,first_post_date,articles=None):
        live_until = calculate_update_delete_date(masker_in_db["mid"],masker_in_db["contributed"],masker_in_db["first_post_date"],articles=masker_in_db["articles"])

        article = {
                "aid":aid,
                "mid":mid,
                "author_uid":user["uid"],
                "tags":tags,
                "alias":alias,
                "content":content,
                "partial_visible":"True",
                "post_date":datetime.utcnow().isoformat(),
                "name":masker_in_db["name"],
                "liked":0,
                "followed":0,
                "comments_count":0,
                "contributed":masker_in_db["contributed"] + 1,
                "author_nickname":nickname,
                "contacts":contacts,
                "live_until":live_until
            }
        # comments_nicknames

        try:
            result = COMMENTS_NICKNAMES.put_item(
                Item={
                    'parent_id':aid,
                    'visible':"True",
                    'uid_nickname_pair':{user["uid"]:nickname}
                }
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating COMMENTS_NICKNAMES, please try again.")

        # masker
        # 1. add article to related masker
        try:
            result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
                    "mid":mid
                },
                UpdateExpression="SET articles = list_append(articles, :i), contributed = contributed + :j ",
                ExpressionAttributeValues={
                    ':i': [aid],
                    ':j':1,
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating MASKERS, please try again.")
        #article

        #2. add article to ARTICLES
        try:
            result = ARTICLES.put_item(
                Item=article
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ARTICLES, please try again.")


        #for all other aritcles under this masker, update their contributed count
        for i in range(len(masker_in_db["articles"])):
            print(masker_in_db["articles"][i])
            try:
                result = ARTICLES.update_item(
                    Key={
                        "partial_visible":"True",
                        "aid":masker_in_db["articles"][i]
                    },
                    UpdateExpression="SET contributed = contributed + :j ",
                    ExpressionAttributeValues={
                        ':j':1,
                    },
                )
            except Exception as e:
                print(e)
                return err_message(e)
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating MASKERS, please try again.")
        #user
        #3. add aid to user[articles]
        #4. add masker to user[masker exposed] if user never posted this masker before
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
        #5.callback to user says its done
        return make_response(jsonify({"message":"post success","mid":mid,"aid":aid}),200)
    except Exception as e:
        return err_message(e)

def articles_update_article(user):
    if (not "article" in request.form):
        return message(400,"no file found in request")
    
    new_article = json.loads(request.form["article"])

    # check input existence
    if (not isinstance(new_article,dict)
        or "aid" not in new_article 
        or "content" not in new_article 
        or "tags" not in new_article 
        or "alias" not in new_article):
        return message(400,"lack of essential information")

    # assign input
    aid = new_article["aid"]
    content = new_article["content"]
    tags = new_article["tags"]
    alias = new_article["alias"]
    files = request.files

    # check input type
    if (not isinstance(aid,str) 
        or not isinstance(content,list) 
        or not isinstance(tags,list) 
        or not isinstance(alias,list)):
        return message(400,"wrong type of essential information")

    for item in tags+alias:
        if not isinstance(item,str):
            return message(400,"wrong type of tags or alias")
    

    # if alias is an empty list, assign it to null to avoid Dynamodb bugs
    if len(alias) == 1 and alias[0] == "":
        alias = None
        
    #upload all files contained
    content = upload_multi(content,files)
    if not isinstance(content,list):
            return content
            
    #check user perm to post
    result = check_user_write_access(user)
    if result != True:
        return result

    #check article exist and visible
    response = ARTICLES.get_item(
        Key={
            'partial_visible':"True",
            'aid': aid   
        }
    )
    if 'Item' not in response:
        return message(400,"article DNE")

    #check aid of the article belongs to user
    if not aid in user["articles"]:
        return message(400,"wrong owner of article")
    
    #sanitize text input
    #####!!!NOT COMPLETE!!!######
    #update article
    try:
        result = ARTICLES.update_item(
            Key={
                'partial_visible':"True",
                'aid':aid
            },
            UpdateExpression="SET content = :i, tags = :j, alias = :k, post_date = :l",
            ExpressionAttributeValues={
                ':i': content,
                ':j': tags,
                ':k': alias,
                ':l': datetime.utcnow().isoformat()
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")
    return message(200,"put successful")

def articles_delete_article(user):
    article = request.get_json()

    # check input type and existence
    if ("aid" not in article 
        or not isinstance(article["aid"],str)):
        return message(400,"aid not exist or has wrong format")

    # assign input 
    aid = article["aid"]

    #check if user has this article
    if aid not in user["articles"]:
        return message(400,"you have no ownership of this article")

    #check article exist
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
        return message(400,"article does not exist")
    new_article = response["Item"]
    new_article["partial_visible"] = "False"

    # find related masker
    mid = new_article["mid"]
    try:
        response = MASKERS.get_item(
            Key={
                'total_visible':"True",
                'mid': mid
            }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"no such masker")

    masker = response["Item"]
    if aid not in masker["articles"]:
        return message(400,"masker has no such article")
    
    # if article is last one of the masker,hide masker
    if len(masker["articles"]) < 2:
        # delete masker
        masker["total_visible"] = "False" 
        try:
            result = MASKERS.delete_item(
                Key={
                    'total_visible':"True",
                    'mid':mid
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating, please try again.")
        # archive this article
        try:
            result = MASKERS.put_item(
                Item=masker
            )
        except Exception as e:
            return err_message(e)     
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating, please try again.")

        # comments_nicknames
        result = archive_comments_nicknames(mid)
        if result != True:
            return result

        user["maskers_exposed"].remove(mid)
        user["articles"].remove(aid)
        # update user related info
        try:
            result = USERS.update_item(
                Key={
                    "uid":user["uid"]
                },
                UpdateExpression="SET maskers_exposed = :i, articles = :j",
                ExpressionAttributeValues={
                    ':i': user["maskers_exposed"],
                    ':j': user["articles"]
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")  
    else:
        # remove the article from masker
        masker["articles"].remove(aid)
        try:
            result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
                    "mid":mid
                },
                UpdateExpression="SET articles = :i,contributed = contributed - :j",
                ExpressionAttributeValues={
                    ':i': masker["articles"],
                    ':j':1
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating MASKERS, please try again.")  

        # comments_nicknames
        result = archive_comments_nicknames(aid)
        if result != True:
            return result

        user["maskers_exposed"].remove(mid)
        user["articles"].remove(aid)
        # update related user info
        try:
            result = USERS.update_item(
                Key={
                    "uid":user["uid"]
                },
                UpdateExpression="SET maskers_exposed = :i, articles = :j",
                ExpressionAttributeValues={
                    ':i': user["maskers_exposed"],
                    ':j': user["articles"]
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")  
    # delete this article
    try:
        result = ARTICLES.delete_item(
            Key={
                'partial_visible':"True",
                'aid':aid
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")

    # archive this article
    try:
        result = ARTICLES.put_item(
            Item=new_article
        )   
    except Exception as e:
        return err_message(e)     
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")

    #callback to user
    return message(200,"delete successful")

def articles_get_article(user,aid):
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
        return message(400,"article does not exist")
    article = response["Item"]
    article["liked"] = str(article["liked"])
    article["followed"] = str(article["followed"])
    article["comments_count"] = str(article["comments_count"])
    article["contributed"] = str(article["contributed"])
    for item in article["content"]:
        if item["type"] == "location":
            item["latitude"] = float(item["latitude"])
            item["longitude"] = float(item["longitude"])
        if item["type"] == "vote":
            for i in range(len(item["counts"])):
                item["counts"][i]=float(item["counts"][i])
    response = DB_ID_TO_USER.get_item(
            Key={
                'db_id_uid': article["aid"] + "_" + user["uid"]
            }
        )
    if "Item" not in response:
        article["user_liked"] = False
        article["user_followed"] = False
    else:
        article["user_liked"] = response["Item"]["to_user"]["like"]["like"]
        article["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]

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

    return make_response(jsonify({"message":"get success","article":article}),200)

def articles_get_articles_by_coor(user):
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
                        "partial_visible": "true"
                    }
                }
            }
        }
    }
    masker_results = es.search(index="articles",body=query_body)
    masker_results = masker_results['hits']['hits']
    for article in masker_results:
        for line in article["_source"]["content"]:
            if line["type"] == "location":
                if(line["latitude"]<= right and line["latitude"] >= left and line["longitude"] >= bottom and line["longitude"] <= top ):
                    article["_source"]["coordinate"] = line
        response = DB_ID_TO_USER.get_item(
            Key={
                'db_id_uid': article['_source']["aid"] + "_" + user["uid"]
            }
        )
        if "Item" not in response:
            article["_source"]["user_liked"] = False
            article["_source"]["user_followed"] = False
        else:
            article["_source"]["user_liked"] = response["Item"]["to_user"]["like"]["like"]
            article["_source"]["user_followed"] = response["Item"]["to_user"]["follow"]["follow"]
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
    masker_results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name','liked','followed','comments_count','contributed','author_nickname','post_date','user_liked','user_followed','coordinate','contacts']} for item in masker_results]

    return make_response(jsonify({"message":"serch success","masker":masker_results,"info":info}))

def articles_get_followed_articles_by_user(user):
    body = request.get_json()

    if( not body
        or not "language" in body
        or not body["language"] in ["Eng","Chi"]
        or not "start" in body
        or not isinstance(body["start"],int)):
        return message(422,"insufficient info in request")
    uid = user["uid"]
    start = body["start"]
    language = body["language"]
    follow_list = follows_mp_get_article(uid,start)
    if follow_list["empty"] and start == 0:
        return make_response(jsonify({"message":getLans("No_followed",language=language),"follow_list":follow_list["results"]}),200)
    else:
        index = start + len(follow_list["results"])
        return make_response(jsonify({"message":"search success","follow_list":follow_list["results"],"index":index}),200)
    
def articles_get_recommend_articles_by_user(user):
    body = request.get_json()
    if( not body
        or not "start" in body
        or not isinstance(body["start"],int)):
        return message(422,"insufficient info in request")
    start = body["start"]
    results = get_front_page_maskers_recommend(user,start)
    index = start + len(results)
    if(len(results) == 0):
        index = 0
    return make_response(jsonify({"message":"search success","recommend_list":results,"index":index}),200)

