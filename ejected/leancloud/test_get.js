/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
fetch = require('node-fetch')
var server = "PLACEHOLDER_FOR_GITHUB"
var { Realtime, TextMessage, Event } = require('leancloud-realtime');
var { TypedMessagesPlugin, ImageMessage, FileMessage , AudioMessage, VideoMessage, LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

var AV = require('leancloud-storage');
AV.init({
  appId: 'PLACEHOLDER_FOR_GITHUB', 
  appKey:'PLACEHOLDER_FOR_GITHUB',
});
var realtime = new Realtime({
  appId: 'PLACEHOLDER_FOR_GITHUB',
  appKey: 'PLACEHOLDER_FOR_GITHUB',
  plugins: [TypedMessagesPlugin], 
});
var signatureFactory = async function() {
  response = await fetch(server + "/chat/login_sign/Tom")
  json = await response.json;
  return json
};


async function test_get(){
  realtime.createIMClient('Tom').then(function(tom) {
  tom.on(Event.MESSAGE, function(message, conversation) {
    console.log('[Bob] received a message from [' + message.from + ']: ' + message.text);
    // 收到消息之后一般的做法是做 UI 展现，示例代码在此处做消息回复，仅为了演示收到消息之后的操作，仅供参考。
  });
}).catch(console.error);
  
}

test_get()
// async function gert(){
//   response =  await fetch(server + "/chat/login_sign/Tom")
//   json = await response.json()
//   console.log(json)
//   return
// }

// gert()
