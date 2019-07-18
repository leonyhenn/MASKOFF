/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import { combineReducers,
				 createStore } from 'redux'

import { GET_MASKER_INFO,
		 		 ADD_INFO_TO_POST,
		 		 REMOVE_INFO_FROM_POST,
		 		 CLEAR_CACHE,
		 		 SEARCH_KEYWORD,
		 		 SWITCH_RESULT_RECOMMEND,
		 		 LOAD_SEARCH_RESULT,
		 		 SHOW_TAB_BAR,
		 		 UPDATE_INFO_TO_POST,
		 		 ADD_CONVERSATION,
         LOAD_OLD_CONVERSATION,
         REMOVE_CONVERSATION,
		 		 REMOVE_UNREAD,
         ADD_MESSAGE,
		 		 ADD_MESSAGE_RIGHT_SENDING,
         ADD_MESSAGE_RIGHT_SENT,
         LOAD_OLD_MESSAGE,
		 		 NEW_SEARCH_RESULTS,
		 		 ADD_TO_SEARCH_RESULTS,
		 		 PUSH_FRONTPAGE,
		 		 LOAD_POST_MASKER,
		 		 LOAD_POST_ROAST,
         UPDATE_CHAT_PAGE_LOCATION,
         CONFIRM_CHAT_PAGE_LOCATION_SEND,
         RESET_CHAT_PAGE_LOCATION_SEND,
         REMOVE_VOTE_BAR,
         RECORD_VOTE,
         LOAD_VOTE,
         CLEAR_CACHE_VOTE,
         CHANGE_LEANCLOUD_STATUS } from './actions.js'


var { TypedMessagesPlugin, ImageMessage, FileMessage , AudioMessage, VideoMessage, LocationMessage } = require('leancloud-realtime-plugin-typed-messages');
const merge = (prev, next) => Object.assign({}, prev, next)
const merge_array = (prev, next) => Object.assign([], prev, next)
function remove(array, element){
    const index = array.indexOf(element);
    if (index !== -1) {
        array.splice(index, 1);
    }
}
function prepend(array,value) {
  array.unshift(value);
}
const getMaskerInfoReducer = (state=[],action) => {
	if (action.type === GET_MASKER_INFO){
		return merge_array(state,action.payload)
	} 
	return state
}

const postReducer = (state={content:[{info_index:0,
                                     	info_type:"ToolBar"}],
                            name:"",
                            title:"",
                            alias:[],
                            tags:[],
                            },action) => {
	if (action.type === ADD_INFO_TO_POST){
		if (["Location","Vote","Text","Photo","Video","ToolBar"].indexOf(action.payload.info_type) > -1){

			index = action.payload.info_index
			newState = {...state}
			front = newState.content.slice(0,index)
			back = newState.content.slice(index)
			for (var i=0;i<back.length;i++){
				back[i].info_index += 1
			}
			now = [action.payload]
			newContent = front.concat(now.concat(back))
			newState.content = newContent
		}else if(action.payload.info_type == "name"){
			newState = {...state}
			newState.name = action.payload.info
		}else if(action.payload.info_type == "alias"){
			newState = {...state}
			newState.alias = action.payload.info
		}else if(action.payload.info_type == "tags"){
			newState = {...state}
			newState.tags = action.payload.info
		}else if(action.payload.info_type == "title"){
			newState = {...state}
			newState.title = action.payload.info
		}
		return newState
	}else if (action.type === UPDATE_INFO_TO_POST){
    
		index = action.payload.info_index
		newState = {...state}
		newState.content[index] = action.payload
		return newState
	}else if (action.type === REMOVE_INFO_FROM_POST) {
		index = action.payload.info_index
		newState = {...state}
		for (var i=index+2;i<newState.content.length;i++){
			newState.content[i].info_index -= 2
		}
		newState.content.splice(index,1)
		newState.content.splice(index,1)
		return newState
	}else if (action.type == CLEAR_CACHE) {
		return {content:[{info_index:0,
                      info_type:"ToolBar"}],
            	name:"",
           	 title:"",
             alias:[],
              tags:[],
                            }
	}else if (action.type === LOAD_POST_MASKER){
		newState = {content:[{info_index:0,
                          info_type:"ToolBar"}],
                          name:"",
                          title:"",
                          alias:[],
                          tags:[],
                          }
    article = action.payload
    newState.name = article.name
    newState.alias = article.alias
    newState.tags = article.tags
    var index = 0
    for(var i=0; i<article.content.length ; i++){
    	if(article.content[i].type.includes("image") || article.content[i].type.includes("Image")){
    		newState.content.push({
    			info_type:"Photo",
    			info_index:index + 1,
    			info:global.bucket.concat(article.content[i]["filename"])
    		})
    		newState.content.push({
    			info_type:"ToolBar",
    			info_index:index + 2
    		})
    		index = index + 2
    	}else if(article.content[i].type.includes("video") || article.content[i].type.includes("Video")){
    		newState.content.push({
    			info_type:"Video",
    			info_index:index + 1,
    			info:global.bucket.concat(article.content[i]["filename"])
    		})
    		newState.content.push({
    			info_type:"ToolBar",
    			info_index:index + 2
    		})
        index = index + 2
    	}else if(article.content[i].type.includes("text") || article.content[i].type.includes("Text")){
    		newState.content.push({
    			info_type:"Text",
    			info_index:index + 1,
    			info:article.content[i]["filename"]
    		})
    		newState.content.push({
    			info_type:"ToolBar",
    			info_index:index + 2
    		})
        index = index + 2
    	}
    }
    return newState
	}else if (action.type === LOAD_POST_ROAST){
    newState = {content:[{info_index:0,
                          info_type:"ToolBar"}],
                          name:"",
                          title:"",
                          alias:[],
                          tags:[],
                          }
    article = action.payload
    newState.title = article.title
    newState.tags = article.tags
    var index = 0
    for(var i=0; i<article.content.length ; i++){
      if(article.content[i].type.includes("image") || article.content[i].type.includes("Image")){
        newState.content.push({
          info_type:"Photo",
          info_index:index + 1,
          info:global.bucket.concat(article.content[i]["filename"])
        })
        newState.content.push({
          info_type:"ToolBar",
          info_index:index + 2
        })
        index = index + 2
      }else if(article.content[i].type.includes("video") || article.content[i].type.includes("Video")){
        newState.content.push({
          info_type:"Video",
          info_index:index + 1,
          info:global.bucket.concat(article.content[i]["filename"])
        })
        newState.content.push({
          info_type:"ToolBar",
          info_index:index + 2
        })
        index = index + 2
      }else if(article.content[i].type.includes("text") || article.content[i].type.includes("Text")){
        newState.content.push({
          info_type:"Text",
          info_index:index + 1,
          info:article.content[i]["filename"]
        })
        newState.content.push({
          info_type:"ToolBar",
          info_index:index + 2
        })
        index = index + 2
      }
    }
    return newState
  }
	return state
}

const searchReducer = (state=['',[]],action) => {
	if (action.type === SEARCH_KEYWORD){
		newState = [...state]
		newState[0] = action.payload.keyword
    
		return newState
	}else if(action.type === NEW_SEARCH_RESULTS){
		newState = [...state]
		newState[1] = action.payload
		return newState
	}else if(action.type === ADD_TO_SEARCH_RESULTS){
		newState = [...state]
		newState[1] = newState[1].concat(action.payload)
		return newState
	}
	return state
}

const conversationReducer = (state=[],action) => {
	if (action.type === ADD_CONVERSATION){
    try{
		  var newState = [...state]
		  new_conversation_id = action.payload.id
		  new_conversation = action.payload
      
		  var include = -1
		  newState.forEach(function(conversation){
		    if(conversation.id == new_conversation_id){
		      include = conversation
		    }
		  })
		  if(include !== -1){
        var unread = include.unread
        new_conversation.unread = unread + 1
		    remove(newState,include)
		    prepend(newState,new_conversation)

		  }else{
        new_conversation.unread = 1
		    prepend(newState,new_conversation)
		  }

      global.sqlitedb.transaction(tx => {
        tx.executeSql(
          'SELECT id FROM conversations WHERE id == ?;', 
          [new_conversation_id],
          (transaction,result)=>{
            if(result.rows.length == 0){
              tx.executeSql(
                'INSERT INTO conversations (id , creator , lastMessage_text, lastMessage , lastMessageAt,members,muted,name,conversation,unread) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);', 
                [new_conversation_id,new_conversation.creator,new_conversation.lastMessage.text,JSON.stringify(new_conversation.lastMessage), new_conversation.lastMessageAt.getTime().toString(),JSON.stringify(new_conversation.members),new_conversation.muted,new_conversation.name,JSON.stringify(new_conversation),1],
                null,
                (transaction,error)=>console.error(error)
              );
            }else{
              tx.executeSql(
                'UPDATE conversations SET creator = ? , lastMessage_text = ?, lastMessage = ?,lastMessageAt = ?,members = ?,muted = ?, name = ?, conversation = ?, unread = unread + 1 WHERE id = ?;', 
                [new_conversation.creator,new_conversation.lastMessage.text,JSON.stringify(new_conversation.lastMessage), new_conversation.lastMessageAt.getTime().toString(),JSON.stringify(new_conversation.members),new_conversation.muted,new_conversation.name, JSON.stringify(new_conversation),new_conversation_id],
                null,
                (transaction,error)=>console.error(error)
              );
            }
          },
          (transaction,error)=>console.error(error)
        );
      });
    }catch(error){
      console.error(error)
    }
		return newState
	}else if (action.type === LOAD_OLD_CONVERSATION){
    return action.payload
  }else if (action.type === REMOVE_CONVERSATION){
    remove_cid = action.payload
    global.sqlitedb.transaction(tx => {
      tx.executeSql(
        'DELETE FROM conversations WHERE id == ?;', 
        [remove_cid],
        null,
        (transaction,error)=>console.error(error)
      );
    });
    newState = [...state]
    for(var i = 0; i < newState.length; i++) {
      if(newState[i].id == remove_cid) {
        newState.splice(i, 1);
        break;
      }
    }
    return newState
  }else if(action.type == REMOVE_UNREAD){
    remove_cid = action.payload
    global.sqlitedb.transaction(tx => {
      tx.executeSql(
        'UPDATE conversations SET unread = 0 WHERE id = ?;', 
        [remove_cid],
        null,
        (transaction,error)=>console.error(error)
      );
    });
    newState = [...state]
    for(var i = 0; i < newState.length; i++) {
      if(newState[i].id == remove_cid) {
        newState[i].unread = 0
        break;
      }
    }
    return newState
  }
	return state
}

const messageReducer =  (state={},action) => {
	if (action.type === ADD_MESSAGE){
    try{
		  newState = {...state}
		  new_conversation_cid = action.payload.cid
		  message = action.payload
		  
      if (!(new_conversation_cid in newState)){
		  	newState[new_conversation_cid] = []
		  }
		  new_message = {}
		  new_message["_id"] = message["id"]
		  new_message["text"] = message["text"]
		  new_message["user"] = {"_id":message["from"],"name":message["from"]}
		  new_message["createdAt"] = message["timestamp"]
		  new_message["type"] = message["type"]
		  if(message['type'] == ImageMessage.TYPE){
		  	new_message['image'] = message.getFile().url()
		  }else if(message['type'] == FileMessage.TYPE){
		  	new_message['file'] = message.getFile().url()
		  }else if(message['type'] == VideoMessage.TYPE){
		  	new_message['video'] = message.getFile().url()
		  }else if(message['type'] == AudioMessage.TYPE){
		  	new_message['audio'] = message.getFile().url()
		  }else if(message['type'] == LocationMessage.TYPE){
		  	new_message['location'] = {latitude:message.getLocation().latitude,longitude:message.getLocation().longitude}
		  }
      
		  newState[new_conversation_cid] = [new_message].concat(newState[new_conversation_cid])
      global.sqlitedb.transaction(tx => {
        tx.executeSql('select * from messages WHERE id = ?', 
          [message.id],
          (_, { rows }) =>{
            if(rows.length == 0){
              tx.executeSql(
                'INSERT INTO messages (id , cid , content, sender, timestamp, filelocaluri, message) VALUES (?, ?, ?, ?, ?, ?, ?);', 
                [message.id,message.cid,message.text,message.from,message.timestamp.getTime().toString(),'null',JSON.stringify(message)],
                null,
                (transaction,error)=>{
                  //console.log("reducer 363")
                  console.error(transaction,error)
                }
              );
            }
          },
            (transaction,error) => console.error(error)
          );
        
      });
    }catch(error){
      console.error(error)
    }
		return newState
	}else if (action.type === ADD_MESSAGE_RIGHT_SENDING){
    try{
		  newState = {...state}
		  conversation_cid = action.payload.cid
		  message = action.payload
      tid = action.payload.id
      new_message = {}
      new_message["_id"] = message["id"]
      new_message["text"] = message["text"]
      new_message["user"] = {"_id":global.IMClientName,"name":global.IMClientName}
      new_message["createdAt"] = message["timestamp"]
      new_message["type"] = message["type"]
      new_message["status"] = "sending"
      if(message['type'] == ImageMessage.TYPE){
        new_message['image'] = message.file.url
      }else if(message['type'] == FileMessage.TYPE){
        new_message['file'] = message.file.url
      }else if(message['type'] == VideoMessage.TYPE){
        new_message['video'] = message.file.url
      }else if(message['type'] == AudioMessage.TYPE){
        new_message['audio'] = message.file.url
      }else if(message['type'] == LocationMessage.TYPE){
        new_message['location'] = {latitude:message.getLocation().latitude,longitude:message.getLocation().longitude}
      }

      global.sqlitedb.transaction(tx => {
        tx.executeSql(
          'INSERT INTO messages (id , cid , content, sender, timestamp, filelocaluri ,message, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?);', 
          [new_message._id,conversation_cid,new_message.text,global.IMClientName,new_message.createdAt.getTime().toString(),"sender",JSON.stringify(message),"sending"],
          null,
          (transaction,error)=>{
            //console.log("reducers 406")
            console.error(error)
          }
        );
      });
		  if(newState[conversation_cid] === undefined){
		  	newState[conversation_cid] = [new_message]
		  }else{
		  	newState[conversation_cid] = [new_message].concat(newState[conversation_cid])
		  }
    }catch(error){
      console.error(error)
    }
    
		return newState
	}else if (action.type === ADD_MESSAGE_RIGHT_SENT){
    try{
      conversation_cid = action.payload.message.cid
      message = action.payload.message
      temp_id = action.payload.temp_id
      conversation = action.payload.conversation
      status = action.payload.status
      newState = {...state}
      var index = -1
      if(newState[conversation_cid] !== undefined){
        for(var i = 0; i < newState[conversation_cid].length; i++) {
          if((newState[conversation_cid][i]['_id'] === temp_id) && (newState[conversation_cid][i]['user']['_id'] == global.IMClientName)) {
            index = i
            break;
          }
        }
      }
      if(index == -1){
        return newState
      }
      //console.log(newState[conversation_cid][i])

      if(JSON.parse(JSON.stringify(newState))[conversation_cid][i]["status"] !== "success"){
        global.sqlitedb.transaction(tx => {
          tx.executeSql(
            'UPDATE messages SET id = ?, cid = ?, content = ?, sender = ?, timestamp = ?, filelocaluri = ?, message = ?, status = ? WHERE id = ?', 
            [message.id,conversation_cid,message.text,global.IMClientName,message.timestamp.getTime().toString(),"sender",JSON.stringify(message),status,temp_id],
            () => {
              if(conversation !== undefined){
                tx.executeSql(
                  'UPDATE conversations SET creator = ? , lastMessage_text = ?, lastMessage = ?,lastMessageAt = ?,members = ?,muted = ?, name = ?, conversation = ? WHERE id = ?;', 
                  [conversation.creator,conversation.lastMessage.text,JSON.stringify(conversation.lastMessage), conversation.lastMessageAt.getTime().toString(),JSON.stringify(conversation.members),conversation.muted,conversation.name, JSON.stringify(conversation),conversation_cid],
                  null,
                  (transaction,error)=>{
                    //console.log("reducers 437")
                    console.error(error)
                  }
                );
              }
            },
            (transaction,error)=>{
              //console.log("reducers 442")
              console.error(error)
            }
          );
           
        });
        new_message = {...newState[conversation_cid][i],status:status,_id:message.id}
        newState[conversation_cid] = [].concat(state[conversation_cid].slice(0,i).concat([new_message].concat(state[conversation_cid].slice(i+1))))
      }
      
    }catch(error){
      console.error(error)
    }
    return newState
  }else if(action.type === LOAD_OLD_MESSAGE){
    try{
      newState = {...state}
      var old_mes = action.payload.old_mes
      cid = action.payload.cid
      if(newState[cid] == undefined){
        newState[cid] = []
      }
      
      old_mes = old_mes.map(message => {

        // if(message["sender"] == global.IMClientName){
        //   if(JSON.parse(message.message)._id){
        //     return JSON.parse(message.message)
        //   }
        // }
        new_message = {}
        message = JSON.parse(message.message)

        new_message["_id"] = message["id"]
        new_message["text"] = message["text"]
        new_message["user"] = {"_id":message["from"],"name":message["from"]}
        new_message["createdAt"] = message["timestamp"]
        new_message["type"] = message["type"]
        if(message['type'] == ImageMessage.TYPE){
          if("2048url" in message.file && Array.isArray(message.file["2048url"]) && message.file["2048url"].length > 0){
            new_message['image'] = message.file["2048url"]
          }else{
            new_message['image'] = message.file.url  
          }
          new_message['download_url'] = message.file.url  
        }else if(message['type'] == FileMessage.TYPE){
          new_message['file'] = message.file.url
        }else if(message['type'] == VideoMessage.TYPE){
          new_message['video'] = message.file.url
        }else if(message['type'] == AudioMessage.TYPE){
          new_message['audio'] = message.file.url
        }else if(message['type'] == LocationMessage.TYPE){
          new_message['location'] = {latitude:message.location.latitude,longitude:message.location.longitude}
        }
        return new_message
      })

      newState[cid] = newState[cid].concat(old_mes)
      return newState
    }catch(error){
      console.error(error)
    }
  }
	return state
}

const frontPageReducer = (state={"Roast":{
																		"Recommend":[],
																		"Follow":[],
																		"Trending":[],
                                    "Keywords":[]
																		},
																 "Masker":{
																 		"Recommend":[],
																		"Follow":[],
																		"Trending":[],
                                    "Keywords":[]
																 }},action) => {
	if (action.type === PUSH_FRONTPAGE){
		front_page = action.payload
		newState = {"Roast":{
							 		"Recommend":front_page["Roast"]["Recommend"],
							 		"Follow":front_page["Roast"]["Follow"],
							 		"Trending":front_page["Roast"]["Trending"],
                  "Keywords":front_page["Roast"]["Keywords"]
							 		},
							  "Masker":{
							 		"Recommend":front_page["Masker"]["Recommend"],
							 		"Follow":front_page["Masker"]["Follow"],
							 		"Trending":front_page["Masker"]["Trending"],
                  "Keywords":front_page["Masker"]["Keywords"]
							 		}}
		return newState
	}
	return state
}

const voteReducer = (state=[],action) => {
  if (action.type === RECORD_VOTE){
    newState = [...state]
    vote_index = action.payload.vote_index
    
    front = newState.slice(0,vote_index)
    back = newState.slice(vote_index)
    now = [{option:action.payload.vote,count:0,backgroundColor:action.payload.backgroundColor}]
    newContent = front.concat(now.concat(back))
    newState = newContent
    return newState
  }else if(action.type == LOAD_VOTE){
    newState = [...state]
    vote_index = action.payload.vote_index
    front = newState.slice(0,vote_index)
    back = newState.slice(vote_index)
    now = [action.payload.vote]
    newContent = front.concat(now.concat(back))
    newState = newContent
    return newState

  }else if(action.type === REMOVE_VOTE_BAR){
    vote_index = action.payload.vote_index
    newState = [...state]
    newState.splice(vote_index,1)
    return newState
  }else if(action.type === CLEAR_CACHE_VOTE){
    return []
  }
  return state
}

const leancloudStatusReducer = (state={status:"active"},action) =>{
  if (action.type === CHANGE_LEANCLOUD_STATUS){
    //status in ["active","inactive","retrying"]
    return {status:action.payload}
  }
  return state
}

const reducer = combineReducers({
	getMaskerInfo:getMaskerInfoReducer,
	post: postReducer,
	search: searchReducer,
	conversations:conversationReducer,
	messages:messageReducer,
	frontPage:frontPageReducer,
  vote:voteReducer,
  leancloudStatus:leancloudStatusReducer
  
})
export default reducer

