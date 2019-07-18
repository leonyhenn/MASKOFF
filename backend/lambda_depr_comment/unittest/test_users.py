# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from dynamodb import delete_all, insert_user_jiangfangzhou, get_from_USERS, get_a_user_scan, upgrade_write_access, get_users_scan
from utility_decoy_data import encrypt, generateAccessToken

import copy
import json
import requests
import unittest


url = "http://127.0.0.1:5000"

# from flask import Flask
# app = Flask(__name__)
# @app.route('/')
# def hello_world():
#     unittest.main()
#     return 'Hello, World!'



# r = requests.get("http://127.0.0.1:5000/")
# >>> print r.status_code
# >>> print r.headers
# >>> print r.content


# helper functions

# class TestRegisterRelogin(unittest.TestCase):
#     data_exist = {"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"}
#     data_new = {"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"}
#     @classmethod
#     def setUpClass(cls):
#         delete_all()

#     @classmethod
#     def tearDownClass(cls):
#         delete_all()

#     def setUp(self):
#         print("                ", self._testMethodName)

#     def tearDown(self):
#         delete_all()
#     # lack data
#     def test_lack_data(self):
#         # insert a user
#         jiangfangzhou = insert_user_jiangfangzhou()

#         # data should be returned before they hit database
#         # init new request data
#         data1 = copy.deepcopy(TestRegisterRelogin.data_new)
#         del data1["smacc"]
#         data2 = copy.deepcopy(TestRegisterRelogin.data_new)
#         del data2["smacc_type"]
#         data3 = copy.deepcopy(TestRegisterRelogin.data_new)
#         del data3["gender"]

#         # send new request
#         r1 = requests.post(url + "/users",json=data1)
#         r2 = requests.post(url + "/users",json=data2)
#         r3 = requests.post(url + "/users",json=data3)
#         r = [r1,r2,r3]

#         # verify response
#         for request in r:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content),json.loads("""{"message":"insufficient social account info in request"}"""))

#         # get all users from USERS and make sure nothing was added into database.
#         existed_user = get_from_USERS(get_a_user_scan()["uid"])
#         self.assertTrue(existed_user == jiangfangzhou)
#     # wrong data types
#     def test_wrong_data_type(self):
#         # insert a user
#         jiangfangzhou = insert_user_jiangfangzhou()

#         # data should be returned before they hit database
#         # init new request data
#         data1 = copy.deepcopy(TestRegisterRelogin.data_new)
#         data1["smacc"] = 123
#         data2 = copy.deepcopy(TestRegisterRelogin.data_new)
#         data2["smacc_type"] = 456
#         data3 = copy.deepcopy(TestRegisterRelogin.data_new)
#         data3["gender"] = 789
#         data4 = copy.deepcopy(TestRegisterRelogin.data_new)
#         data4["smacc_type"] = "Linkdle"
#         data5 = copy.deepcopy(TestRegisterRelogin.data_new)
#         data5["gender"] = "100"

#         # send new requst
#         r1 = requests.post(url + "/users",json=data1)
#         r2 = requests.post(url + "/users",json=data2)
#         r3 = requests.post(url + "/users",json=data3)
#         r4 = requests.post(url + "/users",json=data4)
#         r5 = requests.post(url + "/users",json=data5)
#         r = [r1,r2,r3,r4,r5]

#         # verify response
#         for request in r:
#             self.assertEqual(request.status_code,400)
#             self.assertEqual(json.loads(request.content),json.loads("""{"message":"insufficient social account info in request"}"""))

#         # get all users from USERS and make sure nothing was added into database.
#         existed_user = get_from_USERS(get_a_user_scan()["uid"])
#         self.assertTrue(existed_user == jiangfangzhou)
#     # user already exist
#     def test_user_exist(self):
#         # insert a user
#         user = insert_user_jiangfangzhou()

#         # register a same user
#         r1 = requests.post(url + "/users",json=TestRegisterRelogin.data_exist)
        
#         self.assertEqual(r1.status_code,200)
#         user_should_not_be_updated = get_from_USERS(user["uid"])
#         self.assertNotEqual(user_should_not_be_updated,False)
#         self.assertTrue(user == user_should_not_be_updated)

#     # new user
#     def test_new_user(self):
#         # register a new user
#         r1 = requests.post(url + "/users",json=TestRegisterRelogin.data_new)
#         self.assertEqual(r1.status_code,200)
        
#         user = get_a_user_scan()
#         self.assertNotEqual(user,False)
#         user = get_from_USERS(user["uid"])
#         self.assertEqual(user["smacc"],encrypt(TestRegisterRelogin.data_new["smacc"]))
#         self.assertEqual(user["smacc_type"],TestRegisterRelogin.data_new["smacc_type"])
#         self.assertEqual(user["gender"],TestRegisterRelogin.data_new["gender"])
#         self.assertEqual(user["phone_number"],None)
#         self.assertEqual(user["MASKOFF"],None)
#         self.assertEqual(user["MASKOFF_changed"],0)
#         self.assertListEqual(user["maskers_exposed"],[])
#         self.assertListEqual(user["roasts"],[])
#         self.assertListEqual(user["comments"],[])
#         self.assertListEqual(user["friends"],[])
#         self.assertListEqual(user["blocked"],[])
#         self.assertListEqual(user["articles"],[])


# class TestReadAccess(unittest.TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         delete_all()
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
        
#     @classmethod
#     def tearDownClass(cls):
#         delete_all()
    
#     def setUp(self):
#         print("                ", self._testMethodName)
    
#     def tearDown(self):
#         pass

#     #no token provided
#     def test_read_access_no_header(self):
#         headers = {}
#         r = requests.get(url + "/users/read_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content),json.loads("""{"message":"token is missing"}"""))
#     #access token is None
#     def test_read_access_no_token(self):
#         no_access_token = None
#         headers = {"access_token":no_access_token}
#         r = requests.get(url + "/users/read_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content),json.loads("""{"message":"token is missing"}"""))
#     # access token is invalid
#     def test_read_access_token_wrong_value(self):
#         jiangfangzhou_uid = get_a_user_scan()["uid"]
#         self.assertNotEqual(jiangfangzhou_uid,False)
#         invalid_access_token = generateAccessToken(jiangfangzhou_uid)[:-2]
#         headers = {"access_token":invalid_access_token}
#         r = requests.get(url + "/users/read_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertFalse(json.loads(r.content)["token_valid"])
#     # access token valid
#     def test_read_access_token_right_value(self):
#         jiangfangzhou_uid = get_a_user_scan()["uid"]
#         self.assertNotEqual(jiangfangzhou_uid,False)
#         valid_access_token = generateAccessToken(jiangfangzhou_uid)
#         headers = {"access_token":valid_access_token}
#         r = requests.get(url + "/users/read_access",headers=headers)
#         self.assertEqual(r.status_code,200)
#         self.assertIn("token_valid",json.loads(r.content))

# class TestWriteAccessUpgrade(unittest.TestCase):
#     phone_number = "phone_number"
#     jiangfangzhou_pn = "8613789897676"
#     encrypted = "3cc76b099e1eb05dbda66a591f79e511257fc7f1ca07f7960733bd47b2f7a1213a8e2b9ed7ae56a557b1d19c12b162e4b20c94e63364a4c3e429aa6276c1f3aa"
#     new_encrypted = encrypt(phone_number)
#     @classmethod
#     def setUpClass(cls):
#         delete_all()
        
#     @classmethod
#     def tearDownClass(cls):
#         delete_all()
    
#     def setUp(self):
#         print("                ", self._testMethodName,"                ")
        
#     def tearDown(self):
#         delete_all()
        
#     # 1.send no phone number 
#     def test_no_access_token(self):
#         #add a new user with no write
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         user_in_db = get_a_user_scan()["uid"]

#         headers = {}
#         data = {"phone_number":TestWriteAccessUpgrade.phone_number}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content)["message"],"token is missing")
        
#         # make sure whats in db did not change      
#         user_in_db = get_from_USERS(user_in_db)  
#         self.assertEqual(user_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(user_in_db["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db["gender"],"0")
#         self.assertEqual(user_in_db["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db["phone_number"],None)
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(user_in_db[attr],[])
#         self.assertIsNone(user_in_db["MASKOFF"])

#     # 2.send request with no phone number
#     def test_send_no_phone_number(self):
#         #add a new user with no write
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         user_in_db = get_a_user_scan()["uid"]

#         headers = {"access_token":generateAccessToken(user_in_db)}
#         data = {}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,400)
#         self.assertEqual(json.loads(r.content)["message"],"No phone number attached or phone number has wrong type")

#         # make sure whats in db did not change
#         user_in_db = get_from_USERS(user_in_db)
#         self.assertEqual(user_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(user_in_db["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db["gender"],"0")
#         self.assertEqual(user_in_db["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db["phone_number"],None)
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(user_in_db[attr],[])
#         self.assertIsNone(user_in_db["MASKOFF"])

#     # 3.send phone number already beed registered
#     def test_send_registered_phone_number(self):
#         # insert full access user
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         jiangfangzhou_in_db = get_a_user_scan()["uid"]
#         upgrade_write_access(jiangfangzhou_in_db,TestWriteAccessUpgrade.encrypted)
#         # insert half access user 
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         no_cellphone_in_db = get_users_scan()
#         no_cellphone_in_db.remove({"uid":jiangfangzhou_in_db})
#         no_cellphone_in_db = no_cellphone_in_db[0]["uid"]

#         headers = {"access_token":generateAccessToken(no_cellphone_in_db)}
#         data = {"phone_number":TestWriteAccessUpgrade.jiangfangzhou_pn}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,400)
#         self.assertIsNone(get_from_USERS(no_cellphone_in_db)["phone_number"])
#         self.assertEqual(json.loads(r.content)["message"],"This phone number already exists. If you recently changed your phone number, please contact customer service.")
        
#         # make sure whats in db did not change        
#         jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccessUpgrade.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])

#         no_cellphone_in_db = get_from_USERS(no_cellphone_in_db)
#         self.assertEqual(no_cellphone_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(no_cellphone_in_db["smacc_type"],"WeChat")
#         self.assertEqual(no_cellphone_in_db["gender"],"0")
#         self.assertEqual(no_cellphone_in_db["MASKOFF_changed"],0)
#         self.assertEqual(no_cellphone_in_db["phone_number"],None)
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(no_cellphone_in_db[attr],[])
#         self.assertIsNone(no_cellphone_in_db["MASKOFF"])

#     # 4.send phone number to user who has already registered a phone number
#     def test_send_phone_number_to_user_has_write_access(self):
#         #add a new user with write
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         user_in_db = get_a_user_scan()["uid"]
#         upgrade_write_access(user_in_db,TestWriteAccessUpgrade.encrypted)

#         headers = {"access_token":generateAccessToken(user_in_db)}
#         data = {"phone_number":TestWriteAccessUpgrade.phone_number}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,400)
#         self.assertEqual(get_from_USERS(user_in_db)["phone_number"],TestWriteAccessUpgrade.encrypted)
#         self.assertEqual(json.loads(r.content)["message"],"You already registered with another phone number. If you recently changed your phone number, please contact customer service.")
        
#         jiangfangzhou_in_db = get_from_USERS(user_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccessUpgrade.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])
#     # 5.send phone number in wrong type
#     def test_send_phone_number_in_wrong_type(self):
#         #add a new user with no write
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         user_in_db = get_a_user_scan()["uid"]
#         upgrade_write_access(user_in_db,TestWriteAccessUpgrade.encrypted)

#         headers = {"access_token":generateAccessToken(user_in_db)}
#         data = {"phone_number":12345678910}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,400)
#         self.assertEqual(json.loads(r.content)["message"],"No phone number attached or phone number has wrong type")
        
#         user_in_db = get_from_USERS(user_in_db)
#         self.assertEqual(user_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(user_in_db["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db["gender"],"0")
#         self.assertEqual(user_in_db["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db["phone_number"],encrypt(TestWriteAccessUpgrade.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(user_in_db[attr],[])
#         self.assertIsNone(user_in_db["MASKOFF"])
#     # 6.send phone number to user who never registered phone number
#     def test_send_right(self):
#         #add a new user with no write
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         user_in_db = get_a_user_scan()["uid"]

#         headers = {"access_token":generateAccessToken(user_in_db)}
#         data = {"phone_number":TestWriteAccessUpgrade.phone_number}
#         r = requests.post(url + "/users/write_access",json=data,headers=headers)
#         self.assertEqual(r.status_code,200)
#         user_in_db = get_from_USERS(user_in_db)
#         self.assertEqual(user_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(user_in_db["smacc_type"],"WeChat")
#         self.assertEqual(user_in_db["gender"],"0")
#         self.assertEqual(user_in_db["MASKOFF_changed"],0)
#         self.assertEqual(user_in_db["phone_number"],encrypt(TestWriteAccessUpgrade.phone_number))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(user_in_db[attr],[])
#         self.assertIsNone(user_in_db["MASKOFF"])


# class TestWriteAccess(unittest.TestCase):
#     phone_number = "phone_number"
#     jiangfangzhou_pn = "8613789897676"
#     encrypted = "3cc76b099e1eb05dbda66a591f79e511257fc7f1ca07f7960733bd47b2f7a1213a8e2b9ed7ae56a557b1d19c12b162e4b20c94e63364a4c3e429aa6276c1f3aa"
#     new_encrypted = encrypt(phone_number)
#     @classmethod
#     def setUpClass(cls):
#         delete_all()
        

#     @classmethod
#     def tearDownClass(cls):
#         delete_all()
    
#     def setUp(self):        
#         print("                ", self._testMethodName)
        
#     def tearDown(self):
#         delete_all()

#     def test_write_access_no_header(self):
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         jiangfangzhou_in_db = get_a_user_scan()["uid"]
#         headers = {"access_token":generateAccessToken(jiangfangzhou_in_db)}
#         requests.post(url + "/users/write_access",json={"phone_number":TestWriteAccess.jiangfangzhou_pn},headers=headers)

#         headers = {}
#         r = requests.get(url + "/users/write_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content)["message"],"token is missing")

#         # make sure whats in db did not change        
#         jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccess.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])
#     #access token is None
#     def test_write_access_no_token(self):
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         jiangfangzhou_in_db = get_a_user_scan()["uid"]
#         headers = {"access_token":generateAccessToken(jiangfangzhou_in_db)}
#         requests.post(url + "/users/write_access",json={"phone_number":TestWriteAccess.jiangfangzhou_pn},headers=headers)

#         no_access_token = None
#         headers = {"access_token":no_access_token}
#         r = requests.get(url + "/users/write_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content)["message"],"token is missing")

#         # make sure whats in db did not change        
#         jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccess.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])
#     # access token is invalid
#     def test_write_access_token_wrong_value(self):
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         jiangfangzhou_in_db = get_a_user_scan()["uid"]
#         headers = {"access_token":generateAccessToken(jiangfangzhou_in_db)}
#         requests.post(url + "/users/write_access",json={"phone_number":TestWriteAccess.jiangfangzhou_pn},headers=headers)       

#         invalid_access_token = generateAccessToken(jiangfangzhou_in_db)[:-2]
#         headers = {"access_token":invalid_access_token}
#         r = requests.get(url + "/users/write_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content)["token_valid"],False)

#         # make sure whats in db did not change        
#         jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccess.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])
#     # user has read access but no write access
#     def test_write_access_token_wrong_value2(self):
#         requests.post(url + "/users",json={"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"})
#         no_cellphone_in_db = get_a_user_scan()["uid"]        

#         valid_access_token_no_write = generateAccessToken(no_cellphone_in_db)
#         headers = {"access_token":valid_access_token_no_write}
#         r = requests.get(url + "/users/write_access",headers=headers)
#         self.assertEqual(r.status_code,401)
#         self.assertEqual(json.loads(r.content)["write_access"],False)

#         no_cellphone_in_db = get_from_USERS(no_cellphone_in_db)
#         self.assertEqual(no_cellphone_in_db["smacc"],encrypt("no_cellphone"))
#         self.assertEqual(no_cellphone_in_db["smacc_type"],"WeChat")
#         self.assertEqual(no_cellphone_in_db["gender"],"0")
#         self.assertEqual(no_cellphone_in_db["MASKOFF_changed"],0)
#         self.assertEqual(no_cellphone_in_db["phone_number"],None)
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(no_cellphone_in_db[attr],[])
#         self.assertIsNone(no_cellphone_in_db["MASKOFF"])
#     # user has all access
#     def test_write_access_token_right_value(self):
#         requests.post(url + "/users",json={"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"})
#         jiangfangzhou_in_db = get_a_user_scan()["uid"]
#         valid_access_token_with_write = generateAccessToken(jiangfangzhou_in_db)
#         headers = {"access_token":valid_access_token_with_write}
#         requests.post(url + "/users/write_access",json={"phone_number":TestWriteAccess.jiangfangzhou_pn},headers=headers)
        
#         r = requests.get(url + "/users/write_access",headers=headers)
#         self.assertEqual(r.status_code,200)
#         self.assertEqual(json.loads(r.content)["write_access"],True)

#         # make sure whats in db did not change        
#         jiangfangzhou_in_db = get_from_USERS(jiangfangzhou_in_db)
#         self.assertEqual(jiangfangzhou_in_db["smacc"],encrypt("jiangfangzhou"))
#         self.assertEqual(jiangfangzhou_in_db["smacc_type"],"WeChat")
#         self.assertEqual(jiangfangzhou_in_db["gender"],"0")
#         self.assertEqual(jiangfangzhou_in_db["MASKOFF_changed"],0)
#         self.assertEqual(jiangfangzhou_in_db["phone_number"],encrypt(TestWriteAccess.jiangfangzhou_pn))
#         attrs = ["articles","blocked","comments","friends","maskers_exposed","roasts"]
#         for attr in attrs:
#             self.assertListEqual(jiangfangzhou_in_db[attr],[])
#         self.assertIsNone(jiangfangzhou_in_db["MASKOFF"])

# class TestAddBlockedUser(unittest.TestCase):
#     user1 = {"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"}
#     user2 = {"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"}
#     user3 = {"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"}

#     @classmethod
#     def setUpClass(cls):
#         delete_all()

#     @classmethod
#     def tearDownClass(cls):
#         delete_all()

#     def setUp(self):
#         print("                ", self._testMethodName)

#     def tearDown(self):
#         delete_all()

#     def test_1(self):
#         r1 = requests.post(url + "/users",json=TestAddBlockedUser.user1)
#         self.assertEqual(r1.status_code,200)
#         r2 = requests.post(url + "/users",json=TestAddBlockedUser.user2)
#         self.assertEqual(r2.status_code,200)
#         r3 = requests.post(url + "/users",json=TestAddBlockedUser.user3)
#         self.assertEqual(r3.status_code,200)

#         uid1 = json.loads(r1.content)["uid"]
#         uid2 = json.loads(r2.content)["uid"]
#         uid3 = json.loads(r3.content)["uid"]

#         headers = {"access_token":generateAccessToken(uid1)}
#         r4 = requests.post(url + "/users/blocked" + "/" + uid2,headers=headers)
#         self.assertEqual(r4.status_code,200)
#         r5 = requests.post(url + "/users/blocked" + "/" + uid3,headers=headers)
#         self.assertEqual(r5.status_code,200)

#         r7 = requests.post(url + "/users/blocked" + "/" + "12345",headers=headers)
#         self.assertEqual(r7.status_code,400)
#         self.assertEqual(json.loads(r7.content)["message"],"blocked user DNE.")

#         r8 = requests.post(url + "/users/blocked" + "/" + uid2,headers=headers)
#         self.assertEqual(r8.status_code,400)
#         self.assertEqual(json.loads(r8.content)["message"],"blocked user already in your blocked list")

#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[uid2,uid3])
        
# class TestRemoveBlockedUser(unittest.TestCase):
#     user1 = {"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"}
#     user2 = {"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"}
#     user3 = {"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"}

#     @classmethod
#     def setUpClass(cls):
#         delete_all()

#     @classmethod
#     def tearDownClass(cls):
#         delete_all()

#     def setUp(self):
#         print("                ", self._testMethodName)

#     def tearDown(self):
#         delete_all()

#     def test_1(self):
#         r1 = requests.post(url + "/users",json=TestRemoveBlockedUser.user1)
#         self.assertEqual(r1.status_code,200)
#         r2 = requests.post(url + "/users",json=TestRemoveBlockedUser.user2)
#         self.assertEqual(r2.status_code,200)
#         r3 = requests.post(url + "/users",json=TestRemoveBlockedUser.user3)
#         self.assertEqual(r3.status_code,200)

#         uid1 = json.loads(r1.content)["uid"]
#         uid2 = json.loads(r2.content)["uid"]
#         uid3 = json.loads(r3.content)["uid"]

#         headers = {"access_token":generateAccessToken(uid1)}
#         r4 = requests.post(url + "/users/blocked" + "/" + uid2,headers=headers)
#         self.assertEqual(r4.status_code,200)
        

#         r7 = requests.delete(url + "/users/blocked" + "/" + "12345",headers=headers)
#         self.assertEqual(r7.status_code,400)
#         self.assertEqual(json.loads(r7.content)["message"],"blocked user DNE.")
#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[uid2])

#         r8 = requests.delete(url + "/users/blocked" + "/" + uid3,headers=headers)
#         self.assertEqual(r8.status_code,400)
#         self.assertEqual(json.loads(r8.content)["message"],"blocked user not in your blocked list")
#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[uid2])

#         r5 = requests.post(url + "/users/blocked" + "/" + uid3,headers=headers)
#         self.assertEqual(r5.status_code,200)

#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[uid2,uid3])


#         r9 = requests.delete(url + "/users/blocked" + "/" + uid2,headers=headers)
#         self.assertEqual(r9.status_code,200)
#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[uid3])

#         r10 = requests.delete(url + "/users/blocked" + "/" + uid3,headers=headers)
#         self.assertEqual(r10.status_code,200)
#         user1 = get_from_USERS(uid1)
#         self.assertListEqual(user1["blocked"],[])

class TestGetBlockedUser(unittest.TestCase):
    user1 = {"smacc":"jiangfangzhou","smacc_type":"WeChat","gender":"0"}
    user2 = {"smacc":"no_cellphone","smacc_type":"WeChat","gender":"0"}
    user3 = {"smacc":"nvlvshi","smacc_type":"WeChat","gender":"0"}

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

    def test_1(self):
        r1 = requests.post(url + "/users",json=TestGetBlockedUser.user1)
        self.assertEqual(r1.status_code,200)
        r2 = requests.post(url + "/users",json=TestGetBlockedUser.user2)
        self.assertEqual(r2.status_code,200)
        r3 = requests.post(url + "/users",json=TestGetBlockedUser.user3)
        self.assertEqual(r3.status_code,200)

        uid1 = json.loads(r1.content)["uid"]
        uid2 = json.loads(r2.content)["uid"]
        uid3 = json.loads(r3.content)["uid"]

        headers = {"access_token":generateAccessToken(uid1)}
        r4 = requests.post(url + "/users/blocked" + "/" + uid2,headers=headers)
        self.assertEqual(r4.status_code,200)
        r5 = requests.post(url + "/users/blocked" + "/" + uid3,headers=headers)
        self.assertEqual(r5.status_code,200)

        r8 = requests.get(url + "/users/blocked",headers=headers)
        self.assertEqual(r8.status_code,200)
        self.assertEqual(json.loads(r8.content)["blocked"],[uid2,uid3])

        user1 = get_from_USERS(uid1)
        self.assertListEqual(user1["blocked"],[uid2,uid3])


if __name__ == '__main__':
    unittest.main()

# if __name__ == '__main__':
#     app.run(debug=True,port=6000)








