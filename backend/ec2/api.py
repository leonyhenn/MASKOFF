# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import pymongo
from pymongo import MongoClient
from time import time
from bson.objectid import ObjectId
from hashlib import sha256 
from time import time
from copy import deepcopy
import jwt
client = MongoClient()
maskoff = client.MASKOFF
users = maskoff.users
maskers = maskoff.maskers
roasts = maskoff.roasts
comments = maskoff.comments
chat_records = maskoff.chat_records
# EXPIRE_ELAPSE = 10 * 60
EXPIRE_ELAPSE = 86400 * 30
SECRET = "PLACEHOLER_FOR_GITHUB"
ROAST_AMOUNT = 2
'''
README

users schema
user = {
		"_id" : ObjectId(),
		"smacc" : smacc,
		"smacc_type": smacc_type,
		"gender": gender,
		"phone_number" : None,
		"post_grant":False,
		"maskers_exposed":[],
		"roasts":[],
		"comments":[],
		"friends":[],
		"blocked":[],
		"payment_history":[],
		"login_history":[time()],
		"location":None,
		"profit":[]
		}

users api:

'''

def validateUser_access(smacc,smacc_type,gender,location=None):
	'''
	In this case we PRETEND smaccount and phone number are values after SHA256

	Validate if a user's SHA256 smaccount is in Database
	if is, send a access token to user
	if not, register user, then send a access token

	---TESTED---
	'''
	# Case1: User already exists, but access token has expired
	now = time()
	if users.find_one({"smacc":smacc}):
		print("existed user")
		# find user by smacc
		user = users.find_one({"smacc":smacc})
		user_post_grant = user["post_grant"]
		user_id = user["_id"]
		# update user login history,user new token
		users.update({"_id":user_id},
					 {"$addToSet":{"login_history":now}})
		# return a new generated login token
		return generateAccessToken(user_id,user_post_grant,now)
	# Case2: a new user
	print("new user")
	user_id = ObjectId()
	users.insert_one({
		"_id" : user_id,
		"smacc" : smacc,
		"smacc_type": smacc_type,
		"gender": gender,
		"phone_number" : None,
		"post_grant":False,
		"maskers_exposed":[],
		"roasts":[],
		"comments":[],
		"friends":[],
		"blocked":[],
		"payment_history":[],
		"login_history":[now],
		"location":location,
		"profit":[]
		})
	
	return generateAccessToken(user_id,False,now)
def generateAccessToken(user_id,user_post_grant,now):
	'''
	compute and send a unique access token to user
	'''
	#jwt.decode(access_token, 'secret', algorithms=['HS256'])
	access_token = jwt.encode({"user_id":str(user_id),
							   "user_post_grant":user_post_grant,
							   "exp":now+EXPIRE_ELAPSE},SECRET,algorithm='HS256')
	return access_token


def validateUser_post(user_id,pn):
	'''
	Validates a user's SHA256 hashed smacc and pn.
	1.check if smacc in database.
	if smacc already exist, login, send token to user
	if smacc not in database, lead to 2

	2.check if pn in database.
	if pn in database, refuse to register
	if pn not in database, register user, send token.

	--TESTED--
	'''
	now = time()
	if pn == None:
		return False
	# make sure there pn has a unique owner
	if users.find_one({"phone_number":pn}):
		user = users.find_one({"phone_number":pn})
		if user["_id"] == user_id:
			return True
	# if pn is not in the database yet, make sure user who want to use it had not posted anything yet
	elif users.find_one({"_id":user_id})["phone_number"] == None:
		users.update({"_id":user_id},
					 {"$set" : 
					 		 {"phone_number":pn,
					 		  "post_grant":True}
					 },
					 upsert=False)
		
		return True
	return False
def generatePostToken(user_id,user_post_grant,pn,now):
	'''
	compute and send a unique post token to user
	'''
	#jwt.decode(access_token, 'secret', algorithms=['HS256'])
	post_token = jwt.encode({"user_id":str(user_id),
							 "user_post_grant":user_post_grant,
							 "pn":pn,
							 "exp":now+EXPIRE_ELAPSE},SECRET,algorithm='HS256')
	return post_token

'''
README

maskers schema
masker = {
		"_id":ObjectId(),
		"name":name,
		"alias":[],
		"contributed": "1",
		"article":[{
				"author_uid":author_uid,
				"tags":tags,
				"content":[],
				"elapse":[{
						"start_date":start_date,
						"end_date":end_date
						}],
				"partial_visible":True
				}],
		"price":price,
		"total_visible":True,
		
}
'''
def addNewMasker(new_masker_json,author_uid):
	'''
	add a new masker to maskers database by new_masker_json and uid

	This masker has never been identified before.

	--TESTED--
	'''
	Id = ObjectId()
	new_masker_json["article"][0]["author_uid"] = author_uid
	new_masker_json["_id"] = Id
	maskers.insert_one(new_masker_json)
	users.update({"_id":author_uid},
				 {"$addToSet":
							{"maskers_exposed":new_masker_json["_id"]}
				 })
	return Id
	
def updateMaskerArticle(masker_json,author_uid):
	'''
	--TESTED--
	'''
	masker_id = masker_json["_id"]
	masker = maskers.find_one({"_id":masker_id})

	counter = 0
	author_existed = 0
	for article in masker["article"]:
		if article["author_uid"] == author_uid and article["partial_visible"] == 1:
			author_existed = 1
			existed_author_index = counter
		counter += 1
	contributed_incremented = str(int(masker["contributed"]) + 1)
	alias = masker["alias"]
	for item in masker_json["alias"]:
		if item not in alias:
			masker["alias"].append(item)
	if author_existed:
		maskers.update({"_id":masker_id},
					   {"$set":
					   		   {"article."+str(existed_author_index)+".partial_visible": False,
					   		   "article."+str(existed_author_index)+".author_uid":author_uid},
					   })
		maskers.update({"_id":masker_id},
						{"$addToSet": 
					   		   {"article":masker_json["article"][0]}})
	else:
		maskers.update({"_id":masker_id},
					   {"$addToSet":
					   				{"article":masker_json["article"][0]},
					   	"$set":
					   		   {"alias":alias,
					   		    "contributed":contributed_incremented}
					   	})
		users.update({"_id":author_uid},
				 {"$addToSet":
							{"maskers_exposed":masker_json["_id"]}
				 })
def deleteMaskerArticle_partial(masker_json,author_uid):
	'''
	--TESTED--
	'''
	masker_id = masker_json["_id"]
	masker = maskers.find_one({"_id":masker_id})
	author_existed = 0
	counter = 0
	for article in masker["article"]:
		if article["author_uid"] == author_uid and article["partial_visible"] == 1:
			author_existed = 1
			existed_author_index = counter
		counter += 1
	if author_existed:
		contributed_decremented = str(int(masker["contributed"])-1)
		maskers.update({"_id":masker_id},
					   {"$set":
					   		   {"article."+str(existed_author_index)+".partial_visible": False,
					   		    "contributed": contributed_decremented}
					   })
		partial_visible_counter = 0
		for article in maskers.find_one({"_id":masker_id})["article"]:
			if article["partial_visible"] == True:
				partial_visible_counter += 1
		if partial_visible_counter == 0:
			deleteMaskerArticle_total(masker_id)
		return True
	return False
def deleteMaskerArticle_total(masker_id):
	'''
	--TESTED--
	'''
	maskers.update({"_id":masker_id},{"$set":
						  {"total_visible":False}})
def getMaskerArticle(masker_name):
	result = []
	find = maskers.find({"name":masker_name,"total_visible":True})
	for masker in find:
		masker["_id"] = str(masker["_id"])
		for article in masker["article"]:
			article["author_uid"] = str(article["author_uid"])
		for article in masker["article"]:
			if not article["partial_visible"]: 
				masker["article"].remove(article)
		result.append(masker)
	return result
def getUID(smacc,smacc_type):
	return users.find_one({"smacc":smacc,"smacc_type":smacc_type})["_id"]
'''
README

roasts schema

roast = {
		"_id": ObjectId(),
		"author_uid":author_uid,
		"title": title,
		"content":[],
		"comments":[],
		"visible": True,
		"tags":[]
}
'''
def addNewRoast(roast_json,author_uid):
	'''
	--TESTED--
	'''
	Id = ObjectId()
	roast_json["author_uid"] = author_uid
	roast_json["_id"] = Id
	roasts.insert_one(roast_json)
	users.update({"_id":author_uid},
				 {"$addToSet":
							  {"roasts":roast_json["_id"]}
				 })
def updateRoast(roast_json,requester_uid):
	'''
	permission有问题
	'''
	Id = ObjectId()
	new_roast_json = deepcopy(roast_json)
	new_roast_json["_id"] = Id
	roasts.insert_one(new_roast_json)
	old_id = roast_json["_id"]
	roasts.update({"_id":old_id},
				 {"$set":
						 {"visible":False}
				 })

def deleteRoast(roast_json):
	'''
	permission有问题
	'''
	old_id = roast_json["_id"]
	roasts.update({"_id":old_id},
				 {"$set":
						 {"visible":False}
				 })
def getRoast(last_id):
	'''
	--TESTED--
	'''
	result = []
	if last_id == "first":
		for roast in roasts.find().limit(ROAST_AMOUNT):
			roast["_id"] = str(roast["_id"])
			roast["comments"] = None
			roast["author_uid"] = str(roast["author_uid"])
			result.append(roast)
	
	else:
		for roast in roasts.find({"_id":{"$gt":ObjectId(last_id)}}).limit(ROAST_AMOUNT):
			roast["_id"] = str(roast["_id"])
			roast["comments"] = None
			roast["author_uid"] = str(roast["author_uid"])
			result.append(roast)
	return result
	
'''
README

comments schema

comment = {
		"_id": ObjectId(),
		"roast_rid":roast_rid,
		"author_uid":author_uid,
		"content":[],
		"at":[],
		"date":time(),
		"visible": True,
		
}
'''
def addNewComment(comment_json,author_uid):
	'''
	--TESTED--
	'''
	Id = ObjectId()
	comment_json["_id"] = Id
	comment_json["author_uid"] = author_uid
	comments.insert_one(comment_json)
	roast_rid = comment_json["roast_rid"]
	author_uid = comment_json["author_uid"]
	roasts.update({"_id":roast_rid},
				  {"$addToSet":
				  		 	  {"comments":Id}
				  })
	users.update({"_id":author_uid},
				 {"$addToSet":
				 			 {"comments":Id}
				 })
def deleteComment(comment_json):
	'''
	--TESTED--
	'''
	comment_cid = comment_json["_id"]
	comments.update({"_id":comment_cid},
					{"$set":
							{"visible":False}
					})

def getCommentsByRoast(roast_rid):
	'''
	--TESTED--
	'''
	comment_of_roast = roasts.find_one({"_id":ObjectId(roast_rid)})["comments"]
	result = []
	for comment in comment_of_roast:
		if comments.find_one({"_id":comment})["visible"] == True:
			curr = comments.find_one({"_id":comment})
			curr["_id"] = str(curr["_id"])
			curr["author_uid"] = str(curr["author_uid"])
			curr["roast_rid"] = str(curr["roast_rid"])
			result.append(curr)
	return result
def getCommentsByAuthor(author_uid):
	'''
	--TESTED--
	'''
	comment_of_author = users.find_one({"_id":author_uid})["comments"]
	result = []
	for comment in comment_of_author:
		if comments.find_one({"_id":comment})["visible"] == True:
			result.append(comments.find_one({"_id":comment}))
	return result

def getRecent(user_id):
	return users.find_one({"_id":user_id})[]

def getBlocked(user_id):

	return


# def addNewChatRecord(chat_record_json,uid,another_uid):
# 	'''
# 	--TESTED--
# 	'''
# 	if chat_record_json["content"] and chat_record_json["file"]:
# 		content_json = deepcopy(chat_record_json)
# 		file_json = deepcopy(chat_record_json)
# 		content_json["file"] = None
# 		file_json["content"] = None
# 		addNewChatRecord(content_json,uid,another_uid)
# 		addNewChatRecord(file_json,uid,another_uid)
# 		return 
# 	Id = ObjectId() 
# 	if uid < another_uid:
# 		smaller = uid
# 		larger = another_uid
# 	else:
# 		smaller = another_uid
# 		larger = uid
# 	chat_record_json["_id"] = Id
# 	chat_record_json["uid_smaller"] = smaller
# 	chat_record_json["uid_larger"] = larger
# 	chat_records.insert(chat_record_json)
# def deleteChatRecord(chat_record_id):
# 	'''
# 	--TESTED--
# 	'''
# 	chat_records.update({"_id":chat_record_id},
# 						{"$set":{"visible":False}
# 						})
# def getChatRecordUser(request_uid,query_uid):
# 	'''
# 	--TESTED--
# 	'''
# 	if request_uid < query_uid:
# 		smaller = request_uid
# 		larger = query_uid
# 	else:
# 		smaller = query_uid
# 		larger = request_uid
# 	result = []
# 	for record in chat_records.find({"uid_smaller":smaller,"uid_larger":larger}):
# 		if record["visible"] == True:
# 			result.append(record)
# 	return result


# def getChatRecordAdmin(request_uid,query_uid):
# 	'''
# 	--TESTED--
# 	'''
# 	if request_uid < query_uid:
# 		smaller = request_uid
# 		larger = query_uid
# 	else:
# 		smaller = query_uid
# 		larger = request_uid
# 	result = []
# 	for record in chat_records.find({"uid_smaller":smaller,"uid_larger":larger}):
# 		result.append(record)
# 	return result





