# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
#!/bin/sh
cd venv/lib/python3.6/site-packages/
zip -r9 ../../../../MASKOFF.zip .
cd ../../../..
zip -g MASKOFF.zip app.py 
zip -g MASKOFF.zip arial.ttf
zip -g MASKOFF.zip articles.py
zip -g MASKOFF.zip chat.py
zip -g MASKOFF.zip Chinese_nickname.py
zip -g MASKOFF.zip comments.py
zip -g MASKOFF.zip comments_nicknames.py
zip -g MASKOFF.zip English_nickname.py
zip -g MASKOFF.zip likes.py 
zip -g MASKOFF.zip maskers.py 
zip -g MASKOFF.zip roasts.py 
zip -g MASKOFF.zip upload.py 
zip -g MASKOFF.zip users.py 
zip -g MASKOFF.zip utility.py 