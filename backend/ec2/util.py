# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
import uuid
def newFileName():
	return str(uuid.uuid1())
def getUID(smacc,smacc_type):
	return users.find_one({"smacc":smacc,"smacc_type":smacc_type})["_id"]
ios_video = ["m4v","mp4","mov","avi"]
android_video = ["3gp","mp4","mkv"]
video_format = ios_video + android_video
ios_image = ["png", "jpg", "jpeg", "bmp", "gif", "psd" ]
android_image = ["png", "jpg", "jpeg", "bmp", "gif", "webp"]
special_image_format = ["psd","webp"]
image_format = ios_image + android_image