# Copyright (C) Heng Ye - All Rights Reserved
# Unauthorized copying of this file, via any medium is strictly prohibited
# Proprietary and confidential
# Written by Heng Ye <leonyhenn@gmail.com>, July 2019
# Emoji List
# Slightly Smiling Face 🙂 \U0001f642
# Disappointed Face 😞 \U0001f61e
# Grinning Face 😀 \U0001f600



Eng = {
       "Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642":"Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642",
       "SMS request too often, please request a few minutes later \U0001f642":"SMS request too often, please request a few minutes later \U0001f642",
       "Something is wrong with our SMS service, please request a few minutes later \U0001f642":"Something is wrong with our SMS service, please request a few minutes later \U0001f642",
       "Verification code sent! \U0001f600":"Verification code sent! \U0001f600",
       "Wrong password \U0001f61e":"Wrong password \U0001f61e",
       "User does not exist \U0001f61e":"User does not exist \U0001f61e",
       "User already exist \U0001f600":"User already exist \U0001f600",
       "Verification succeed, access granted \U0001f600":"Verification succeed, access granted \U0001f600",
       "EmailSent_1":"Phone verification succeed! already sent an email verification to ",
       "EmailSent_2":" , please enter the verification code in the Email in the next page. \U0001f642",
       "Verification_failed":"Verification failed \U0001f61e",
       "Mulformed_Email_Address":"Mulformed Email Address \U0001f61e",
       "No_followed":"You have not followed any roast \U0001f642"
       }
Chi = {
       "Our server is complaining \U0001f61e, this bug is already being recoreded \U0001f642":"服务器出了点问题 \U0001f61e, 这个bug已经被滤茶记录下啦 \U0001f642",
       "SMS request too often, please request a few minutes later \U0001f642":"验证短信请求太频繁, 请等几分钟再进行下一次请求 \U0001f642",
       "Something is wrong with our SMS service, please request a few minutes later \U0001f642":"我们的SMS服务出了一点问题, 请等几分钟再进行下一次请求 \U0001f642",
       "Verification code sent! \U0001f600":"验证码已发送! \U0001f600",
       "Wrong password \U0001f61e":"密码错误 \U0001f61e",
       "User does not exist \U0001f61e":"用户不存在 \U0001f61e",
       "User already exist \U0001f600":"用户已存在 \U0001f600",
       "Verification succeed, access granted \U0001f600":"已验证, 准入! \U0001f600",
       "EmailSent_1":"手机验证成功! 已经将一封带有邮箱验证码的邮件发送至 ",
       "EmailSent_2":" , 请在下一个页面输入邮箱验证码. \U0001f642",
       "Verification_failed":"验证失败 \U0001f61e",
       "Mulformed_Email_Address":"Email格式不正确,发送失败",
       "No_followed":"你还没有追踪任何一个吐槽呢 \U0001f642"
      }

def getLans(keyword,language=None):
  if(language == "Eng"):
    return Eng[keyword]
  return Chi[keyword]
