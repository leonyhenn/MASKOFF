/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  1.change sound to webview and html5
  2. Detach 之后重新检查location permission

  2019.Jan.01
*/
//Expo
import { SQLite,
         SecureStore,
         Font } from 'expo';

//Utility
import { MESSAGE_SOUND } from '../utility/Util.js'

//Language
import { Lan, 
         setLanDict } from '../utility/Languages.js';

//Redux
import { store } from '../store/store.js';
import { loadOldConversation } from '../store/actions.js';
export async function Init_local_settings(){
  try{
    global.sqlitedb = SQLite.openDatabase('sqlitedb');

    global.sqlitedb.transaction(tx => {
      // tx.executeSql(
      //   'drop table conversations',
      //   [],
      //   ()=>console.log("DROPPED"),
      //   ()=>console.log("DROP FAILED")
      // );
      // tx.executeSql(
      //   'drop table messages',
      //   [],
      //   ()=>console.log("DROPPED"),
      //   ()=>console.log("DROP FAILED")
      // );
      
      //init messages table
      tx.executeSql(
        'create table if not exists messages (id text primary key not null, cid text, content text, sender text, timestamp text,filelocaluri text, message text,status text);'
      );

      //init conversation table
      tx.executeSql(
        'create table if not exists conversations (id text primary key not null, creator text, lastMessage_text text, lastMessage text,lastMessageAt text,members text,muted text,name text,conversation text,unread integer);',
        [],
      );
      
      //load old conversations
      tx.executeSql('select * from conversations ORDER BY lastMessageAt DESC', [], async (_, { rows }) =>{
        // console.log(JSON.stringify(rows))
        await store.dispatch(loadOldConversation(rows._array.map(conversation => {
          var unread = conversation.unread
          conversation = JSON.parse(conversation.conversation)
          Object.assign(conversation,{unread:unread})
          return conversation
        }))) 
      },
        (transaction,error) => console.error(error)
      );
    });
  
    
    //当地设置
    global.local_settings = await SecureStore.getItemAsync("local_settings");
    if(global.local_settings == undefined){
      await SecureStore.setItemAsync("local_settings",JSON.stringify({Language_Conversion_Switch:false,
                                                     Notification_Sound_Switch:false,
                                                     Notification_Vibration_Switch:false})).catch(error => console.error(error.message))
      global.local_settings = await SecureStore.getItemAsync("local_settings");
    }
    global.local_settings = JSON.parse(global.local_settings)
    global.local_settings.Language_Conversion_Switch?global.language = "English" : global.language = "Chinese"
    
    setLanDict(global.language)
    
    global.ec2 = "PLACEHOLDER_FOR_GITHUB"
    global.server = "PLACEHOLDER_FOR_GITHUB"
    global.bucket = "PLACEHOLDER_FOR_GITHUB" 

    
      //字体
      await Font.loadAsync({
        Arial: require("../assets/fonts/arial.ttf"),
        Tencent:require('../assets/fonts/TTTGB-Medium180130.ttf'),
      });
    
      //铃声
      await MESSAGE_SOUND.loadAsync(require('../assets/sounds/definite.mp3'));

    }catch(error){
      console.error(error)
    }
}