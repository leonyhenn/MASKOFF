# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from utility import COMMENTS, ARTICLES, MASKERS, ROASTS,USERS, COMMENTS_NICKNAMES, DB_ID_TO_USER, \
                    err_message, message, \
                    check_user_write_access, check_file_exist_in_s3_n_sanitize_text, \
                    get_nickname
from flask import make_response, jsonify, request
import uuid
from boto3.dynamodb.conditions import Key, Attr
from operator import itemgetter, attrgetter 
import time
from multiprocessing.dummy import Pool as ThreadPool 
from elasticsearch import Elasticsearch, RequestsHttpConnection
import random
from comments_mp_helpers import es_get_comments, get_subcomments, get_like_follow_by_user, mp_get_comments_helper

COMMENTS_CHRONO_BATCH_SIZE = 15
COMMENTS_HOT_BATCH_SIZE = 5
def comments_post_comment(user):

  comment = request.get_json()
  # check input existence
  if (not "db_id" in comment
    or not "content" in comment
    or not "db_type" in comment
    or not "reply_id" in comment
    or not "parent_id" in comment):
    return message(400,"lack of essential information")

  # check input type
  content = comment["content"]
  

  if(not isinstance(comment["content"],list)
    or not isinstance(comment["db_id"],str)
    or not isinstance(comment["db_type"],str)
    or not (comment["db_type"] in ["ROASTS","MASKERS","ARTICLES"])
    or not isinstance(comment["parent_id"],str)
    or not isinstance(comment["reply_id"],str)):
    return message(400,"wrong at/content/db_id/db_type type")
  
  # assign input
  db_id = comment["db_id"]
  db_type = comment["db_type"]
  content = comment["content"]
  parent_id = comment["parent_id"]
  reply_id = comment["reply_id"]

  # check content valid 
  result = check_file_exist_in_s3_n_sanitize_text(content)
  if result != True:
    return result
  
  # check parent_id and reply_id exist
  if not(parent_id == "0"):
    try:
      response = COMMENTS.get_item(
          Key={
            "visible":"True",
            "cid":parent_id
          }
        )
    except Exception as e:
      return err_message(e)   
    if "Item" not in response:
      return message(400,"parent comment does not exist")
    else:
      try:
        result = COMMENTS.update_item(
          Key={
            "visible":"True",
            "cid":parent_id
          },
          UpdateExpression="SET child_count = :i",
          ExpressionAttributeValues={
            ':i':str(int(response["Item"]["child_count"]) + 1),
          },
        )
      except Exception as e:
        return err_message(e)  

  if not(reply_id == "0"):
    try:
      response = COMMENTS.get_item(
          Key={
            "visible":"True",
            "cid":reply_id
          }
        )
    except Exception as e:
      return err_message(e)   
    if "Item" not in response:
      return message(400,"reply comment does not exist")
  
  if reply_id == "0":
    at = None
  else:
    at = response["Item"]["nickname"]

  # check rid or mid type and existence
  if db_type == "ROASTS":
    rid = db_id
    try:
      response = ROASTS.get_item(
          Key={
            "visible":"True",
            "rid":rid
          }
        )
    except Exception as e:
      return err_message(e)   
    if "Item" not in response:
      return message(400,"roast does not exist")
    
    try:
      result = ROASTS.update_item(
          Key={
                      "visible":"True",
            "rid":rid
                  },
                  UpdateExpression="SET comments_count = comments_count + :j",
                  ExpressionAttributeValues={
                      ':j': 1
                  },
              )
    except Exception as e:
      return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
      return message(400,"server has error updating ROASTS, please try again.")

  elif(db_type == "MASKERS"):
    result = check_user_write_access(user)
    if result != True:
      return result
    mid = db_id
    try:
      response = MASKERS.get_item(
          Key={
            "total_visible":"True",
            "mid":mid
          }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
      return message(400,"masker does not exist")

    try:
      result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
          "mid":mid
                },
                UpdateExpression="SET comments_count = comments_count + :j",
                ExpressionAttributeValues={
                    ':j': 1
                },
            )
    except Exception as e:
      return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
      return message(400,"server has error updating MASKERS, please try again.")

  elif(db_type == "ARTICLES"):
    result = check_user_write_access(user)
    if result != True:
      return result
    aid = db_id
    try:
      response = ARTICLES.get_item(
          Key={
            "partial_visible":"True",
            "aid":aid
          }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
      return message(400,"article does not exist")

    try:
      result = ARTICLES.update_item(
                Key={
                    "partial_visible":"True",
          "aid":aid
                },
                UpdateExpression="SET comments_count = comments_count + :j",
                ExpressionAttributeValues={
                    ':j': 1
                },
            )
    except Exception as e:
      return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
      return message(400,"server has error updating ARTICLES, please try again.")  
  
  #get nickname_comments group
  try:
    response = COMMENTS_NICKNAMES.get_item(
      Key={
        "visible":"True",
        "parent_id":db_id
      }
    )
  except Exception as e:
    return err_message(e)   
  if "Item" not in response:
    return message(400,"comments_nicknames does not exist")

  # check if this user already has nickname
  comments_nicknames = response["Item"]

  if(db_type in ["MASKERS","ARTICLES"]):
    # if not, assign a new one and make sure its not used
    if user["uid"] not in comments_nicknames["uid_nickname_pair"]:
      nickname = get_nickname()
      while(nickname in comments_nicknames["uid_nickname_pair"].values()):
        nickname = get_nickname()
      comments_nicknames["uid_nickname_pair"][user["uid"]] = nickname
      try:
        response = COMMENTS_NICKNAMES.update_item(
          Key={
            "visible":"True",
            "parent_id":db_id
          },
          UpdateExpression='SET uid_nickname_pair = :val1',
            ExpressionAttributeValues={
                ':val1': comments_nicknames["uid_nickname_pair"]
            }
        )
      except Exception as e:
        return err_message(e)   
    else:
      nickname = comments_nicknames["uid_nickname_pair"][user["uid"]]
  else:
    # if not, assign a new one and make sure its not used
    if user["ruid"] not in comments_nicknames["uid_nickname_pair"]:
      nickname = get_nickname()
      while(nickname in comments_nicknames["uid_nickname_pair"].values()):
        nickname = get_nickname()
      comments_nicknames["uid_nickname_pair"][user["ruid"]] = nickname
      try:
        response = COMMENTS_NICKNAMES.update_item(
          Key={
            "visible":"True",
            "parent_id":db_id
          },
          UpdateExpression='SET uid_nickname_pair = :val1',
            ExpressionAttributeValues={
                ':val1': comments_nicknames["uid_nickname_pair"]
            }
        )
      except Exception as e:
        return err_message(e)  
    else:
      nickname = comments_nicknames["uid_nickname_pair"][user["ruid"]]

  #post to comments
  

  cid = str(uuid.uuid4())
  new_comment = {
    "cid":cid,
    "db_id":db_id,
    "db_type":db_type,
    "author_id":user["uid"] if db_type in ["MASKERS","ARTICLES"] else user["ruid"],
    "user_info":{"roast_thumbnail":user["roast_thumbnail"]},
    "parent_id":parent_id,
    "reply_id":reply_id,
    "at":at,
    "content":content,
    "visible":"True",
    "date":datetime.utcnow().isoformat(),
    "child_count":"0",
    "nickname":nickname,
    "liked":0
  }
  try:
    result = COMMENTS.put_item(
      Item=new_comment
    )
  except Exception as e:
    return err_message(e)
  if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
    return message(400,"server has error updating COMMENTS, please try again.")

  #update user comment list
  try:
    result = USERS.update_item(
      Key={
        "uid":user["uid"]
      },
      UpdateExpression="SET comments = list_append(comments, :i)",
      ExpressionAttributeValues={
        ':i': [cid],
      },
    )
  except Exception as e:
    return err_message(e)
  if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
    return message(400,"server has error updating USERS, please try again.")

  #callback to user
  return make_response(jsonify({"message":"comment successful","cid":cid,"parent_id":parent_id,"reply_id":reply_id,"comment":new_comment}),200)

def comments_get_comments(user,get_id,get_db,index):
  
  #return all comments that are directly under article, sort by date
  if (get_db in ["MASKERS","ROASTS","ARTICLES"]):
    if(get_db == "MASKERS"):
      try:
        response = MASKERS.get_item(
            Key={
              "total_visible":"True",
              "mid":get_id
            }
          )
      except Exception as e:
          return err_message(e)
      if "Item" not in response:
        return message(400,"masker does not exist")
    elif(get_db == "ROASTS"):
      try:
        response = ROASTS.get_item(
            Key={
              "visible":"True",
              "rid":get_id
            }
          )
      except Exception as e:
          return err_message(e)
      if "Item" not in response:
        return message(400,"roast does not exist")
    elif(get_db == "ARTICLES"):
      try:
        response = ARTICLES.get_item(
            Key={
              "partial_visible":"True",
              "aid":get_id
            }
          )
      except Exception as e:
          return err_message(e)
      if "Item" not in response:
        return message(400,"article does not exist")

    # first time access a comment
    if index == 0:
      # get comments in chronographical order
      comments_chrono = es_get_comments(get_id,get_db,index,"date","asc",COMMENTS_CHRONO_BATCH_SIZE)
      len_comments_chrono = len(comments_chrono)
      if len(comments_chrono) == 0:
      	len_comments_chrono = -1
      	return make_response(jsonify({"comments":[],"message":"query success!","index":len_comments_chrono}),200)
      # get comments ranked by hotness
      comments_hot = es_get_comments(get_id,get_db,index,"liked","desc",COMMENTS_HOT_BATCH_SIZE)
      # get a list of chronographic cid
      c_c_cids = []
      for c_c in comments_chrono:
      		c_c_cids.append(c_c["cid"])
      # randomly insert hottest comments into top 10 comments
      for h_c in comments_hot:
      		if h_c["cid"] in c_c_cids:
      			continue
      		comments_chrono.insert(random.randint(0, COMMENTS_HOT_BATCH_SIZE), h_c)
      comments = comments_chrono

    # NOT first time access a comment
    elif index > 0:
      # get comments in chronographical order
      comments_chrono = es_get_comments(get_id,get_db,index,"date","asc",COMMENTS_CHRONO_BATCH_SIZE)
      len_comments_chrono = index + len(comments_chrono)
      if len(comments_chrono) == 0:
      	len_comments_chrono = -1
      	return make_response(jsonify({"comments":[],"message":"query success!","index":len_comments_chrono}),200)
      comments = comments_chrono

    # get subcomments and user_liked of each comment in comments
    pool = ThreadPool(len(comments))
    infos = []
    for comment in comments:
    		infos.append({"get_id":get_id,"get_db":get_db,"parent_id":comment["cid"],"index":index,"cid":comment["cid"],"uid":user["uid"],"size":COMMENTS_CHRONO_BATCH_SIZE,"comment":comment})
    comments = pool.map(mp_get_comments_helper, infos)
    pool.close()
    pool.join()
    return make_response(jsonify({"comments":comments,"message":"query success!","index":len_comments_chrono}),200)

  elif (get_db == "COMMENTS"):
    cid = get_id
    try:
      response = COMMENTS.get_item(
          Key={
            "visible":"True",
            "cid":cid
          }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
      return message(400,"comment does not exist")
    else:
      get_db = response["Item"]["db_type"]
      get_id = response["Item"]["db_id"]
    # first time access a comment
    
      info = {"get_id":get_id,"get_db":get_db,"parent_id":cid,"index":index,"size":COMMENTS_CHRONO_BATCH_SIZE}

      # get subcomments in chronographical order
      subcomments_chrono = get_subcomments(info)
      if (len(subcomments_chrono) == 0):
      	return make_response(jsonify({"comments":[],"message":"query success!","index":-1}),200)
      # get user_liked of each subcomment in comments
      pool = ThreadPool(len(subcomments_chrono))
      infos = []
      for subcomment in subcomments_chrono:
      		infos.append({"cid":subcomment["cid"],"uid":user["uid"]})
      subcomments_liked = pool.map(get_like_follow_by_user, infos)
      ["False" if subcomment==None else subcomment for subcomment in subcomments_liked]
      for i in range(len(subcomments_chrono)) :
      	subcomments_chrono[i]["user_liked"] = subcomments_liked[i]
      pool.close()
      pool.join()
      if index == 0:
      	return make_response(jsonify({"comments":subcomments_chrono,"message":"query success!","index":len(subcomments_chrono)}),200)
      # NOT first time access a comment
      elif index > 0:
      	return make_response(jsonify({"comments":subcomments_chrono,"message":"query success!","index":index + len(subcomments_chrono)}),200)

def comments_delete_comment(user):
  try:
    # check input
    comment = request.get_json()
    if (not "cid" in comment 
      or not isinstance(comment["cid"],str)):
      return message(400,"lack of essential information")
  
    # assign input
    cid = comment["cid"]
  
    # check if user has this comment
    if cid not in user["comments"]:
      return message(400,"you have no ownership of this comment")
    
    # check comment exist and visible
    response = COMMENTS.get_item(
      Key={
        'visible':"True",
        'cid': cid
      }
    )
    
    # check if comment exist and visible
    if "Item" not in response:
      return message(400,"comment does not exist")



    new_comment = response["Item"]
    new_comment["visible"] = "False"    

    if new_comment["parent_id"] != "0":
      try:
        response = COMMENTS.get_item(
          Key={
            "visible":"True",
            "cid":parent_id
          }
        )
        if "Item" not in response:
          return message(200,"parent comment does not exist")

        result = COMMENTS.update_item(
          Key={
            "visible":"True",
            "cid":new_comment["parent_id"]
          },
          UpdateExpression="SET child_count = :i",
          ExpressionAttributeValues={
            ':i':str(int(response["Item"]["child_count"])-1),
          },
        )
      except Exception as e:
        return err_message(e)  

    # delete comment from user
    uid = user["uid"]
    user_new_comments = user["comments"]
    user_new_comments.remove(cid)
    

    result = USERS.update_item(
      Key={
        'uid': uid
      },
      UpdateExpression="SET comments = :i",
      ExpressionAttributeValues={
        ':i':user_new_comments,
      },
    )

    db_id = user_new_comments["db_id"]
    db_type = user_new_comments["db_type"]
    if db_type == "ROASTS":
      rid = db_id
      try:
        response = ROASTS.get_item(
            Key={
              "visible":"True",
              "rid":rid
            }
          )
      except Exception as e:
        return err_message(e)   
      if "Item" in response:
        try:
          result = ROASTS.update_item(
                  Key={
                      "visible":"True",
              "rid":rid
                  },
                  UpdateExpression="SET comments_count = comments_count - :j",
                  ExpressionAttributeValues={
                      ':j': 1
                  },
              )
        except Exception as e:
          return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
          return message(400,"server has error updating ROASTS, please try again.")

    elif(db_type == "MASKERS"):
      
      mid = db_id
      try:
        response = MASKERS.get_item(
            Key={
              "total_visible":"True",
              "mid":mid
            }
          )
      except Exception as e:
          return err_message(e)
      if "Item" in response:
        try:
          result = MASKERS.update_item(
                  Key={
                      "total_visible":"True",
              "mid":mid
                  },
                  UpdateExpression="SET comments_count = comments_count - :j",
                  ExpressionAttributeValues={
                      ':j': 1
                  },
              )
        except Exception as e:
          return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
          return message(400,"server has error updating MASKERS, please try again.")

    elif(db_type == "ARTICLES"):
      aid = db_id
      try:
        response = ARTICLES.get_item(
            Key={
              "partial_visible":"True",
              "aid":aid
            }
          )
      except Exception as e:
          return err_message(e)
      if "Item" in response:
        try:
          result = ARTICLES.update_item(
                  Key={
                      "partial_visible":"True",
              "aid":aid
                  },
                  UpdateExpression="SET comments_count = comments_count - :j",
                  ExpressionAttributeValues={
                      ':j': 1
                  },
              )
        except Exception as e:
          return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
          return message(400,"server has error updating ARTICLES, please try again.")  

    # delete this comment

    result = COMMENTS.delete_item(
      Key={
        'visible':"True",
        'cid':cid
      },
    )
  
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
      return message(400,"server has error updating, please try again.")

    # archive this comment
    result = COMMENTS.put_item(
      Item=new_comment
    )
  
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
      return message(400,"server has error updating, please try again.")
   
    #callback to user
    return message(200,"delete successful")
  except Exception as e:
      return err_message(e)  