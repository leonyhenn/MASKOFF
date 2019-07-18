# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
from botocore.client import Config

ACCESS_KEY_ID = 'PLACEHOLDER_FOR_GITHUB'
ACCESS_SECRET_KEY = 'PLACEHOLDER_FOR_GITHUB'
BUCKET_NAME = 'PLACEHOLDER_FOR_GITHUB'

file = "ayami_nakajo.jpg"
data = open("PLACEHOLDER_FOR_GITHUB",'rb')
s3 = boto3.resource(
	    's3',
	    aws_access_key_id=ACCESS_KEY_ID,
	    aws_secret_access_key=ACCESS_SECRET_KEY,
	    config=Config(signature_version='s3v4')
	)
s3.Bucket(BUCKET_NAME).put_object(Key=file, Body=data)
print(file,("Done"))