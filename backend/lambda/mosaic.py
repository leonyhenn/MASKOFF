# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import random
import re
import math

# MOSAIC_SQUARE = "\uff0a"
MOSAIC_SQUARE = " * "

chinese_char_ranges = [
  {"from": ord(u"\u3300"), "to": ord(u"\u33ff")},         # compatibility ideographs
  {"from": ord(u"\ufe30"), "to": ord(u"\ufe4f")},         # compatibility ideographs
  {"from": ord(u"\uf900"), "to": ord(u"\ufaff")},         # compatibility ideographs
  {"from": ord(u"\U0002F800"), "to": ord(u"\U0002fa1f")}, # compatibility ideographs
  {'from': ord(u'\u3040'), 'to': ord(u'\u309f')},         # Japanese Hiragana
  {"from": ord(u"\u30a0"), "to": ord(u"\u30ff")},         # Japanese Katakana
  {"from": ord(u"\u2e80"), "to": ord(u"\u2eff")},         # cjk radicals supplement
  {"from": ord(u"\u4e00"), "to": ord(u"\u9fff")},
  {"from": ord(u"\u3400"), "to": ord(u"\u4dbf")},
  {"from": ord(u"\U00020000"), "to": ord(u"\U0002a6df")},
  {"from": ord(u"\U0002a700"), "to": ord(u"\U0002b73f")},
  {"from": ord(u"\U0002b740"), "to": ord(u"\U0002b81f")},
  {"from": ord(u"\U0002b820"), "to": ord(u"\U0002ceaf")}  # included as of Unicode 8.0
]

def is_cjk(char):
  return any([range["from"] <= ord(char) <= range["to"] for range in chinese_char_ranges])

def cjk_substrings(string):
  i = 0
  while i<len(string):
    if is_cjk(string[i]):
      start = i
      while i+1 < len(string) and (is_cjk(string[i+1])): 
        i += 1
      yield string[start:i+1]
    else:
      start = i
      while i+1 < len(string) and (not is_cjk(string[i+1])): 
        i += 1
      yield string[start:i+1]
    i += 1

def cjk_exist(string):
    i = 0
    while i<len(string):
        if is_cjk(string[i]):
            return True
        i += 1
    return False

def cjk_mosaic(string,chinese):
    if chinese:
        if len(string) == 1:
            return string
        elif len(string) == 2 or len(string) == 3:
            temp = list(string)
            temp[1] = MOSAIC_SQUARE
            string = "".join(temp)
            return string
        elif len(string) >= 4:
            if(len(string) == 4):
                rand_list = random.sample(range(1,4), 2)
            elif(len(string) == 5):
                rand_list = random.sample(range(1,5), 2)
            else:
                rand_list = random.sample(range(1,len(string)), 2)
            temp = list(string)
            for index in rand_list:
                temp[index] = MOSAIC_SQUARE
            string = "".join(temp)
            return string

    else:
        temp = list(string)
        for index in range(1,len(string)):
            temp[index] = MOSAIC_SQUARE   
        string = "".join(temp)
        return string+" "

def mosaic_contacts(contacts):
    wechat = contacts["wechat"]
    cellphone = contacts["cellphone"]
    other_key = contacts["other_key"]
    other_value = contacts["other_value"]
    contacts_list = [wechat,cellphone,other_value]
    for i in range(len(contacts_list)):
        mosaic_index = math.ceil(len(contacts_list[i]) / 2)
        temp = list(contacts_list[i])
        for index in range(len(contacts_list[i])):
            if not ((index == 0) or (index == len(contacts_list[i])-1)):
                temp[index] = MOSAIC_SQUARE
        contacts_list[i] = "".join(temp)
    contacts["wechat"] = contacts_list[0]
    contacts["cellphone"] = contacts_list[1]
    contacts["other_value"] = contacts_list[2]
    return contacts

def process_name_contacts(input_sentence,name,mosaic_name,contacts,mosaic_contacts):
    processed_sentence = re.sub(name,mosaic_name,input_sentence)
    processed_sentence = re.sub(contacts["wechat"],mosaic_contacts["wechat"],processed_sentence)
    processed_sentence = re.sub(contacts["cellphone"],mosaic_contacts["cellphone"],processed_sentence)
    processed_sentence = re.sub(contacts["other_value"],mosaic_contacts["other_value"],processed_sentence)
    return processed_sentence