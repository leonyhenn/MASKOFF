# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
import copy
from users_decoy_data import *
from maskers_decoy_data import *
from articles_decoy_data import *
dynamodb = boto3.resource('dynamodb')
users = dynamodb.Table('users')
maskers = dynamodb.Table('maskers')
articles = dynamodb.Table('articles')
comments = dynamodb.Table('comments')
roasts = dynamodb.Table('roasts')




def delete_all():
    # users
    scan = users.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'uid'
        }
    )
    
    with users.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)


    # articles
    scan = articles.scan(
        ProjectionExpression='#t,#m',
        ExpressionAttributeNames={
            '#t': 'partial_visible',
            '#m': 'aid'
        }
    )
    
    with articles.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)


    # comments
    scan = comments.scan(
        ProjectionExpression='#t,#m',
        ExpressionAttributeNames={
            '#t': 'visible',
            '#m': 'cid'
        }
    )
    
    with comments.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)
    # roasts
    scan = roasts.scan(
        ProjectionExpression='#t,#m',
        ExpressionAttributeNames={
            '#t': 'visible',
            '#m': 'rid'
        }
    )
    
    with roasts.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)
    # maskers
    scan = maskers.scan(
        ProjectionExpression='#t,#m',
        ExpressionAttributeNames={
            '#t': 'total_visible',
            '#m': 'mid'
        }
    )
    
    with maskers.batch_writer() as batch:
        for each in scan['Items']:
            batch.delete_item(Key=each)

def insert_user_jiangfangzhou():
    users.put_item(
        Item=jiangfangzhou
    )
    return jiangfangzhou

def insert_a_full_access_user2():
    users.put_item(
        Item=nvlvshi
    )
def insert_a_half_access_user():
    users.put_item(
        Item=no_cellphone
    )
    return no_cellphone

def get_from_USERS(uid):
    response = users.get_item(
        Key={"uid":uid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_a_user_scan():
    response = users.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'uid'
        }
    )
    if response["Count"] != 1:
        return False
    return response["Items"][0]
def insert_a_masker():
    maskers.put_item(
        Item=zhangwen_masker
        )
def insert_an_article(article):
    articles.put_item(
        Item=article
        )
def get_from_db(db,get_id):
    if db == "users":
        db = users
        key = {"uid":get_id}
    elif db == "maskers":
        db = maskers
        key = {"mid":get_id,"total_visible":"True"}
    elif db == "articles":
        db = articles
        key = {"aid":get_id,"partial_visible":"True"}
    response = db.get_item(
        Key=key
    )
    return response["Item"]
def get_articles_scan():
    response = articles.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'aid',
        }
    )
    if response["Count"] < 1:
        return False
    return response["Items"]
def get_users_scan():
    response = users.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'uid',
        }
    )
    if response["Count"] < 1:
        return False
    return response["Items"]
def upgrade_write_access(uid,phone_number=None):
    if phone_number == None:
        phone_number = "some phone_number"
    users.update_item(
        Key={
            'uid': uid,
        },
        UpdateExpression='SET phone_number = :i',
        ExpressionAttributeValues={
            ':i': phone_number
        }
    )

def get_maskers_scan():
    response = maskers.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'mid',
        }
    )
    if response["Count"] < 1:
        return False
    return response["Items"]
def get_roasts_scan():
    response = roasts.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'rid',
        }
    )
    if response["Count"] < 1:
        return False
    return response["Items"]
def get_comments_scan():
    response = comments.scan(
        ProjectionExpression='#m',
        ExpressionAttributeNames={
            '#m': 'cid',
        }
    )
    if response["Count"] < 1:
        return False
    return response["Items"]
def get_from_ARTICLES(aid):
    response = articles.get_item(
        Key={"partial_visible":"True",
            "aid":aid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_from_ROASTS(rid):
    response = roasts.get_item(
        Key={"visible":"True",
            "rid":rid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_from_MASKERS(mid):
    response = maskers.get_item(
        Key={"total_visible":"True",
            "mid":mid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_from_COMMENTS(cid):
    response = comments.get_item(
        Key={"visible":"True",
             "cid":cid}
    )
    if "Item" in response:
        return response["Item"]
    return False

def get_deleted_article(aid):
    response = articles.get_item(
        Key={"partial_visible":"False",
            "aid":aid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_deleted_masker(mid):
    response = maskers.get_item(
        Key={"total_visible":"False",
            "mid":mid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_deleted_roast(rid):
    response = roasts.get_item(
        Key={"visible":"False",
            "rid":rid}
    )
    if "Item" in response:
        return response["Item"]
    return False
def get_deleted_comment(cid):
    response = comments.get_item(
        Key={"visible":"False",
            "cid":cid}
    )
    if "Item" in response:
        return response["Item"]
    return False