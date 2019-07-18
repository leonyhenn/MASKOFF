# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from utility import COMMENTS, err_message, MASKERS, message, ROASTS, USERS, check_user_write_access, check_file_exist_in_s3_n_sanitize_text
from flask import make_response, jsonify, request
import uuid
def comments_post_comment(user):
	
	comment = request.get_json()
	# check input existence
	if ((bool("rid" in comment) == bool("mid" in comment))
		or not "content" in comment):
		return message(400,"lack of essential information")

	# check input type
	# assign input
	content = comment["content"]
	if "at" in comment:
		at = comment["at"]
	else:
		at = None
	if(not isinstance(content,dict)
		or not isinstance(at,str)):
		return message(400,"wrong at/content type")
	
	# check content valid 


	result = check_file_exist_in_s3_n_sanitize_text([content])
	if result != True:
		return result
	
	# check rid or mid type and existence
	if "rid" in comment:
		rid = comment["rid"]
		if not isinstance(rid,str):
			return message(400,"wrong rid type")
		mid = None
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
	else:
		result = check_user_write_access(user)
		if result != True:
			return result
		rid = None
		mid = comment["mid"]
		if not isinstance(mid,str):
			return message(400,"wrong mid type")
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
	
	
	#post to comments
	cid = str(uuid.uuid4())
	new_comment = {
		"cid":cid,
		"rid":rid,
		"mid":mid,
		"author_uid":user["uid"],
		"at":at,
		"content":content,
		"visible":"True",
		"date":datetime.utcnow().isoformat()
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

	if rid != None:
		try:
			result = ROASTS.update_item(
				Key={
					"visible":"True",
					"rid":rid
				},
				UpdateExpression="SET comments = list_append(comments, :i)",
				ExpressionAttributeValues={
					':i': [cid],
				},
			)
		except Exception as e:
			return err_message(e)
		if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
			return message(400,"server has error updating ROASTS, please try again.")
	else:
		try:
			result = MASKERS.update_item(
				Key={
					"total_visible":"True",
					"mid":mid
				},
				UpdateExpression="SET comments = list_append(comments, :i)",
				ExpressionAttributeValues={
					':i': [cid],
				},
			)
		except Exception as e:
			return err_message(e)
		if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
			return message(400,"server has error updating MASKERS, please try again.")
	#callback to user
	return message(200,"comment successful")

def comments_get_comments(user,get_id,get_db,index):
	if get_db == "MASKERS":
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
		else:
			comments = response["Item"]["comments"]
			if len(comments) < index+1:
				return message(400,"index out of range")
			if (len(comments) < index+1 + 20):
				comments = comments[index:]
				index = None
			else:
				comments = comments[index:index+20]
				index += 20
			return make_response(jsonify({"comments":comments,"index":index}),200)   
	elif get_db == "ROASTS":
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
		else:
			comments = response["Item"]["comments"]
			if len(comments) < index+1:
				return message(400,"index out of range")
			if len(comments) < index+1 + 20:
				comments = comments[index:]
				index = None
			else:
				comments = comments[index:index+20]
				index += 20
			return make_response(jsonify({"comments":comments,"index":index}),200)   
	elif get_db == "USERS":
		if user["uid"] == get_id:
			try:
				response = USERS.get_item(
						Key={
							"uid":get_id
						}
					)
			except Exception as e:
				return err_message(e)   
			if "Item" not in response:
				return message(400,"user does not exist")
			else:
				comments = response["Item"]["comments"]
				if len(comments) < index+1:
					return message(400,"index out of range")
				if len(comments) < index+1 + 20:
					comments = comments[index:]
					index = None
				else:
					comments = comments[index:index+20]
					index += 20
				return make_response(jsonify({"comments":comments,"index":index}),200)   
		return message(403,"you are not the user u claimed to be")
	return message(400,"bad request")     
	

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
		
		# delete from rid/mid
		if new_comment["mid"] != None:
			
			response = MASKERS.get_item(
				Key={
					'total_visible':"True",
					'mid': new_comment["mid"]
				}
			)

			if "Item" not in response:
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
		
				# delete this comment
		
				result = COMMENTS.delete_item(
					Key={
						'visible':"True",
						'cid':cid
					},
				)
			
				if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
					return message(400,"server has error updating, please try again.")
		
				# archive this article
				result = COMMENTS.put_item(
					Item=new_comment
				)
			
				if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
					return message(400,"server has error updating, please try again.")
				return message(200,"this masker has been deleted")
			masker = response["Item"]
			if cid not in masker["comments"]:
				return message(200,"this comment has been deleted")
			masker_comments = masker["comments"]
			masker_comments.remove(cid)
			result = MASKERS.update_item(
				Key={
					'total_visible':"True",
					'mid': new_comment["mid"]
				},
				UpdateExpression="SET comments = :i",
				ExpressionAttributeValues={
					':i':masker_comments,
				},
			)
			if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
				return message(400,"server has error updating, please try again.")
		
			
		else:

			response = ROASTS.get_item(
				Key={
					'visible':"True",
					'rid': new_comment["rid"]
				}
			)
		
			if "Item" not in response:
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
		
				# delete this comment
		
				result = COMMENTS.delete_item(
					Key={
						'visible':"True",
						'cid':cid
					},
				)
			
				if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
					return message(400,"server has error updating, please try again.")
		
				# archive this article
				result = COMMENTS.put_item(
					Item=new_comment
				)
			
				if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
					return message(400,"server has error updating, please try again.")
				return message(200,"this roast has been deleted")
			roast = response["Item"]
			if cid not in roast["comments"]:
				return message(200,"this comment has been deleted")
			roast_comments = roast["comments"]
			roast_comments.remove(cid)

			result = ROASTS.update_item(
				Key={
					'visible':"True",
					'rid': new_comment["rid"]
				},
				UpdateExpression="SET comments = :i",
				ExpressionAttributeValues={
					':i':roast_comments,
				},
			)
		
			if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
				return message(400,"server has error updating COMMENTS, please try again.")

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

		# delete this comment

		result = COMMENTS.delete_item(
			Key={
				'visible':"True",
				'cid':cid
			},
		)
	
		if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
			return message(400,"server has error updating, please try again.")

		# archive this article
		result = COMMENTS.put_item(
			Item=new_comment
		)
	
		if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
			return message(400,"server has error updating, please try again.")
   
		#callback to user
		return message(200,"delete successful")
	except Exception as e:
			return err_message(e)  