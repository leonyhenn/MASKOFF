/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  intermediate performance tested
  for MASKOFF.

  TODO:
  1. waiting for leancloud blacklist
  2. onLoadEarlier Spinner style(Ted)
  3. not sure how to handle report
  x4. Permission setting
  5. when user download image, prompt sth
  6. slow loading of leancloud images

  x将所有setState / dispatch改为async/await, 取消所有除了show:false之外的取消设定 
  x重新测试
  2019.Jan.17
*/

//React
import React from 'react';

// Official Modules
import { Platform,
         StyleSheet,
         Text,
         View,
         Keyboard,
         KeyboardAvoidingView,
         BackHandler,
         Dimensions } from 'react-native';

//Expo
import { Asset,
         DocumentPicker } from 'expo';

import uuid from 'uuid';

//Community Modules
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Spinner } from 'native-base'
import {  WaveIndicator } from 'react-native-indicators'
//Custom Modules
import { GiftedChat, 
         Actions, 
         Bubble, 
         SystemMessage } from '../components/GiftedChatIndex.js';

import { CustomComposer,
         InputToolbar,
         CustomAccesories,
         CustomActions,
         CustomSend,
         CustomView,
         CustomMessageImage,
         CustomMessageText,
         CustomTime,
         CustomBubble,
         CustomLoadEarlier,
         CustomDay } from '../components/Chat_Modules.js'

import { MASKOFFStatusBar,
         ButtonHeader,
         ProgressMeter } from '../components/Modules.js';

import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';

import DropdownAlert from 'react-native-dropdownalert';
import { notifications } from '../components/Dropdown_Alert_helpers.js'
import MO_Alerts from '../components/MO_Alerts.js'
const { Popover } = renderers

//Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

//Redux
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { addMessageRightSending,
         addMessageRightSent,
         loadOldMessage,
         removeUnread } from '../store/actions.js';

import { FILLING_COLOR,
         STANDARD_BORDER_COLOR,
         STATUS_BAR_COLOR,
         THEME_COLOR,
         TRANSPARENT,
         COLOR_HEADER_ICON,
         COLOR_ChatPage } from '../utility/colors.js'
//LeanCloud
var { TextMessage, 
      MessageStatus } = require('leancloud-realtime');

var { ImageMessage, 
      FileMessage , 
      AudioMessage, 
      VideoMessage, 
      LocationMessage } = require('leancloud-realtime-plugin-typed-messages');

var AV = require('leancloud-storage');

//Chat Class
class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      messages:[],
      typingText: null,
      isLoadingEarlier: false,
      show:false,
      type:undefined,
      EmojiModalVisible:false,
      accessoryHeight:44,
      input:'',
      selection:0,
      notificationBarType:undefined
    };
    
    //Navigation Params
    this.maskname = this.props.navigation.getParam("maskname")
    this.cid = this.props.navigation.getParam("conversation").id
    this.unread = this.props.navigation.getParam("conversation").unread

    //Status Bits
    this._isMounted = false;

    //Function Binding
    this.notification=this.notification.bind(this)
    this.onSend=this.onSend.bind(this);
    this.confirm=this.confirm.bind(this)
    this.renderBubble=this.renderBubble.bind(this);
    this.renderNotificationBarImage=this.renderNotificationBarImage.bind(this)
    this.renderSystemMessage=this.renderSystemMessage.bind(this);
    this.renderFooter=this.renderFooter.bind(this);
    this.onLoadEarlier=this.onLoadEarlier.bind(this);
    this.renderMessageImage=this.renderMessageImage.bind(this);
    this.renderMessageText=this.renderMessageText.bind(this);
    this.renderTime=this.renderTime.bind(this)
    this.renderLoadEarlier=this.renderLoadEarlier.bind(this)
    this.renderDay=this.renderDay.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
    this.backPressed=this.backPressed.bind(this)
    this.setEmojiModalVisible=this.setEmojiModalVisible.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this)
    this.EmojiCallback=this.EmojiCallback.bind(this)
    this.onChangeText=this.onChangeText.bind(this)
    this.resend=this.resend.bind(this)
    this.getOtherUnread=this.getOtherUnread.bind(this)

    //Pre-load History messages when no unread messages in messageContainer
    if(this.props.messages[this.cid] == undefined || this.props.messages[this.cid].length == 0){
      global.sqlitedb.transaction(tx => {
        tx.executeSql('SELECT * FROM messages WHERE cid = ? ORDER BY timestamp DESC LIMIT ?', [this.cid,this.unread > 0?this.unread:5], async (_, { rows }) =>{
          await store.dispatch(loadOldMessage({cid:this.cid,old_mes:rows._array}))
        },
          (transaction,error) => console.error(error)
        );
      })
    }
  }
  async componentDidUpdate(prevProps) {
    if (this.props.messages !== prevProps.messages &&  this.props.leancloudStatus.status == "active") {

      //if prev status off line, setup conversation
      if(this.conversation == undefined){
        this.conversation = await global.IMClient.createConversation({
          members: this.props.navigation.getParam("conversation").members,
          name: this.props.navigation.getParam("conversation").name,
          unique: true
        })
      }

      //mark all messages as read in leancoud server
      this.conversation.read().then(async function(conversation) {
        //mark all messages as read in local
        await store.dispatch(removeUnread(this.cid))
      }).catch(console.error.bind(console));
    }else if(this.props.leancloudStatus.status !== prevProps.leancloudStatus.status){
      if(this.props.leancloudStatus.status == "inactive"){
        this.notification(notifications['error'].type,"Network Down")
      }else if(this.props.leancloudStatus.status == "retrying"){
        this.notification(notifications['warn'].type,"Reconnecting...")
      }else if(this.props.leancloudStatus.status == "active"){
        this.notification(notifications['success'].type,"Connected!")
      }
    }   
  }

  componentDidMount(){
    //Hardware back setup
    BackHandler.addEventListener('ChatPage_hardwareBackPress', this.backPressed);
    
  }


  async componentWillMount() {

    //block all notification sound
    global.local_settings.Notification_Sound_Switch = false

    //setup conversation
    if(this.props.leancloudStatus.status == "active"){
      this.conversation = await global.IMClient.createConversation({
        members: this.props.navigation.getParam("conversation").members,
        name: this.props.navigation.getParam("conversation").name,
        unique: true
      })
    }

    //set status bits
    this._isMounted = true;

    //setup keyboard listener
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    
  }

  componentWillUnmount() {

    //remove keyboard listener
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    
    //remove hardware back listener
    BackHandler.removeEventListener('ChatPage_hardwareBackPress', this.backPressed);

    //turn on all notification sounds
    global.local_settings.Notification_Sound_Switch = true

    //turn off status bits
    this._isMounted = false;
  }


  backPressed(){
    //hardware back function  
    this.props.navigation.goBack();
    return true;
  }

  
  _keyboardDidShow(e) {
    //get keyboard height
    global.keyboardHeight = e.endCoordinates.height + Dimensions.get('screen').height - Dimensions.get('window').height
  }


  async onLoadEarlier() {
    await this.setState({isLoadingEarlier:true})
    //load earlier messages
    global.sqlitedb.transaction(tx => {
      tx.executeSql('SELECT * FROM messages WHERE cid = ? AND timestamp <= ? AND id <> ? ORDER BY timestamp DESC LIMIT 20', 
        [this.cid,new Date(this.props.messages[this.cid][this.props.messages[this.cid].length - 1].createdAt).getTime().toString(),this.props.messages[this.cid][this.props.messages[this.cid].length - 1]._id], 
        async (_, { rows }) =>{
          await store.dispatch(loadOldMessage({cid:this.cid,old_mes:rows._array}))
          await this.setState({isLoadingEarlier:false})
        },
        (transaction,error) => console.error(error)
      );
    })

  }

  //onSend
  async onSend(messages = []) {
    try{
      if(messages[0]["text"]){
        var new_message = new TextMessage(messages[0]["text"])
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        await store.dispatch(addMessageRightSending(new_message))
        
      }else if(messages[0]["location"]){
        var location = new AV.GeoPoint(messages[0]["location"]["latitude"],messages[0]["location"]["longitude"]);
        var new_message = new LocationMessage(location)
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        await store.dispatch(addMessageRightSending(new_message))
        
      }else if(messages[0]["image"]){
        await this.setState({show:true,type:"Chat_Picture_Send_Confirm",uri:messages[0]["image"],messages:messages})
        return
        
      }else if(messages[0]["video"]){
        await this.setState({show:true,type:"Chat_Video_Send_Confirm",uri:messages[0]["video"],messages:messages})
        return
        
        
      }else if(messages[0]["file"]){
        var file = new AV.File(messages[0]["filename"], { blob: { uri:messages[0]["file"]}})        
        var temp_id = uuid.v4()
        var new_message = {
          id:temp_id,
          text:undefined,
          timestamp:new Date(),
          type:FileMessagel.TYPE,
          file:{
            url:messages[0]["file"]
          },
          cid:this.cid
        }
        await store.dispatch(addMessageRightSending(new_message))
        response = await file.save()
        var new_message = new FileMessage(file);
        new_message['cid'] = this.cid
        await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:undefined,status:"pending"}))
        var temp_id = new_message['id']
        
      }
      //only send message when leancloud is connected
      if(!messages[0]["image"] && !messages[0]["video"]){
        // console.error("wrong section!")
        if(this.props.leancloudStatus.status == "active"){
          response = await this.conversation.send(new_message)
          if(response.status == MessageStatus.SENT){
            await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"success"}))
          }else if(response.status == MessageStatus.FAILED){
            await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))
          }
        //else send a failed message only to messageContainer so user can send it again in the future
        }else{
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))
        }
      }
      
    }catch(error){
      console.error(error)
      await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))
    }
    
  }

  async confirm(type,messages){
    await this.setState({show:false})
    try{
      switch(type){
        case "Chat_Picture_Send_Confirm":
          var file = new AV.File(messages[0]["filename"], { blob: { uri:messages[0]["image"]}})  
          //decoy message, not actually sending, just for displaying as soon as user press send
          //same as below
          var temp_id = uuid.v4()
          var new_message = {
            id:temp_id,
            text:undefined,
            timestamp:new Date(),
            type:ImageMessage.TYPE,
            file:{
              url:messages[0]["image"]
            },
            cid:this.cid
          }
          await store.dispatch(addMessageRightSending(new_message))
          response = await file.save()
          var new_message = new ImageMessage(file);
          new_message['cid'] = this.cid
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:undefined,status:"pending"}))
          var temp_id = new_message['id']
        break;
        case "Chat_Video_Send_Confirm":
          var file = new AV.File(messages[0]["filename"], { blob: { uri:messages[0]["video"]}})  
          var temp_id = uuid.v4()
          var new_message = {
            id:temp_id,
            text:undefined,
            timestamp:new Date(),
            type:VideoMessage.TYPE,
            file:{
              url:messages[0]["video"]
            },
            cid:this.cid
          }
          await store.dispatch(addMessageRightSending(new_message))
          response = await file.save()
          var new_message = new VideoMessage(file);
          new_message['cid'] = this.cid
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:undefined,status:"pending"}))
        var temp_id = new_message['id']
        break;
      }
      if(this.props.leancloudStatus.status == "active"){
        response = await this.conversation.send(new_message)
        if(response.status == MessageStatus.SENT){
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"success"}))
        }else if(response.status == MessageStatus.FAILED){
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))
        }
      //else send a failed message only to messageContainer so user can send it again in the future
      }else{
        await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))
      }
    }catch(error){
      await store.dispatch(addMessageRightSent({message:new_message,temp_id:temp_id,conversation:this.conversation,status:"failed"}))

    }

  }

  renderInputToolbar(props){
    return(
      <InputToolbar 
        {...props}/>
    )
  }
  renderComposer(props){
    return(
      <CustomComposer
        ref={component => this._CustomComposer = component}
        {...props}/>
    )
  }
  renderAccessory(props) {
    return (
      <CustomAccesories
        {...props}
      />
    );
  }
  renderSend(props){
    return(
      <CustomSend 
        {...props}
      />
    );
  }
  renderBubble(props) {
    return (
      <Bubble
        {...props}
        wrapperStyle={{
          left: {
            backgroundColor: COLOR_ChatPage["bubble"]["wrapper"],
          }
        }}
      />
    );
  }

  renderCustomView(props) {
    return (
      <CustomView
        {...props}
      />
    );
  }

  renderSystemMessage(props) {
    return (
      <SystemMessage
        {...props}
        containerStyle={{
          marginBottom: 15,
        }}
        textStyle={{
          fontSize: 14,
        }}
      />
    );
  }

  renderDay(props) {
    return <CustomDay {...props} textStyle={{color: COLOR_ChatPage["day"]["text"],}}/>
  }

  renderFooter(props) {
    if (this.state.typingText) {
      return (
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>
            {this.state.typingText}
          </Text>
        </View>
      );
    }
    return null;
  }

  renderMessageImage(props){
    return(
      <CustomMessageImage 
        {...props}
      />
    );
  }

  renderMessageText(props){
    return(
      <CustomMessageText
        {...props}
      />
    )
  }

  renderTime(props){
    return(
      <CustomTime 
        {...props}
      /> 
    )
  }

  renderBubble(props){
    return(
      <CustomBubble 
        {...props}
      />
    )
  }

  renderLoadEarlier(props){
    return(
      <CustomLoadEarlier
        {...props}
      />
    )
  }

  //TODO: waiting for leancloud blacklist
  async handleMenu(value){
    switch(value){
      case "Block":
        
        break;
      case "Report":
        // console.log(value)
        break;
    }
  }
  
  //set emoji panel status
  async setEmojiModalVisible(value,caller){
    if(this._isMounted){
      //set base in order to avoid emoji panel jumping
      if(Platform.OS == 'ios'){
        var base = 44
      }else{
        var base = 43
      }

      //if emoji icon on toolbar are pressed
      if(value == true && caller == "toolbar"){
        await this.setState({EmojiModalVisible:true,accessoryHeight:base + global.keyboardHeight})
        Keyboard.dismiss()

      //if textinput is focused and user just done using emoji panel
      }else if(value == false && caller == "textinput" && this.state.accessoryHeight == base + global.keyboardHeight){
        if(Platform.OS !== 'ios'){
          await this.setState({EmojiModalVisible:false})  
        }else{
          await this.setState({EmojiModalVisible:false})  
        }
      
      //if textinput is focused and user start from emoji panel is down
      }else if(value == false && caller == "textinput" && this.state.accessoryHeight == base){
        if(Platform.OS == 'ios'){
          if(global.keyboardHeight !== undefined){
            await this.setState({EmojiModalVisible:false,accessoryHeight:base + global.keyboardHeight})   
          }
        }
      // to avoid ios jumping InputToolBar problem
      }else if(value == false && caller == "textinputBlur" && !this.state.EmojiModalVisible){
        if(Platform.OS == 'ios'){
          if(global.keyboardHeight !== undefined){
            // console.log("textinputBlur set")
            await this.setState({EmojiModalVisible:false,accessoryHeight:base})   
          }
        }
        //deped.
      }else if(value == false && caller == "toolbar"){
        await this.setState({EmojiModalVisible:false,accessoryHeight:base + global.keyboardHeight})
      }
    }
  }
    

  async EmojiCallback(emoji){
    if(this._isMounted){
      //set emoji selected to input value, and move cursor 1 pos back
      await this.setState({input:[this.state.input.slice(0, this.state.selection), emoji, this.state.input.slice(this.state.selection)].join(''),selection:this.state.selection + emoji.length})  
    }
    
  }

  async onChangeText(text,selection=null){
    //get newest cursor and input value
    if(this._isMounted){
      if(selection == null){
        await this.setState({input:text})
      }else{
        await this.setState({selection:selection})
      }
    }
  }

  //resend as user press on red ! icon
  async resend(message){
    try{
      if(message["text"]){
        var new_message = new TextMessage(message["text"])
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        
        
      }else if(message["location"]){
        var location = new AV.GeoPoint(message["location"]["latitude"],message["location"]["longitude"]);
        var new_message = new LocationMessage(location)
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        
        
      }else if(message["image"]){
        var file = new AV.File("resend",{ blob: { uri:message["image"]}})  
        response = await file.save()
        var new_message = new ImageMessage(file);
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        
        
        
      }else if(message["video"]){
        var file = new AV.File("resend", { blob: { uri:message["video"]}})  
        response = await file.save()
        var new_message = new VideoMessage(file);
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        
        
        
      }else if(message["file"]){
        var file = new AV.File("resend", { blob: { uri:message["file"]}})
        response = await file.save()
        var new_message = new FileMessage(file);
        new_message['cid'] = this.cid
        var temp_id = new_message['id']
        
        

      }
      if(this.props.leancloudStatus.status == "active"){
        response = await this.conversation.send(new_message)
        if(response.status == MessageStatus.SENT){
          await store.dispatch(addMessageRightSent({message:new_message,temp_id:message._id,conversation:this.conversation,status:"success"}))
        }
      }
        
      
    }catch(error){

    }
  }

  getOtherUnread(){
    var other_unread = this.props.conversations.map(conversation => conversation.id == this.cid?0:conversation.unread).reduce((a, b) => a + b, 0)
    if(other_unread == 0){
      return "Back";
    }else if(0<other_unread<=99){
      return "Back("+other_unread+")";
    }else{
      return "Back(...)"
    }
  }

  async notification(type,message){
    this.dropdown.alertWithType(type,
                                null,
                                message);
    await this.setState({notificationBarType:type})
  }

  renderNotificationBarImage(){
    switch(this.state.notificationBarType){
      case notifications['warn'].type:
        return <View style={styles.notificationBarImage}><WaveIndicator color={COLOR_ChatPage["NotificationBar"]["icon"]} waveMode='outline' size={25}/></View>
      break;
      case notifications['success'].type:
        return <View style={styles.notificationBarImage}><Ionicons name="ios-checkmark" size={30} color={COLOR_ChatPage["NotificationBar"]["icon"]}/></View>
      break;
      case notifications['error'].type:
        return <View style={styles.notificationBarImage}><Ionicons name="ios-close" size={30} color={COLOR_ChatPage["NotificationBar"]["icon"]}/></View>
      break;
      default:
       return (null)
    }
  }

  render() {
    if(Platform.OS !== "ios"){
      //if remove this, InputToolbar wont stay up when keyboard shows
        keyboard_supporter = <KeyboardAvoidingView behavior={'padding'} keyboardVerticalOffset={0}/>  
      
    }else{
      keyboard_supporter = null
    }
    
    return (
        <View style={{flex: 1,backgroundColor:FILLING_COLOR}}>
          <View style={{flex: 1,backgroundColor:FILLING_COLOR}}>
            <MASKOFFStatusBar backgroundColor={STATUS_BAR_COLOR} barStyle="dark-content"/>
            <ButtonHeader layout="chat"
                          center_content={<ProgressMeter maskname={this.maskname} />}
                          left_button_onPress={() => this.props.navigation.goBack()}
                          left_button_text={this.getOtherUnread()}
                          right_button={
                            <Menu onSelect={(value) => this.handleMenu(value)}
                                  renderer={Popover} 
                                  rendererProps={{ preferredPlacement: 'bottom' }}>
                              <MenuTrigger style={styles.menuTrigger} >
                                <Ionicons name="ios-menu"
                                            size={20}
                                            color={COLOR_HEADER_ICON}/>
                              </MenuTrigger>
                              <MenuOptions style={styles.menuOptions}>
                                <MenuOption value={"Block"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
                                  <Text style={{color: THEME_COLOR}}>Block</Text>
                                </MenuOption>
                                <MenuOption value={"Report"}>
                                  <Text style={{color: THEME_COLOR}}>Report</Text>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>
                          }/>
            <GiftedChat
              messages={this.props.messages[this.cid]}
              onSend={this.onSend}
              loadEarlier={true}
              onLoadEarlier={this.onLoadEarlier}
              isLoadingEarlier={this.state.isLoadingEarlier}
              renderMessageImage={this.renderMessageImage}
              renderMessageText={this.renderMessageText}
              renderSystemMessage={this.renderSystemMessage}
              renderBubble={this.renderBubble}
              renderFooter={this.renderFooter}
              renderComposer={this.renderComposer}
              renderCustomView={this.renderCustomView}
              renderSend={this.renderSend}
              renderDay={this.renderDay}
              renderAccessory={this.renderAccessory}
              renderInputToolbar={this.renderInputToolbar}
              renderTime={this.renderTime}
              renderLoadEarlier={this.renderLoadEarlier}
              navigation={this.props.navigation}
              showAvatarForEveryMessage
              listViewProps={{
                style:{
                  backgroundColor: FILLING_COLOR,
                },
              }}
              isAnimated={true}
              send_back_location={this.send_back_location}
              handlePictureOnPress={this.handlePictureOnPress}
              setEmojiModalVisible={this.setEmojiModalVisible}
              modalVisible={this.state.EmojiModalVisible}
              _isMounted={this._isMounted}
              accessoryHeight={this.state.accessoryHeight}
              EmojiCallback={this.EmojiCallback}
              resend={this.resend}
              onChangeText={this.onChangeText}
              input={this.state.input}
              user={{
                    _id:global.IMClientName
                  }}
              notification={this.notification} />
              {keyboard_supporter}

          </View>
          <MO_Alerts show={this.state.show} 
                     type={this.state.type} 
                     confirm={()=>{this.confirm(this.state.type,this.state.messages)}}
                     closeOnTouchOutside={false}
                     uri={this.state.uri}/>
          <DropdownAlert
            ref={ref => this.dropdown = ref}
            showCancel={false}
            startDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
            endDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
            updateStatusBar={false}
            replaceEnabled
            tapToCloseEnabled
            panResponderEnabled
            renderTitle={()=>{return(null)}}
            renderImage={this.renderNotificationBarImage}
            defaultContainer={{margin:0,  flexDirection: 'row',alignItems:"center", backgroundColor: TRANSPARENT, }}
            defaultTextContainer={{ flex: 1, margin: 8 ,alignSelf: 'center', flexDirection:'row',alignItems:'center',justifyContent:"flex-start"}}
            messageNumOfLines={3}
            messageStyle={{fontSize: 12, textAlign: 'left', fontWeight: '400', color: COLOR_ChatPage["DropdownAlert"]["messageText"], backgroundColor: TRANSPARENT}}
            closeInterval={0}
          />
        </View>
    );
   
  }
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 10,
  },
  footerContainer_not_typing: {
    marginTop: 5,
    marginLeft: 10,
    marginRight: 10,
    marginBottom: 0,
  },
  footerText: {
    fontSize: 14,
    color: COLOR_ChatPage["footer"]["text"],
  },
  menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  menuTrigger: {
    padding: 5,
  },
  notificationBarImage:{
    height:30,
    width:30,
    margin: 3,
    alignSelf: 'center', 
    flexDirection:'row',
    alignItems:'center',
    justifyContent:"center"
  }
});

const getPropsFromState = state => ({
  messages:state.messages,
  leancloudStatus:state.leancloudStatus,
  conversations:state.conversations
  
})

export default connect(getPropsFromState)(Chat)