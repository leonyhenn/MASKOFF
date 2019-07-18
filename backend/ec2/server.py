# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import Flask, jsonify, request, make_response
from werkzeug.security import generate_password_hash, check_password_hash
from hashlib import sha256
from api import *
from functools import wraps
import base64
import boto3
from botocore.client import Config
from util import video_format,image_format,newFileName
from werkzeug.utils import secure_filename


ACCESS_KEY_ID = 'PLACEHOLDER_FOR_GITHUB'
ACCESS_SECRET_KEY = 'PLACEHOLDER_FOR_GITHUB'
BUCKET_NAME = 'PLACEHOLDER_FOR_GITHUB'
app = Flask(__name__)
app.config['SECRET'] = 'PLACEHOLDER_FOR_GITHUB'

# def token_required(f):
# 	@wraps(f)
# 	def decorated(*args,**kwargs):
# 		token = None
# 		if 'access-token' in request.headers:
# 			token = request.headers['access-token']
# 		if not token:
# 			return jsonify({"message":"token is missing"}),401
# 		try:
# 			data = jwt.decode(token, app.config['SECRET'],algorithms=['HS256'])
# 			current_user = users.find_one({"_id":ObjectId(data["user_id"])})
# 			current_user["_id"] = ObjectId(data["user_id"])
# 		except:
# 			return jsonify({"token_valid" : False}), 401
# 		return f(current_user, *args, **kwargs)
# 	return decorated

@app.route("/",methods=["GET"])
def welcome():
	return ("MASKOFF SERVER")

# #handle user access the app.
# @app.route("/users",methods=["POST"])
# def check_access_permission():
# 	if 'access-token' in request.headers:
# 		token = request.headers['access-token']
# 		try:
# 			data = jwt.decode(token, app.config['SECRET'],algorithms=['HS256'])
# 			current_user = users.find_one({"_id":ObjectId(data["user_id"])})
# 			if current_user:
# 				return jsonify({"token_valid" : True}), 200
# 			else:
# 				return jsonify({"token_valid" : False}), 401
# 		except:
# 			return jsonify({"token_valid" : False}), 401
# 	else:
# 		data = request.get_json()
# 		smacc = sha256(str.encode(data['smacc_type']+data['smacc'])).hexdigest()
# 		smacc_type = data['smacc_type']
# 		gender = data['gender']
# 		access_token = validateUser_access(smacc,smacc_type,gender,location=None)
# 		return jsonify({"access_token":access_token.decode('UTF-8')})

# #check user permission for post
# @app.route("/users",methods=["GET"])
# @token_required
# def check_post_permission(current_user):
# 	if current_user["phone_number"]:
# 		return jsonify({"post_grant":True})
# 	return jsonify({"post_grant":False})

# #handle user post grant
# @app.route("/users",methods=["PUT"])
# @token_required
# def promote_post_permission(current_user):
# 	user_id = current_user["_id"]
# 	pn = current_user["phone_number"]
# 	print(request.get_json()["phone_number"])
# 	if not pn and request.get_json()["phone_number"]:
# 		pn = sha256(str.encode(request.get_json()["phone_number"])).hexdigest()
# 	post_token = validateUser_post(user_id,pn)
# 	if not post_token:
# 		return jsonify({"post_grant":False,
# 						"message":"Please make sure your phone number is only tied with one social account."})
# 	return jsonify({"post_grant":True})
# @app.route("/maskers/<string:mid>",methods=["POST"])
# @token_required
# def update_masker(current_user,mid):
# 	if current_user["phone_number"]:
# 		json = request.get_json()
# 		#-------decoy--------
# 		start_date = "today"
# 		end_date = "three seconds later"
# 		price = 20
# 		#-------decoy--------
# 		masker = {
# 			"_id":ObjectId(mid),
# 			"name":json["name"],
# 			"alias":json["alias"],
# 			"contributed": "1",
# 			"article":[{
# 					"author_uid":ObjectId(current_user["_id"]),
# 					"tags":json["tags"],
# 					"content":json["content"],
# 					"pictures":[],
# 					"audios":[],
# 					"videos":[],
# 					"elapse":[{
# 							"start_date":start_date,
# 							"end_date":end_date
# 							}],
# 					"partial_visible":True
# 					}],
# 			"price":price,
# 			"total_visible":True,
			
# 			}
# 		updateMaskerArticle(masker,current_user["_id"])
# 		return jsonify({"post_success":True})
# 	return jsonify({"post_success":False})
# #handle search masker by name
# @app.route("/maskers",methods=["POST"])
# @token_required
# def search_masker(current_user):
# 	masker_info = request.get_json()["masker_info"]
# 	print(masker_info)
# 	result = {"maskers":getMaskerArticle(masker_info)}
# 	return jsonify(result)

@app.route("/test",methods=["POST"])

def test():
	print(request.form)
	print(request.files)
	masker_dict = merge_two_dicts(request.form,request.files)
	print(masker_dict)
	print(request)
	
	
	
	# if current_user["phone_number"]:
	# 	masker_dict = merge_two_dicts(request.form,request.files)
	# 	name = masker_dict["name"]
	# 	alias = masker_dict["alias"].split()
	# 	tags = masker_dict["tags"].split()
	# 	masker_dict_length = len(masker_dict) - 3
	# 	content = []
	# 	for i in range(masker_dict_length):
	# 		file = masker_dict[str(i)]
	# 		print(file)
	# 		if (isinstance(file,str)):
	# 			print(i)
	# 			content.append(("text",file))
	# 		else:
	# 			filename = secure_filename(file.filename)
	# 			extension = file.filename.rsplit('.', 1)[1].lower()
	# 			new_filename = newFileName() + '.' + extension
	# 			if (extension in video_format):
	# 				content.append(("video",new_filename))
	# 			elif (extension in image_format):
	# 				content.append(("image",new_filename))
	# 			s3 = boto3.resource(
	# 				    's3',
	# 				    aws_access_key_id=ACCESS_KEY_ID,
	# 				    aws_secret_access_key=ACCESS_SECRET_KEY,
	# 				    config=Config(signature_version='s3v4')
	# 				)
	# 			s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=file)
	
	# 	start_date = "today"
	# 	end_date = "three seconds later"
	# 	masker = {
	# 			"_id":None,
	# 			"name":name,
	# 			"alias":alias,
	# 			"contributed": "1",
	# 			"article":[{
	# 					"author_uid":current_user["_id"],
	# 					"tags":tags,
	# 					"content":content,
	# 					"elapse":[{
	# 							"start_date":start_date,
	# 							"end_date":end_date
	# 							}],
	# 					"partial_visible":True
	# 					}],
	# 			"price":-1,
	# 			"total_visible":True,
				
	# 	}
	# 	print(masker)
	# 	addNewMasker(masker,current_user["_id"])
	# 	return jsonify({"post_success":True})
	return jsonify({"post_success":False})
# @app.route("/maskers",methods=["PUT"])
# @token_required
# def add_new_masker(current_user):
# 	if current_user["phone_number"]:
# 		json = request.get_json()
# 		#-------decoy--------
# 		start_date = "today"
# 		end_date = "three seconds later"
# 		price = 20
# 		#-------decoy--------

# 		masker = {
# 		"_id":None,
# 		"name":json["name"],
# 		"alias":[json["alias"]],
# 		"contributed": "1",
# 		"article":[{
# 				"author_uid":current_user["_id"],
# 				"tags":json["tags"],
# 				"content":json["content"],
# 				"pictures":[],
# 				"audios":[],
# 				"videos":[],
# 				"elapse":[{
# 						"start_date":start_date,
# 						"end_date":end_date
# 						}],
# 				"partial_visible":True
# 				}],
# 		"price":price,
# 		"total_visible":True,
# 		}
# 		addNewMasker(masker,current_user["_id"])
# 		return jsonify({"post_success":True})
# 	return jsonify({"post_success":False})

# @app.route("/roasts",methods=["POST"])
# @token_required
# def add_new_roast(current_user):
# 	json = request.get_json()
# 	roast = {
# 		"_id": None,
# 		"author_uid":None,
# 		"title": json["title"],
# 		"content":json["content"],
# 		"pictures":[],
# 		"audios":[],
# 		"videos":[],
# 		"comments":[],
# 		"visible": True,
# 		"tags":[]
# 	}
# 	addNewRoast(roast,current_user["_id"])
# 	return jsonify({"post_success":True})

# @app.route("/roasts/<string:last_id>",methods=["GET"])
# @token_required
# def get_roasts(current_user,last_id):
# 	result = getRoast(last_id)
# 	if len(result) != 0:
# 		return jsonify({"roast_list":result,
# 						"have_roast":True})
# 	return jsonify({"have_roast":False})



# @app.route("/comments",methods=["POST"])
# @token_required
# def add_new_comment(current_user):
# 	json = request.get_json()
# 	comment = {
# 		"_id": None,
# 		"roast_rid":ObjectId(json["rid"]),
# 		"author_uid":None,
# 		"content":json["comment"],
# 		"pictures":[],
# 		"audios":[],
# 		"videos":[],
# 		"at":[],
# 		"date":time(),
# 		"visible": True,
		
# 	}
# 	addNewComment(comment,current_user["_id"])
# 	return jsonify({"comment_success":True})

# @app.route("/comments/<string:rid>",methods=["GET"])
# @token_required
# def get_comments_by_rid(current_user,rid):
# 	result = getCommentsByRoast(rid)
# 	return jsonify({"comment_list":result})

# @app.route("/people",methods=["POST"])
# @token_required
# def get_comments_by_rid(current_user,rid):

# 	return jsonify({})

#=========utils==========
def merge_two_dicts(x, y):
    z = x.copy()   # start with x's keys and values
    z.update(y)    # modifies z with y's keys and values & returns None
    return z





if __name__ == '__main__':
	# app.run(debug=True)
    app.run(debug=True,host='0.0.0.0',port=80)