# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import request, make_response, jsonify
from utility import BUCKET_NAME, check_user_write_access, message, s3
import uuid



def upload_upload(user):
    '''
    check if user has write access, if user does, rename file than upload it to s3 bucket.

    return key in s3 bucket.
    '''
    # check user post permission
    result = check_user_write_access(user)
    if result != True:
        return result

    # check file exist in request 
    if (not request.files or not request.files["file"]):
        return message(400,"no file found in request")
    file = request.files.get("file")

    # check filename exist in request
    if (not request.form or not request.form["filename"]):
        return message(400,"no filename found in this requst")
    filename = request.form["filename"]

    # check filename has extension
    if len(filename.split(".")) < 2:
        return message(400,"no file extension found in filename")

    # form new filename
    new_filename = str(uuid.uuid4())
    file_extension = filename.split(".")[-1]
    new_filename += "." + file_extension

    # put new file in to s3 bucket
    s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=file,ACL='public-read')
    return make_response(jsonify({"message":"upload done",
                                  "filename":new_filename}),200)