# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import requests
import json
import time
from utility import *
url = "http://127.0.0.1:5000"
aws_es = "PLACEHOLDER_FOR_GITHUB"
keyword="舒适"
headers ={'access_token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJlYWJjNDc2OS00MTEwLTRlYWUtOTY2NS01MzQzYjk3ZWVkNzUiLCJleHAiOjE4NjIzMDEwMDguOTg0Njk3OH0.KX5MOxBti5bK6MugX217CwCwbT9piLrY2J66_h59ppY'}

# #r1 = requests.get(url+"/maskers"+"/"+keyword,headers=headers)
# submit = []
# r1 = requests.post(url+"/roasts"+"/search",headers=headers,json={"keyword":keyword,"index":0})
# results  =  json.loads(r1.content)["results"]

# for result in results:
#   print(result["rid"])
#   submit.append(result)
# print(len(results))


# r1 = requests.post(url+"/roasts"+"/search",headers=headers,json={"keyword":keyword,"index":len(submit)})
# results  =  json.loads(r1.content)["results"]

# for result in results:
#   print(result["rid"])
#   submit.append(result)
# print(len(results))

# r1 = requests.post(url+"/roasts"+"/search",headers=headers,json={"keyword":keyword,"index":len(submit)})
# results  =  json.loads(r1.content)["results"]

# for result in results:
#   print(result["rid"])
#   submit.append(result)
# print(len(results))

# r1 = requests.post(url+"/roasts"+"/search",headers=headers,json={"keyword":keyword,"index":len(submit)})
# results  =  json.loads(r1.content)["results"]

# for result in results:
#   print(result["rid"])
#   submit.append(result)
# print(len(results))


# keyword = "章文"
# r1 = requests.post(url+"/maskers"+"/search",headers=headers,json={"keyword":keyword,"index":0})
# print(r1.status_code,json.loads(r1.content))
# results  =  json.loads(r1.content)["results"]
# print(len(results))


# r1 = requests.get(url+"/comments/6032219e-e500-414d-a54f-6a5e2742767c/ROASTS/0",headers=headers)
# print(r1.status_code,json.loads(r1.content))

pack = {
  "pack":json.dumps({
      "filename":"erweima.png"
    })
}
files = {"0":open("/Users/study/Desktop/erweima.png","rb")}
r6 = requests.post(url + "/users/thumbnail",data=pack,headers=headers,files=files)
print(r6.status_code,json.loads(r6.content))