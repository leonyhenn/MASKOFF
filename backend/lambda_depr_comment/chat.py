# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from utility import message
import leancloud
import hmac, hashlib
from flask import make_response, jsonify
from time import time
from random import randint

def sign(msg, k):
    # return hmac.new(k, msg, hashlib.sha1).digest().encode('hex')
    return hmac.new(k, msg, hashlib.sha1).digest().hex()

def chat_login_signiture(client_id):
  timestamp = str(int(time()))
  nonce = str(randint(10000, 99999))
  data = "PLACEHOLDER_FOR_GITHUB"+":"+client_id+"::"+ timestamp +":"+ nonce
  data_b = bytes(data,"utf-8")
  signiture = sign(data_b, b'PLACEHOLDER_FOR_GITHUB')
  print(signiture)
  return make_response(jsonify({"signiture":signiture,
                                "nonce":nonce,
                                "timestamp":timestamp,
                                "msg":data}),200)

  

