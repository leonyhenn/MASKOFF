# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from utility import COMMENTS_NICKNAMES

def archive_comments_nicknames(parent_id):
    try:
        response = COMMENTS_NICKNAMES.get_item(
            Key={
                'visible':"True",
                'parent_id': parent_id
            }
        )
    except Exception as e:
        return err_message(e)
    if "Item" not in response:
        return message(400,"no such comments_group")

    comments_nicknames = response["Item"]

    # archive comments_nicknames
    comments_nicknames["visible"] = "False" 
    try:
        result = COMMENTS_NICKNAMES.delete_item(
            Key={
                'visible':"True",
                'parent_id':parent_id
            },
        )
    except Exception as e:
        return err_message(e)
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")
    try:
        result = COMMENTS_NICKNAMES.put_item(
            Item=comments_nicknames
        )
    except Exception as e:
        return err_message(e)     
    if not result['ResponseMetadata']['HTTPStatusCode'] == 200:
        return message(400,"server has error updating, please try again.")  
    return True