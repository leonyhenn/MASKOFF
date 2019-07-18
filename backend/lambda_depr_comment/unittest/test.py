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

jiangfangzhou_pn = "8613789897676"
def register_and_upgrade_jiangfangzhou():
    requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
    jiangfangzhou_in_db = get_a_user_scan()["uid"]
    valid_access_token_with_write = generateAccessToken(jiangfangzhou_in_db)
    headers = {"access_token":valid_access_token_with_write}
    requests.post(url + "/users/write_access",json={"phone_number":jiangfangzhou_pn},headers=headers)
    return (jiangfangzhou_in_db, headers)
jiangfangzhou_article = {       
        "alias":["公共知识分子","作家"],
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
    }
def post_a_masker(jiangfangzhou=None):
    if jiangfangzhou == None:
        (user_in_db,headers) = register_and_upgrade_jiangfangzhou()
        article = deepcopy(jiangfangzhou_article)
    else:
        (user_in_db,headers) = register_and_upgrade_nvlvshi(jiangfangzhou)
        article = deepcopy(nvlvshi_article)
    article["name"] = "zhangwen"
    r = requests.post(url + "/maskers",json=article,headers=headers)
    mid = get_maskers_scan()[0]["mid"]
    first_aid = get_from_MASKERS(mid)["articles"][0]
    return (user_in_db,headers,mid,first_aid)




post_a_masker()