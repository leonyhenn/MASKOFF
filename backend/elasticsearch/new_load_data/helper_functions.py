# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from copy import deepcopy
import json
import requests
from decoy_data import *
url = "http://127.0.0.1:5000"
def register_and_upgrade_decoy_users(number):
    users_list = []
    for i in range(number):
        json = {"phone_number":"12345678"+str(i),
                "idd":"54321",
                "password":"sup_bitch"
                }
        r1 = requests.post(url + "/users",json=json)
        print("register_and_upgrade_decoy_users  "+str(i),r1.status_code)
        user_uid = r1.json()["uid"]
        user_ruid = r1.json()["ruid"]
        user_access_token = r1.json()["access_token"]
        header = {"access_token":user_access_token}
        users_list.append({"uid":user_uid,
                          "ruid":user_ruid,
                          "access_token":user_access_token,
                          "phone_number":"12345678"+str(i),
                          "idd":"54321",
                          "password":"sup_bitch",
                          "header":header})
    return users_list

def make_comment(db_id,db_type,parent_id,reply_id,content,at=None,content_type="text/plain"):
    return {
        "at":at,
        "db_id":db_id,
        "content":[{"type":content_type,"filename":content}],
        "db_type":db_type,
        "parent_id":parent_id,
        "reply_id":reply_id
        }

def post_13_roasts_and_46_comments_and_46_subcomments(users_list):
    users_list_temp = deepcopy(users_list)
    for i in range(len(roasts_list)-2):
        roast = roasts_list[i]
        filename = "fuli_"+str(i)+".jpg"
        roast["roast"]["content"].insert(3, {"type":"image/jpeg","filename":filename})
        roast["roast"] = json.dumps(roast["roast"])
        user = users_list_temp.pop()
        files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/fuli/"+filename,"rb")}
        r = requests.post(url + "/roasts",data=roast,headers=user["header"],files=files)
        print("post_roast",r.status_code,r.json())
        rid = r.json()["rid"]

    roast = roasts_list[-2]
    
    
    
    roast["roast"] = json.dumps(roast["roast"])
    user = users_list_temp.pop()
    
    r = requests.post(url + "/roasts",data=roast,headers=user["header"])
    print("post_roast",r.status_code)

    roast = roasts_list[-1]
    filename = "fuli_"+str(12)+".jpg"
    roast["roast"]["content"].insert(3, {"type":"video/mp4","filename":"shipin.mp4"})
    roast["roast"]["content"].insert(4, {"type":"image/jpeg","filename":filename})
    
    roast["roast"] = json.dumps(roast["roast"])
    user = users_list_temp.pop()
    files = {"4":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/fuli/"+filename,"rb"),"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/shipin/"+"shipin.mp4","rb")}
    
    r = requests.post(url + "/roasts",data=roast,headers=user["header"],files=files)
    print("post_roast",r.status_code)
    
    rid = r.json()["rid"]
    
        
    post_comments(users_list,rid,"ROASTS")
    
    
def post_comments(users_list,db_id,db_type):
    users_list_temp = deepcopy(users_list)
    parent_comments = []
    for i in range(46):
        user = users_list_temp.pop()
        c1 = deepcopy(make_comment(db_id,db_type,"0","0","comment #"+str(i)))
        r1 = requests.post(url + "/comments",json=c1,headers=user["header"])
        print("post comment",r1.status_code)
        
        c1_cid = r1.json()["cid"]
        parent_comments.append({"cid":c1_cid,"ruid":user["ruid"]})
    at_ruid = parent_comments[0]["ruid"]
    user = users_list_temp.pop()
    
    filename = "fuli_"+str(0)+".jpg"
    files = {"file":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/fuli/"+filename,"rb")}
    r1 = requests.post(url + "/upload",headers=user["header"],files=files,data={"filename":filename})
    print("post comment upload",r1.status_code)

    filename = r1.json()["filename"]
    # c1 = deepcopy(make_comment(db_id,db_type,parent_comments[0]["cid"],"0",filename,at_ruid,content_type="image/jpeg"))
    c1 = deepcopy(make_comment(db_id,db_type,parent_comments[0]["cid"],parent_comments[0]["cid"],filename,at_ruid,content_type="image/jpeg"))
    r1 = requests.post(url + "/comments",json=c1,headers=user["header"])
    print("post comment roast",r1.status_code)
    c1_cid = r1.json()["cid"]
    at_ruid = user["ruid"]
    
    for j in range(45):
        user = users_list_temp.pop()
        c1 = deepcopy(make_comment(db_id,db_type,parent_comments[0]["cid"],"0","subcomment #"+str(j+1),at_ruid))
        r1 = requests.post(url + "/comments",json=c1,headers=user["header"])
        print("post comment",r1.status_code)
        c1_cid = r1.json()["cid"]
        at_ruid = user["ruid"]        
def post_zhangwen_and_5_articles_and_46_comments_and_46_subcomments(users_list):
    users_list_temp = deepcopy(users_list)
    user = users_list_temp.pop()
    article1["masker"] = json.dumps(article1["masker"])
    files = {"3":open("/Users/study/Desktop/假数据_章文/3e89803fly1ftta7v7qspj20v91vok00.jpg","rb"),"4":open("/Users/study/Desktop/假数据_章文/cSL5-hftenia2454894.jpg","rb"),"5":open("/Users/study/Desktop/假数据_章文/v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg","rb")}
    r = requests.post(url + "/maskers",data=article1,headers=user["header"],files=files)
    print(r.status_code,r.json())
    mid = r.json()["mid"]
    article1_aid = r.json()["aid"]
    post_comments(users_list,mid,"MASKERS")
    
    
    
    user = users_list_temp.pop()
    article2["masker"]["mid"] = mid
    article2["masker"]["content"].insert(5, {"type":"video/mp4","filename":"shipin.mp4"})
    article2["masker"] = json.dumps(article2["masker"])
    files = {"2":open("/Users/study/Desktop/假数据_章文/Rbxi-hftenia2500242.png","rb"),"3":open("/Users/study/Desktop/假数据_章文/gBKW-hftenia2519068.jpg","rb"),"4":open("/Users/study/Desktop/假数据_章文/8721e49bly1ftlssuzty0j20ku112dk1.jpg","rb"),"5":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/shipin/"+"shipin.mp4","rb")}
    r = requests.post(url + "/articles",data=article2,headers=user["header"],files=files)
    print(r.status_code,r.json())
    aid = r.json()["aid"]
    post_comments(users_list,aid,"ARTICLES")
    
    
    user = users_list_temp.pop()
    article3["masker"]["mid"] = mid
    article3["masker"] = json.dumps(article3["masker"])
    files = {"2":open("/Users/study/Desktop/假数据_章文/595ad6fegy1ftqllvc47oj20ms8c0e81.jpg","rb"),"3":open("/Users/study/Desktop/假数据_章文/v2-27e4262cc267db567ab2fbccebf6d848_b.jpg","rb")}
    r7 = requests.post(url + "/articles",data=article3,headers=user["header"],files=files)
    print(r7.status_code)
    
    
    user = users_list_temp.pop()
    article4["masker"]["mid"] = mid
    article4["masker"] = json.dumps(article4["masker"])
    r8 = requests.post(url + "/articles",data=article4,headers=user["header"])
    print(r8.status_code)
    
    
    user = users_list_temp.pop()
    article5["masker"]["mid"] = mid
    article5["masker"] = json.dumps(article5["masker"])
    files = {"2":open("/Users/study/Desktop/假数据_章文/R67U-hftenia2449125.png","rb"),"3":open("/Users/study/Desktop/假数据_章文/v2-40389313b3b31f6cfee435bda0164ea8_hd.jpg","rb")}
    r9 = requests.post(url + "/articles",data=article5,headers=user["header"],files=files)
    print(r9.status_code)   

def post_liuyuchen_and_5_articles_and_46_comments_and_46_subcomments(users_list):
    users_list_temp = deepcopy(users_list)
    user = users_list_temp.pop()
    article6["masker"] = json.dumps(article6["masker"])
    files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/刘宇辰/6e52e980d7514082b736d6872265fa6b.jpeg","rb")}
    r = requests.post(url + "/maskers",data=article6,headers=user["header"],files=files)
    print(r.status_code)
    mid = r.json()["mid"]
    article1_aid = r.json()["aid"]
    post_comments(users_list,mid,"MASKERS")
    
    
    
    user = users_list_temp.pop()
    article7["masker"]["mid"] = mid
    article7["masker"] = json.dumps(article7["masker"])
    files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/刘宇辰/2018022140922969.jpg","rb")}
    r = requests.post(url + "/articles",data=article7,headers=user["header"],files=files)
    print(r.status_code,r.json())
    aid = r.json()["aid"]
    post_comments(users_list,aid,"ARTICLES")
    
    
    user = users_list_temp.pop()
    article8["masker"]["mid"] = mid
    article8["masker"] = json.dumps(article8["masker"])
    files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/刘宇辰/w0rYCa_H_400x400.jpeg","rb")}
    r7 = requests.post(url + "/articles",data=article8,headers=user["header"],files=files)
    print(r7.status_code)
    
    
    user = users_list_temp.pop()
    article9["masker"]["mid"] = mid
    article9["masker"] = json.dumps(article9["masker"])
    files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/刘宇辰/Waterloo_Math_Logo.gif","rb")}
    r8 = requests.post(url + "/articles",data=article9,headers=user["header"],files=files)
    print(r8.status_code)
    
    
    user = users_list_temp.pop()
    article10["masker"]["mid"] = mid
    article10["masker"] = json.dumps(article10["masker"])
    files = {"3":open("/Users/study/MASKOFF/backend/elasticsearch/new_load_data/刘宇辰/twitterlogo.png","rb")}
    r9 = requests.post(url + "/articles",data=article10,headers=user["header"],files=files)
    print(r9.status_code)   



