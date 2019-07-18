# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3

# Get the service resource.
dynamodb = boto3.resource('dynamodb')

# Create the DynamoDB table.
comments = dynamodb.create_table(
    TableName='comments',
    KeySchema=[
        {
            'AttributeName': 'cid',
            'KeyType': 'HASH'
        },
        {
            'AttributeName': 'visible',
            'KeyType': 'RANGE'
        }
    ],
    AttributeDefinitions=[
        {
            'AttributeName': 'cid',
            'AttributeType': 'S'
        },
        {
            'AttributeName': 'visible',
            'AttributeType': 'S'
        }

    ],
    ProvisionedThroughput={
        'ReadCapacityUnits': 5,
        'WriteCapacityUnits': 5
    }
)

# Wait until the table exists.
comments.meta.client.get_waiter('table_exists').wait(TableName='comments')

# Print out some data about the table.
print(comments.item_count)