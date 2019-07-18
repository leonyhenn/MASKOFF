# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 
import boto3

dynamodb = boto3.resource('dynamodb')

users = dynamodb.create_table(
	TableName='users',
	KeySchema=[
		{
			'AttributeName':'uid',
			'KeyType':'HASH'
		}
	],
	AttributeDefinitions=[
		{
			'AttributeName':'uid',
			'AttributeType':'S'
		}
	],
	ProvisionedThroughput={
      'ReadCapacityUnits': 5,
      'WriteCapacityUnits': 5
  }
)
users.meta.client.get_waiter('table_exists').wait(TableName='users')
print('users',users.item_count)

maskers = dynamodb.create_table(
	TableName='maskers',
	KeySchema=[
		{	
			'AttributeName':'total_visible',
			'KeyType':'HASH'
		},
		{
			'AttributeName':'mid',
			'KeyType':'RANGE'
		}
	],
	AttributeDefinitions=[
		{
			'AttributeName':'total_visible',
			'AttributeType':'S'
		},
		{
			'AttributeName':'mid',
			'AttributeType':'S'
		}
	],
	ProvisionedThroughput={
      'ReadCapacityUnits': 5,
      'WriteCapacityUnits': 5
  }
)
maskers.meta.client.get_waiter('table_exists').wait(TableName='maskers')
print('maskers',maskers.item_count)

roasts = dynamodb.create_table(
	TableName='roasts',
	KeySchema=[
		{
			'AttributeName':'visible',
			'KeyType':'HASH'
		},
		{
			'AttributeName':'rid',
			'KeyType':'RANGE'
		},
	],
	AttributeDefinitions=[
		{
			'AttributeName':'visible',
			'AttributeType':'S'
		},
		{
			'AttributeName':'rid',
			'AttributeType':'S'
		}
	],
	ProvisionedThroughput={
      'ReadCapacityUnits': 5,
      'WriteCapacityUnits': 5
  }
)
roasts.meta.client.get_waiter('table_exists').wait(TableName='roasts')
print('roasts',roasts.item_count)

comments = dynamodb.create_table(
	TableName='comments',
	KeySchema=[
		{
			'AttributeName':'visible',
			'KeyType':'HASH'
		},
		{
			'AttributeName':'cid',
			'KeyType':'RANGE'
		}
	],
	AttributeDefinitions=[
		{
			'AttributeName':'visible',
			'AttributeType':'S',
		},
		{
			'AttributeName':'cid',
			'AttributeType':'S'
		}
	],
	ProvisionedThroughput={
      'ReadCapacityUnits': 5,
      'WriteCapacityUnits': 5
  }
)

comments.meta.client.get_waiter('table_exists').wait(TableName='comments')
print('comments',comments.item_count)

articles = dynamodb.create_table(
	TableName='articles',
	KeySchema=[
		{
			'AttributeName':'partial_visible',
			'KeyType':'HASH'
		},
		{
			'AttributeName':'aid',
			'KeyType':'RANGE'
		}
	],
	AttributeDefinitions=[
		{
			'AttributeName':'partial_visible',
			'AttributeType':'S',
		},
		{
			'AttributeName':'aid',
			'AttributeType':'S'
		}
	],
	ProvisionedThroughput={
      'ReadCapacityUnits': 5,
      'WriteCapacityUnits': 5
  }
)

articles.meta.client.get_waiter('table_exists').wait(TableName='articles')
print('articles',articles.item_count)