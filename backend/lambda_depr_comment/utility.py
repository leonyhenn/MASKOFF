# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import boto3
import botocore
from functools import wraps
from flask import jsonify, request, make_response
import hashlib
import jwt
import time
from elasticsearch import Elasticsearch, RequestsHttpConnection
# s3,dynamoDB permission
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
ACCESS_KEY_ID = 'AKIAIWJZVU5SJQIMOV3Q'
ACCESS_SECRET_KEY = 'kNR0ESUqeztfKx5yhxrca9xZo0pRrBV5NpbA162e'
SALT = 'SimonaWishIwassoberSoIcouldseeclearlynowTherainhasgone'
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# remember to replace it!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

# dynamodb tables
DYNAMODB = boto3.resource('dynamodb')
USERS = DYNAMODB.Table('users')
MASKERS = DYNAMODB.Table('maskers')
ARTICLES = DYNAMODB.Table('articles')
ROASTS = DYNAMODB.Table('roasts')
COMMENTS = DYNAMODB.Table('comments')

# s3 bucket config
s3 = boto3.resource(
        's3',
        aws_access_key_id=ACCESS_KEY_ID,
        aws_secret_access_key=ACCESS_SECRET_KEY,
    )
BUCKET_NAME = 'maskoff'


# check token
SECRET = "takeyourproteinpillsandputyourhelmeton_YouonlygetoneshotdonotmissyourchancetoblowThisopportunitycomesonceinalifetime"
EXPIRE_ELAPSE = 86400 * 365 * 10
def token_required(f):
    @wraps(f)
    def decorated(*args,**kwargs):
        token = None
        if "access-token" in request.headers and isinstance(request.headers['access-token'],str):
            token = request.headers["access-token"]
        if not token:
            return message(401,"token is missing")
        if not isinstance(request.headers['access-token'],str):
            return message(401,"token has wrong type")
        try:
            token = jwt.decode(token, SECRET,algorithms=['HS256'])
            response = USERS.get_item(
                Key={
                    'uid': token["uid"],   
                }
            )
            if "Item" in response:
                user = response["Item"]
            else:
                return message(401,"no such user")
        except Exception as e:
            return message(401,False,"token_valid")
        return f(user, *args, **kwargs)
    return decorated


# sending out response
def message(statusCode,message_text,message_title="message"):
    return make_response(jsonify({message_title:message_text}),statusCode)

def err_message(e):
    return make_response(jsonify({"error":str(e)}),500)


# check user post permission
def check_user_write_access(user):
    if "phone_number" in user:
        if not user["phone_number"]:
            return message(401,"No permission to write")
    else:
        return message(401,"No permission to write")
    return True
def encrypt(info):
    '''
    SHA512 + const salt now.

    how to check password:
    bcrypt.checkpw(password, hashed)
    '''
    return hashlib.sha512(bytes(info,'utf-8')+bytes(SALT,'utf-8')).hexdigest()

def generateAccessToken(uid):
    '''
    compute and send a unique access token to user
    '''
    #jwt.decode(access_token, 'secret', algorithms=['HS256'])
    now = time.time()
    access_token = jwt.encode({"uid":str(uid),
                               "exp":now+EXPIRE_ELAPSE},SECRET,algorithm='HS256')
    return access_token.decode('ascii')

def check_file_exist_in_s3_n_sanitize_text(content):
    for item in content:
        if not isinstance(item,dict):
            return message(400,"wrong type of items in content")
        if "type" not in item or not isinstance(item["type"],str):
            return message(400,"item has no type or type format is wrong")
        #if it is rich media file,check its availability in S3
        if item["type"] != "text/plain":
            s3 = boto3.resource('s3')
            try:
                if "filename" not in item or not isinstance(item["filename"],str):
                    return message(400,"item has no filename or filename is wrong")
                s3.Object(BUCKET_NAME, item["filename"]).load()
            except botocore.exceptions.ClientError as e:
                if e.response['Error']['Code'] == "404":
                    #if some file missing, reject
                    return message(400,"file " + item["filename"] + " DNE.")
                else:
                    return message(400,"something went wrong when posting article")
        
        # print("if it is text input, clean it")
        # print("#######!!! NOT DONE !!!#######")
    return True

def remove_dup(seq):
    # remove duplicates from a list whilst preserving order
    seen = set()
    seen_add = seen.add
    return [x for x in seq if not (x in seen or seen_add(x))]

def welcome_to_maskoff():
    return message(200,"welcome to maskoff")

def utility_get_front_page(user):
    es = Elasticsearch(["https://search-maskoff-es-6o4uagbwcjd2acnyxi6fpwqfee.ca-central-1.es.amazonaws.com"])
    
    roast_keyword = "女朋友"
    roast_body = {
      "size" : 5,
      "query": {
        "multi_match" : {
          "query": roast_keyword, 
          "type": "phrase",
          "fields": ["title^3","tags^3","content.filename"] 
        }
      }
    }
    roast_results = es.search(index="roasts",body=roast_body)
    roast_results = [{key:item["_source"][key] for key in ['title','tags','rid','content','author_uid']} for item in roast_results["hits"]["hits"]]
    
    masker_keyword = "章文"
    masker_body = {
      "query": {
        "multi_match" : {
          "query": masker_keyword, 
          "type": "most_fields",
          "fields": ["name^3","alias^3","tags^3","content.filename"] 
        }
      },
    }
    masker_results = es.search(index="articles",body=masker_body)
    masker_results = [{key:item["_source"][key] for key in ['aid', 'mid','tags','alias','name']} for item in masker_results["hits"]["hits"]]
    
    front_page = {"Roast":{
                         "Recommend":roast_results,
                         "Follow":roast_results,
                         "Trending":roast_results
                         },
                  "Masker":{
                         "Recommend":masker_results,
                         "Follow":masker_results,
                         "Trending":masker_results
                  }}
    print(front_page)
    return make_response(jsonify({"message":"search success","front_page":front_page}),200)



front_page = {'Roast': {'Recommend': [{'title': '内容绝对舒适 一口老血', 'tags': ['七夕', '礼物', '吵架', '分手', '女朋友'], 'rid': '2f407619-6032-4645-ab22-9a06bfea9adb', 'content': [{'type': 'text/plain', 'filename': '\u200b前天晚上下班回家，女朋友说七夕买的礼物到了，我挺开心的。表示了很开心，和感谢。准备提一局fifa然后说了晚上带他去看电影。打算回来慢慢拆，慢慢欣赏。结果她就开始不高兴了，作为一个直男，一开始真没意识到。后来觉得不对劲，就去问问。重点是一开始态度极好，本着有错就改，误会我的话加以注意的原则沟通。'}, {'type': 'text/plain', 'filename': '\u200b哄了两个小时，人家一言不发，玩手机，看书。后来心态崩了，让她把书放下，好好沟通一波。'}, {'type': 'text/plain', 'filename': '\u200b上手把她书抢下来了，我不是脾气暴躁啊，哄了十几次，两个多小时后才爆发的。后来她要回宿舍，楼主女朋友在校读研，还没毕业。'}, {'type': 'text/plain', 'filename': '非要自几打车回去，想想最近发生的事情 大晚上我也不敢让她自己回去啊。就开车把她送回学校了，心想冷静下来再当面哄，昨晚在她学校楼下两个多小时，不见，不接。今天发来截图。果断删微信，删电话，心态崩了。'}, {'type': 'text/plain', 'filename': '\u200b吐出来轻松多了'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '我该怎么办，内容引起舒适。', 'tags': ['女朋友', '自拍', '同学聚会'], 'rid': '3827aeca-4c4c-4473-8a0a-400d414c4098', 'content': [{'type': 'text/plain', 'filename': '和女朋友谈了快两年，感情一直挺好，虽然还没有见过双方父母，但是也在微信上加了好友，商量好今年过年见面。'}, {'type': 'text/plain', 'filename': '前两天高中同学聚会，也提前和她报备过了。当时她的态度就是有女的就不准去，不然就不放心我，后来和她好说歹说总算同意了。等到了聚会那天，见到了几个好几年没见的同学大家都很开心。有一个高中玩的最好的一个女同学这几年都没有联系过，然后就和她拍了三张自拍。当时我就想也不是用我手机拍的，我也没做出格的事，女朋友也不会知道。那天聚会我还怕女朋友不高兴，提前就走了。结果不知道怎么回事，今天她就搞到了那三张自拍，其中两张根本没有身体接触，有一张就肩膀靠在了一起。然后根本不给我解释的机会。说什么笑得这么开心，找人家过去吧。我就纳闷了，拍个照还得哭不成。完全不相信我，自己脑补了一出大戏，觉得同学聚会也是骗她的。究竟是我真的错了还是她太小心眼了？'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '看隔壁的找对象要求，感叹街上的同学可能有些事不知道（内容引起极度舒适）', 'tags': ['极度舒适', '婚恋市场', '找不到女朋友', '负面榜样'], 'rid': '1d47c132-8594-4764-9b6a-8deede2de3a1', 'content': [{'type': 'text/plain', 'filename': '\u200b先说结论：婚恋市场真的会出现让你们大跌眼镜的情况，比如在街上看来的三分女农村家庭嫁了一个各方面都不错的男的。'}, {'type': 'text/plain', 'filename': '\u200b论据不用“我朋友”了，就说我吧：坐标上海，身高180CM，颜值基本路人。学历方面，某个211本科，正在想去考个研究生。经济方面，无车无房，年薪60+吧。性格方面，三观、待人接物、沟通能力、兴趣爱好这些都没什么问题，工作多年跟周围的同事朋友全部相处愉快。除了抽烟也没什么不良嗜好。家庭方面，没什么助力，但也没什么阻力。这种条件，能否达到BXJ“条件还凑合”的男性标准呢？'}, {'type': 'text/plain', 'filename': '\u200b好了，下面是重点了 找不到女朋友！找不到女朋友！找不到女朋友！原因？我也不知道，自我检讨了一下，大概是已经一年多两年没认识过新的“未婚单身妹子”了，这很抓狂。平常工作忙也没什么时间到处溜达。但真的，可能BXJ的大伙年龄不大感受不深，但像我这种30左右的，可能一不留神，身边就再没合适的对象了。虽然一个人过得也挺舒服的，但看到身边朋友纷纷开始晒娃，父母也催得越来越急，有时候也在想要不随便找个人娶了算了？如果以这种状态去相亲，是不会考虑类似于“女方学历如何收入如何家庭如何”之类的，也就是看着顺眼，对方对我不排斥，快速就娶了。为什么不呢？有时候可能相亲的时间都不充裕，仅此而已…'}, {'type': 'text/plain', 'filename': '\u200b所以啊，25左右的兄弟们 珍惜这种“环顾四周到处都是可撩妹子”的时光吧 看看我，负面榜样'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '关于前女友的事情，内容引起极度舒适', 'tags': ['前女友', '极度舒适', '渣男'], 'rid': 'c30101be-01a0-4a4b-9e39-a41c07780351', 'content': [{'type': 'text/plain', 'filename': '\u200b事情是这样的，lz家最近装修，今天骑车送给我家装修的一个阿姨回家拿工具，本来开心的以为可以秀一下车技，结果快到他家的时候才发现，他家就在我前女友家旁边。也是我嘴贱，说这旁边有几个同学还是我一届的，然后就提到了我前女友（简称X吧），她跟我说X之前跟她们班的一个同学谈恋爱，耽误了学习，后来那个男的考上了一本，而X自己却只考了个三本，然后那个男的嫌弃X学历没有自己高，高考之后就突然不理她了，我当然知道他说的是谁，可是，事情不是这样的啊。事实是，我和前女友初中谈恋爱，确实有点早哈，然后高中不在一个学校，高一的时候还挺好的，可是高二的时候我的一个同学跟我讲她把我绿了，我刚开始不信，后来证实了，确实是这样，我当时也没说什么，只是没理他，把她删了。就此大路朝天，各走一边。'}, {'type': 'text/plain', 'filename': '\u200b后来，大二的时候，她大一，她复习了一年，有一天她突然找我，聊了两句发现她的诚实竟然就在我的城市旁边，然后她突然跟我说让我做她男朋友，我。，。。我说 你是在玩大冒险吗   她说不是   然后我就没理他了   不得不说，我真的不会在回头喜欢她了，况且当时我和我现女友都快成了。OK 我现在有女朋友，而且很相爱。'}, {'type': 'text/plain', 'filename': '\u200b所以说到这，家人们，你们怎么看。'}, {'type': 'text/plain', 'filename': '\u200b我现在心情很复杂，为什么我就变成了一个彻彻底底的渣男了'}, {'type': 'text/plain', 'filename': '\u200b福利就算了吧，心情很不好。家人们见谅。 '}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}], 'Follow': [{'title': '内容绝对舒适 一口老血', 'tags': ['七夕', '礼物', '吵架', '分手', '女朋友'], 'rid': '2f407619-6032-4645-ab22-9a06bfea9adb', 'content': [{'type': 'text/plain', 'filename': '\u200b前天晚上下班回家，女朋友说七夕买的礼物到了，我挺开心的。表示了很开心，和感谢。准备提一局fifa然后说了晚上带他去看电影。打算回来慢慢拆，慢慢欣赏。结果她就开始不高兴了，作为一个直男，一开始真没意识到。后来觉得不对劲，就去问问。重点是一开始态度极好，本着有错就改，误会我的话加以注意的原则沟通。'}, {'type': 'text/plain', 'filename': '\u200b哄了两个小时，人家一言不发，玩手机，看书。后来心态崩了，让她把书放下，好好沟通一波。'}, {'type': 'text/plain', 'filename': '\u200b上手把她书抢下来了，我不是脾气暴躁啊，哄了十几次，两个多小时后才爆发的。后来她要回宿舍，楼主女朋友在校读研，还没毕业。'}, {'type': 'text/plain', 'filename': '非要自几打车回去，想想最近发生的事情 大晚上我也不敢让她自己回去啊。就开车把她送回学校了，心想冷静下来再当面哄，昨晚在她学校楼下两个多小时，不见，不接。今天发来截图。果断删微信，删电话，心态崩了。'}, {'type': 'text/plain', 'filename': '\u200b吐出来轻松多了'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '我该怎么办，内容引起舒适。', 'tags': ['女朋友', '自拍', '同学聚会'], 'rid': '3827aeca-4c4c-4473-8a0a-400d414c4098', 'content': [{'type': 'text/plain', 'filename': '和女朋友谈了快两年，感情一直挺好，虽然还没有见过双方父母，但是也在微信上加了好友，商量好今年过年见面。'}, {'type': 'text/plain', 'filename': '前两天高中同学聚会，也提前和她报备过了。当时她的态度就是有女的就不准去，不然就不放心我，后来和她好说歹说总算同意了。等到了聚会那天，见到了几个好几年没见的同学大家都很开心。有一个高中玩的最好的一个女同学这几年都没有联系过，然后就和她拍了三张自拍。当时我就想也不是用我手机拍的，我也没做出格的事，女朋友也不会知道。那天聚会我还怕女朋友不高兴，提前就走了。结果不知道怎么回事，今天她就搞到了那三张自拍，其中两张根本没有身体接触，有一张就肩膀靠在了一起。然后根本不给我解释的机会。说什么笑得这么开心，找人家过去吧。我就纳闷了，拍个照还得哭不成。完全不相信我，自己脑补了一出大戏，觉得同学聚会也是骗她的。究竟是我真的错了还是她太小心眼了？'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '看隔壁的找对象要求，感叹街上的同学可能有些事不知道（内容引起极度舒适）', 'tags': ['极度舒适', '婚恋市场', '找不到女朋友', '负面榜样'], 'rid': '1d47c132-8594-4764-9b6a-8deede2de3a1', 'content': [{'type': 'text/plain', 'filename': '\u200b先说结论：婚恋市场真的会出现让你们大跌眼镜的情况，比如在街上看来的三分女农村家庭嫁了一个各方面都不错的男的。'}, {'type': 'text/plain', 'filename': '\u200b论据不用“我朋友”了，就说我吧：坐标上海，身高180CM，颜值基本路人。学历方面，某个211本科，正在想去考个研究生。经济方面，无车无房，年薪60+吧。性格方面，三观、待人接物、沟通能力、兴趣爱好这些都没什么问题，工作多年跟周围的同事朋友全部相处愉快。除了抽烟也没什么不良嗜好。家庭方面，没什么助力，但也没什么阻力。这种条件，能否达到BXJ“条件还凑合”的男性标准呢？'}, {'type': 'text/plain', 'filename': '\u200b好了，下面是重点了 找不到女朋友！找不到女朋友！找不到女朋友！原因？我也不知道，自我检讨了一下，大概是已经一年多两年没认识过新的“未婚单身妹子”了，这很抓狂。平常工作忙也没什么时间到处溜达。但真的，可能BXJ的大伙年龄不大感受不深，但像我这种30左右的，可能一不留神，身边就再没合适的对象了。虽然一个人过得也挺舒服的，但看到身边朋友纷纷开始晒娃，父母也催得越来越急，有时候也在想要不随便找个人娶了算了？如果以这种状态去相亲，是不会考虑类似于“女方学历如何收入如何家庭如何”之类的，也就是看着顺眼，对方对我不排斥，快速就娶了。为什么不呢？有时候可能相亲的时间都不充裕，仅此而已…'}, {'type': 'text/plain', 'filename': '\u200b所以啊，25左右的兄弟们 珍惜这种“环顾四周到处都是可撩妹子”的时光吧 看看我，负面榜样'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '关于前女友的事情，内容引起极度舒适', 'tags': ['前女友', '极度舒适', '渣男'], 'rid': 'c30101be-01a0-4a4b-9e39-a41c07780351', 'content': [{'type': 'text/plain', 'filename': '\u200b事情是这样的，lz家最近装修，今天骑车送给我家装修的一个阿姨回家拿工具，本来开心的以为可以秀一下车技，结果快到他家的时候才发现，他家就在我前女友家旁边。也是我嘴贱，说这旁边有几个同学还是我一届的，然后就提到了我前女友（简称X吧），她跟我说X之前跟她们班的一个同学谈恋爱，耽误了学习，后来那个男的考上了一本，而X自己却只考了个三本，然后那个男的嫌弃X学历没有自己高，高考之后就突然不理她了，我当然知道他说的是谁，可是，事情不是这样的啊。事实是，我和前女友初中谈恋爱，确实有点早哈，然后高中不在一个学校，高一的时候还挺好的，可是高二的时候我的一个同学跟我讲她把我绿了，我刚开始不信，后来证实了，确实是这样，我当时也没说什么，只是没理他，把她删了。就此大路朝天，各走一边。'}, {'type': 'text/plain', 'filename': '\u200b后来，大二的时候，她大一，她复习了一年，有一天她突然找我，聊了两句发现她的诚实竟然就在我的城市旁边，然后她突然跟我说让我做她男朋友，我。，。。我说 你是在玩大冒险吗   她说不是   然后我就没理他了   不得不说，我真的不会在回头喜欢她了，况且当时我和我现女友都快成了。OK 我现在有女朋友，而且很相爱。'}, {'type': 'text/plain', 'filename': '\u200b所以说到这，家人们，你们怎么看。'}, {'type': 'text/plain', 'filename': '\u200b我现在心情很复杂，为什么我就变成了一个彻彻底底的渣男了'}, {'type': 'text/plain', 'filename': '\u200b福利就算了吧，心情很不好。家人们见谅。 '}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}], 'Trending': [{'title': '内容绝对舒适 一口老血', 'tags': ['七夕', '礼物', '吵架', '分手', '女朋友'], 'rid': '2f407619-6032-4645-ab22-9a06bfea9adb', 'content': [{'type': 'text/plain', 'filename': '\u200b前天晚上下班回家，女朋友说七夕买的礼物到了，我挺开心的。表示了很开心，和感谢。准备提一局fifa然后说了晚上带他去看电影。打算回来慢慢拆，慢慢欣赏。结果她就开始不高兴了，作为一个直男，一开始真没意识到。后来觉得不对劲，就去问问。重点是一开始态度极好，本着有错就改，误会我的话加以注意的原则沟通。'}, {'type': 'text/plain', 'filename': '\u200b哄了两个小时，人家一言不发，玩手机，看书。后来心态崩了，让她把书放下，好好沟通一波。'}, {'type': 'text/plain', 'filename': '\u200b上手把她书抢下来了，我不是脾气暴躁啊，哄了十几次，两个多小时后才爆发的。后来她要回宿舍，楼主女朋友在校读研，还没毕业。'}, {'type': 'text/plain', 'filename': '非要自几打车回去，想想最近发生的事情 大晚上我也不敢让她自己回去啊。就开车把她送回学校了，心想冷静下来再当面哄，昨晚在她学校楼下两个多小时，不见，不接。今天发来截图。果断删微信，删电话，心态崩了。'}, {'type': 'text/plain', 'filename': '\u200b吐出来轻松多了'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '我该怎么办，内容引起舒适。', 'tags': ['女朋友', '自拍', '同学聚会'], 'rid': '3827aeca-4c4c-4473-8a0a-400d414c4098', 'content': [{'type': 'text/plain', 'filename': '和女朋友谈了快两年，感情一直挺好，虽然还没有见过双方父母，但是也在微信上加了好友，商量好今年过年见面。'}, {'type': 'text/plain', 'filename': '前两天高中同学聚会，也提前和她报备过了。当时她的态度就是有女的就不准去，不然就不放心我，后来和她好说歹说总算同意了。等到了聚会那天，见到了几个好几年没见的同学大家都很开心。有一个高中玩的最好的一个女同学这几年都没有联系过，然后就和她拍了三张自拍。当时我就想也不是用我手机拍的，我也没做出格的事，女朋友也不会知道。那天聚会我还怕女朋友不高兴，提前就走了。结果不知道怎么回事，今天她就搞到了那三张自拍，其中两张根本没有身体接触，有一张就肩膀靠在了一起。然后根本不给我解释的机会。说什么笑得这么开心，找人家过去吧。我就纳闷了，拍个照还得哭不成。完全不相信我，自己脑补了一出大戏，觉得同学聚会也是骗她的。究竟是我真的错了还是她太小心眼了？'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '看隔壁的找对象要求，感叹街上的同学可能有些事不知道（内容引起极度舒适）', 'tags': ['极度舒适', '婚恋市场', '找不到女朋友', '负面榜样'], 'rid': '1d47c132-8594-4764-9b6a-8deede2de3a1', 'content': [{'type': 'text/plain', 'filename': '\u200b先说结论：婚恋市场真的会出现让你们大跌眼镜的情况，比如在街上看来的三分女农村家庭嫁了一个各方面都不错的男的。'}, {'type': 'text/plain', 'filename': '\u200b论据不用“我朋友”了，就说我吧：坐标上海，身高180CM，颜值基本路人。学历方面，某个211本科，正在想去考个研究生。经济方面，无车无房，年薪60+吧。性格方面，三观、待人接物、沟通能力、兴趣爱好这些都没什么问题，工作多年跟周围的同事朋友全部相处愉快。除了抽烟也没什么不良嗜好。家庭方面，没什么助力，但也没什么阻力。这种条件，能否达到BXJ“条件还凑合”的男性标准呢？'}, {'type': 'text/plain', 'filename': '\u200b好了，下面是重点了 找不到女朋友！找不到女朋友！找不到女朋友！原因？我也不知道，自我检讨了一下，大概是已经一年多两年没认识过新的“未婚单身妹子”了，这很抓狂。平常工作忙也没什么时间到处溜达。但真的，可能BXJ的大伙年龄不大感受不深，但像我这种30左右的，可能一不留神，身边就再没合适的对象了。虽然一个人过得也挺舒服的，但看到身边朋友纷纷开始晒娃，父母也催得越来越急，有时候也在想要不随便找个人娶了算了？如果以这种状态去相亲，是不会考虑类似于“女方学历如何收入如何家庭如何”之类的，也就是看着顺眼，对方对我不排斥，快速就娶了。为什么不呢？有时候可能相亲的时间都不充裕，仅此而已…'}, {'type': 'text/plain', 'filename': '\u200b所以啊，25左右的兄弟们 珍惜这种“环顾四周到处都是可撩妹子”的时光吧 看看我，负面榜样'}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}, {'title': '关于前女友的事情，内容引起极度舒适', 'tags': ['前女友', '极度舒适', '渣男'], 'rid': 'c30101be-01a0-4a4b-9e39-a41c07780351', 'content': [{'type': 'text/plain', 'filename': '\u200b事情是这样的，lz家最近装修，今天骑车送给我家装修的一个阿姨回家拿工具，本来开心的以为可以秀一下车技，结果快到他家的时候才发现，他家就在我前女友家旁边。也是我嘴贱，说这旁边有几个同学还是我一届的，然后就提到了我前女友（简称X吧），她跟我说X之前跟她们班的一个同学谈恋爱，耽误了学习，后来那个男的考上了一本，而X自己却只考了个三本，然后那个男的嫌弃X学历没有自己高，高考之后就突然不理她了，我当然知道他说的是谁，可是，事情不是这样的啊。事实是，我和前女友初中谈恋爱，确实有点早哈，然后高中不在一个学校，高一的时候还挺好的，可是高二的时候我的一个同学跟我讲她把我绿了，我刚开始不信，后来证实了，确实是这样，我当时也没说什么，只是没理他，把她删了。就此大路朝天，各走一边。'}, {'type': 'text/plain', 'filename': '\u200b后来，大二的时候，她大一，她复习了一年，有一天她突然找我，聊了两句发现她的诚实竟然就在我的城市旁边，然后她突然跟我说让我做她男朋友，我。，。。我说 你是在玩大冒险吗   她说不是   然后我就没理他了   不得不说，我真的不会在回头喜欢她了，况且当时我和我现女友都快成了。OK 我现在有女朋友，而且很相爱。'}, {'type': 'text/plain', 'filename': '\u200b所以说到这，家人们，你们怎么看。'}, {'type': 'text/plain', 'filename': '\u200b我现在心情很复杂，为什么我就变成了一个彻彻底底的渣男了'}, {'type': 'text/plain', 'filename': '\u200b福利就算了吧，心情很不好。家人们见谅。 '}], 'author_uid': '2d7132a8-f5ba-4aa7-a715-ee4cfc17a888'}]}, 'Masker': {'Recommend': [{'aid': '85490cca-aa23-4dcc-b405-c5d1b63eeaae', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '摸大腿', '饭局'], 'alias': ['公共知识分子', '作家'], 'name': '章文'}, {'aid': '6aec6bfc-fea5-4597-8801-48f933a5e8a9', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '白天约喝酒'], 'alias': ['章老师,章教授'], 'name': '章文'}, {'aid': '1f842212-94ba-460e-b0f5-861df6724b55', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['我是清白的', '两情相悦'], 'alias': [], 'name': '章文'}, {'aid': '2ed7dbf8-3dc0-4be1-b6fc-3e48913032d7', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['强奸', '媒体人', '时事评论员', '公知', '专栏作家', '饭局后'], 'alias': ['南京师范大学新闻学硕士'], 'name': '章文'}, {'aid': '21861956-7b20-405a-9fa6-86129b89c622', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['移民', '美国大使馆', '性骚扰'], 'alias': [], 'name': '章文'}], 'Follow': [{'aid': '85490cca-aa23-4dcc-b405-c5d1b63eeaae', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '摸大腿', '饭局'], 'alias': ['公共知识分子', '作家'], 'name': '章文'}, {'aid': '6aec6bfc-fea5-4597-8801-48f933a5e8a9', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '白天约喝酒'], 'alias': ['章老师,章教授'], 'name': '章文'}, {'aid': '1f842212-94ba-460e-b0f5-861df6724b55', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['我是清白的', '两情相悦'], 'alias': [], 'name': '章文'}, {'aid': '2ed7dbf8-3dc0-4be1-b6fc-3e48913032d7', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['强奸', '媒体人', '时事评论员', '公知', '专栏作家', '饭局后'], 'alias': ['南京师范大学新闻学硕士'], 'name': '章文'}, {'aid': '21861956-7b20-405a-9fa6-86129b89c622', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['移民', '美国大使馆', '性骚扰'], 'alias': [], 'name': '章文'}], 'Trending': [{'aid': '85490cca-aa23-4dcc-b405-c5d1b63eeaae', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '摸大腿', '饭局'], 'alias': ['公共知识分子', '作家'], 'name': '章文'}, {'aid': '6aec6bfc-fea5-4597-8801-48f933a5e8a9', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['性骚扰', '白天约喝酒'], 'alias': ['章老师,章教授'], 'name': '章文'}, {'aid': '1f842212-94ba-460e-b0f5-861df6724b55', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['我是清白的', '两情相悦'], 'alias': [], 'name': '章文'}, {'aid': '2ed7dbf8-3dc0-4be1-b6fc-3e48913032d7', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['强奸', '媒体人', '时事评论员', '公知', '专栏作家', '饭局后'], 'alias': ['南京师范大学新闻学硕士'], 'name': '章文'}, {'aid': '21861956-7b20-405a-9fa6-86129b89c622', 'mid': 'b78ce338-9f0d-4ba5-8cb2-f7ac6003fe9c', 'tags': ['移民', '美国大使馆', '性骚扰'], 'alias': [], 'name': '章文'}]}}
