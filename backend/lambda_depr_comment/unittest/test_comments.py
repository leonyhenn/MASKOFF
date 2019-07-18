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

#(no_cellphone_in_db, headers_no) = register_no_cellphone(jiangfangzhou_in_db)
def register_no_cellphone(jiangfangzhou_in_db):
    requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
    no_cellphone_in_db = get_users_scan()
    no_cellphone_in_db.remove({"uid":jiangfangzhou_in_db})
    no_cellphone_in_db = no_cellphone_in_db[0]["uid"]
    valid_access_token_with_write = generateAccessToken(no_cellphone_in_db)
    headers = {"access_token":valid_access_token_with_write}
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

def jiangfangzhou_comment_m(mid):
    return {
        "at":"user_1",
        "mid":mid,
        "content":{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"}
        }
def jiangfangzhou_comment_r(rid):
    return {
        "at":"user_1",
        "rid":rid,
        "content":{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"}
        }
#(jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
def post_a_masker():
    (user_in_db,headers) = register_and_upgrade_jiangfangzhou()
    article = deepcopy(jiangfangzhou_article)
    article["name"] = "zhangwen"
    r = requests.post(url + "/maskers",json=article,headers=headers)
    mid = get_maskers_scan()[0]["mid"]
    first_aid = get_from_MASKERS(mid)["articles"][0]
    return (user_in_db,headers,mid,first_aid)

#(jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
def post_a_roast():
    (jiangfangzhou_in_db,headers) = register_and_upgrade_jiangfangzhou()
    ro1 = deepcopy(jiangfangzhou_roast)
    r1 = requests.post(url + "/roasts",json=ro1,headers=headers)
    first_rid = get_roasts_scan()[0]["rid"]
    return (jiangfangzhou_in_db,headers,first_rid)

class TestPostComment(unittest.TestCase):
    

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

    # lack info/wrong type
    def test_1(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c1["rid"] = first_rid
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))
        del c2["rid"] 
        c3 = deepcopy(jiangfangzhou_comment_m(mid))
        del c3["content"] 
        c4 = deepcopy(jiangfangzhou_comment_r(first_rid))
        del c4["content"]
        c5 = deepcopy(jiangfangzhou_comment_m(mid))
        c5["content"] = 12345
        c6 = deepcopy(jiangfangzhou_comment_r(first_rid))
        c6["content"] = 12345
        c7 = deepcopy(jiangfangzhou_comment_m(mid))
        c7["at"] = 12345
        c8 = deepcopy(jiangfangzhou_comment_r(first_rid))
        c8["at"] = 12345
        c9 = deepcopy(jiangfangzhou_comment_m(mid))
        c9["mid"] = 12345
        c10 = deepcopy(jiangfangzhou_comment_r(first_rid))
        c10["rid"] = 12345


        r1 = requests.post(url + "/comments",json=c1,headers=headers) #both mid and rid
        r2 = requests.post(url + "/comments",json=c2,headers=headers) #both none
        r3 = requests.post(url + "/comments",json=c3,headers=headers) #mid and no content
        r4 = requests.post(url + "/comments",json=c4,headers=headers) #rid and no content
        r5 = requests.post(url + "/comments",json=c5,headers=headers) #mid and wrong type of content
        r6 = requests.post(url + "/comments",json=c6,headers=headers) #rid and wrong type of content
        r7 = requests.post(url + "/comments",json=c7,headers=headers) #mid and wrong type of at
        r8 = requests.post(url + "/comments",json=c8,headers=headers) #rid and wrong type of at
        r9 = requests.post(url + "/comments",json=c9,headers=headers) #mid and wrong type of rid
        r10 = requests.post(url + "/comments",json=c10,headers=headers) #rid and wrong type of rid
        
        for request in [r1,r2,r3,r4]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"lack of essential information")
        for request in [r5,r6]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"wrong content type")
        for request in [r7,r8]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"wrong at type")

        
        self.assertEqual(r9.status_code,400)
        self.assertEqual(json.loads(r9.content)["message"],"wrong mid type")
        self.assertEqual(r10.status_code,400)
        self.assertEqual(json.loads(r10.content)["message"],"wrong rid type")
        self.assertFalse(get_comments_scan())

        self.assertEqual(len(get_users_scan()),1)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

    # user has no write access to masker comments
    def test_2(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (no_cellphone_in_db, headers_no) = register_no_cellphone(jiangfangzhou_in_db)
        c1 = deepcopy(jiangfangzhou_comment_m(mid))

        r1 = requests.post(url + "/comments",json=c1,headers=headers_no) #both mid and rid
        
        self.assertEqual(r1.status_code,401)
        self.assertEqual(json.loads(r1.content)["message"],"No permission to write")
        
        self.assertFalse(get_comments_scan())
        self.assertEqual(len(get_users_scan()),2)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

        user_in_db_no = get_from_USERS(no_cellphone_in_db)
        self.assertIsNone(user_in_db_no["MASKOFF"])
        self.assertEqual(user_in_db_no["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_no["smacc"],encrypt("no_cellphone"))
        self.assertEqual(user_in_db_no["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_no["gender"],"0")
        self.assertEqual(user_in_db_no["phone_number"],None)
        self.assertListEqual(user_in_db_no["maskers_exposed"],[])
        self.assertListEqual(user_in_db_no["roasts"],[])
        self.assertListEqual(user_in_db_no["comments"],[])
        self.assertListEqual(user_in_db_no["friends"],[])
        self.assertListEqual(user_in_db_no["blocked"],[])
        self.assertListEqual(user_in_db_no["articles"],[])

    # mid/rid dne
    def test_3(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        c1 = deepcopy(jiangfangzhou_comment_m("mid"))
        c2 = deepcopy(jiangfangzhou_comment_r("first_rid"))

        r1 = requests.post(url + "/comments",json=c1,headers=headers) #both mid and rid
        r2 = requests.post(url + "/comments",json=c2,headers=headers) #both none
        
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"masker does not exist")
        self.assertEqual(r2.status_code,400)
        self.assertEqual(json.loads(r2.content)["message"],"roast does not exist")
        self.assertFalse(get_comments_scan())

        self.assertEqual(len(get_users_scan()),1)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])
    # success
    def test_4(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))

        r1 = requests.post(url + "/comments",json=c1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"comment successful")
        comment_m = get_comments_scan()[0]["cid"]
        r2 = requests.post(url + "/comments",json=c2,headers=headers)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(json.loads(r2.content)["message"],"comment successful")
        comment_r = get_comments_scan()
        comment_r.remove({"cid":comment_m})
        comment_r = comment_r[0]["cid"]

        
        
        
        self.assertEqual(len(get_comments_scan()),2)
        self.assertEqual(len(get_users_scan()),1)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)

        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[comment_m, comment_r])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_from_ARTICLES(first_aid)
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertTrue(masker_in_db["comments"],[comment_m])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])

        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertListEqual(roast["comments"],[comment_r])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        comment_m = get_from_COMMENTS(comment_m)
        self.assertEqual(comment_m["at"],c1["at"])
        self.assertEqual(comment_m["content"],c1["content"])
        self.assertEqual(comment_m["mid"],c1["mid"])
        self.assertIsNone(comment_m["rid"])
        
        comment_r = get_from_COMMENTS(comment_r)
        self.assertEqual(comment_r["at"],c2["at"])
        self.assertEqual(comment_r["content"],c2["content"])
        self.assertEqual(comment_r["rid"],c2["rid"])
        self.assertTrue("cid" in comment_r)
        self.assertIsNone(comment_r["mid"])


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
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))
        masker_comments = []
        roast_comments = []
        user_comments = []
        for i in range(50):
            c1["content"] = {"type":"text/plain","filename":"this is comment to masker no​ "+ str(i)}
            masker_comments.append(deepcopy(c1))
            user_comments.append(deepcopy(c1))
            c2["content"] = {"type":"text/plain","filename":"this is comment to roast no​ "+ str(i)}
            roast_comments.append(deepcopy(c2))
            user_comments.append(deepcopy(c2))
            r1 = requests.post(url + "/comments",json=c1,headers=headers)
            r2 = requests.post(url + "/comments",json=c2,headers=headers)
            self.assertEqual(r1.status_code,200)
            self.assertEqual(r2.status_code,200)
        r1 = requests.get(url + "/comments" + "/" + mid + "/" + "MASKERS" + "/0",headers=headers)
        r2 = requests.get(url + "/comments" + "/" + first_rid + "/" + "ROASTS" + "/0",headers=headers)
        r3 = requests.get(url + "/comments" + "/" + jiangfangzhou_in_db + "/" + "USERS" + "/0",headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(len(json.loads(r1.content)["comments"]),20)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(len(json.loads(r2.content)["comments"]),20)
        self.assertEqual(r3.status_code,200)
        self.assertEqual(len(json.loads(r3.content)["comments"]),20)
        masker_comments_in_db = json.loads(r1.content)["comments"]
        roast_comments_in_db = json.loads(r2.content)["comments"]
        user_comments_in_db = json.loads(r3.content)["comments"]
        index = json.loads(r2.content)["index"]
        
        for i in range(20):
            comment_m_in_db = get_from_COMMENTS(masker_comments_in_db[i])
            self.assertDictEqual(comment_m_in_db["content"],masker_comments[i]["content"])
            comment_r_in_db = get_from_COMMENTS(roast_comments_in_db[i])
            self.assertDictEqual(comment_r_in_db["content"],roast_comments[i]["content"])
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])

        r4 = requests.get(url + "/comments" + "/" + mid + "/" + "MASKERS" + "/" + str(index),headers=headers)
        r5 = requests.get(url + "/comments" + "/" + first_rid + "/" + "ROASTS" + "/" + str(index),headers=headers)
        r6 = requests.get(url + "/comments" + "/" + jiangfangzhou_in_db + "/" + "USERS" + "/" + str(index),headers=headers)
        self.assertEqual(r4.status_code,200)
        self.assertEqual(len(json.loads(r4.content)["comments"]),20)
        self.assertEqual(r5.status_code,200)
        self.assertEqual(len(json.loads(r5.content)["comments"]),20)
        self.assertEqual(r6.status_code,200)
        self.assertEqual(len(json.loads(r6.content)["comments"]),20)
        masker_comments_in_db = json.loads(r4.content)["comments"]
        roast_comments_in_db = json.loads(r5.content)["comments"]
        user_comments_in_db = json.loads(r6.content)["comments"]
        index = json.loads(r4.content)["index"]

        for i in range(20,40):
            comment_m_in_db = get_from_COMMENTS(masker_comments_in_db[i - 20])
            self.assertDictEqual(comment_m_in_db["content"],masker_comments[i]["content"])
            comment_r_in_db = get_from_COMMENTS(roast_comments_in_db[i - 20])
            self.assertDictEqual(comment_r_in_db["content"],roast_comments[i]["content"])
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i - 20])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])

        r7 = requests.get(url + "/comments" + "/" + mid + "/" + "MASKERS" + "/" + str(index),headers=headers)
        r8 = requests.get(url + "/comments" + "/" + first_rid + "/" + "ROASTS" + "/" + str(index),headers=headers)
        r9 = requests.get(url + "/comments" + "/" + jiangfangzhou_in_db + "/" + "USERS" + "/" + str(index),headers=headers)
        self.assertEqual(r7.status_code,200)
        self.assertEqual(len(json.loads(r7.content)["comments"]),10)
        self.assertEqual(r8.status_code,200)
        self.assertEqual(len(json.loads(r8.content)["comments"]),10)
        self.assertEqual(r9.status_code,200)
        self.assertEqual(len(json.loads(r9.content)["comments"]),20)
        masker_comments_in_db = json.loads(r7.content)["comments"]
        roast_comments_in_db = json.loads(r8.content)["comments"]
        user_comments_in_db = json.loads(r9.content)["comments"]
        index = json.loads(r7.content)["index"]
        self.assertIsNone(index)
        index = json.loads(r9.content)["index"]
        for i in range(40,50):
            comment_m_in_db = get_from_COMMENTS(masker_comments_in_db[i - 40])
            self.assertDictEqual(comment_m_in_db["content"],masker_comments[i]["content"])
            comment_r_in_db = get_from_COMMENTS(roast_comments_in_db[i - 40])
            self.assertDictEqual(comment_r_in_db["content"],roast_comments[i]["content"])
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i - 40])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])
        for i in range(50,60):
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i - 40])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])
        r10 = requests.get(url + "/comments" + "/" + jiangfangzhou_in_db + "/" + "USERS" + "/" + str(index),headers=headers)
        self.assertEqual(r10.status_code,200)
        self.assertEqual(len(json.loads(r10.content)["comments"]),20)
        user_comments_in_db = json.loads(r10.content)["comments"]
        index = json.loads(r10.content)["index"]
        for i in range(60,80):
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i - 60])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])

        r11 = requests.get(url + "/comments" + "/" + jiangfangzhou_in_db + "/" + "USERS" + "/" + str(index),headers=headers)
        self.assertEqual(r11.status_code,200)
        self.assertEqual(len(json.loads(r11.content)["comments"]),20)
        user_comments_in_db = json.loads(r11.content)["comments"]
        index = json.loads(r11.content)["index"]
        for i in range(80,100):
            comment_u_in_db = get_from_COMMENTS(user_comments_in_db[i - 80])
            self.assertDictEqual(comment_u_in_db["content"],user_comments[i]["content"])
        index = json.loads(r11.content)["index"]
        self.assertIsNone(index)
    #index out of range/wrong info
    def test_2(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))
        masker_comments = []
        roast_comments = []
        for i in range(10):
            c1["content"] = {"type":"text/plain","filename":"this is comment to masker no​ "+ str(i)}
            masker_comments.append(deepcopy(c1))
            c2["content"] = {"type":"text/plain","filename":"this is comment to roast no​ "+ str(i)}
            roast_comments.append(deepcopy(c2))
            r1 = requests.post(url + "/comments",json=c1,headers=headers)
            r2 = requests.post(url + "/comments",json=c2,headers=headers)
            self.assertEqual(r1.status_code,200)
            self.assertEqual(r2.status_code,200)
        r1 = requests.get(url + "/comments" + "/" + mid + "/" + "MASKERS" + "/10",headers=headers)
        r2 = requests.get(url + "/comments" + "/" + first_rid + "/" + "ROASTS" + "/10",headers=headers)
        r3 = requests.get(url + "/comments" + "/" + "mid" + "/" + "MASKERS" + "/0",headers=headers)
        r4 = requests.get(url + "/comments" + "/" + "first_rid" + "/" + "ROASTS" + "/0",headers=headers)
        r5 = requests.get(url + "/comments" + "/" + mid + "/" + "ROASTS" + "/0",headers=headers)
        r6 = requests.get(url + "/comments" + "/" + first_rid + "/" + "MASKERS" + "/0",headers=headers)

        for r in [r1,r2,r3,r4,r5,r6]:
            self.assertEqual(r.status_code,400)    
        self.assertEqual(json.loads(r1.content)["message"],"index out of range")
        self.assertEqual(json.loads(r2.content)["message"],"index out of range")
        self.assertEqual(json.loads(r3.content)["message"],"masker does not exist")
        self.assertEqual(json.loads(r4.content)["message"],"roast does not exist")
        self.assertEqual(json.loads(r5.content)["message"],"roast does not exist")
        self.assertEqual(json.loads(r6.content)["message"],"masker does not exist")
        
        
        
        

       

class TestDeleteComment(unittest.TestCase):
    
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

    # wrong type/lack info/wrong owner
    def test_1(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)

        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))

        r1 = requests.post(url + "/comments",json=c1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"comment successful")
        comment_m = get_comments_scan()[0]["cid"]
        r2 = requests.post(url + "/comments",json=c2,headers=headers)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(json.loads(r2.content)["message"],"comment successful")
        comment_r = get_comments_scan()
        comment_r.remove({"cid":comment_m})
        comment_r = comment_r[0]["cid"]

        j_m = {"cid":comment_m} 
        j_r = {"cid":comment_r}
        j_m_1 = {}
        j_m_2 = {"cid":12345}
        j_r_1 = {}
        j_r_2 = {"cid":12345}

        r3 = requests.delete(url + "/comments",json=j_m_1,headers=headers)
        r4 = requests.delete(url + "/comments",json=j_m_2,headers=headers)
        r5 = requests.delete(url + "/comments",json=j_r_1,headers=headers)
        r6 = requests.delete(url + "/comments",json=j_r_2,headers=headers)
        r7 = requests.delete(url + "/comments",json=j_m,headers=headers2)
        r8 = requests.delete(url + "/comments",json=j_r,headers=headers2)

        for request in [r3,r4,r5,r6]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"lack of essential information")
        for request in [r7,r8]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"you have no ownership of this comment")        

        self.assertEqual(len(get_comments_scan()),2)
        self.assertEqual(len(get_users_scan()),2)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)

        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[comment_m, comment_r])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

        user_in_db_nv = get_from_USERS(nvlvshi_in_db)
        self.assertIsNone(user_in_db_nv["MASKOFF"])
        self.assertEqual(user_in_db_nv["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_nv["smacc"],encrypt("nvlvshi"))
        self.assertEqual(user_in_db_nv["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_nv["gender"],"0")
        self.assertEqual(user_in_db_nv["phone_number"],encrypt("nvlvshi"))
        self.assertListEqual(user_in_db_nv["maskers_exposed"],[])
        self.assertListEqual(user_in_db_nv["roasts"],[])
        self.assertListEqual(user_in_db_nv["comments"],[])
        self.assertListEqual(user_in_db_nv["friends"],[])
        self.assertListEqual(user_in_db_nv["blocked"],[])
        self.assertListEqual(user_in_db_nv["articles"],[])

        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_from_ARTICLES(first_aid)
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertTrue(masker_in_db["comments"],[comment_m])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])

        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertListEqual(roast["comments"],[comment_r])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        comment_m = get_from_COMMENTS(comment_m)
        self.assertEqual(comment_m["at"],c1["at"])
        self.assertEqual(comment_m["content"],c1["content"])
        self.assertEqual(comment_m["mid"],c1["mid"])
        self.assertIsNone(comment_m["rid"])
        
        comment_r = get_from_COMMENTS(comment_r)
        self.assertEqual(comment_r["at"],c2["at"])
        self.assertEqual(comment_r["content"],c2["content"])
        self.assertEqual(comment_r["rid"],c2["rid"])
        self.assertTrue("cid" in comment_r)
        self.assertIsNone(comment_r["mid"])


    # other delete-but-no-longer-there
    def test_2(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        

        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))

        r1 = requests.post(url + "/comments",json=c1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"comment successful")
        comment_m = get_comments_scan()[0]["cid"]
        r2 = requests.post(url + "/comments",json=c2,headers=headers)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(json.loads(r2.content)["message"],"comment successful")
        comment_r = get_comments_scan()
        comment_r.remove({"cid":comment_m})
        comment_r = comment_r[0]["cid"]

        j_a = {"aid":first_aid} 
        j_r = {"rid":first_rid}

        j_a_c = {"cid":comment_m}
        j_r_c = {"cid":comment_r}

        r3 = requests.delete(url + "/articles",json=j_a,headers=headers)
        r4 = requests.delete(url + "/roasts",json=j_r,headers=headers)
        r5 = requests.delete(url + "/comments",json=j_a_c,headers=headers)
        r6 = requests.delete(url + "/comments",json=j_r_c,headers=headers)

        for request in [r3,r4]:
            self.assertEqual(request.status_code,200)
            self.assertEqual(json.loads(request.content)["message"],"delete successful")        
        
        
        self.assertEqual(r5.status_code,200)
        self.assertEqual(json.loads(r5.content)["message"],"this masker has been deleted")        
        self.assertEqual(r6.status_code,200)
        self.assertEqual(json.loads(r6.content)["message"],"this roast has been deleted")        


        self.assertEqual(len(get_comments_scan()),2)
        self.assertEqual(len(get_users_scan()),1)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)

        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])

        masker_in_db = get_deleted_masker(mid)
        article_in_db = get_deleted_article(first_aid)
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertEqual(masker_in_db["total_visible"],"False")
        self.assertTrue(masker_in_db["comments"],[comment_m])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertEqual(article_in_db["partial_visible"],"False")

        roast = get_roasts_scan()[0]["rid"]
        roast = get_deleted_roast(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertListEqual(roast["comments"],[comment_r])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(roast["visible"],"False")

        comment_m = get_deleted_comment(comment_m)
        self.assertEqual(comment_m["at"],c1["at"])
        self.assertEqual(comment_m["content"],c1["content"])
        self.assertEqual(comment_m["mid"],c1["mid"])
        self.assertIsNone(comment_m["rid"])
        self.assertEqual(comment_m["visible"],"False")
        
        comment_r = get_deleted_comment(comment_r)
        self.assertEqual(comment_r["at"],c2["at"])
        self.assertEqual(comment_r["content"],c2["content"])
        self.assertEqual(comment_r["rid"],c2["rid"])
        self.assertTrue("cid" in comment_r)
        self.assertIsNone(comment_r["mid"])
        self.assertEqual(comment_r["visible"],"False")
    
    # success
    def test_3(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        

        c1 = deepcopy(jiangfangzhou_comment_m(mid))
        c2 = deepcopy(jiangfangzhou_comment_r(first_rid))

        r1 = requests.post(url + "/comments",json=c1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"comment successful")
        comment_m = get_comments_scan()[0]["cid"]
        r2 = requests.post(url + "/comments",json=c2,headers=headers)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(json.loads(r2.content)["message"],"comment successful")
        comment_r = get_comments_scan()
        comment_r.remove({"cid":comment_m})
        comment_r = comment_r[0]["cid"]

        j_a = {"aid":first_aid} 
        j_r = {"rid":first_rid}

        j_a_c = {"cid":comment_m}
        j_r_c = {"cid":comment_r}

        
        
        r3 = requests.delete(url + "/comments",json=j_a_c,headers=headers)
        r4 = requests.delete(url + "/comments",json=j_r_c,headers=headers)

        for request in [r3,r4]:
            self.assertEqual(request.status_code,200)
            self.assertEqual(json.loads(request.content)["message"],"delete successful")        
        
        self.assertEqual(len(get_comments_scan()),2)
        self.assertEqual(len(get_users_scan()),1)
        self.assertEqual(len(get_roasts_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)

        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertEqual(user_in_db_jiang["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[mid])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[first_aid])

        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_from_ARTICLES(first_aid)
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertEqual(masker_in_db["total_visible"],"True")
        self.assertEqual(masker_in_db["comments"],[])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertEqual(article_in_db["partial_visible"],"True")

        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertListEqual(roast["comments"],[])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(roast["visible"],"True")

        comment_m = get_deleted_comment(comment_m)
        self.assertEqual(comment_m["at"],c1["at"])
        self.assertEqual(comment_m["content"],c1["content"])
        self.assertEqual(comment_m["mid"],c1["mid"])
        self.assertIsNone(comment_m["rid"])
        self.assertEqual(comment_m["visible"],"False")
        
        comment_r = get_deleted_comment(comment_r)
        self.assertEqual(comment_r["at"],c2["at"])
        self.assertEqual(comment_r["content"],c2["content"])
        self.assertEqual(comment_r["rid"],c2["rid"])
        self.assertTrue("cid" in comment_r)
        self.assertIsNone(comment_r["mid"])
        self.assertEqual(comment_r["visible"],"False")

if __name__ == '__main__':
    unittest.main()