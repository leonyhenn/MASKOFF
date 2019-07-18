# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
dynamodb = boto3.resource('dynamodb')
users = dynamodb.Table('users')
maskers = dynamodb.Table('maskers')
articles = dynamodb.Table('articles')
decoy_data_user = [
	{
	"uid":"458e7df4-6880-4c16-aaad-3152dd6f494d",
	"MASKOFF":"蒋方舟",
	"MASKOFF_changed":"1",
	"smacc":"A04C62EACCCAFACBF6E6A56AF05C868AECA078F3DD342F28FA9F30A3563EC1DA",
	"smacc_type":"WeChat",
	"gender":"0",
	"phone_number":"07FA85950178E27C9B4F6A56B6D7EC8A0EF5A5847D5563F25A83F23236337341",
	"maskers_exposed":["84bcb4bf-f92f-4bad-9e8b-151ed9612db3"],
	"roasts":[],
	"comments":[],
	"friends":[],
	"blocked":[],
	"payment_history":[],
	"login_history":[],
	},
	{
	"uid":"98a21e06-59de-4912-bb73-d641c977b901",
	"MASKOFF":"None",
	"MASKOFF_changed":"0",
	"smacc":"7032282903C7CC7723B3A1682BBEF002C2738ED393D8689F1F1D7D28A466C913",
	"smacc_type":"WeChat",
	"gender":"0",
	"phone_number":"69A9FA5AAD2470D69B21598D0F8596D77195A439F5FFD93184877C43C91DA16C",
	"maskers_exposed":["84bcb4bf-f92f-4bad-9e8b-151ed9612db3"],
	"roasts":[],
	"comments":[],
	"friends":[],
	"blocked":[],
	"payment_history":[],
	"login_history":[],
	},
	{
	"uid":"aef24dd8-f478-450f-96ed-90b1d44389d2",
	"MASKOFF":"章文",
	"MASKOFF_changed":"1",
	"smacc":"5F82B4F2584974B91D0D26958602AE3887B791B72AA83A0F34EA2121F39F3182",
	"smacc_type":"WeChat",
	"gender":"0",
	"phone_number":"D8719741533FC1A558B24306E689A1EF201865583C61745F72C69384C1EB98E6",
	"maskers_exposed":["84bcb4bf-f92f-4bad-9e8b-151ed9612db3"],
	"roasts":[],
	"comments":[],
	"friends":[],
	"blocked":[],
	"payment_history":[],
	"login_history":[],
	},
	{
	"uid":"e5d939f2-94cf-465b-a5db-f4bad41bdc4e",
	"MASKOFF":"易小荷",
	"MASKOFF_changed":"1",
	"smacc":"0E20B6ED4174C073D8C88B373840D1B4FB2483B01853D9480C8A0FF0913D0641",
	"smacc_type":"WeChat",
	"gender":"0",
	"phone_number":"3E6092A4328F85775256C265B2D79383D7CA472FEE50C1CBFCB6E0C0BADD64EF",
	"maskers_exposed":["84bcb4bf-f92f-4bad-9e8b-151ed9612db3"],
	"roasts":[],
	"comments":[],
	"friends":[],
	"blocked":[],
	"payment_history":[],
	"login_history":[],
	},
	{
	"uid":"f65925d7-7dcf-4182-8e5b-e86891c7923f",
	"MASKOFF":"王嫣芸",
	"MASKOFF_changed":"1",
	"smacc":"67D09BF5683DCCBC45FD22DF51239E4392FF40F512D1C53A85BC232325336775",
	"smacc_type":"WeChat",
	"gender":"0",
	"phone_number":"C8CED6436A83FCE02103E4FFF5708051D865D56FFD8FD50F6D1323278A2D89FB",
	"maskers_exposed":["84bcb4bf-f92f-4bad-9e8b-151ed9612db3"],
	"roasts":[],
	"comments":[],
	"friends":[],
	"blocked":[],
	"payment_history":[],
	"login_history":[],
	},

]

decoy_data_articles = [
	{		"aid":"f4257c5e-358f-4d62-8572-910fd6e79a6f",
			"author_uid":"458e7df4-6880-4c16-aaad-3152dd6f494d",
			"tags":["性骚扰","摸大腿","饭局"],
			"content":[
				{
					"text/plain","章文刚刚给我发的微博私信。 ​"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/3e89803fly1ftta7v7qspj20v91vok00.jpg"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/cSL5-hftenia2454894.jpg"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/v2-cddb8219f91b4765fe74f3af96880ea7_hd.jpg"
				}
			],
			"partial_visible":"True"
		},
		{
			"aid":"9deb71ef-807a-46d6-9d2b-03281a45c716",
			"author_uid":"98a21e06-59de-4912-bb73-d641c977b901",
			"tags":["强奸","媒体人","时事评论员","公知","专栏作家","饭局后"],
			"content":[
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/Rbxi-hftenia2500242.png"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/gBKW-hftenia2519068.jpg"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/8721e49bly1ftlssuzty0j20ku112dk1.jpg"
				}
			],
			"partial_visible":"True"
		},
		{	
			"aid":"53e12e83-8c0e-46b9-9521-c335adb05c82",
			"author_uid":"e5d939f2-94cf-465b-a5db-f4bad41bdc4e",
			"tags":["移民","美国大使馆","性骚扰"],
			"content":[
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/595ad6fegy1ftqllvc47oj20ms8c0e81.jpg"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/v2-27e4262cc267db567ab2fbccebf6d848_b.jpg"
				},
			],
			"partial_visible":"True"
		},
		{
			"aid":"62d82fb0-4dcf-4e69-9bfe-50f4328a68ec",
			"author_uid":"f65925d7-7dcf-4182-8e5b-e86891c7923f",
			"tags":["性骚扰","白天约喝酒"],
			"content":[
				{
					"text/plain","忙了一天，现在开始打字，人渣章文，注意：以下部分，和你我恩怨无关，反正我已经揍过你了，当年没说，就是觉得撕起来难看，但没意识到 人生该撕的一个都不能落下，早曝光几年也不会由得你现在欺负了姑娘还威胁人家、欺骗世人。当时的情况如下：我和章文中间有一些共同认识的朋友，有一次在聚会上碰见了，他过来加微信，之后私底下一直约见面，我拒绝了三次，第四次他说下午三点喝个下午茶，出于礼貌，我去了。 到达咖啡馆后，章文告诉我在包间，我第一反应是：喝咖啡为什么需要包包间？进门后才发现他叫了十几瓶啤酒，已经喝了一大半。疑惑至此加深：谁没事大白天约女性喝下午茶却自己在包间里喝酒？所以我第一句话是问他：有什么事情。他不说，只是闲扯，然后看我坐下不到五分钟就要走后，直接扑了上来。亲吻，抹胸，摸私处，一个动作不落。在他出现猥琐的行为后，我情急之下做了三件事：第一，迅速攻击他的喉结处，让他离开我的身体。第二，打开了包间的房门。第三，抄起桌上的开水壶，拧开盖子砸了过去。 他准备还手的时候，我掀了桌子，叫了服务员。今天看见他回答蒋方舟的实名举报，说媒体圈就是搂搂抱抱喝多了都这样，哪一次发生那样的事情自己也忘了。占了的便宜可以忘，挨过的打总忘不了吧？所以我想问：章文，还记得2015年夏天你在珠江帝景门口的咖啡馆挨过的揍、受过的烫吗？ 我是跟你有什么私仇打了你，但你特别宽宏大量都不敢找警察抓我吗？"
				},
				{
					"text/plain","刚刚看他打“荡妇牌”，说蒋方舟男友多，易小荷离过婚，试图污名化受害者，我王嫣芸离了两次婚了，做过人体模特，不穿衣服的照片到处都是，在他眼里应该算彻头彻尾的荡妇吧？那为什么还打了他？能解释一下吗？挨打的时候没想过为什么吗？"
				},
			],
			"partial_visible":"True"
		},
		{
			"aid":"b9d33860-21c0-4de6-a954-3d8b2d25ce5f",
			"author_uid":"aef24dd8-f478-450f-96ed-90b1d44389d2",
			"tags":["我是清白的","两情相悦"],
			"content":[
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/R67U-hftenia2449125.png"
				},
				{
					"image/jpeg","https://s3.ca-central-1.amazonaws.com/maskoff/v2-40389313b3b31f6cfee435bda0164ea8_hd.jpg"
				},
			],
			"partial_visible":"True"
		}
]

zhangwen = {
	"mid":"84bcb4bf-f92f-4bad-9e8b-151ed9612db3",
	"name":"章文",
	"contributed":"5",
	"alias":[],
	"article":[
		"f4257c5e-358f-4d62-8572-910fd6e79a6f",
		"9deb71ef-807a-46d6-9d2b-03281a45c716",
		"53e12e83-8c0e-46b9-9521-c335adb05c82",
		"62d82fb0-4dcf-4e69-9bfe-50f4328a68ec",
		"b9d33860-21c0-4de6-a954-3d8b2d25ce5f"
	],
	"total_visible":"True"
}
with users.batch_writer() as batch:
	for i in range(len(decoy_data_user)):
		batch.put_item(
			Item=decoy_data_user[i]
		)

maskers.put_item(
	Item=zhangwen)

with articles.batch_writer() as batch:
	for i in range(len(decoy_data_articles)):
		batch.put_item(
			Item=decoy_data_articles[i]
		)
