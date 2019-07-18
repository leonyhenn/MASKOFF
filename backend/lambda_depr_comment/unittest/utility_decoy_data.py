import boto3
from flask import jsonify
import hashlib
import jwt
import time

DYNAMODB = boto3.resource('dynamodb')
USERS = DYNAMODB.Table('users')
MASKERS = DYNAMODB.Table('maskers')
ARTICLES = DYNAMODB.Table('articles')
ROASTS = DYNAMODB.Table('roasts')
COMMENTS = DYNAMODB.Table('comments')

SECRET = "takeyourproteinpillsandputyourhelmeton_YouonlygetoneshotdonotmissyourchancetoblowThisopportunitycomesonceinalifetime"
EXPIRE_ELAPSE = 86400 * 365 * 10
SALT = 'SimonaWishIwassoberSoIcouldseeclearlynowTherainhasgone'

def generateAccessToken(uid):
    '''
    compute and send a unique access token to user
    '''
    #jwt.decode(access_token, 'secret', algorithms=['HS256'])
    now = time.time()
    access_token = jwt.encode({"uid":str(uid),
                               "exp":now+EXPIRE_ELAPSE},SECRET,algorithm='HS256')
    return access_token.decode('ascii')

def encrypt(info):
    '''
    SHA512 + const salt now.

    how to check password:
    bcrypt.checkpw(password, hashed)
    '''
    return hashlib.sha512(bytes(info,'utf-8')+bytes(SALT,'utf-8')).hexdigest()

