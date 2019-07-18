/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//official modules
import React, { Component } from 'react';
import { View,
         Text, 
         FlatList,
         StyleSheet } from 'react-native';

//Custom
import { ChatThumbnailWindow } from "../components/Modules.js";

//Utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT,
         CHAT_THUMBNAIL_HEIGHT } from '../utility/Util.js';

// Store
import { store } from '../store/store.js';
import { removeUnread } from '../store/actions.js';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';

// Redux
import { connect } from 'react-redux';

//LeanCloud
var { TextMessage, 
      MessageStatus } = require('leancloud-realtime');

var { ImageMessage, 
      FileMessage , 
      AudioMessage, 
      VideoMessage, 
      LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

import { FILLING_COLOR,
         TRANSPARENT,
         COLOR_Contact_Recent } from '../utility/colors.js'

// Component UI--checked
class Contact_Recent extends Component {
  constructor(props){
    super(props)
    this.get_chat_mes=this.get_chat_mes.bind(this)

  }
  get_chat_mes(item){
    // console.log(item.lastMessage.type)
    // console.log(ImageMessage)
    switch(item.lastMessage.type){
      case LocationMessage.TYPE:
      return <Ionicons name="ios-pin" size={20} color={COLOR_Contact_Recent['icon']}/>
      break;
      case FileMessage.TYPE:
      return <Ionicons name="ios-folder" size={20} color={COLOR_Contact_Recent['icon']}/>
      break;
      case ImageMessage.TYPE:
      return <Ionicons name="ios-image" size={20} color={COLOR_Contact_Recent['icon']}/>
      break;
      case VideoMessage.TYPE:
      return <Ionicons name="ios-skip-forward" size={20} color={COLOR_Contact_Recent['icon']}/>
      break;
      case TextMessage.TYPE:
      return <Text style={styles.message}
          numberOfLines={1}>
      {item.lastMessage.summary.trim()}
    </Text>
      break;
      default:
      return <Text style={styles.message}
          numberOfLines={1}>
      {item.lastMessage.summary.trim()}
    </Text>
    }
  }
  render() {
    // console.log(this.props.conversations)
    let pic ='../ayami_nakajo/1.jpg'
    return (
      
      <View 
        style={{
          height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT ,
          width:width,
          flexDirection:"column",
          justifyContent:"flex-start",
          alignItems:"center",
          backgroundColor:FILLING_COLOR
        }}>

        <FlatList
          data={this.props.conversations}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ChatThumbnailWindow maskname={item.name}
                                    last_chat_date="Today"
                                    last_chat_mes={this.get_chat_mes(item)}
                                    type="Chat"
                                    conversation={item}
                                    onPress={async () => {
                                      await store.dispatch(removeUnread(item.id))
                                      this.props.navigation.navigate("Chat",{maskname:item.name,
                                           mode:"modal",
                                           conversation:item})}
                                    }
                                  />}

        />

      </View>
    );
  }
}


const getPropsFromState = state => ({
  conversations:state.conversations,
  messages:state.messages
})

const styles = StyleSheet.create({
  message:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.8,
    backgroundColor:TRANSPARENT,
    fontSize: CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.8 * 0.5,
    color:COLOR_Contact_Recent["message"]["text"],
    textAlign:"left",
    textAlignVertical:"center",
    alignSelf:"center",
  },
})

export default connect(getPropsFromState)(Contact_Recent)