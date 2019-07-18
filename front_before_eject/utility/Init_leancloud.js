/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  1. change sound to HTML5 and webview on android
  2. delete Transient Messages or implement it
  3. on 259, comment out unreadmessage count. delete if it do not cause any trouble

  2019.Jan.01
*/


//Official modules
import { Vibration, 
         Audio } from 'react-native'

//Redux
import { store } from '../store/store.js';
import { addConversation,
         addMessage,
         changeLeancloudStatus } from '../store/actions.js';

//Utility
import { MESSAGE_VIBRATION_PATTERN,
         MESSAGE_SOUND } from '../utility/Util.js'



//Leancloud
var { Realtime, 
      TextMessage, 
      Event, 
      TypedMessage, 
      messageField, 
      messageType} = require('leancloud-realtime');
      
var { TypedMessagesPlugin, 
      ImageMessage, 
      FileMessage, 
      AudioMessage, 
      VideoMessage, 
      LocationMessage } = require('leancloud-realtime-plugin-typed-messages');
var AV = require('leancloud-storage');
AV.init({
  appId: 'PLACEHOLDER_FOR_GITHUB', 
  appKey:'PLACEHOLDER_FOR_GITHUB',
});
var realtime = new Realtime({
  appId: 'PLACEHOLDER_FOR_GITHUB',
  appKey: 'PLACEHOLDER_FOR_GITHUB',
  plugins: [TypedMessagesPlugin], 
  pushOfflineMessages: true,
});
@messageType(1)
@messageField('op')
class OperationMessage extends TypedMessage {}
realtime.register(OperationMessage);

export async function Init_leancloud(){
    //聊天数据库
    

    //leancloud
    global.IMClientName = "Jerry"
    // global.IMClient = await realtime.createIMClient(global.IMClientName,{
    //   signatureFactory:signatureFactory,
    //   tag: 'Mobile',
    // }).catch(error => console.error(error.message));
    global.IMClient = await realtime.createIMClient(global.IMClientName)

    const that = this;
    realtime.createIMClient(global.IMClientName).then(function(client) {
      client.on(Event.MESSAGE, async function(message, conversation) {
        var file;
          switch (message.type) {
            case TextMessage.TYPE:
              // console.log('收到文本消息， text: ' + message.getText() + ', msgId: ' + message.id);
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case FileMessage.TYPE:
              file = message.getFile(); 
              // console.log('收到文件消息，url: ' + file.url() + ', size: ' + file.metaData('size'));
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case ImageMessage.TYPE:
              file = message.getFile();
              // console.log('收到图片消息，url: ' + file.url() + ', width: ' + file.metaData('width'));
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case AudioMessage.TYPE:
              file = message.getFile();
              // console.log('收到音频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case VideoMessage.TYPE:
              file = message.getFile();
              // console.log('收到视频消息，url: ' + file.url() + ', width: ' + file.metaData('duration'));
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case LocationMessage.TYPE:
              var location = message.getLocation();
              // console.log('收到位置消息，latitude: ' + location.latitude + ', longitude: ' + location.longitude);
              if(global.local_settings.Notification_Vibration_Switch){
                Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
              }
              if(global.local_settings.Notification_Sound_Switch){
                try{
                  await MESSAGE_SOUND.setPositionAsync(0);
                  await MESSAGE_SOUND.playAsync();
                } catch (error) {
                  console.error(error)
                }
              }
              await store.dispatch(addConversation(conversation))
              await store.dispatch(addMessage(message))
              break;
            case OperationMessage.TYPE:
              // console.log('收到暂态消息，url: ' + message.getText() + ', msgId: ' + message.id);
              break;
            default:
              // console.warn('收到未知类型消息');
          }
      });
      // client.on(Event.UNREAD_MESSAGES_COUNT_UPDATE, function(conversations) {
      //   for(let conv of conversations) {
      //     // console.log(conv.id, conv.name, conv.unreadMessagesCount);
      //   }
      // });
      client.on(Event.DISCONNECT,async function() {
        await store.dispatch(changeLeancloudStatus("inactive"))
        console.log('服务器连接已断开');
      });
      client.on(Event.OFFLINE, async function() {
        await store.dispatch(changeLeancloudStatus("inactive"))
        console.log('离线（网络连接已断开）');
      });
      client.on(Event.ONLINE, async function() {
        await store.dispatch(changeLeancloudStatus("active"))
        console.log('已恢复在线');
      });
      client.on(Event.SCHEDULE, function(attempt, delay) {
        console.log(delay + 'ms 后进行第' + (attempt + 1) + '次重连');
      });
      client.on(Event.RETRY, async function(attempt) {
        await store.dispatch(changeLeancloudStatus("retrying"))
        console.log('正在进行第' + (attempt + 1) + '次重连');
      });
      client.on(Event.RECONNECT, async function() {
        await store.dispatch(changeLeancloudStatus("active"))
        console.log('与服务端连接恢复');
      });
    }).catch((e) => {
      console.log("message error =>" + e);
    });
}