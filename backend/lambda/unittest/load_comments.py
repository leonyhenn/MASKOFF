# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from boto3.dynamodb.conditions import Key, Attr
from utility_decoy_data import *
from users_decoy_data import *
from articles_decoy_data import *
from dynamodb import *
import requests
import json
from copy import deepcopy
url = "http://127.0.0.1:5000"
import boto3
from random import randint


def register_and_upgrade_jiangfangzhou():
    r1 = requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
    if not r1.status_code == 200:
        raise ValueError("register_and_upgrade_jiangfangzhou failed")
    jiangfangzhou_in_db = json.loads(r1.content)["uid"]
    valid_access_token_with_write = generateAccessToken(jiangfangzhou_in_db)
    headers = {"access_token":valid_access_token_with_write}
    r2 = requests.post(url + "/users/write_access",json={"phone_number":jiangfangzhou_pn},headers=headers)
    return (jiangfangzhou_in_db, headers)

#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi()
def register_and_upgrade_nvlvshi(jiangfangzhou_in_db):
    r1 = requests.post(url + "/users",json={"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"})
    if not r1.status_code == 200:
        raise ValueError("register_and_upgrade_jiangfangzhou failed")
    nvlvshi_in_db = json.loads(r1.content)["uid"]
    valid_access_token_with_write = generateAccessToken(nvlvshi_in_db)
    headers = {"access_token":valid_access_token_with_write}
    r2 = requests.post(url + "/users/write_access",json={"phone_number":"nvlvshi"},headers=headers)
    if not r2.status_code == 200:
        raise ValueError("register_and_upgrade_jiangfangzhou failed")
    return (nvlvshi_in_db, headers)

#(no_cellphone_in_db, headers_no) = register_no_cellphone(jiangfangzhou_in_db)
def register_no_cellphone():
    r1 = requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
    if not r1.status_code == 200:
        raise ValueError("register_and_upgrade_jiangfangzhou failed")
    no_cellphone_in_db = json.loads(r1.content)["uid"]
    valid_access_token_without_write = generateAccessToken(no_cellphone_in_db)
    headers = {"access_token":valid_access_token_without_write}
    return (no_cellphone_in_db, headers)

jiangfangzhou_article = {       
        "alias":["公共知识分子","作家"],
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
    }

jiangfangzhou_roast = {       
        "title":"nvlvshi_roast",
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
    }


jiangfangzhou_pn = "8613789897676"
def jiangfangzhou_comment(mrid,is_masker,parent_id,reply_id,content):
    return {
        "at":"user_1",
        "mrid":mrid,
        "content":{"type":"text/plain","filename":"comment #"+content},
        "is_masker":is_masker,
        "parent_id":parent_id,
        "reply_id":reply_id
        }
#(jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
def post_a_masker():
    (user_in_db,headers) = register_and_upgrade_jiangfangzhou()
    article = deepcopy(jiangfangzhou_article)
    article["name"] = "zhangwen"
    r = requests.post(url + "/maskers",json=article,headers=headers)
    mid = json.loads(r.content)["mid"]
    first_aid = json.loads(r.content)["aid"]
    return (user_in_db,headers,mid,first_aid)

#(jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
def post_a_roast():
    (jiangfangzhou_in_db,headers) = register_and_upgrade_jiangfangzhou()
    ro1 = deepcopy(jiangfangzhou_roast)
    r1 = requests.post(url + "/roasts",json=ro1,headers=headers)
    first_rid = json.loads(r1.content)["rid"]
    return (jiangfangzhou_in_db,headers,first_rid)


delete_all()
(jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
print(headers,mid)
parent_comments = []
child_comments = []
for i in range(46):
    c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0",str(i)))
    r1 = requests.post(url + "/comments",json=c1,headers=headers)
    print(r1.status_code)
    c1_cid = json.loads(r1.content)["cid"]
    parent_comments.append(c1_cid)
# for i in range(46):
#     for j in range(randint(16,46)):
#         c1 = deepcopy(jiangfangzhou_comment(mid,True,parent_comments[i],"0","sub"+str(j)))
#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         print(r1.status_code)
#         c1_cid = json.loads(r1.content)["cid"]


