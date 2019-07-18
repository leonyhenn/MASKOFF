# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3

from elasticsearch import Elasticsearch

def f7(seq):
    # remove duplicates from a list whilst preserving order
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]

dynamodb = boto3.resource('dynamodb')
# es = Elasticsearch(['https://search-movie-elasticsearch-ijlqcnaulepbk5ipz4fggekxty.ca-central-1.es.amazonaws.com'])
es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])



# get maskers
masker_keyword = "章文"
# masker_body = {
#   "query" :{
#     "bool": {
#       "must": {
#         "multi_match" : {
#           "query": masker_keyword, 
#           "type": "most_fields",
#           "fields": ["name^3","alias^3","tags^3","content.filename"] 
#         }
#       },
#       "must_not" : {
#         "term" : {"partial_visible":"False"}
#       }
#     } 
#   }
# }
masker_body = {
  "query" :{
    "bool": {
      "must": {
        "multi_match" : {
          "query": masker_keyword, 
          "type": "most_fields",
          "fields": ["name^3","alias^3","tags^3","content.filename"] 
        }
      },
      "filter": {
        "term": {
          "partial_visible": "true"
        }
      }
    } 
  }
}
results = es.search(index="articles",body=masker_body)

for item in results["hits"]["hits"]:
    # print(item["_source"]["overview"])
    # print(item["_source"]["title"])
    print(item["_source"])
    print(item["_source"]["mid"])
    print(item["_score"])
    # print(pretty(item))
    print("==============")    

results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name','likes','comments_count','contributed']} for item in results["hits"]["hits"]]
print(results)



