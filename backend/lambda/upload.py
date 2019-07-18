# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
from flask import request, make_response, jsonify
from utility import BUCKET_NAME, check_user_write_access, message, s3, err_message
import math
import uuid
import json
from decimal import Decimal
from PIL import Image, ImageDraw, ImageFont, ImageEnhance
import io
import time
FONT = './arial.ttf'
from leancloud import cloud
# import leancloud
# import logging
# logging.basicConfig(level=logging.DEBUG)

def upload_upload():
    leancloud.init("a56mdcj1bSq4XJAjjdAD32Sc-MdYXbMMI", "7XfWxE2al2Smj8pvvPJXXXas")
    try:
        start_time = time.time()

        cloud.request_sms_code("6479862310",idd="+1")
        elapsed_time = time.time() - start_time
        print(elapsed_time)

    except Exception as e:
        if(e.code == 601):
            return message(429,"request too often")
        if(e.code == 603):
            return message(424,"wrong verification code")
        return err_message(e)
    return message(200,str(elapsed_time))
    # '''
    # user do not need to have access to post on s3 bucket.

    # return key in s3 bucket.
    # '''

    # # check file exist in request 
    
    # if (not request.files or not request.files["file"]):
    #     return message(400,"no file found in request")
    # file = request.files.get("file")
    
    # # check filename exist in request

    # if (not request.form or not "filename" in request.form):
    #     return message(400,"no filename found in this requst")
    # filename = request.form["filename"]
    
    # print(filename.split("."))
    
    # # check filename has extension
    # if len(filename.split(".")) < 2:
    #     return message(400,"no file extension found in filename")
    
    # # form new filename
    # result = image_resize_max_2048(file)
    # if (not isinstance(result,list)):
    #     return result

    # # put new file in to s3 bucket
    # return make_response(jsonify({"message":"upload done",
    #                               "filename":result}),200)

# assume all other stuff are parsed by parent function. This function only handles uploads.
# content: dict of content
# files: ImmutableDict
# def upload_multi():
def upload_multi(content,files):
    # # testing purpose code
    # files = request.files
    # masker = json.loads(request.form["masker"])
    # content = masker["content"]
    # # testing purpose code    
    
    for i in range(len(content)):
        if("video" in content[i]["type"].lower() or "image" in content[i]["type"].lower()):
            if ("filename" not in content[i]
                or not (isinstance(content[i]["filename"],str)
                or (isinstance(content[i]["filename"],dict) and content[i]['type'] == "location")
                or (isinstance(content[i]["filename"],list) and content[i]['type'] == "vote"))):
                return message(400,"lack of content info")
    
            if ("video" in content[i]["type"].lower()):
                if not str(i) in files:
                    return message(400,"lack of file")
                file = files[str(i)]
                
                filename = file.filename
                if len(filename.split(".")) < 2:
                    return message(400,"no file extension found in filename")
                new_filename = str(uuid.uuid4())
                file_extension = filename.split(".")[-1]
                new_filename += "." + file_extension
                try:
                    response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=file,ACL='public-read')
                    content[i]["filename"] = new_filename
                except Exception as e:
                    return err_message(e)
            elif("image" in content[i]["type"].lower()):
                if not str(i) in files:
                    return message(400,"lack of file")
                file = files[str(i)]
                
                filename = file.filename
                if len(filename.split(".")) < 2:
                    return message(400,"no file extension found in filename")
    
                result = image_resize_max_2048(file)
                if (not isinstance(result,list)):
                    return result
                content[i]["filename"] = result
            
        elif(content[i]["type"].lower() == "location"):
            if(not content[i]["latitude"]
                or not isinstance(content[i]['latitude'],float)
                or not content[i]['longitude']
                or not isinstance(content[i]['longitude'],float)):
                return message(400,"wrong type in location")
            content[i]['latitude'] = Decimal(str(content[i]['latitude']))
            content[i]['longitude'] = Decimal(str(content[i]['longitude']))
        if(content[i]["type"].lower() == "vote"):
            if(not isinstance(content[i]["options"],list)
                or not len(content[i]['options']) >= 2 ):
                return message(400,"wrong type in location")
            content[i]["vote_id"] = str(uuid.uuid4())
    return content
    # return make_response(jsonify({"message":"done",
    #                               "content":content}),200)


def image_resize_max_2048(file):
    im = Image.open(file)
    filename = file.filename
    if len(filename.split(".")) < 2:
        return message(400,"no file extension found in filename")
    
    file_extension = filename.split(".")[-1]
    img_width, img_height = im.size
    
    
    #tested - 2
    if(img_height > 2048 and img_width > 2048):
        img_height = math.floor(img_height * (2048 / float(img_width)))
        img_width = 2048
        
        if(img_height > 2048):
            #裁成几节
            num_of_parts = math.ceil(img_height / float(2048))
            new_pictures_dimensions = []
            for i in range(num_of_parts - 1):
                new_pictures_dimensions.append((2048,img_width))
            new_pictures_dimensions.append((img_height % 2048,img_width))
            
            new_pictures = []
            for i in range(len(new_pictures_dimensions) - 1):
                left = 0
                top = i*2048
                right = new_pictures_dimensions[i][1]
                bottom = (i+1)*2048
                new_pictures.append(im.crop((left,top,right,bottom)))
            left = 0
            top = img_height - (img_height % 2048)
            right = img_width
            bottom = img_height
            new_pictures.append(im.crop((left,top,right,bottom)))
            new_pictures_names = []
            for new_picture in new_pictures:
                new_filename = str(uuid.uuid4())
                new_filename += "." + file_extension
                new_pictures_names.append(new_filename)
                try:
                    in_mem_file = io.BytesIO()
                    new_picture = add_watermark(new_picture)
                    new_picture.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
                    response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
                    
                except Exception as e:
                    return err_message(e)
            return new_pictures_names
        
        #tested - 2
        else:
            
            size = 2048,2048
            im.thumbnail(size, Image.ANTIALIAS)
            new_filename = str(uuid.uuid4())
            new_filename += "." + file_extension
            
            try:
                in_mem_file = io.BytesIO()
                im = add_watermark(im)
                im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
                
                response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')

                
            except Exception as e:
                return err_message(e)
            return [new_filename]


            
    
    #tested - 2
    elif(img_height > 2048 and img_width <= 2048):
        #裁成几节
        num_of_parts = math.ceil(img_height / float(2048))
        new_pictures_dimensions = []
        for i in range(num_of_parts - 1):
            new_pictures_dimensions.append((2048,img_width))
        new_pictures_dimensions.append((img_height % 2048,img_width))
        
        new_pictures = []
        for i in range(len(new_pictures_dimensions) - 1):
            left = 0
            top = i*2048
            right = new_pictures_dimensions[i][1]
            bottom = (i+1)*2048
            new_pictures.append(im.crop((left,top,right,bottom)))
        left = 0
        top = img_height - (img_height % 2048)
        right = img_width
        bottom = img_height
        new_pictures.append(im.crop((left,top,right,bottom)))
        new_pictures_names = []
        for new_picture in new_pictures:
            new_filename = str(uuid.uuid4())
            new_filename += "." + file_extension
            new_pictures_names.append(new_filename)
            try:
                in_mem_file = io.BytesIO()
                new_picture = add_watermark(new_picture)
                new_picture.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
                response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
                
            except Exception as e:
                return err_message(e)
        return new_pictures_names
    
    #tested - 2
    elif(img_height <= 2048 and img_width > 2048):
        # img_height = math.floor(img_height * (2048 / float(img_width)))
        # img_width = 2048
        size = 2048, 2048
        im.thumbnail(size, Image.ANTIALIAS)
        new_filename = str(uuid.uuid4())
        new_filename += "." + file_extension
        try:
            in_mem_file = io.BytesIO()
            im = add_watermark(im)
            im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
            
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
            
            
        except Exception as e:
            return err_message(e)
        return [new_filename]
        
    
    #tested - 2
    elif(img_height <= 2048 and img_width <= 2048):
        new_filename = str(uuid.uuid4())
        new_filename += "." + file_extension
        try:
            
            in_mem_file = io.BytesIO()
            
            im = add_watermark(im)
            
            im.save(in_mem_file,format = 'JPEG' if file_extension.lower() == 'jpg' else file_extension.upper())
            
            response = s3.Bucket(BUCKET_NAME).put_object(Key=new_filename, Body=in_mem_file.getvalue(),ACL='public-read')
            
        except Exception as e:
            return err_message(e)
        return [new_filename]

def add_watermark(img, text="MASKOFF", out_file='/Users/study/Desktop/watermark.jpg', angle=23, opacity=0.5):
    
    watermark = Image.new('RGBA', img.size, (0,0,0,0))
    
    size = 2
    
    n_font = ImageFont.truetype(FONT, size)
    
    n_width, n_height = n_font.getsize(text)

    while n_width+n_height < watermark.size[0]:
        size += 2
        n_font = ImageFont.truetype(FONT, size)
        n_width, n_height = n_font.getsize(text)
    
    draw = ImageDraw.Draw(watermark, 'RGBA')
    
    draw.text(((watermark.size[0] - n_width) / 2,
              (watermark.size[1] - n_height) / 2),
              text, font=n_font)
    
    watermark = watermark.rotate(angle,Image.BICUBIC)
    
    alpha = watermark.split()[3]
    
    alpha = ImageEnhance.Brightness(alpha).enhance(opacity)
    
    watermark.putalpha(alpha)
    
    img = Image.composite(watermark, img, watermark)
    return img