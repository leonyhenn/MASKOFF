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
  tom = await realtime.createIMClient('maskoff_admin')
  conversation = await tom.createConversation({
    members: ['Jerry'],
    name: 'System Message',
    unique: true
  })
  response = await conversation.send(new TextMessage("欢迎使用MASKOFF! "));
  

  // var file = new AV.File.withURL('cheng_xiao', 'https://img1.utuku.china.com/uploadimg/ent/20180122/34a9524e-22ad-4657-966e-97145ef8f101.jpg');
  // response = await file.save()
  // var message = new ImageMessage(file);
  
  // var file = new AV.File.withURL('cheng_xiao', 'https://web.stanford.edu/class/cs193p/cgi-bin/.../assignments/Assignment%202_3.pdf');
  // response = await file.save()b
  // var message = new FileMessage(file);

  // var location = new AV.GeoPoint(31.3753285,120.9664658);
  // var message = new LocationMessage(location);
  // message.setText('发自我的小米mix2s');
  // message.setAttributes({ location: '旧金山' });
  // response = await this.conversation.send(message);
  // console.log(response)
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



