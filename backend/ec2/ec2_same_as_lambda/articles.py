# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from datetime import datetime
from flask import request, make_response, jsonify
from utility import ARTICLES, check_file_exist_in_s3_n_sanitize_text, check_user_write_access, err_message, MASKERS, message, USERS, COMMENTS_NICKNAMES,get_nickname,LIKES
from comments_nicknames import archive_comments_nicknames
from upload import upload_multi
import uuid
import json
def articles_post_article(user):
    try:
        if (not "masker" in request.form):
            return message(400,"no file found in request")

        masker = json.loads(request.form["masker"])

        # check input type
        if (not isinstance(masker,dict)
            or "mid" not in masker 
            or not isinstance(masker["mid"],str)
            or "content" not in masker
            or not isinstance(masker["content"],list)
            or "alias" not in masker
            or not isinstance(masker["alias"],list)
            or "tags" not in masker
            or not isinstance(masker["tags"],list)):
            return message(400,"lack of mid or content, or their type is wrong")
        # assign input
        mid = masker["mid"]
        content = masker["content"]
        tags = masker["tags"]
        alias = masker["alias"]
        files = request.files

        # upload all files contained
        content = upload_multi(content,files)
        if not isinstance(content,list):
            return content
        
        # for items in tags and alias, check each's type
        for item in masker["alias"] + masker["tags"]:
            if not isinstance(item,str):
                return message(400,"wrong type for alias or tag info")
        
        # if alias is an empty list, assign it to null to avoid Dynamodb bugs
        if len(alias) == 1 and alias[0] == "":
            alias = None

        #check user perm to post
        result = check_user_write_access(user)
        if result != True:
            return result
    
        # check if user is exposing same makser again
        if mid in user["maskers_exposed"]:
            return message(400,"You have already exposed this masker. please use update masker to update your article")
    
        #check if the masker exist
        try:
            response = MASKERS.get_item(
                Key={
                    'total_visible':"True",
                    'mid': mid,
                }
            )
        except Exception as e:
            return err_message(e)
        if "Item" not in response:
            return message(400,"masker do not exist")
        masker_in_db = response["Item"] 
        # otherwise
        # generate an id for this article
        aid = str(uuid.uuid4())
        nickname = get_nickname("Chinese")
        article = {
                "aid":aid,
                "mid":mid,
                "author_uid":user["uid"],
                "tags":tags,
                "alias":alias,
                "content":content,
                "partial_visible":"True",
                "post_date":datetime.utcnow().isoformat(),
                "name":masker_in_db["name"],
                "liked":0,
                "comments_count":0,
                "contributed":masker_in_db["contributed"] + 1,
                "author_nickname":nickname
            }
        # comments_nicknames

        try:
            result = COMMENTS_NICKNAMES.put_item(
                Item={
                    'parent_id':aid,
                    'visible':"True",
                    'uid_nickname_pair':{user["uid"]:nickname}
                }
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating COMMENTS_NICKNAMES, please try again.")

        # masker
        # 1. add article to related masker
        try:
            result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
                    "mid":mid
                },
                UpdateExpression="SET articles = list_append(articles, :i), contributed = contributed + :j ",
                ExpressionAttributeValues={
                    ':i': [aid],
                    ':j':1,
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating MASKERS, please try again.")
        #article

        #2. add article to ARTICLES
        try:
            result = ARTICLES.put_item(
                Item=article
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating ARTICLES, please try again.")


        #for all other aritcles under this masker, update their contributed count
        for i in range(len(masker_in_db["articles"])):
            print(masker_in_db["articles"][i])
            try:
                result = ARTICLES.update_item(
                    Key={
                        "partial_visible":"True",
                        "aid":masker_in_db["articles"][i]
                    },
                    UpdateExpression="SET contributed = contributed + :j ",
                    ExpressionAttributeValues={
                        ':j':1,
                    },
                )
            except Exception as e:
                print(e)
                return err_message(e)
            if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
                return message(400,"server has error updating MASKERS, please try again.")
        #user
        #3. add aid to user[articles]
        #4. add masker to user[masker exposed] if user never posted this masker before
        try:
            result = USERS.update_item(
                Key={
                    "uid":user["uid"]
                },
                UpdateExpression="SET maskers_exposed = list_append(maskers_exposed, :i), articles = list_append(articles, :j)",
                ExpressionAttributeValues={
                    ':i': [mid],
                    ':j': [aid],
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")        
        #5.callback to user says its done
        return make_response(jsonify({"message":"post success","mid":mid,"aid":aid}),200)
    except Exception as e:
        return err_message(e)

def articles_update_article(user):
    if (not "article" in request.form):
        return message(400,"no file found in request")
    
    new_article = json.loads(request.form["article"])

    # check input existence
    if (not isinstance(new_article,dict)
        or "aid" not in new_article 
        or "content" not in new_article 
        or "tags" not in new_article 
        or "alias" not in new_article):
        return message(400,"lack of essential information")

    # assign input
    aid = new_article["aid"]
    content = new_article["content"]
    tags = new_article["tags"]
    alias = new_article["alias"]
    files = request.files

    # check input type
    if (not isinstance(aid,str) 
        or not isinstance(content,list) 
        or not isinstance(tags,list) 
        or not isinstance(alias,list)):
        return message(400,"wrong type of essential information")

    for item in tags+alias:
        if not isinstance(item,str):
            return message(400,"wrong type of tags or alias")
    

    # if alias is an empty list, assign it to null to avoid Dynamodb bugs
    if len(alias) == 1 and alias[0] == "":
        alias = None
        
    #upload all files contained
    content = upload_multi(content,files)
    if not isinstance(content,list):
            return content
            
    #check user perm to post
    result = check_user_write_access(user)
    if result != True:
        return result

    #check article exist and visible
    response = ARTICLES.get_item(
        Key={
            'partial_visible':"True",
            'aid': aid   
        }
    )
    if 'Item' not in response:
        return message(400,"article DNE")

    #check aid of the article belongs to user
    if not aid in user["articles"]:
        return message(400,"wrong owner of article")
    
    #sanitize text input
    #####!!!NOT COMPLETE!!!######
    #update article
    try:
        result = ARTICLES.update_item(
            Key={
                'partial_visible':"True",
                'aid':aid
            },
            UpdateExpression="SET content = :i, tags = :j, alias = :k, post_date = :l",
            ExpressionAttributeValues={
                ':i': content,
                ':j': tags,
                ':k': alias,
                ':l': datetime.utcnow().isoformat()
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")
    return message(200,"put successful")

def articles_delete_article(user):
    article = request.get_json()

    # check input type and existence
    if ("aid" not in article 
        or not isinstance(article["aid"],str)):
        return message(400,"aid not exist or has wrong format")

    # assign input 
    aid = article["aid"]

    #check if user has this article
    if aid not in user["articles"]:
        return message(400,"you have no ownership of this article")

    #check article exist
    try:
        response = ARTICLES.get_item(
            Key={
                'partial_visible':"True",
                'aid': aid
            }
        )
        #check if article exist and visible
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"article does not exist")
    new_article = response["Item"]
    new_article["partial_visible"] = "False"

    # find related masker
    mid = new_article["mid"]
    try:
        response = MASKERS.get_item(
            Key={
                'total_visible':"True",
                'mid': mid
            }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"no such masker")

    masker = response["Item"]
    if aid not in masker["articles"]:
        return message(400,"masker has no such article")
    
    # if article is last one of the masker,hide masker
    if len(masker["articles"]) < 2:
        # delete masker
        masker["total_visible"] = "False" 
        try:
            result = MASKERS.delete_item(
                Key={
                    'total_visible':"True",
                    'mid':mid
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating, please try again.")
        # archive this article
        try:
            result = MASKERS.put_item(
                Item=masker
            )
        except Exception as e:
            return err_message(e)     
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating, please try again.")

        # comments_nicknames
        result = archive_comments_nicknames(mid)
        if result != True:
            return result

        user["maskers_exposed"].remove(mid)
        user["articles"].remove(aid)
        # update user related info
        try:
            result = USERS.update_item(
                Key={
                    "uid":user["uid"]
                },
                UpdateExpression="SET maskers_exposed = :i, articles = :j",
                ExpressionAttributeValues={
                    ':i': user["maskers_exposed"],
                    ':j': user["articles"]
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")  
    else:
        # remove the article from masker
        masker["articles"].remove(aid)
        try:
            result = MASKERS.update_item(
                Key={
                    "total_visible":"True",
                    "mid":mid
                },
                UpdateExpression="SET articles = :i,contributed = contributed - :j",
                ExpressionAttributeValues={
                    ':i': masker["articles"],
                    ':j':1
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating MASKERS, please try again.")  

        # comments_nicknames
        result = archive_comments_nicknames(aid)
        if result != True:
            return result

        user["maskers_exposed"].remove(mid)
        user["articles"].remove(aid)
        # update related user info
        try:
            result = USERS.update_item(
                Key={
                    "uid":user["uid"]
                },
                UpdateExpression="SET maskers_exposed = :i, articles = :j",
                ExpressionAttributeValues={
                    ':i': user["maskers_exposed"],
                    ':j': user["articles"]
                },
            )
        except Exception as e:
            return err_message(e)
        if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
            return message(400,"server has error updating USERS, please try again.")  
    # delete this article
    try:
        result = ARTICLES.delete_item(
            Key={
                'partial_visible':"True",
                'aid':aid
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")

    # archive this article
    try:
        result = ARTICLES.put_item(
            Item=new_article
        )   
    except Exception as e:
        return err_message(e)     
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")

    #callback to user
    return message(200,"delete successful")

def articles_get_article(user,aid):
    try:
        response = ARTICLES.get_item(
            Key={
                'partial_visible':"True",
                'aid': aid
            }
        )
        #check if article exist and visible
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"article does not exist")
    article = response["Item"]
    article["liked"] = str(article["liked"])
    article["comments_count"] = str(article["comments_count"])
    article["contributed"] = str(article["contributed"])
    response = LIKES.get_item(
            Key={
                'object_type_id_userid': "ARTICLES" + "_" + article["aid"] + "_" + user["uid"]
            }
        )
    if "Item" not in response:
        article["user_liked"] = False
    else:
        article["user_liked"] = True
    return make_response(jsonify({"message":"get success","article":article}),200)


