# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from copy import deepcopy
import json
import requests

from utility import *
from decoy_data import *
from helper_functions import *
import time

url = "http://127.0.0.1:5000"


delete_all()

users_list = register_and_upgrade_decoy_users(93)

post_zhangwen_and_5_articles_and_46_comments_and_46_subcomments(users_list)
post_liuyuchen_and_5_articles_and_46_comments_and_46_subcomments(users_list)
post_13_roasts_and_46_comments_and_46_subcomments(users_list)

