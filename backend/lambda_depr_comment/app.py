# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
# Library imports
from flask import Flask

# Local file imports
from articles import *
from comments import *
from maskers import *
from roasts import *
from upload import *
from users import *
from utility import *
from chat import *
app = Flask(__name__)

#test
@app.route("/")
def welcome():
    return welcome_to_maskoff()


#articles
#   C
@app.route("/articles",methods=["POST"])
@token_required
def post_article(user):
    return articles_post_article(user)
#   U
@app.route("/articles",methods=["PUT"])
@token_required
def update_article(user):
    return articles_update_article(user)
#   D
@app.route("/articles",methods=["DELETE"])
@token_required
def delete_article(user):
    return articles_delete_article(user)
#   R -- get
@app.route("/articles/<string:aid>")
@token_required
def get_article(user,aid):
    return articles_get_article(user,aid)

#chat
@app.route("/chat/login_sign/<string:client_id>")
# @token_required
# def get_signiture(user):
#     return chat_get_signiture(user)
def get_signiture(client_id):
    return chat_login_signiture(client_id)


#comments
#   C
@app.route("/comments",methods=["POST"])
@token_required
def post_comment(user):
    return comments_post_comment(user)
#   R
@app.route("/comments/<string:get_id>/<string:get_db>/<int:index>")
@token_required
def get_comments_user(user,get_id,get_db,index=0):
    return comments_get_comments(user,get_id,get_db,index)
#   D
@app.route("/comments",methods=["DELETE"])
@token_required
def delete_comment(user):
    return comments_delete_comment(user)


#maskers
#   C
@app.route("/maskers",methods=["POST"])
@token_required
def post_masker(user):
    return maskers_post_masker(user)
#   R -- search
@app.route("/maskers/search",methods=["POST"])
@token_required
def get_masker_by_search(user):
    return maskers_get_masker_by_search(user)
#   R -- get
@app.route("/maskers/<string:mid>")
@token_required
def get_masker(user,mid):
    return maskers_get_masker(user,mid)


#roasts
#   C
@app.route("/roasts",methods=["POST"])
@token_required
def post_roast(user):
    return roasts_post_roast(user)
#   R
@app.route("/roasts/search",methods=["POST"])
@token_required
def get_roasts(user):
    return roasts_get_roasts(user)
#   U
@app.route("/roasts",methods=["PUT"])
@token_required
def update_roast(user):
    return roasts_update_roast(user)
#   D
@app.route("/roasts",methods=["DELETE"])
@token_required
def delete_roast(user):
    return roasts_delete_roast(user)

#   frontPage
# @app.route("/front_page",methods=["GET"])
# @token_required
# def get_front_page(user):
#     return utility_get_front_page(user)

#upload
@app.route("/upload",methods=["POST"])
@token_required
def upload(user):
	return upload_upload(user)

#users
#   permissions
#       verify read access
@app.route("/users/read_access")
@token_required
def read_access(user):
    return users_read_access(user)
#       verify write access
@app.route("/users/write_access")
@token_required
def write_access(user):
    return users_write_access(user)
#       upgrade to write access
@app.route("/users/write_access",methods=["POST"])
@token_required
def write_access_upgrade(user):
    return users_write_access_upgrade(user)

#   register/login     
@app.route("/users",methods=["POST"])
def register_relogin():
    return users_register_relogin()

#   blocked
#       add
@app.route("/users/blocked/<string:blocked_id>",methods=["POST"])
@token_required
def add_blocked(user,blocked_id):
    return users_add_blocked_user(user,blocked_id)
#       get
@app.route("/users/blocked",methods=["GET"])
@token_required
def get_blocked(user):
    return users_get_blocked_users(user)
#       remove
@app.route("/users/blocked/<string:blocked_id>",methods=["DELETE"])
@token_required
def remove_blocked(user,blocked_id):
    return users_remove_blocked_user(user,blocked_id)