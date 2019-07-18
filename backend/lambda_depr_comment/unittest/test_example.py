# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import json
import unittest
url = "http://127.0.0.1:5000"
#for connection test purpose
# class TestWelcome(unittest.TestCase):
    
#     @classmethod
#     def setUpClass(cls):
#         print('setUpClass')
    
#     @classmethod
#     def tearDownClass(cls):
#         print('tearDownClass')
    
#     def setUp(self):
#         print("                ", self._testMethodName)
    
#     def tearDown(self):
#         print('tearDown\n')
#     def test_welcome(self):
#         r = requests.get(url + "/")
#         content = json.loads(r.content)
#         self.assertEqual(r.status_code,200)