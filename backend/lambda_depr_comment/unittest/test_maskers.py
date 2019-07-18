# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import json
import requests
import unittest

from copy import deepcopy
from dynamodb import get_maskers_scan, delete_all, get_a_user_scan, get_from_MASKERS, get_from_ARTICLES, get_from_USERS, get_articles_scan
from utility_decoy_data import generateAccessToken, encrypt
url = "http://127.0.0.1:5000"

jiangfangzhou_pn = "8613789897676"

def register_and_upgrade_jiangfangzhou():
    requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
    jiangfangzhou_in_db = get_a_user_scan()["uid"]
    valid_access_token_with_write = generateAccessToken(jiangfangzhou_in_db)
    headers = {"access_token":valid_access_token_with_write}
    requests.post(url + "/users/write_access",json={"phone_number":jiangfangzhou_pn},headers=headers)
    return (jiangfangzhou_in_db, headers)

def register_no_cellphone():
    requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
    no_cellphone_in_db = get_a_user_scan()["uid"]
    valid_access_token_with_write = generateAccessToken(no_cellphone_in_db)
    headers = {"access_token":valid_access_token_with_write}
    return (no_cellphone_in_db, headers)

jiangfangzhou_article = {       
        "alias":["公共知识分子","作家"],
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}],
    }

zhangwen_mid = "84bcb4bf-f92f-4bad-9e8b-151ed9612db3"

class TestPostMasker(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        delete_all()
        
    
    @classmethod
    def tearDownClass(cls):
        delete_all()
    
    def setUp(self):
        print("                ", self._testMethodName)
    
    def tearDown(self):
        delete_all()
        
    # lack info
    def test_lack_info(self):
        (jiangfangzhou_in_db,headers) = register_and_upgrade_jiangfangzhou()
        m1 = deepcopy(jiangfangzhou_article)
        m1["name"] = "zhangwen"
        m2 = deepcopy(m1)
        m3 = deepcopy(m1)
        m4 = deepcopy(m1)
        del m1["name"]
        del m2["alias"]
        del m3["tags"]
        del m4["content"]

        r1 = requests.post(url + "/maskers",json=m1,headers=headers)
        r2 = requests.post(url + "/maskers",json=m2,headers=headers)
        r3 = requests.post(url + "/maskers",json=m3,headers=headers)
        r4 = requests.post(url + "/maskers",json=m4,headers=headers)

        r = [r1,r2,r3,r4]
        for request in r:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"lack of essential info")
        self.assertFalse(get_maskers_scan())

    # info wrong type
    def test_wrong_info_type(self):
        (jiangfangzhou_in_db,headers) = register_and_upgrade_jiangfangzhou()
        m1 = deepcopy(jiangfangzhou_article)
        m1["name"] = "zhangwen"
        m2 = deepcopy(m1)
        m3 = deepcopy(m1)
        m4 = deepcopy(m1)
        m5 = deepcopy(m1)
        m6 = deepcopy(m1)
        m7 = deepcopy(m1)
        m8 = deepcopy(m1)
        m9 = deepcopy(m1)
        m10 = deepcopy(m1)
        m1["name"] = 12345
        m2["alias"] = 12345
        m3["tags"] = 12345
        m4["content"] = 12345
        m5["alias"] = [1,2,3]
        m6["tags"] = [1,2,3]
        m7["content"] = [1,2,3]
        m8["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        m9["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        m10["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"dne.jpg"}]
        r1 = requests.post(url + "/maskers",json=m1,headers=headers)
        r2 = requests.post(url + "/maskers",json=m2,headers=headers)
        r3 = requests.post(url + "/maskers",json=m3,headers=headers)
        r4 = requests.post(url + "/maskers",json=m4,headers=headers)
        r5 = requests.post(url + "/maskers",json=m5,headers=headers)
        r6 = requests.post(url + "/maskers",json=m6,headers=headers)
        r7 = requests.post(url + "/maskers",json=m7,headers=headers)
        r8 = requests.post(url + "/maskers",json=m8,headers=headers)
        r9 = requests.post(url + "/maskers",json=m9,headers=headers)
        r10 = requests.post(url + "/maskers",json=m10,headers=headers)
        r = [r1,r2,r3,r4,r5,r6,r7,r8,r9,r10]
        for request in r[0:4]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"wrong type of essential information")
        for request in r[4:6]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content)["message"],"wrong type of tags or alias")
        self.assertEqual(r7.status_code,400)
        self.assertEqual(json.loads(r7.content)["message"],"wrong type of items in content")
        self.assertEqual(r8.status_code,400)
        self.assertEqual(json.loads(r8.content)["message"],"item has no type or type format is wrong")
        self.assertEqual(r9.status_code,400)
        self.assertEqual(json.loads(r9.content)["message"],"item has no filename or filename is wrong")
        self.assertEqual(r10.status_code,400)
        self.assertEqual(json.loads(r10.content)["message"],"file dne.jpg DNE.")
        self.assertFalse(get_maskers_scan())

    # user no write access
    def test_no_write_access(self):
        (no_cellphone_in_db,headers) = register_no_cellphone()
        m1 = deepcopy(jiangfangzhou_article)
        m1["name"] = "zhangwen"

        r1 = requests.post(url + "/maskers",json=m1,headers=headers)

        self.assertEqual(r1.status_code,401)
        self.assertEqual(json.loads(r1.content)["message"],"No permission to write")
        self.assertFalse(get_maskers_scan())

    # correct input
    def test_no_write_access(self):
        (jiangfangzhou_in_db,headers) = register_and_upgrade_jiangfangzhou()
        m1 = deepcopy(jiangfangzhou_article)
        m1["name"] = "zhangwen"

        r1 = requests.post(url + "/maskers",json=m1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"post successful")
        masker = get_from_MASKERS(get_maskers_scan()[0]["mid"])
        article = get_from_ARTICLES(get_articles_scan()[0]["aid"])
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        self.assertEqual(masker["name"],m1["name"])
        self.assertEqual(masker["contributed"],1)
        self.assertListEqual(masker["articles"],[article["aid"]])
        self.assertTrue(masker["total_visible"])
        
        self.assertEqual(article["mid"],masker["mid"])
        self.assertEqual(article["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article["tags"],m1["tags"])
        self.assertEqual(article["alias"],m1["alias"])
        self.assertEqual(article["content"],m1["content"])
        self.assertTrue(article["partial_visible"])

        jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
        self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
        self.assertEqual(jiangfangzhou_in_db["gender"],"0")
        self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
        self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(jiangfangzhou_pn))
        attrs = ["blocked","comments","friends","roasts"]
        for attr in attrs:
            self.assertListEqual(jiangfangzhou_in_db[attr],[])
        self.assertListEqual(jiangfangzhou_in_db["articles"],[article["aid"]])
        self.assertListEqual(jiangfangzhou_in_db["maskers_exposed"],[masker["mid"]])
        self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])
        




if __name__ == '__main__':
    unittest.main()