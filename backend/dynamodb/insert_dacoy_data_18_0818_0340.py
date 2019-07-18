# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
dynamodb = boto3.resource('dynamodb')
users = dynamodb.Table('users')
maskers = dynamodb.Table('maskers')
articles = dynamodb.Table('articles')


zhangwen = {
    "mid":"3a27ed2a-784f-4b49-9b34-017bb089ac44",
    "name":"刘宇辰",
    "contributed":"5",
    "alias":["tylor"],
    "article":[
        "f4257c5e-358f-4d62-8572-910fd6e79a6f",
        "9deb71ef-807a-46d6-9d2b-03281a45c716",
        "53e12e83-8c0e-46b9-9521-c335adb05c82",
        "62d82fb0-4dcf-4e69-9bfe-50f4328a68ec",
        "b9d33860-21c0-4de6-a954-3d8b2d25ce5f"
    ],
    "total_visible":"True"
}


maskers.put_item(
    Item=zhangwen)

