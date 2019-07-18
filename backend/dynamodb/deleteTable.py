# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import sys
import boto3
delete_object = sys.argv[1]
delete_table = dynamodb.Table(delete_object)
delete_table.delete()
