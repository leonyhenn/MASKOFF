/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
fetch = require('node-fetch')

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

async function test_send(){
  tom = await realtime.createIMClient('Tom')
  conversation = await tom.createConversation({
    members: ['Jerry'],
    name: 'Tom & Jerry',
    unique: true
  });
  // response = await conversation.send(new TextMessage(new Date().toString()));  
  // realtime.createIMClient('Tom').then(function (host) {
  //     return host.createConversation({
  //         members: ['Jerry'],
  //         name: 'Tom & Jerry',
  //         unique: true
  //     });
  // }).then(function (conversation) {
  //     console.log(conversation.id);
  //     return conversation.send(new TextMessage('耗子，今晚有比赛，我约了 Kate，咱们仨一起去酒吧看比赛啊？！'), {
  //         pushData: {
  //             "alert": "您有一条未读的消息",
  //             "category": "消息",
  //             "badge": 1,
  //             "sound": "声音文件名，前提在应用里存在",
  //             "custom-key": "由用户添加的自定义属性，custom-key 仅是举例，可随意替换"
  //         }
  //     });
  // }).then(function (message) {
  //     console.log(message);
  // }).catch(console.error);
 
  
  // var new_message = new TextMessage("去吃华北美食啊")
  // response = await conversation.send(new_message);
  // response = await conversation.send(new TextMessage(new Date().toString()));
  // response = await conversation.send(new TextMessage(new Date().toString()));
  // response = await conversation.send(new TextMessage(new Date().toString()));
  

  // var file = new AV.File.withURL('chengxiao', 'https://s3.ca-central-1.amazonaws.com/maskoff/29c5e0b2-01a0-48d9-92f9-7b14988e4c99.png');
  // response = await file.save()
  // var message = new ImageMessage(file);
  // response = await conversation.send(message);
  // var file = new AV.File.withURL('homework', 'https://web.stanford.edu/class/cs193p/cgi-bin/.../assignments/Assignment%202_3.pdf');
  // response = await file.save()
  // var message = new FileMessage(file);
  // response = await conversation.send(message);
  // var file = new AV.File.withURL('rabbit', 'http://d23dyxeqlo5psv.cloudfront.net/big_buck_bunny.mp4');
  // response = await file.save()
  // var message = new VideoMessage(file);
  // response = await conversation.send(message);
  var location = new AV.GeoPoint(31.3753285,120.9664658);
  var message = new LocationMessage(location);
  response = await conversation.send(message);
  console.log(response)
}

async function test_get(){
  realtime.createIMClient('Tom').then(function(tom) {
  tom.on(Event.MESSAGE, function(message, conversation) {
    console.log('[Bob] received a message from [' + message.from + ']: ' + message.text);
    // 收到消息之后一般的做法是做 UI 展现，示例代码在此处做消息回复，仅为了演示收到消息之后的操作，仅供参考。
  });
}).catch(console.error);
  
}

// test_get()

test_send()



