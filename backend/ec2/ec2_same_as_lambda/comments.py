# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from utility import COMMENTS, err_message, MASKERS, message,ARTICLES, ROASTS, USERS, check_user_write_access, check_file_exist_in_s3_n_sanitize_text,COMMENTS_NICKNAMES, get_nickname, LIKES
from flask import make_response, jsonify, request
import uuid
from boto3.dynamodb.conditions import Key, Attr
from operator import itemgetter, attrgetter 
import time
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
	if "at" in comment:
		at = comment["at"]
	else:
		at = None

	if(not isinstance(comment["content"],list)
		or not (isinstance(at,str) or (not at))
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
	return make_response(jsonify({"message":"comment successful","cid":cid,"parent_id":parent_id,"reply_id":reply_id}),200)

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
				return message(400,"roast does not exist")
		if index == 0:
			
			try:
				response = COMMENTS.scan(
    			FilterExpression=Attr('visible').eq('True') & Attr('db_id').eq(get_id) & Attr('db_type').eq(get_db) & Attr('parent_id').eq("0") & Attr('reply_id').eq("0") 
				)	
			except Exception as e:
					return err_message(e)
			if "Items" not in response:
				return make_response(jsonify({"comments":[],"message":"query success!","index":0}),200)
			comments = response['Items']
			comments_asc = sorted(comments, key=itemgetter('date'))
			comments_hot = sorted(comments, key=itemgetter('child_count'), reverse=True)
			comments_hot = comments_hot[0:3]
			comments = comments_hot + comments_asc[0:12]#15 more comments with all sub comments
			
			for comment in comments:
				now3 = time.time()
			
				if get_db in ["MASKERS","ARTICLES"]:
					response = USERS.get_item(
						Key={
    					    'uid': comment["author_id"]
    					}
					)
					if "Item" not in response:
						comment["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						comment["user_info"] = {"uid":response["Item"]["uid"],"roast_thumbnail":response["Item"]["roast_thumbnail"]}

					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + comment["cid"] + "_" + user["uid"]
							}
						)
					if "Item" not in response:
						comment["user_liked"] = False
					else:
						comment["user_liked"] = True


				else:
					response = USERS.scan(
						FilterExpression=Attr('ruid').eq(comment["author_id"])

					)
					
					if "Items" not in response:
						comment["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						comment["user_info"] = {"uid":response["Items"][0]["uid"],"roast_thumbnail":response["Items"][0]["roast_thumbnail"]}

					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + comment["cid"] + "_" + user["ruid"]
							}
						)
					if "Item" not in response:
						comment["user_liked"] = False
					else:
						comment["user_liked"] = True
				try:
					response = COMMENTS.scan(
    					FilterExpression=Attr('visible').eq('True') & Attr('db_id').eq(get_id) & Attr('db_type').eq(get_db) & Attr('parent_id').eq(comment["cid"])
					)
	
				except Exception as e:
					return err_message(e)
				if "Items" not in response:
					continue
				else:
					sub_comments = response['Items']
					sub_comments = sorted(sub_comments, key=itemgetter('date'))[0:3]

					for sub_comment in sub_comments:
						sub_comment["liked"] = str(sub_comment["liked"])
					comment["sub_comments"] = sub_comments
			for comment in comments:
				comment["liked"] = str(comment["liked"])

			return make_response(jsonify({"comments":comments,"message":"query success!","index":len(comments) - len(comments_hot)}),200)
		else:
			try:
				response = COMMENTS.scan(
    			FilterExpression=Attr('visible').eq('True') & Attr('db_id').eq(get_id) & Attr('db_type').eq(get_db) & Attr('parent_id').eq("0") & Attr('reply_id').eq("0") 
				)	
			except Exception as e:
					return err_message(e)
			if "Items" not in response:
				return make_response(jsonify({"comments":[],"message":"query success!","index":index}),200)
			comments = response['Items']
			comments_asc = sorted(comments, key=itemgetter('date'))
			comments =  comments_asc[index:index + 15]#15 more comments with all sub comments
			for comment in comments:
				if get_db in ["MASKERS","ARTICLES"]:
					response = USERS.get_item(
						Key={
    					    'uid': comment["author_id"]
    					}
					)
					if "Item" not in response:
						comment["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						comment["user_info"] = {"uid":response["Item"]["uid"],"roast_thumbnail":response["Item"]["roast_thumbnail"]}
					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + comment["cid"] + "_" + user["uid"]
							}
						)
					if "Item" not in response:
						comment["user_liked"] = False
					else:
						comment["user_liked"] = True
				else:
					response = USERS.scan(
						FilterExpression=Attr('ruid').eq(comment["author_id"])
					)
					if "Items" not in response:
						comment["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						comment["user_info"] = {"uid":response["Items"][0]["uid"],"roast_thumbnail":response["Items"][0]["roast_thumbnail"]}
					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + comment["cid"] + "_" + user["ruid"]
							}
						)
					if "Item" not in response:
						comment["user_liked"] = False
					else:
						comment["user_liked"] = True
				try:
					response = COMMENTS.scan(
    				FilterExpression=Attr('visible').eq('True') & Attr('db_id').eq(get_id) & Attr('db_type').eq(get_db) & Attr('parent_id').eq(comment["cid"])
					)
				except Exception as e:
					return err_message(e)
				if "Items" not in response:
					continue
				else:
					sub_comments = response['Items']
					sub_comments = sorted(sub_comments, key=itemgetter('date'))[0:3]#3 sub comments
					for sub_comment in sub_comments:
						sub_comment["liked"] = str(sub_comment["liked"])
					comment["sub_comments"] = sub_comments
			if len(comments) == 0:
				index = -1
			for comment in comments:
				comment["liked"] = str(comment["liked"])
			
			return make_response(jsonify({"comments":comments,"message":"query success!","index":index + len(comments)}),200)

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
		if index == 0:
			try:
				response = COMMENTS.scan(
   					FilterExpression=Attr('visible').eq('True') & Attr('parent_id').eq(cid) 
				)
			except Exception as e:
					return err_message(e)
			if "Items" not in response:
				return make_response(jsonify({"comments":[],"message":"query success!","index":index}),200)
			comments = response['Items']
			comments_asc = sorted(comments, key=itemgetter('date'))
			comments_asc = comments_asc[0:15]#15 more comments
			for sub in comments_asc:
				if get_db in ["MASKERS","ARTICLES"]:
					response = USERS.get_item(
						Key={
    					    'uid': sub["author_id"]
    					}
					)
					if "Item" not in response:
						sub["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						sub["user_info"] = {"uid":response["Item"]["uid"],"roast_thumbnail":response["Item"]["roast_thumbnail"]}
					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + sub["cid"] + "_" + user["uid"]
							}
						)
					if "Item" not in response:
						sub["user_liked"] = False
					else:
						sub["user_liked"] = True
				else:
					response = USERS.scan(
						FilterExpression=Attr('ruid').lt(sub["author_id"])
					)
					if "Items" not in response:
						sub["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						sub["user_info"] = {"uid":response["Items"][0]["uid"],"roast_thumbnail":response["Items"][0]["roast_thumbnail"]}

					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + sub["cid"] + "_" + user["ruid"]
							}
						)
					if "Item" not in response:
						sub["user_liked"] = False
					else:
						sub["user_liked"] = True
			for comment in comments_asc:
				comment["liked"] = str(comment["liked"])
			return make_response(jsonify({"comments":comments_asc,"message":"query success!","index":index + len(comments_asc)}),200)
		else:
			try:
				response = COMMENTS.scan(
   				FilterExpression=Attr('visible').eq('True') & Attr('parent_id').eq(cid) 
				)
			except Exception as e:
					return err_message(e)
			if "Items" not in response:
				return make_response(jsonify({"comments":[],"message":"query success!"}),200)
			comments = response['Items']
			comments_asc = sorted(comments, key=itemgetter('date'))
			comments = comments_asc[index:index + 15]#15 more comments
			for sub in comments:
				if get_db in ["MASKERS","ARTICLES"]:
					response = USERS.get_item(
						Key={
    					    'uid': sub["author_id"]
    					}
					)
					if "Item" not in response:
						sub["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						sub["user_info"] = {"uid":response["Item"]["uid"],"roast_thumbnail":response["Item"]["roast_thumbnail"]}

					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + sub["cid"] + "_" + user["uid"]
							}
						)
					if "Item" not in response:
						sub["user_liked"] = False
					else:
						sub["user_liked"] = True
				else:
					response = USERS.scan(
						FilterExpression=Attr('ruid').lt(sub["author_id"])
					)
					if "Items" not in response:
						sub["user_info"] = {"uid":"None","roast_thumbnail":"empty_profile_picture.png"}
					else:
						sub["user_info"] = {"uid":response["Items"][0]["uid"],"roast_thumbnail":response["Items"][0]["roast_thumbnail"]}
					response = LIKES.get_item(
							Key={
								'object_type_id_userid':"COMMENTS" + "_" + sub["cid"] + "_" + user["ruid"]
							}
						)
					if "Item" not in response:
						sub["user_liked"] = False
					else:
						sub["user_liked"] = True
			if len(comments) == 0:
				index = -1
			for comment in comments:
				comment["liked"] = str(comment["liked"])
			return make_response(jsonify({"comments":comments,"message":"query success!","index":index + len(comments)}),200)

	

	
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