# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
from dynamodb import *
from copy import deepcopy
import json
from utility_decoy_data import generateAccessToken, encrypt
import requests
import unittest

url = "http://127.0.0.1:5000"

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

def jiangfangzhou_comment(mrid,is_masker,parent_id,reply_id):
    return {
        "at":"user_1",
        "mrid":mrid,
        "content":{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},
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

# class TestPostComment(unittest.TestCase):
#     @classmethod
#     def setUpClass(cls):
#         delete_all()
    
#     @classmethod
#     def tearDownClass(cls):
#         pass
    
#     def setUp(self):
#         pass
    
#     def tearDown(self):
#         delete_all()

#     # lack info/wrong type
#     '''
#     def jiangfangzhou_comment(mrid,is_masker,parent_id,reply_id):
#     return {
#         "at":"user_1",
#         "mrid":mrid,
#         "content":{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},
#         "is_masker":is_masker,
#         "parent_id":parent_id,
#         "reply_id":reply_id
#         }
#     '''
#     def test_1(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         complete_comment = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         c1 = deepcopy(complete_comment)
#         del c1["mrid"]
#         c2 = deepcopy(complete_comment)
#         del c2["content"]
#         c3 = deepcopy(complete_comment)
#         del c3["is_masker"]
#         c4 = deepcopy(complete_comment)
#         del c4["parent_id"]
#         c5 = deepcopy(complete_comment)
#         del c5["reply_id"]
#         c6 = deepcopy(complete_comment)
#         c6 ["at"] = 12345
#         c7 = deepcopy(complete_comment)
#         c7["mrid"] = 12345
#         c8 = deepcopy(complete_comment)
#         c8["content"] = 12345
#         c9 = deepcopy(complete_comment)
#         c9["is_masker"] = 12345
#         c10 = deepcopy(complete_comment)
#         c10["parent_id"] = 12345
#         c11 = deepcopy(complete_comment)
#         c11["reply_id"] = 12345

#         r1 = requests.post(url + "/comments",json=c1,headers=headers) #no mrid
#         r2 = requests.post(url + "/comments",json=c2,headers=headers) #no content
#         r3 = requests.post(url + "/comments",json=c3,headers=headers) #no is_masker
#         r4 = requests.post(url + "/comments",json=c4,headers=headers) #no parent_id
#         r5 = requests.post(url + "/comments",json=c5,headers=headers) #no reply_id
#         r6 = requests.post(url + "/comments",json=c6,headers=headers) #wrong at
#         r7 = requests.post(url + "/comments",json=c7,headers=headers) #wrong mrid
#         r8 = requests.post(url + "/comments",json=c8,headers=headers) #wrong content
#         r9 = requests.post(url + "/comments",json=c9,headers=headers) #wrong is_masker
#         r10 = requests.post(url + "/comments",json=c10,headers=headers) #wrong parent_id
#         r11 = requests.post(url + "/comments",json=c11,headers=headers) #wrong reply_id
        
#         for request in [r1,r2,r3,r4,r5]:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content)["message"],"lack of essential information")
#         for request in [r6,r7,r8,r9,r10,r11]:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content)["message"],"wrong at/content/mrid/is_masker type")

#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)
#         self.assertFalse(get_comments_scan())

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#     # user has no write access to masker comments
#     def test_2(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         (no_cellphone_in_db, headers_no) = register_no_cellphone()
#         c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         r1 = requests.post(url + "/comments",json=c1,headers=headers_no)
        
#         self.assertEqual(r1.status_code,401)
#         self.assertEqual(json.loads(r1.content)["message"],"No permission to write")

#         self.assertFalse(get_comments_scan())
#         self.assertEqual(len(get_users_scan()),2)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)
        
#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[])
#         self.assertListEqual(user_in_db_jiang["comments"],[])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#         user_in_db_no = get_from_USERS(no_cellphone_in_db)
#         self.assertIsNone(user_in_db_no["MASKOFF"])
#         self.assertEqual(user_in_db_no["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_no["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(user_in_db_no["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_no["gender"],"0")
#         self.assertEqual(user_in_db_no["phone_number"],None)
#         self.assertListEqual(user_in_db_no["maskers_exposed"],[])
#         self.assertListEqual(user_in_db_no["roasts"],[])
#         self.assertListEqual(user_in_db_no["comments"],[])
#         self.assertListEqual(user_in_db_no["friends"],[])
#         self.assertListEqual(user_in_db_no["blocked"],[])
#         self.assertListEqual(user_in_db_no["articles"],[])

#     # mrid dne
#     def test_3(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         c1 = deepcopy(jiangfangzhou_comment("mid",True,"0","0"))
#         c2 = deepcopy(jiangfangzhou_comment("first_rid",False,"0","0"))
#         c3 = deepcopy(jiangfangzhou_comment("mid",False,"0","0"))
#         c4 = deepcopy(jiangfangzhou_comment("first_rid",True,"0","0"))

#         r1 = requests.post(url + "/comments",json=c1,headers=headers) 
#         r2 = requests.post(url + "/comments",json=c2,headers=headers) 
#         r3 = requests.post(url + "/comments",json=c3,headers=headers) 
#         r4 = requests.post(url + "/comments",json=c4,headers=headers) 
        
#         self.assertEqual(r1.status_code,400)
#         self.assertEqual(json.loads(r1.content)["message"],"masker does not exist")
#         self.assertEqual(r3.status_code,400)
#         self.assertEqual(json.loads(r3.content)["message"],"roast does not exist")
#         self.assertEqual(r2.status_code,400)
#         self.assertEqual(json.loads(r2.content)["message"],"roast does not exist")
#         self.assertEqual(r4.status_code,400)
#         self.assertEqual(json.loads(r4.content)["message"],"masker does not exist")
        
#         self.assertFalse(get_comments_scan())

#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)
#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])
#     # success-directly under article, no reply(parent0,reply0)
#     def test_4(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         c2 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         comment_m = json.loads(r1.content)["cid"]
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         comment_r = json.loads(r2.content)["cid"]

#         self.assertEqual(len(get_comments_scan()),2)
#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[comment_m, comment_r])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#         masker_in_db = get_from_MASKERS(mid)
#         article_in_db = get_from_ARTICLES(first_aid)
#         self.assertEqual(len(masker_in_db["articles"]),1)
#         self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
#         self.assertEqual(masker_in_db["name"],"zhangwen")
#         self.assertEqual(masker_in_db["contributed"],1)
#         self.assertListEqual(masker_in_db["articles"],[first_aid])
#         self.assertTrue(masker_in_db["total_visible"])
#         self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
#         self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
#         self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
#         self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
#         self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
#         self.assertTrue(article_in_db["partial_visible"])

#         roast = get_roasts_scan()[0]["rid"]
#         roast = get_from_ROASTS(roast)
#         self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
#         self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
#         self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
#         self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

#         comment_m = get_from_COMMENTS(comment_m)
#         self.assertEqual(comment_m["at"],c1["at"])
#         self.assertEqual(comment_m["content"],c1["content"])
#         self.assertEqual(comment_m["mrid"],c1["mrid"])
#         self.assertEqual(comment_m["is_masker"],c1["is_masker"])
#         self.assertEqual(comment_m["parent_id"],c1["parent_id"])
#         self.assertEqual(comment_m["reply_id"],c1["reply_id"])

        
#         comment_r = get_from_COMMENTS(comment_r)
#         self.assertEqual(comment_r["at"],c2["at"])
#         self.assertEqual(comment_r["content"],c2["content"])
#         self.assertEqual(comment_r["mrid"],c2["mrid"])
#         self.assertEqual(comment_r["is_masker"],c2["is_masker"])
#         self.assertEqual(comment_r["parent_id"],c2["parent_id"])
#         self.assertEqual(comment_r["reply_id"],c2["reply_id"])
#         self.assertTrue("cid" in comment_r)
    
#     #success-directly under article, with reply(parent-some_id,reply-some_id)/masker
#     def test_5(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         self.assertTrue("cid" in json.loads(r1.content))
#         self.assertTrue("parent_id" in json.loads(r1.content))
#         self.assertTrue(json.loads(r1.content)["parent_id"],"0")
#         self.assertTrue(json.loads(r1.content)["reply_id"],"0")
#         first_comment_cid = json.loads(r1.content)["cid"]

#         c2 = deepcopy(jiangfangzhou_comment(mid,True,first_comment_cid,first_comment_cid))
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         reply_comment_cid = json.loads(r2.content)["cid"]

#         self.assertEqual(len(get_comments_scan()),2)
#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[])
#         self.assertListEqual(user_in_db_jiang["comments"],[first_comment_cid, reply_comment_cid])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#         masker_in_db = get_from_MASKERS(mid)
#         article_in_db = get_from_ARTICLES(first_aid)
#         self.assertEqual(len(masker_in_db["articles"]),1)
#         self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
#         self.assertEqual(masker_in_db["name"],"zhangwen")
#         self.assertEqual(masker_in_db["contributed"],1)
#         self.assertListEqual(masker_in_db["articles"],[first_aid])
#         self.assertTrue(masker_in_db["total_visible"])
#         self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
#         self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
#         self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
#         self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
#         self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
#         self.assertTrue(article_in_db["partial_visible"])

#         first_comment = get_from_COMMENTS(first_comment_cid)
#         self.assertEqual(first_comment["at"],c1["at"])
#         self.assertEqual(first_comment["content"],c1["content"])
#         self.assertEqual(first_comment["mrid"],c1["mrid"])
#         self.assertEqual(first_comment["is_masker"],c1["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c1["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c1["reply_id"])

        
#         reply_comment = get_from_COMMENTS(reply_comment_cid)
#         self.assertEqual(reply_comment["at"],c2["at"])
#         self.assertEqual(reply_comment["content"],c2["content"])
#         self.assertEqual(reply_comment["mrid"],c2["mrid"])
#         self.assertEqual(reply_comment["is_masker"],c2["is_masker"])
#         self.assertEqual(reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(reply_comment["reply_id"],first_comment_cid)
#         self.assertTrue("cid" in reply_comment)
        
#     #success-directly under article, with reply(parent-some_id,reply-some_id)/roast
#     def test_6(self):
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         c1 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         self.assertTrue("cid" in json.loads(r1.content))
#         self.assertTrue("parent_id" in json.loads(r1.content))
#         self.assertTrue(json.loads(r1.content)["parent_id"],"0")
#         self.assertTrue(json.loads(r1.content)["reply_id"],"0")
#         first_comment_cid = json.loads(r1.content)["cid"]

#         c2 = deepcopy(jiangfangzhou_comment(first_rid,False,first_comment_cid,first_comment_cid))
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         reply_comment_cid = json.loads(r2.content)["cid"]

#         self.assertEqual(len(get_comments_scan()),2)
#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertFalse(get_maskers_scan())
#         self.assertFalse(get_articles_scan())

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[first_comment_cid, reply_comment_cid])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[])

#         roast = get_roasts_scan()[0]["rid"]
#         roast = get_from_ROASTS(roast)
#         self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
#         self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
#         self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
#         self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

#         first_comment = get_from_COMMENTS(first_comment_cid)
#         self.assertEqual(first_comment["at"],c1["at"])
#         self.assertEqual(first_comment["content"],c1["content"])
#         self.assertEqual(first_comment["mrid"],c1["mrid"])
#         self.assertEqual(first_comment["is_masker"],c1["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c1["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c1["reply_id"])

        
#         reply_comment = get_from_COMMENTS(reply_comment_cid)
#         self.assertEqual(reply_comment["at"],c2["at"])
#         self.assertEqual(reply_comment["content"],c2["content"])
#         self.assertEqual(reply_comment["mrid"],c2["mrid"])
#         self.assertEqual(reply_comment["is_masker"],c2["is_masker"])
#         self.assertEqual(reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(reply_comment["reply_id"],first_comment_cid)
#         self.assertTrue("cid" in reply_comment)
    
#     #success-under a parent(parent-some_id,reply-other_id)/masker
#     def test_7(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         self.assertTrue("cid" in json.loads(r1.content))
#         self.assertTrue("parent_id" in json.loads(r1.content))
#         self.assertTrue(json.loads(r1.content)["parent_id"],"0")
#         self.assertTrue(json.loads(r1.content)["reply_id"],"0")
#         first_comment_cid = json.loads(r1.content)["cid"]

#         c2 = deepcopy(jiangfangzhou_comment(mid,True,first_comment_cid,"0"))
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         reply_comment_cid = json.loads(r2.content)["cid"]

#         c3 = deepcopy(jiangfangzhou_comment(mid,True,first_comment_cid,reply_comment_cid))
#         r3 = requests.post(url + "/comments",json=c3,headers=headers)
#         self.assertEqual(r3.status_code,200)
#         self.assertEqual(json.loads(r3.content)["message"],"comment successful")
#         other_reply_comment_cid = json.loads(r3.content)["cid"]

#         self.assertEqual(len(get_comments_scan()),3)
#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[])
#         self.assertListEqual(user_in_db_jiang["comments"],[first_comment_cid, reply_comment_cid,other_reply_comment_cid])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#         masker_in_db = get_from_MASKERS(mid)
#         article_in_db = get_from_ARTICLES(first_aid)
#         self.assertEqual(len(masker_in_db["articles"]),1)
#         self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
#         self.assertEqual(masker_in_db["name"],"zhangwen")
#         self.assertEqual(masker_in_db["contributed"],1)
#         self.assertListEqual(masker_in_db["articles"],[first_aid])
#         self.assertTrue(masker_in_db["total_visible"])
#         self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
#         self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
#         self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
#         self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
#         self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
#         self.assertTrue(article_in_db["partial_visible"])

#         first_comment = get_from_COMMENTS(first_comment_cid)
#         self.assertEqual(first_comment["at"],c1["at"])
#         self.assertEqual(first_comment["content"],c1["content"])
#         self.assertEqual(first_comment["mrid"],c1["mrid"])
#         self.assertEqual(first_comment["is_masker"],c1["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c1["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c1["reply_id"])

        
#         reply_comment = get_from_COMMENTS(reply_comment_cid)
#         self.assertEqual(reply_comment["at"],c2["at"])
#         self.assertEqual(reply_comment["content"],c2["content"])
#         self.assertEqual(reply_comment["mrid"],c2["mrid"])
#         self.assertEqual(reply_comment["is_masker"],c2["is_masker"])
#         self.assertEqual(reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(reply_comment["reply_id"],"0")
#         self.assertTrue("cid" in reply_comment)

#         other_reply_comment = get_from_COMMENTS(other_reply_comment_cid)
#         self.assertEqual(other_reply_comment["at"],c3["at"])
#         self.assertEqual(other_reply_comment["content"],c3["content"])
#         self.assertEqual(other_reply_comment["mrid"],c3["mrid"])
#         self.assertEqual(other_reply_comment["is_masker"],c3["is_masker"])
#         self.assertEqual(other_reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(other_reply_comment["reply_id"],reply_comment_cid)
#         self.assertTrue("cid" in other_reply_comment)
        
#     #success-under a parent(parent-some_id,reply-other_id)/roast
#     def test_8(self):
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         c1 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         self.assertTrue("cid" in json.loads(r1.content))
#         self.assertTrue("parent_id" in json.loads(r1.content))
#         self.assertTrue(json.loads(r1.content)["parent_id"],"0")
#         self.assertTrue(json.loads(r1.content)["reply_id"],"0")
#         first_comment_cid = json.loads(r1.content)["cid"]

#         c2 = deepcopy(jiangfangzhou_comment(first_rid,False,first_comment_cid,"0"))
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         reply_comment_cid = json.loads(r2.content)["cid"]

#         c3 = deepcopy(jiangfangzhou_comment(first_rid,False,first_comment_cid,reply_comment_cid))
#         r3 = requests.post(url + "/comments",json=c3,headers=headers)
#         self.assertEqual(r3.status_code,200)
#         self.assertEqual(json.loads(r3.content)["message"],"comment successful")
#         other_reply_comment_cid = json.loads(r3.content)["cid"]

#         self.assertEqual(len(get_comments_scan()),3)
#         self.assertEqual(len(get_users_scan()),1)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertFalse(get_maskers_scan())
#         self.assertFalse(get_articles_scan())

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[first_comment_cid, reply_comment_cid,other_reply_comment_cid])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[])

#         roast = get_roasts_scan()[0]["rid"]
#         roast = get_from_ROASTS(roast)
#         self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
#         self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
#         self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
#         self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

#         first_comment = get_from_COMMENTS(first_comment_cid)
#         self.assertEqual(first_comment["at"],c1["at"])
#         self.assertEqual(first_comment["content"],c1["content"])
#         self.assertEqual(first_comment["mrid"],c1["mrid"])
#         self.assertEqual(first_comment["is_masker"],c1["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c1["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c1["reply_id"])

        
#         reply_comment = get_from_COMMENTS(reply_comment_cid)
#         self.assertEqual(reply_comment["at"],c2["at"])
#         self.assertEqual(reply_comment["content"],c2["content"])
#         self.assertEqual(reply_comment["mrid"],c2["mrid"])
#         self.assertEqual(reply_comment["is_masker"],c2["is_masker"])
#         self.assertEqual(reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(reply_comment["reply_id"],"0")
#         self.assertTrue("cid" in reply_comment)

#         other_reply_comment = get_from_COMMENTS(other_reply_comment_cid)
#         self.assertEqual(other_reply_comment["at"],c3["at"])
#         self.assertEqual(other_reply_comment["content"],c3["content"])
#         self.assertEqual(other_reply_comment["mrid"],c3["mrid"])
#         self.assertEqual(other_reply_comment["is_masker"],c3["is_masker"])
#         self.assertEqual(other_reply_comment["parent_id"],first_comment_cid)
#         self.assertEqual(other_reply_comment["reply_id"],reply_comment_cid)
#         self.assertTrue("cid" in other_reply_comment)


class TestGetComment(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        delete_all()
    
    @classmethod
    def tearDownClass(cls):
        pass
    
    def setUp(self):
        pass
    
    def tearDown(self):
        delete_all()   

    # success    
    def test_1(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        print(headers,mid)
        c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
        c2 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
        c3 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
        c4 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
        r1 = requests.post(url + "/comments",json=c1,headers=headers)
        self.assertEqual(r1.status_code,200)
        c1_cid = json.loads(r1.content)["cid"]
        r2 = requests.post(url + "/comments",json=c2,headers=headers)
        self.assertEqual(r2.status_code,200)
        c2_cid = json.loads(r2.content)["cid"]
        r3 = requests.post(url + "/comments",json=c3,headers=headers)
        self.assertEqual(r3.status_code,200)
        c3_cid = json.loads(r3.content)["cid"]
        r4 = requests.post(url + "/comments",json=c4,headers=headers)
        self.assertEqual(r4.status_code,200)
        c4_cid = json.loads(r4.content)["cid"]
        c5 = deepcopy(jiangfangzhou_comment(mid,True,c1_cid,"0"))
        r5 = requests.post(url + "/comments",json=c5,headers=headers)
        c5_cid = json.loads(r5.content)["cid"]
        self.assertEqual(r5.status_code,200)

        g1 = requests.get(url + "/comments" + "/" + mid + "/MASKERS" + "/" + "0",headers=headers)
        self.assertEqual(g1.status_code,200)
        results = json.loads(g1.content)["comments"]


        expected = [c1_cid,c2_cid,c3_cid,c4_cid]
        for i in range(len(results)):
            self.assertTrue(results[i]["cid"] in expected)
        self.assertTrue(results[0]["cid"],c1_cid)
        self.assertEqual(len(results[0]["sub_comments"]),1)
        self.assertEqual(results[0]["sub_comments"][0]["cid"],c5_cid)

        
                
                
        
        

       

# class TestDeleteComment(unittest.TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         delete_all()
    
#     @classmethod
#     def tearDownClass(cls):
#         pass
    
#     def setUp(self):
#         pass
    
#     def tearDown(self):
#         delete_all()    

#     # wrong type/lack info/wrong owner
#     def test_1(self):
#         (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
#         (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
#         (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)

#         c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
#         c2 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

#         r1 = requests.post(url + "/comments",json=c1,headers=headers)
#         self.assertEqual(r1.status_code,200)
#         self.assertEqual(json.loads(r1.content)["message"],"comment successful")
#         comment_m = json.loads(r1.content)["cid"]
#         r2 = requests.post(url + "/comments",json=c2,headers=headers)
#         self.assertEqual(r2.status_code,200)
#         self.assertEqual(json.loads(r2.content)["message"],"comment successful")
#         comment_r = json.loads(r2.content)["cid"]

#         j_m = {"cid":comment_m} 
#         j_r = {"cid":comment_r}
#         j_m_1 = {}
#         j_m_2 = {"cid":12345}
#         j_r_1 = {}
#         j_r_2 = {"cid":12345}

#         r3 = requests.delete(url + "/comments",json=j_m_1,headers=headers)
#         r4 = requests.delete(url + "/comments",json=j_m_2,headers=headers)
#         r5 = requests.delete(url + "/comments",json=j_r_1,headers=headers)
#         r6 = requests.delete(url + "/comments",json=j_r_2,headers=headers)
#         r7 = requests.delete(url + "/comments",json=j_m,headers=headers2)
#         r8 = requests.delete(url + "/comments",json=j_r,headers=headers2)

#         for request in [r3,r4,r5,r6]:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content)["message"],"lack of essential information")
#         for request in [r7,r8]:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content)["message"],"you have no ownership of this comment")        

#         self.assertEqual(len(get_comments_scan()),2)
#         self.assertEqual(len(get_users_scan()),2)
#         self.assertEqual(len(get_roasts_scan()),1)
#         self.assertEqual(len(get_maskers_scan()),1)
#         self.assertEqual(len(get_articles_scan()),1)

#         user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
#         self.assertIsNone(user_in_db_jiang["MASKOFF"])
#         self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_jiang["gender"],"0")
#         self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
#         self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
#         self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
#         self.assertListEqual(user_in_db_jiang["comments"],[comment_m, comment_r])
#         self.assertListEqual(user_in_db_jiang["friends"],[])
#         self.assertListEqual(user_in_db_jiang["blocked"],[])
#         self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

#         user_in_db_nv = get_from_USERS(nvlvshi_in_db)
#         self.assertIsNone(user_in_db_nv["MASKOFF"])
#         self.assertEqual(user_in_db_nv["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db_nv["smacc"],encrypt("nvlvshi"))
#         self.assertEqual(user_in_db_nv["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db_nv["gender"],"0")
#         self.assertEqual(user_in_db_nv["phone_number"],encrypt("nvlvshi"))
#         self.assertListEqual(user_in_db_nv["maskers_exposed"],[])
#         self.assertListEqual(user_in_db_nv["roasts"],[])
#         self.assertListEqual(user_in_db_nv["comments"],[])
#         self.assertListEqual(user_in_db_nv["friends"],[])
#         self.assertListEqual(user_in_db_nv["blocked"],[])
#         self.assertListEqual(user_in_db_nv["articles"],[])

#         masker_in_db = get_from_MASKERS(mid)
#         article_in_db = get_from_ARTICLES(first_aid)
#         self.assertEqual(len(masker_in_db["articles"]),1)
#         self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
#         self.assertEqual(masker_in_db["name"],"zhangwen")
#         self.assertEqual(masker_in_db["contributed"],1)
#         self.assertListEqual(masker_in_db["articles"],[first_aid])
#         self.assertTrue(masker_in_db["total_visible"])
        
#         self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
#         self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
#         self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
#         self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
#         self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
#         self.assertTrue(article_in_db["partial_visible"])

#         roast = get_roasts_scan()[0]["rid"]
#         roast = get_from_ROASTS(roast)
#         self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
#         self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
#         self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        
#         self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

#         first_comment = get_from_COMMENTS(comment_m)
#         self.assertEqual(first_comment["at"],c1["at"])
#         self.assertEqual(first_comment["content"],c1["content"])
#         self.assertEqual(first_comment["mrid"],c1["mrid"])
#         self.assertEqual(first_comment["is_masker"],c1["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c1["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c1["reply_id"])
#         self.assertTrue(first_comment["visible"])
        
#         first_comment = get_from_COMMENTS(comment_r)
#         self.assertEqual(first_comment["at"],c2["at"])
#         self.assertEqual(first_comment["content"],c2["content"])
#         self.assertEqual(first_comment["mrid"],c2["mrid"])
#         self.assertEqual(first_comment["is_masker"],c2["is_masker"])
#         self.assertEqual(first_comment["parent_id"],c2["parent_id"])
#         self.assertEqual(first_comment["reply_id"],c2["reply_id"])
#         self.assertTrue(first_comment["visible"])


    # other delete-but-no-longer-there
    # def test_2(self):
    #     (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
    #     (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        

    #     c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
    #     c2 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

    #     r1 = requests.post(url + "/comments",json=c1,headers=headers)
    #     self.assertEqual(r1.status_code,200)
    #     self.assertEqual(json.loads(r1.content)["message"],"comment successful")
    #     comment_m = json.loads(r1.content)["cid"]
    #     r2 = requests.post(url + "/comments",json=c2,headers=headers)
    #     self.assertEqual(r2.status_code,200)
    #     self.assertEqual(json.loads(r2.content)["message"],"comment successful")
    #     comment_r = json.loads(r2.content)["cid"]

    #     j_a = {"aid":first_aid} 
    #     j_r = {"rid":first_rid}

    #     j_a_c = {"cid":comment_m}
    #     j_r_c = {"cid":comment_r}

    #     r3 = requests.delete(url + "/articles",json=j_a,headers=headers)
    #     r4 = requests.delete(url + "/roasts",json=j_r,headers=headers)
    #     r5 = requests.delete(url + "/comments",json=j_a_c,headers=headers)
    #     r6 = requests.delete(url + "/comments",json=j_r_c,headers=headers)

    #     for request in [r3,r4]:
    #         self.assertEqual(request.status_code,200)
    #         self.assertEqual(json.loads(request.content)["message"],"delete successful")        
        
        
    #     self.assertEqual(r5.status_code,200)
    #     self.assertEqual(json.loads(r5.content)["message"],"this masker has been deleted")        
    #     self.assertEqual(r6.status_code,200)
    #     self.assertEqual(json.loads(r6.content)["message"],"this roast has been deleted")        


    #     self.assertEqual(len(get_comments_scan()),2)
    #     self.assertEqual(len(get_users_scan()),1)
    #     self.assertEqual(len(get_roasts_scan()),1)
    #     self.assertEqual(len(get_maskers_scan()),1)
    #     self.assertEqual(len(get_articles_scan()),1)

    #     user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
    #     self.assertIsNone(user_in_db_jiang["MASKOFF"])
    #     self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
    #     self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
    #     self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
    #     self.assertEqual(user_in_db_jiang["gender"],"0")
    #     self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
    #     self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
    #     self.assertListEqual(user_in_db_jiang["roasts"],[])
    #     self.assertListEqual(user_in_db_jiang["comments"],[])
    #     self.assertListEqual(user_in_db_jiang["friends"],[])
    #     self.assertListEqual(user_in_db_jiang["blocked"],[])
    #     self.assertListEqual(user_in_db_jiang["articles"],[])

    #     masker_in_db = get_deleted_masker(mid)
    #     article_in_db = get_deleted_article(first_aid)
    #     self.assertEqual(len(masker_in_db["articles"]),1)
    #     self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
    #     self.assertEqual(masker_in_db["name"],"zhangwen")
    #     self.assertEqual(masker_in_db["contributed"],1)
    #     self.assertListEqual(masker_in_db["articles"],[first_aid])
    #     self.assertEqual(masker_in_db["total_visible"],"False")
    #     self.assertTrue(masker_in_db["comments"],[comment_m])
    #     self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
    #     self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
    #     self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
    #     self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
    #     self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
    #     self.assertEqual(article_in_db["partial_visible"],"False")

    #     roast = get_roasts_scan()[0]["rid"]
    #     roast = get_deleted_roast(roast)
    #     self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
    #     self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
    #     self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
    #     self.assertListEqual(roast["comments"],[comment_r])
    #     self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)
    #     self.assertEqual(roast["visible"],"False")

    #     comment_m = get_deleted_comment(comment_m)
    #     self.assertEqual(comment_m["at"],c1["at"])
    #     self.assertEqual(comment_m["content"],c1["content"])
    #     self.assertEqual(comment_m["mid"],c1["mid"])
    #     self.assertIsNone(comment_m["rid"])
    #     self.assertEqual(comment_m["visible"],"False")
        
    #     comment_r = get_deleted_comment(comment_r)
    #     self.assertEqual(comment_r["at"],c2["at"])
    #     self.assertEqual(comment_r["content"],c2["content"])
    #     self.assertEqual(comment_r["rid"],c2["rid"])
    #     self.assertTrue("cid" in comment_r)
    #     self.assertIsNone(comment_r["mid"])
    #     self.assertEqual(comment_r["visible"],"False")
    
    # success
    # def test_3(self):
    #     (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
    #     (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        

    #     c1 = deepcopy(jiangfangzhou_comment(mid,True,"0","0"))
    #     c2 = deepcopy(jiangfangzhou_comment(first_rid,False,"0","0"))

    #     r1 = requests.post(url + "/comments",json=c1,headers=headers)
    #     self.assertEqual(r1.status_code,200)
    #     self.assertEqual(json.loads(r1.content)["message"],"comment successful")
    #     comment_m = json.loads(r1.content)["cid"]
    #     r2 = requests.post(url + "/comments",json=c2,headers=headers)
    #     self.assertEqual(r2.status_code,200)
    #     self.assertEqual(json.loads(r2.content)["message"],"comment successful")
    #     comment_r = json.loads(r2.content)["cid"]

    #     j_a = {"aid":first_aid} 
    #     j_r = {"rid":first_rid}

    #     j_a_c = {"cid":comment_m}
    #     j_r_c = {"cid":comment_r}

        
        
    #     r3 = requests.delete(url + "/comments",json=j_a_c,headers=headers)
    #     r4 = requests.delete(url + "/comments",json=j_r_c,headers=headers)

    #     for request in [r3,r4]:
    #         self.assertEqual(request.status_code,200)
    #         self.assertEqual(json.loads(request.content)["message"],"delete successful")        
        
    #     self.assertEqual(len(get_comments_scan()),2)
    #     self.assertEqual(len(get_users_scan()),1)
    #     self.assertEqual(len(get_roasts_scan()),1)
    #     self.assertEqual(len(get_maskers_scan()),1)
    #     self.assertEqual(len(get_articles_scan()),1)

    #     user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
    #     self.assertIsNone(user_in_db_jiang["MASKOFF"])
    #     self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
    #     self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
    #     self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
    #     self.assertEqual(user_in_db_jiang["gender"],"0")
    #     self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
    #     self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
    #     self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
    #     self.assertListEqual(user_in_db_jiang["comments"],[])
    #     self.assertListEqual(user_in_db_jiang["friends"],[])
    #     self.assertListEqual(user_in_db_jiang["blocked"],[])
    #     self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

    #     masker_in_db = get_from_MASKERS(mid)
    #     article_in_db = get_from_ARTICLES(first_aid)
    #     self.assertEqual(len(masker_in_db["articles"]),1)
    #     self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
    #     self.assertEqual(masker_in_db["name"],"zhangwen")
    #     self.assertEqual(masker_in_db["contributed"],1)
    #     self.assertListEqual(masker_in_db["articles"],[first_aid])
    #     self.assertEqual(masker_in_db["total_visible"],"True")
        
    #     self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
    #     self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
    #     self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
    #     self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
    #     self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
    #     self.assertEqual(article_in_db["partial_visible"],"True")

    #     roast = get_roasts_scan()[0]["rid"]
    #     roast = get_from_ROASTS(roast)
    #     self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
    #     self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
    #     self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        
    #     self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)
    #     self.assertEqual(roast["visible"],"True")

    #     first_comment = get_deleted_comment(comment_m)
    #     print(first_comment,comment_m)
    #     self.assertEqual(first_comment["at"],c1["at"])
    #     self.assertEqual(first_comment["content"],c1["content"])
    #     self.assertEqual(first_comment["mrid"],c1["mrid"])
    #     self.assertEqual(first_comment["is_masker"],c1["is_masker"])
    #     self.assertEqual(first_comment["parent_id"],c1["parent_id"])
    #     self.assertEqual(first_comment["reply_id"],c1["reply_id"])
    #     self.assertEqual(first_comment["visible"],"False")
        
    #     first_comment = get_deleted_comment(comment_r)
    #     self.assertEqual(first_comment["at"],c2["at"])
    #     self.assertEqual(first_comment["content"],c2["content"])
    #     self.assertEqual(first_comment["mrid"],c2["mrid"])
    #     self.assertEqual(first_comment["is_masker"],c2["is_masker"])
    #     self.assertEqual(first_comment["parent_id"],c2["parent_id"])
    #     self.assertEqual(first_comment["reply_id"],c2["reply_id"])
    #     self.assertEqual(first_comment["visible"],"False")

if __name__ == '__main__':
    unittest.main()