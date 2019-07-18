# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
from dynamodb import *
from utility_decoy_data import generateAccessToken, encrypt
from copy import deepcopy
import json
import requests
import unittest

url = "http://127.0.0.1:5000"
#(jiangfangzhou_in_db,headers) = register_jiangfangzhou()
def register_jiangfangzhou():
    requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
    jiangfangzhou_in_db = get_a_user_scan()["uid"]
    valid_access_token_no_write = generateAccessToken(jiangfangzhou_in_db)
    headers = {"access_token":valid_access_token_no_write}
    return (jiangfangzhou_in_db, headers)

#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
#(nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi()
def register_nvlvshi(jiangfangzhou_in_db):
    requests.post(url + "/users",json={"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"})
    nvlvshi_in_db = get_users_scan()
    nvlvshi_in_db.remove({"uid":jiangfangzhou_in_db})
    nvlvshi_in_db = nvlvshi_in_db[0]["uid"]
    valid_access_token_with_write = generateAccessToken(nvlvshi_in_db)
    headers = {"access_token":valid_access_token_with_write}
    return (nvlvshi_in_db, headers)

jiangfangzhou_roast = {       
        "title":"nvlvshi_roast",
        "tags":["性骚扰","摸大腿","饭局"],
        "content":[{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
    }

nvlvshi_roast = {
        "title":"nvlvshi_roast",
        "tags":["强奸","媒体人","时事评论员","公知","专栏作家","饭局后"],
        "content":[{"type":"image/jpeg","filename":"Rbxi-hftenia2500242.png"},{"type":"image/jpeg","filename":"gBKW-hftenia2519068.jpg"},{"type":"image/jpeg","filename":"8721e49bly1ftlssuzty0j20ku112dk1.jpg"}]
    }
#(jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
def post_a_roast():
    (jiangfangzhou_in_db,headers) = register_jiangfangzhou()
    ro1 = deepcopy(jiangfangzhou_roast)
    r1 = requests.post(url + "/roasts",json=ro1,headers=headers)
    first_rid = get_roasts_scan()[0]["rid"]
    return (jiangfangzhou_in_db,headers,first_rid)
class TestPostRoast(unittest.TestCase):
    
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

    # lack info / wrong type / file dne
    def test_1(self):
        (jiangfangzhou_in_db,headers) = register_jiangfangzhou()
        ro1 = deepcopy(jiangfangzhou_roast)
        ro2 = deepcopy(jiangfangzhou_roast)
        ro3 = deepcopy(jiangfangzhou_roast)
        ro4 = deepcopy(jiangfangzhou_roast)
        ro5 = deepcopy(jiangfangzhou_roast)
        ro6 = deepcopy(jiangfangzhou_roast)
        ro7 = deepcopy(jiangfangzhou_roast)
        ro8 = deepcopy(jiangfangzhou_roast)
        ro9 = deepcopy(jiangfangzhou_roast)
        ro10 = deepcopy(jiangfangzhou_roast)
        ro11 = deepcopy(jiangfangzhou_roast)
        del ro1["title"]
        del ro2["tags"]
        del ro3["content"]
        ro4["title"] = 12345
        ro5["tags"] = 12345
        ro6["content"] = 12345
        ro7["tags"] = [12,23,4]
        ro8["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        ro9["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        ro10["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"some_random_file.jpg"}]
        ro11["content"] = [1,2,3]
        r1 = requests.post(url + "/roasts",json=ro1,headers=headers)
        r2 = requests.post(url + "/roasts",json=ro2,headers=headers)
        r3 = requests.post(url + "/roasts",json=ro3,headers=headers)
        r4 = requests.post(url + "/roasts",json=ro4,headers=headers)
        r5 = requests.post(url + "/roasts",json=ro5,headers=headers)
        r6 = requests.post(url + "/roasts",json=ro6,headers=headers)
        r7 = requests.post(url + "/roasts",json=ro7,headers=headers)
        r8 = requests.post(url + "/roasts",json=ro8,headers=headers)
        r9 = requests.post(url + "/roasts",json=ro9,headers=headers)
        r10 = requests.post(url + "/roasts",json=ro10,headers=headers)
        r11 = requests.post(url + "/roasts",json=ro11,headers=headers)
        for request in [r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11]:
            self.assertEqual(request.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"lack of content")
        self.assertEqual(json.loads(r2.content)["message"],"lack of content")
        self.assertEqual(json.loads(r3.content)["message"],"lack of content")
        self.assertEqual(json.loads(r4.content)["message"],"wrong type of content")
        self.assertEqual(json.loads(r5.content)["message"],"wrong type of content")
        self.assertEqual(json.loads(r6.content)["message"],"wrong type of content")
        self.assertEqual(json.loads(r7.content)["message"],"wrong type of tags")
        self.assertEqual(json.loads(r8.content)["message"],"item has no filename or filename is wrong")
        self.assertEqual(json.loads(r9.content)["message"],"item has no type or type format is wrong")
        self.assertEqual(json.loads(r10.content)["message"],"file some_random_file.jpg DNE.")
        self.assertEqual(json.loads(r11.content)["message"],"wrong type of items in content")
        self.assertFalse(get_roasts_scan())

        self.assertEqual(len(get_users_scan()),1)
        user_in_db_jiang = get_users_scan()
        user_in_db_jiang = get_from_USERS(user_in_db_jiang[0]["uid"])
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])

    # correct input
    def test_2(self):
        (jiangfangzhou_in_db,headers) = register_jiangfangzhou()
        ro1 = deepcopy(jiangfangzhou_roast)

        r1 = requests.post(url + "/roasts",json=ro1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"roast successful")

        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        self.assertEqual(len(get_users_scan()),1)
        user_in_db_jiang = get_users_scan()
        user_in_db_jiang = get_from_USERS(user_in_db_jiang[0]["uid"])
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[roast["rid"]])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])
class TestUpdateRoast(unittest.TestCase):
    
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
    # lack info/wrong type/file dne
    def test_1(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        ro1 = deepcopy(jiangfangzhou_roast)
        ro1["rid"] = first_rid
        ro2 = deepcopy(ro1)
        ro3 = deepcopy(ro1)
        ro4 = deepcopy(ro1)
        ro5 = deepcopy(ro1)
        ro6 = deepcopy(ro1)
        ro7 = deepcopy(ro1)
        ro8 = deepcopy(ro1)
        ro9 = deepcopy(ro1)
        ro10 = deepcopy(ro1)
        ro11 = deepcopy(ro1)
        ro12 = deepcopy(ro1)
        ro13 = deepcopy(ro1)
        del ro1["title"]
        del ro2["tags"]
        del ro3["content"]
        ro4["title"] = 12345
        ro5["tags"] = 12345
        ro6["content"] = 12345
        ro7["tags"] = [12,23,4]
        ro8["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        ro9["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        ro10["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"some_random_file.jpg"}]
        ro11["content"] = [1,2,3]
        del ro12["rid"]
        ro13["rid"] = 123
        r1 = requests.put(url + "/roasts",json=ro1,headers=headers)
        r2 = requests.put(url + "/roasts",json=ro2,headers=headers)
        r3 = requests.put(url + "/roasts",json=ro3,headers=headers)
        r4 = requests.put(url + "/roasts",json=ro4,headers=headers)
        r5 = requests.put(url + "/roasts",json=ro5,headers=headers)
        r6 = requests.put(url + "/roasts",json=ro6,headers=headers)
        r7 = requests.put(url + "/roasts",json=ro7,headers=headers)
        r8 = requests.put(url + "/roasts",json=ro8,headers=headers)
        r9 = requests.put(url + "/roasts",json=ro9,headers=headers)
        r10 = requests.put(url + "/roasts",json=ro10,headers=headers)
        r11 = requests.put(url + "/roasts",json=ro11,headers=headers)
        r12 = requests.put(url + "/roasts",json=ro12,headers=headers)
        r13 = requests.put(url + "/roasts",json=ro13,headers=headers)
        for request in [r1,r2,r3,r4,r5,r6,r7,r8,r9,r10,r11]:
            self.assertEqual(request.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"lack of essential parts")
        self.assertEqual(json.loads(r2.content)["message"],"lack of essential parts")
        self.assertEqual(json.loads(r3.content)["message"],"lack of essential parts")
        self.assertEqual(json.loads(r4.content)["message"],"wrong type of request body parts")
        self.assertEqual(json.loads(r5.content)["message"],"wrong type of request body parts")
        self.assertEqual(json.loads(r6.content)["message"],"wrong type of request body parts")
        self.assertEqual(json.loads(r7.content)["message"],"wrong type of tags")
        self.assertEqual(json.loads(r8.content)["message"],"item has no filename or filename is wrong")
        self.assertEqual(json.loads(r9.content)["message"],"item has no type or type format is wrong")
        self.assertEqual(json.loads(r10.content)["message"],"file some_random_file.jpg DNE.")
        self.assertEqual(json.loads(r11.content)["message"],"wrong type of items in content")
        self.assertEqual(json.loads(r12.content)["message"],"lack of essential parts")
        self.assertEqual(json.loads(r13.content)["message"],"wrong type of request body parts")                
        self.assertEqual(len(get_roasts_scan()),1)

        self.assertEqual(len(get_users_scan()),1)
        user_in_db_jiang = get_users_scan()
        user_in_db_jiang = get_from_USERS(user_in_db_jiang[0]["uid"])
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])
    # roast does not belong to user
    def test_2(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        (nvlvshi_in_db, headers2) = register_nvlvshi(jiangfangzhou_in_db)
        roast2 = deepcopy(nvlvshi_roast)
        roast2["rid"] = first_rid
        r1 = requests.put(url + "/roasts",json=roast2,headers=headers2)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"you have no ownership of this roast")
        
        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        self.assertEqual(len(get_users_scan()),2)
        
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])


        user_in_db_nv = get_from_USERS(nvlvshi_in_db)
        self.assertIsNone(user_in_db_nv["MASKOFF"])
        self.assertEqual(user_in_db_nv["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_nv["smacc"],encrypt("nvlvshi"))
        self.assertEqual(user_in_db_nv["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_nv["gender"],"0")
        self.assertEqual(user_in_db_nv["phone_number"],None)
        self.assertListEqual(user_in_db_nv["maskers_exposed"],[])
        self.assertListEqual(user_in_db_nv["roasts"],[])
        self.assertListEqual(user_in_db_nv["comments"],[])
        self.assertListEqual(user_in_db_nv["friends"],[])
        self.assertListEqual(user_in_db_nv["blocked"],[])
        self.assertListEqual(user_in_db_nv["articles"],[])
    # success
    def test_3(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()

        roast2 = deepcopy(nvlvshi_roast)
        roast2["rid"] = first_rid
        r1 = requests.put(url + "/roasts",json=roast2,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"update successful")
        
        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],roast2["content"])
        self.assertEqual(roast["title"],roast2["title"])
        self.assertListEqual(roast["tags"],roast2["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        self.assertEqual(len(get_users_scan()),1)
        
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])


class TestDeleteRoast(unittest.TestCase):
    
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

    # wrong type/lack info
    def test_1(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        data1={}
        data2={"rid":12345}
        
        r1 = requests.delete(url + "/roasts",json=data1,headers=headers)
        r2 = requests.delete(url + "/roasts",json=data2,headers=headers)

        self.assertEqual(r1.status_code,400)
        self.assertEqual(r2.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"rid not exist or has wrong format")
        self.assertEqual(json.loads(r2.content)["message"],"rid not exist or has wrong format")

        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])

    # wrong owner
    def test_2(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        (nvlvshi_in_db, headers2) = register_nvlvshi(jiangfangzhou_in_db)
        data={"rid":first_rid}
        
        r1 = requests.delete(url + "/roasts",json=data,headers=headers2)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content)["message"],"you have no ownership of this roast")
        
        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_roasts_scan()[0]["rid"]
        roast = get_from_ROASTS(roast)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)

        self.assertEqual(len(get_users_scan()),2)
        
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[first_rid])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])


        user_in_db_nv = get_from_USERS(nvlvshi_in_db)
        self.assertIsNone(user_in_db_nv["MASKOFF"])
        self.assertEqual(user_in_db_nv["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_nv["smacc"],encrypt("nvlvshi"))
        self.assertEqual(user_in_db_nv["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_nv["gender"],"0")
        self.assertEqual(user_in_db_nv["phone_number"],None)
        self.assertListEqual(user_in_db_nv["maskers_exposed"],[])
        self.assertListEqual(user_in_db_nv["roasts"],[])
        self.assertListEqual(user_in_db_nv["comments"],[])
        self.assertListEqual(user_in_db_nv["friends"],[])
        self.assertListEqual(user_in_db_nv["blocked"],[])
        self.assertListEqual(user_in_db_nv["articles"],[])
    
    # success 
    def test_3(self):
        (jiangfangzhou_in_db,headers,first_rid) = post_a_roast()
        
        data1={"rid":first_rid}
        
        r1 = requests.delete(url + "/roasts",json=data1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"delete successful")

        self.assertEqual(len(get_roasts_scan()),1)
        roast = get_deleted_roast(first_rid)
        self.assertListEqual(roast["content"],jiangfangzhou_roast["content"])
        self.assertEqual(roast["title"],jiangfangzhou_roast["title"])
        self.assertListEqual(roast["tags"],jiangfangzhou_roast["tags"])
        self.assertEqual(roast["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(roast["visible"],"False")

        self.assertEqual(len(get_users_scan()),1)
        user_in_db_jiang = get_from_USERS(jiangfangzhou_in_db)
        self.assertIsNone(user_in_db_jiang["MASKOFF"])
        self.assertEqual(user_in_db_jiang["MASKOFF_changed"],0)
        self.assertEqual(user_in_db_jiang["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db_jiang["smacc_type"],"WeChat")
        self.assertEqual(user_in_db_jiang["gender"],"0")
        self.assertIsNone(user_in_db_jiang["phone_number"])
        self.assertListEqual(user_in_db_jiang["maskers_exposed"],[])
        self.assertListEqual(user_in_db_jiang["roasts"],[])
        self.assertListEqual(user_in_db_jiang["comments"],[])
        self.assertListEqual(user_in_db_jiang["friends"],[])
        self.assertListEqual(user_in_db_jiang["blocked"],[])
        self.assertListEqual(user_in_db_jiang["articles"],[])
        

if __name__ == '__main__':
    unittest.main()