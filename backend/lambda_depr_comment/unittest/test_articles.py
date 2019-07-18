# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
from dynamodb import get_maskers_scan, delete_all, get_a_user_scan, get_from_MASKERS, get_from_ARTICLES, get_from_USERS, get_articles_scan, get_users_scan, get_from_db, get_deleted_article, get_deleted_masker
from utility_decoy_data import generateAccessToken, encrypt
from copy import deepcopy
import json
import requests
import unittest


url = "http://127.0.0.1:5000"

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
nvlvshi_article = {
        "alias":["南京师范大学新闻学硕士"],
        "tags":["强奸","媒体人","时事评论员","公知","专栏作家","饭局后"],
        "content":[{"type":"image/jpeg","filename":"Rbxi-hftenia2500242.png"},{"type":"image/jpeg","filename":"gBKW-hftenia2519068.jpg"},{"type":"image/jpeg","filename":"8721e49bly1ftlssuzty0j20ku112dk1.jpg"}]
    }

zhangwen_mid = "84bcb4bf-f92f-4bad-9e8b-151ed9612db3"

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



class TestPostArticle(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        delete_all()
        
    @classmethod
    def tearDownClass(cls):
        delete_all()
    
    def setUp(self):
        print("                ", self._testMethodName,"                ")
    
    def tearDown(self):
        delete_all()

    # not_post token
    def test_no_post_token(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nocellphone_in_db,headers) = register_no_cellphone(jiangfangzhou_in_db)
        article_2 = deepcopy(nvlvshi_article)
        article_2["mid"] = mid
        r1 = requests.post(url + "/articles",json=article_2,headers=headers)
        self.assertEqual(r1.status_code,401)
        self.assertEqual(json.loads(r1.content)["message"],"No permission to write")
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        masker_in_db = get_from_MASKERS(mid)
        self.assertEqual(len(get_articles_scan()),1)
        article_in_db = get_from_ARTICLES(get_articles_scan()[0]["aid"])
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])

    # lack info
    def test_lack_info(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        article1 = deepcopy(nvlvshi_article)
        article1["mid"] = mid
        article2 = deepcopy(article1)
        article3 = deepcopy(article1)
        article4 = deepcopy(article1)
        article5 = deepcopy(article1)
        article6 = deepcopy(article1)
        article7 = deepcopy(article1)
        article8 = deepcopy(article1)
        article9 = deepcopy(article1)
        article10 = deepcopy(article1)
        article11 = deepcopy(article1)
        article12 = deepcopy(article1)
        article13 = deepcopy(article1)
        article14 = deepcopy(article1)
        del article1["mid"]
        del article2["tags"]
        del article3["alias"]
        del article4["content"]
        article5["mid"] = 12345
        article6["content"] = {12345:54321}
        article7["content"] = [{12345:54321}]
        article8["content"] = [[2]]
        article9["tags"] = 123
        article10["tags"] = [123]
        article11["alias"] = 123
        article12["alias"] = [123]
        article13["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg"},{"type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]
        article14["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"}]

        r1 = requests.post(url + "/articles",json=article1,headers=headers2)
        r2 = requests.post(url + "/articles",json=article2,headers=headers2)
        r3 = requests.post(url + "/articles",json=article3,headers=headers2)
        r4 = requests.post(url + "/articles",json=article4,headers=headers2)
        r5 = requests.post(url + "/articles",json=article5,headers=headers2)
        r6 = requests.post(url + "/articles",json=article6,headers=headers2)
        r7 = requests.post(url + "/articles",json=article7,headers=headers2)
        r8 = requests.post(url + "/articles",json=article8,headers=headers2)
        r9 = requests.post(url + "/articles",json=article9,headers=headers2)
        r10 = requests.post(url + "/articles",json=article10,headers=headers2)
        r11 = requests.post(url + "/articles",json=article11,headers=headers2)
        r12 = requests.post(url + "/articles",json=article12,headers=headers2)
        r13 = requests.post(url + "/articles",json=article13,headers=headers2)
        r14 = requests.post(url + "/articles",json=article14,headers=headers2)

        r = [r1,r2,r3,r4,r5,r6,r9,r11,r13,r14,r7,r8,r10,r12]
        for request in r:
            self.assertEqual(request.status_code,400)
        for request in r[:7]:
            self.assertEqual(json.loads(request.content),json.loads("""{"message":"lack of mid or content, or their type is wrong"}"""))
        self.assertEqual(json.loads(r10.content),json.loads("""{"message":"wrong type for alias or tag info"}"""))    
        self.assertEqual(json.loads(r12.content),json.loads("""{"message":"wrong type for alias or tag info"}"""))    
        self.assertEqual(json.loads(r7.content),json.loads("""{"message":"item has no type or type format is wrong"}"""))
        self.assertEqual(json.loads(r8.content),json.loads("""{"message":"wrong type of items in content"}"""))
        self.assertEqual(json.loads(r13.content),json.loads("""{"message":"item has no filename or filename is wrong"}"""))
        self.assertEqual(json.loads(r14.content),json.loads("""{"message":"item has no type or type format is wrong"}"""))
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_from_ARTICLES(get_articles_scan()[0]["aid"])
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])
    # article has info that is not in s3
    def test_exist_in_s3(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        article1 = deepcopy(nvlvshi_article)
        article1["mid"] = mid
        article1["content"] = [{"type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"},{"type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"},{"type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"},{"type":"image/jpeg","filename":"some_random_file.jpg"}]
        r1 = requests.post(url + "/articles",json=article1,headers=headers2)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"file some_random_file.jpg DNE."}"""))
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_from_ARTICLES(get_articles_scan()[0]["aid"])
        
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])
    # masker dne
    def test_mid_dne(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        article1 = deepcopy(nvlvshi_article)
        article1["mid"] = "mid"
        r1 = requests.post(url + "/articles",json=article1,headers=headers2)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"masker do not exist"}"""))
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_articles_scan()
        article_in_db = get_from_ARTICLES(article_in_db[0]["aid"])

        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])
    # masker already exposed
    def test_masker_already_exposed(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        article1 = deepcopy(jiangfangzhou_article)
        article1["mid"] = mid
        r1 = requests.post(url + "/articles",json=article1,headers=headers)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"You have already exposed this masker. please use update masker to update your article"}"""))        
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),1)
        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_articles_scan()
        article_in_db = get_from_ARTICLES(article_in_db[0]["aid"])
        self.assertEqual(len(masker_in_db["articles"]),1)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][0])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertListEqual(masker_in_db["articles"],[first_aid])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])
    def test_successful_posting(self):
        (jiangfangzhou_in_db,headers_j) = register_and_upgrade_jiangfangzhou()
        (nvlvshi_in_db,headers_n,mid,first_aid) = post_a_masker(jiangfangzhou_in_db)
        article1 = deepcopy(jiangfangzhou_article)
        article1["mid"] = mid
        r1 = requests.post(url + "/articles",json=article1,headers=headers_j)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_articles_scan()),2)
        masker_in_db = get_from_MASKERS(mid)
        article_in_db = get_articles_scan()
        article_in_db.remove({"aid":first_aid})
        article_in_db = get_from_ARTICLES(article_in_db[0]["aid"])
        self.assertEqual(len(masker_in_db["articles"]),2)
        self.assertEqual(article_in_db["aid"],masker_in_db["articles"][1])
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],2)
        self.assertListEqual(masker_in_db["articles"],[first_aid,article_in_db["aid"]])
        self.assertTrue(masker_in_db["total_visible"])
        self.assertEqual(article_in_db["mid"],masker_in_db["mid"])
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertTrue(article_in_db["partial_visible"])
        jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
        self.assertListEqual(jiangfangzhou_in_db["maskers_exposed"],[mid])
        self.assertListEqual(jiangfangzhou_in_db["articles"],[article_in_db["aid"]])
        self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
        self.assertEqual(jiangfangzhou_in_db["gender"],"0")
        self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
        self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(jiangfangzhou_pn))
        attrs = ["blocked","comments","friends","roasts"]
        for attr in attrs:
            self.assertListEqual(jiangfangzhou_in_db[attr],[])
        self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])


class TestUpdateArticle(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        delete_all()
        
    @classmethod
    def tearDownClass(cls):
        delete_all()
    
    def setUp(self):
        print("                ", self._testMethodName,"                ")
    
    def tearDown(self):
        delete_all()

    # lack post access
    def test_no_post_token(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker() #post article1
        a1 = deepcopy(nvlvshi_article) #article2
        a1["aid"] = first_aid
        headers = {"access_token":None}
        r1 = requests.put(url + "/articles",json=a1,headers=headers)
        self.assertEqual(r1.status_code,401)
        self.assertEqual(json.loads(r1.content)["message"],"token is missing")
    # lack info
    def test_lack_info(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        
        a1 = deepcopy(jiangfangzhou_article)
        a1["aid"] = first_aid
        a2 = deepcopy(a1)
        a3 = deepcopy(a1)
        a4 = deepcopy(a1)
        del a1["aid"]
        del a2["alias"]
        del a3["tags"]
        del a4["content"]
        
        r1 = requests.put(url + "/articles",json=a1,headers=headers)
        r2 = requests.put(url + "/articles",json=a2,headers=headers)
        r3 = requests.put(url + "/articles",json=a3,headers=headers)
        r4 = requests.put(url + "/articles",json=a4,headers=headers)
        
        r = [r1,r2,r3,r4]
        for request in r:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content),json.loads("""{"message":"lack of essential information"}"""))
        
        a0_db = get_articles_scan()[0]
        a0_db= get_from_ARTICLES(a0_db["aid"])
        del a0_db["aid"]
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        del a0_db["author_uid"]
        self.assertEqual(a0_db["mid"],mid)
        del a0_db["mid"]
        del a0_db["partial_visible"]
        del a0_db["name"]
        self.assertDictEqual(a0_db,a1)
    # wrong info type
    def test_wrong_info_type(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        
        a1 = deepcopy(jiangfangzhou_article)
        a1["aid"] = first_aid
        a2 = deepcopy(a1)
        a3 = deepcopy(a1)
        a4 = deepcopy(a1)
        a5 = deepcopy(a1)
        a6 = deepcopy(a1)
        a7 = deepcopy(a1)
        a8 = deepcopy(a1)
        a1["aid"] = 12345
        a2["alias"] = {123:345}
        a3["tags"] = {123:345}
        a4["content"] = {123:345}
        a5["alias"] = [123,456]
        a6["tags"] = [123,456]
        a7["content"] = [
            {
                "type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"
            },
            {
                "type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"
            },
            {
                "type":"image/jpeg"
            },
            {
                "type":"image/jpeg","filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"
            }
        ]
        a8["content"] = [
            {
                "type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"
            },
            {
                "type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"
            },
            {
                "type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"
            },
            {
                "filename":"v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"
            }
        ]
        r1 = requests.put(url + "/articles",json=a1,headers=headers)
        r2 = requests.put(url + "/articles",json=a2,headers=headers)
        r3 = requests.put(url + "/articles",json=a3,headers=headers)
        r4 = requests.put(url + "/articles",json=a4,headers=headers)
        r5 = requests.put(url + "/articles",json=a5,headers=headers)
        r6 = requests.put(url + "/articles",json=a6,headers=headers)
        r7 = requests.put(url + "/articles",json=a7,headers=headers)
        r8 = requests.put(url + "/articles",json=a8,headers=headers)
        
        r = [r1,r2,r3,r4,r7,r8,r5,r6]
        for request in r[0:4]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content),json.loads("""{"message":"wrong type of essential information"}"""))
        for request in r[-2:]:
            self.assertEqual(request.status_code,400)
            self.assertEqual(json.loads(request.content),json.loads("""{"message":"wrong type of tags or alias"}"""))
        self.assertEqual(r7.status_code,400)
        self.assertEqual(json.loads(r7.content),json.loads("""{"message":"item has no filename or filename is wrong"}"""))
        self.assertEqual(r8.status_code,400)
        self.assertEqual(json.loads(r8.content),json.loads("""{"message":"item has no type or type format is wrong"}"""))
        
        a0_db = get_articles_scan()[0]
        a0_db= get_from_ARTICLES(a0_db["aid"])
        del a0_db["aid"]
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        del a0_db["author_uid"]
        self.assertEqual(a0_db["mid"],mid)
        del a0_db["mid"]
        del a0_db["partial_visible"]
        del a1["aid"]
        del a0_db["name"]
        self.assertDictEqual(a0_db,a1)
    # s3 exisitence
    def test_exist_in_s3(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        
        article1 = deepcopy(jiangfangzhou_article)
        article1["aid"] = first_aid
        article1["content"] = [
            {
                "type":"text/plain","filename":"章文刚刚给我发的微博私信。 ​"
            },
            {
                "type":"image/jpeg","filename":"3e89803fly1ftta7v7qspj20v91vok00.jpg"
            },
            {
                "type":"image/jpeg","filename":"cSL5-hftenia2454894.jpg"
            },
            {
                 "type":"image/jpeg","filename":"some_random_file.jpg"
            }
        ]
        r1 = requests.put(url + "/articles",json=article1,headers=headers)
        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"file some_random_file.jpg DNE."}"""))
        

        a0_db = get_articles_scan()[0]
        a0_db= get_from_ARTICLES(a0_db["aid"])
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        del a0_db["author_uid"]
        self.assertEqual(a0_db["mid"],mid)
        del a0_db["mid"]
        self.assertListEqual(a0_db["content"],jiangfangzhou_article["content"])
        del a0_db["content"]
        del article1["content"]
        del a0_db["partial_visible"]
        del a0_db["name"]
        self.assertDictEqual(a0_db,article1)

    # user do not own article
    def test_user_do_not_own_article(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        
        a1 = deepcopy(nvlvshi_article)
        a1["content"] = [{"type":"text/plain","filename":"不应该录入"}]
        a1["aid"] = first_aid
        r1 = requests.put(url + "/articles",json=a1,headers=headers2)

        self.assertEqual(r1.status_code,400)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"wrong owner of article"}"""))

        a0_db = get_articles_scan()[0]
        a0_db= get_from_ARTICLES(a0_db["aid"])
        del a0_db["aid"]
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        del a0_db["author_uid"]
        self.assertEqual(a0_db["mid"],mid)
        del a0_db["mid"]
        del a0_db["partial_visible"]
        del a0_db["name"]
        self.assertDictEqual(a0_db,jiangfangzhou_article)

    def test_success_post(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()

        a1 = deepcopy(jiangfangzhou_article)
        a1["content"] = [{"type":"text/plain","filename":"不应该录入"}]
        a1["aid"] = first_aid
        r1 = requests.put(url + "/articles",json=a1,headers=headers)

        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content),json.loads("""{"message":"put successful"}"""))


        a0_db = get_articles_scan()[0]
        a0_db= get_from_ARTICLES(a0_db["aid"])
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        del a0_db["author_uid"]
        self.assertEqual(a0_db["mid"],mid)
        del a0_db["mid"]
        del a0_db["partial_visible"]
        del a0_db["post_date"]
        del a0_db["name"]
        self.assertDictEqual(a0_db,a1)
class TestDeleteArticle(unittest.TestCase):
    
    @classmethod
    def setUpClass(cls):
        delete_all()
        
    @classmethod
    def tearDownClass(cls):
        delete_all()
    
    def setUp(self):
        print("                ", self._testMethodName,"                ")
    
    def tearDown(self):
        delete_all()

    # lack info
    def test_lack_info_n_wrong_type(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        data = {}
        data = {"aid":12345}
        
        r1 = requests.delete(url + "/articles",json=data,headers=headers)
        r2 = requests.delete(url + "/articles",json=data,headers=headers)
        r = [r1,r2]
        for request in r:
            self.assertEqual(r1.status_code,400)
            self.assertEqual(json.loads(r1.content)["message"],"aid not exist or has wrong format")

        a0 = deepcopy(jiangfangzhou_article)
        a0_db = get_articles_scan()[0]
        a0_db = get_from_ARTICLES(a0_db["aid"])
        self.assertEqual(a0_db["aid"],first_aid)
        self.assertEqual(a0_db["author_uid"],jiangfangzhou_in_db)
        for key in (list(a0.keys())):
            self.assertListEqual(a0_db[key],a0[key])

    # article do not belong to user
    def test_article_do_not_belong_to_user(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers2) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        data={"aid":first_aid}
        r1 = requests.delete(url + "/articles",json=data,headers=headers2)
        self.assertEqual(r1.status_code,400),
        self.assertEqual(json.loads(r1.content)["message"],"you have no ownership of this article")
    # last article in masker

    def test_last_article_in_masker(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        data = {"aid":first_aid}
        r1 = requests.delete(url + "/articles",json=data,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"delete successful")
        self.assertEqual(len(get_articles_scan()),1)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_users_scan()),1)
        
        user_in_db = get_users_scan()[0]
        user_in_db = get_from_USERS(user_in_db["uid"])
        self.assertIsNone(user_in_db["MASKOFF"])
        self.assertEqual(user_in_db["MASKOFF_changed"],0)
        self.assertEqual(user_in_db["smacc"],encrypt("jiangfangzhou"))
        self.assertEqual(user_in_db["smacc_type"],"WeChat")
        self.assertEqual(user_in_db["gender"],"0")
        self.assertEqual(user_in_db["phone_number"],encrypt(jiangfangzhou_pn))
        self.assertListEqual(user_in_db["maskers_exposed"],[])
        self.assertListEqual(user_in_db["roasts"],[])
        self.assertListEqual(user_in_db["comments"],[])
        self.assertListEqual(user_in_db["friends"],[])
        self.assertListEqual(user_in_db["blocked"],[])
        self.assertListEqual(user_in_db["articles"],[])

        masker_in_db = get_maskers_scan()[0]
        self.assertEqual(masker_in_db["mid"],mid)
        masker_in_db = get_deleted_masker(mid)
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertEqual(masker_in_db["articles"],[first_aid])
        self.assertEqual(masker_in_db["total_visible"],"False")
        
        article_in_db = get_articles_scan()[0]
        self.assertEqual(article_in_db["aid"],first_aid)
        article_in_db = get_deleted_article(article_in_db["aid"])
        self.assertEqual(article_in_db["mid"],mid)
        self.assertEqual(article_in_db["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db["content"],jiangfangzhou_article["content"])
        self.assertEqual(article_in_db["partial_visible"],"False")


    # not last article in masker
    def test_last_article_in_masker(self):
        (jiangfangzhou_in_db,headers,mid,first_aid) = post_a_masker()
        (nvlvshi_in_db, headers_n) = register_and_upgrade_nvlvshi(jiangfangzhou_in_db)
        article_n = deepcopy(nvlvshi_article)
        article_n["mid"] = mid
        r = requests.post(url + "/articles",json=article_n,headers=headers_n)
        self.assertEqual(r.status_code,200)
        self.assertEqual(json.loads(r.content)["message"],"post successful")


        data1 = {"aid":first_aid}
        r1 = requests.delete(url + "/articles",json=data1,headers=headers)
        self.assertEqual(r1.status_code,200)
        self.assertEqual(json.loads(r1.content)["message"],"delete successful")
        self.assertEqual(len(get_articles_scan()),2)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_users_scan()),2)
        
        second_aid = get_articles_scan()
        second_aid.remove({"aid":first_aid})
        second_aid = second_aid[0]["aid"]
        data2 = {"aid":second_aid}
        r2 = requests.delete(url + "/articles",json=data2,headers=headers_n)
        self.assertEqual(r2.status_code,200)
        self.assertEqual(json.loads(r2.content)["message"],"delete successful")
        self.assertEqual(len(get_articles_scan()),2)
        self.assertEqual(len(get_maskers_scan()),1)
        self.assertEqual(len(get_users_scan()),2)

        user_in_db_jiang = get_users_scan()
        user_in_db_jiang.remove({"uid":nvlvshi_in_db})
        user_in_db_jiang = get_from_USERS(user_in_db_jiang[0]["uid"])
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

        user_in_db_nv = get_users_scan()
        user_in_db_nv.remove({"uid":jiangfangzhou_in_db})
        user_in_db_nv = get_from_USERS(user_in_db_nv[0]["uid"])
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

        masker_in_db = get_maskers_scan()[0]
        self.assertEqual(masker_in_db["mid"],mid)
        masker_in_db = get_deleted_masker(mid)
        self.assertEqual(masker_in_db["name"],"zhangwen")
        self.assertEqual(masker_in_db["contributed"],1)
        self.assertEqual(masker_in_db["articles"],[second_aid])
        self.assertEqual(masker_in_db["total_visible"],"False")
        
        article_in_db_j = get_articles_scan()
        article_in_db_j.remove({"aid":second_aid})
        self.assertEqual(article_in_db_j[0]["aid"],first_aid)
        article_in_db_j = get_deleted_article(article_in_db_j[0]["aid"])
        self.assertEqual(article_in_db_j["mid"],mid)
        self.assertEqual(article_in_db_j["author_uid"],jiangfangzhou_in_db)
        self.assertEqual(article_in_db_j["tags"],jiangfangzhou_article["tags"])
        self.assertEqual(article_in_db_j["alias"],jiangfangzhou_article["alias"])
        self.assertEqual(article_in_db_j["content"],jiangfangzhou_article["content"])
        self.assertEqual(article_in_db_j["partial_visible"],"False")

        article_in_db_n = get_articles_scan()
        article_in_db_n.remove({"aid":first_aid})
        self.assertEqual(article_in_db_n[0]["aid"],second_aid)
        article_in_db_n = get_deleted_article(article_in_db_n[0]["aid"])
        self.assertEqual(article_in_db_n["mid"],mid)
        self.assertEqual(article_in_db_n["author_uid"],nvlvshi_in_db)
        self.assertEqual(article_in_db_n["tags"],nvlvshi_article["tags"])
        self.assertEqual(article_in_db_n["alias"],nvlvshi_article["alias"])
        self.assertEqual(article_in_db_n["content"],nvlvshi_article["content"])
        self.assertEqual(article_in_db_n["partial_visible"],"False")
if __name__ == '__main__':
    unittest.main()




