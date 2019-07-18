# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import random
f = open("English_nicknames.txt","r")
# f_w = open("nicknames.txt","w")
nicknames = set()
line = f.readline() 
while f.readline():
  line = f.readline() 
  nicknames.add(line.strip())
f.close()
output = random.sample(nicknames, 1)[0]
print(output)
