# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from copy import deepcopy
import json
import requests

from utility import *

url = "http://127.0.0.1:5000"


#test masker search

jiangfangzhou_pn = "8613789897676"
def register_and_upgrade_jiangfangzhou():
    requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
    jiangfangzhou_in_db = get_a_user_scan()["uid"]
    valid_access_token_with_write = generateAccessToken(jiangfangzhou_in_db)
    headers = {"access_token":valid_access_token_with_write}
    requests.post(url + "/users/write_access",json={"phone_number":jiangfangzhou_pn},headers=headers)
    return (jiangfangzhou_in_db, headers)

#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi()
def register_and_upgrade_nvlvshi(jiangfangzhou_in_db):
    requests.post(url + "/users",json={"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"})
    nvlvshi_in_db = get_users_scan()
    nvlvshi_in_db.remove({"uid":jiangfangzhou_in_db})
    nvlvshi_in_db = nvlvshi_in_db[0]["uid"]
    valid_access_token_with_write = generateAccessToken(nvlvshi_in_db)
    headers = {"access_token":valid_access_token_with_write}
    requests.post(url + "/users/write_access",json={"phone_number":"nvlvshi"},headers=headers)
    return (nvlvshi_in_db, headers)

masker_article1 = {       
        "alias":["公共知识分子","作家"],
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}],
        "name":"章文"
    }
masker_article2 = {
        "alias":["南京师范大学新闻学硕士"],
        "tags":["强奸","媒体人","时事评论员","公知","专栏作家","饭局后"],
        "content":[{"type":"image/jpeg","filename":"Rbxi-hftenia2500242.png"},{"type":"image/jpeg","filename":"gBKW-hftenia2519068.jpg"},{"type":"image/jpeg","filename":"8721e49bly1ftlssuzty0j20ku112dk1.jpg"}],
        "name":"章文"
    }
masker_article3 = {
    "tags":["移民","美国大使馆","性骚扰"],
    "content":[{"type":"image/jpeg","filename":"595ad6fegy1ftqllvc47oj20ms8c0e81.jpg"},{"type":"image/jpeg","filename":"v2-27e4262cc267db567ab2fbccebf6d848_b.jpg"}],
    "alias":[],
    "name":"章文"
}
masker_article4 = {
    "tags":["性骚扰","白天约喝酒"],
    "content":[{"type":"text/plain","filename":"刚刚看他打“荡妇牌”，说蒋方舟男友多，易小荷离过婚，试图污名化受害者，我王嫣芸离了两次婚了，做过人体模特，不穿衣服的照片到处都是，在他眼里应该算彻头彻尾的荡妇吧？那为什么还打了他？能解释一下吗？挨打的时候没想过为什么吗？"},{"type":"text/plain","filename":"刚刚看他打荡妇牌,说蒋方舟男友多,易小荷离过婚,试图污名化受害者,我王嫣芸离了两次婚了,做过人体模特,不穿衣服的照片到处都是,在他眼里应该算彻头彻尾的荡妇吧?那为什么还打了他?能解释一下吗?挨打的时候没想过为什么吗?"}],
    "alias":["章老师,章教授"],
    "name":"章文"   
}
masker_article5 = {
    "tags":["我是清白的","两情相悦"],
    "content":[{"type":"image/jpeg","filename":"R67U-hftenia2449125.png"},{"type":"image/jpeg","filename":"v2-40389313b3b31f6cfee435bda0164ea8_hd.jpg"}],
    "alias":[],
    "name":"章文"
}
def post_a_masker(article,headers,name):
    article["name"] = name
    r = requests.post(url + "/maskers",json=article,headers=headers)
    print(r.status_code)
    print(json.loads(r.content))
    mid = json.loads(r.content)["mid"]
    first_aid = json.loads(r.content)["aid"]
    return (mid,first_aid)



delete_all()
user1 = {"smacc":"user1","smacc_type":"WeChat","gender":"0"}
user2 = {"smacc":"user2","smacc_type":"WeChat","gender":"0"}
user3 = {"smacc":"user3","smacc_type":"WeChat","gender":"0"}
user4 = {"smacc":"user4","smacc_type":"WeChat","gender":"0"}
user5 = {"smacc":"user5","smacc_type":"WeChat","gender":"0"}

p1 = {"phone_number":"1234567"}
p2 = {"phone_number":"2345678"}
p3 = {"phone_number":"3456789"}
p4 = {"phone_number":"45678910"}
p5 = {"phone_number":"567891011"}

r1 = requests.post(url + "/users",json=user1)
print(r1.status_code)
access_token1 = json.loads(r1.content)["access_token"]
headers1 = {"access_token":access_token1}
requests.post(url + "/users/write_access",json=p1,headers=headers1)


r2 = requests.post(url + "/users",json=user2)
print(r2.status_code)
access_token2 = json.loads(r2.content)["access_token"]
print(access_token2)
headers2 = {"access_token":access_token2}
requests.post(url + "/users/write_access",json=p2,headers=headers2)

r3 = requests.post(url + "/users",json=user3)
print(r3.status_code)
access_token3 = json.loads(r3.content)["access_token"]
headers3 = {"access_token":access_token3}
requests.post(url + "/users/write_access",json=p3,headers=headers3)

r4 = requests.post(url + "/users",json=user4)
print(r4.status_code)
access_token4 = json.loads(r4.content)["access_token"]
headers4 = {"access_token":access_token4}
requests.post(url + "/users/write_access",json=p4,headers=headers4)

r5 = requests.post(url + "/users",json=user5)
print(r5.status_code)
access_token5 = json.loads(r5.content)["access_token"]
headers5 = {"access_token":access_token5}
requests.post(url + "/users/write_access",json=p5,headers=headers5)

(mid,first_aid) = post_a_masker(article1,headers1,"章文")

article2["mid"] = mid
r6 = requests.post(url + "/articles",json=article2,headers=headers2)
print(r6.status_code)
print(json.loads(r6.content))

article3["mid"] = mid
r7 = requests.post(url + "/articles",json=article3,headers=headers3)
print(r7.status_code)

article4["mid"] = mid
r8 = requests.post(url + "/articles",json=article4,headers=headers4)
print(r8.status_code)

article5["mid"] = mid
r9 = requests.post(url + "/articles",json=article5,headers=headers5)
print(r9.status_code)

















