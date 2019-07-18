/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 检查purpose
  1. 检查console.error
  2. 检查network failure
  3. 中英文
  4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  7. 解决flatlist 不render spinner的问题
  8. 解决article的评论
  9. 解决评论区的头像
  10. 给article加上评论和like
  2019.Jan.09
  
  x0. BackHandler
*/
//official modules
import React, { Component } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { View,
         Text,
         Alert,
         FlatList,
         Platform,
         Keyboard,
         TextInput,
         StyleSheet,
         Dimensions,
         ScrollView,
         BackHandler,
         TouchableOpacity, } from 'react-native';
import uuid from 'uuid'

import { ImagePicker,
         Permissions } from 'expo'
//native-base
import { Spinner } from 'native-base'

//MASKOFF custom modules
import { CustomComposer } from '../components/Comments_Modules.js'
import { MASKOFFStatusBar,
         ButtonHeader,
         Comments_container } from '../components/Modules.js';

//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         getPermission } from '../utility/Util.js';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import {  WaveIndicator } from 'react-native-indicators';

//Dropdown Alert
import DropdownAlert from 'react-native-dropdownalert';
import { notifications } from '../components/Dropdown_Alert_helpers.js'

//HttpRequests
import {  Like,
          Dislike,
          getComments,
          sendComment,
          chatImageMax2048  } from '../utility/HttpRequests.js'

//Languages
import { Lan } from '../utility/Languages.js'

import { FILLING_COLOR,
         STATUS_BAR_COLOR,
         COLOR_View_Comment,
         TRANSPARENT } from '../utility/colors.js'

const COMMMENT_IMAGE_HEIGHT = 100 + 20
export default class View_Comment extends Component{
  constructor(props){
    super(props)
    this.state={
      loading:true,
      fetchComments:false,
      composer_show:false,
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
      inputSize:{height:44,width:0},
      EmojiModalVisible:false,
      comment_image:null,
      notificationBarType:undefined,
      make_comment:{
        original_comment:undefined,
        place_holder:undefined
      }
    }
    this.like=this.like.bind(this)
    this.back=this.back.bind(this)
    this.dislike=this.dislike.bind(this)
    this.onScroll=this.onScroll.bind(this)
    this.clearText=this.clearText.bind(this)
    this.make_comment=this.make_comment.bind(this)
    this.send_comment=this.send_comment.bind(this)
    this.remove_image=this.remove_image.bind(this)
    this.imageOnPress=this.imageOnPress.bind(this)
    this.onChangeText=this.onChangeText.bind(this)
    this.onEndReached=this.onEndReached.bind(this)
    this.notification=this.notification.bind(this)
    this.EmojiCallback=this.EmojiCallback.bind(this)
    this.renderSpinner=this.renderSpinner.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this) 
    this._keyboardDidHide=this._keyboardDidHide.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.onInputSizeChanged=this.onInputSizeChanged.bind(this)
    this.setEmojiModalVisible=this.setEmojiModalVisible.bind(this)
    this.fetchFurtherComments=this.fetchFurtherComments.bind(this)
    this.renderNotificationBarImage=this.renderNotificationBarImage.bind(this)
    this.purpose = this.props.navigation.getParam("purpose")
    this.comment = this.props.navigation.getParam("comment")
    this.sub_comments = [this.comment]
    this.index = 0
    this.onEndReachedCalledDuringMomentum = true;
    this.unmounted = false    

    global.keyboardHeight = null
  }

  _handleBackPress(){
    this.back()
    return true
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    this.unmounted = true
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    
    response = await getComments(global.server+"/"+"comments"+"/"+this.comment.cid+"/"+"COMMENTS"+"/"+"0")
    if(response == false){
      //说明前面出现了error, 需要重连
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
    }else if(response.ok){
      var json = await response.json()
      this.sub_comments = await this.sub_comments.concat(json["comments"])
      this.index = await json["index"]
      for (var i=0;i<this.sub_comments.length;i++){
        this.sub_comments[i]["key"] = i.toString()
      }
      await this.setState({loading:false})
    }else if(response.status == 401){
      navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:''})},100)
      return
    } 
  }

  _keyboardDidShow(e) {
    //get keyboard height
    // console.log("_keyboardDidShow")
    global.keyboardHeight = e.endCoordinates.height + Dimensions.get('screen').height - Dimensions.get('window').height
    // console.log("global.keyboardHeight",global.keyboardHeight)
  }

  _keyboardDidHide(e){
    // console.log("_keyboardDidHide")

  }

  onInputSizeChanged(newSize){
    if(!this.unmount){
      if(newSize.height < 44){
        if(this.state.composer_show){
          if(this.state.comment_image){
            this.setState({inputSize :{height:44,width:newSize.width} ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - 44 - COMMMENT_IMAGE_HEIGHT})
          }else{
            this.setState({inputSize :{height:44,width:newSize.width} ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - 44 })  
          }
          
        }else{
          
        }
        
      }else{
        if(this.state.composer_show){
          if(this.state.comment_image){
            this.setState({inputSize :newSize ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - newSize.height - COMMMENT_IMAGE_HEIGHT})  
          }else{
            this.setState({inputSize :newSize ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - newSize.height })  
          }
        }else{
          
        }
        
      }
    }
  }

  async setEmojiModalVisible(value,caller){
    if(!this.unmount){
      if(value == false && caller == "textinputBlur"){
        if(this.state.EmojiModalVisible){
          
        }else{
          await this.setState({EmojiModalVisible:false,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT})
        }
        
      }
      else if(value == true && caller == "toolbar"){
        if(this.state.EmojiModalVisible){
          await this.setState({EmojiModalVisible:false}) 
          this._textInput.focus()  
        }else{
          await this.setState({EmojiModalVisible:true}) 
          this._textInput.blur()  
        }
      }else if(value == false && caller == "textinput"){
          await this.setState({EmojiModalVisible:false})  
      }
    }
  }

  onScroll(){
    this._textInput.blur()
    this.setState({composer_show:false,EmojiModalVisible:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
  }

  async EmojiCallback(emoji){
    if(!this.unmount){
      //set emoji selected to input value, and move cursor 1 pos back
      await this.setState({input:[this.state.input.slice(0, this.state.selection), emoji, this.state.input.slice(this.state.selection)].join(''),selection:this.state.selection + emoji.length})  
    }
    
  }

  clearText(){
    this.onChangeText('')
    if (Platform.OS === 'ios') {
      this._textInput.setNativeProps({ text: ' ' });
    }
    setTimeout(() => {
      this._textInput.setNativeProps({ text: '' });
    },5);
  }

  async onChangeText(text,selection=null){
    //get newest cursor and input value
    if(!this.unmount){
      if(selection == null){
        await this.setState({input:text})
      }else{
        await this.setState({selection:selection})
      }
    }
  }

  async imageOnPress(){
      this._textInput.blur()
      old_MainViewHeight = this.state.MainViewHeight
      this.setState({composer_show:false,EmojiModalVisible:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
      setTimeout(async()=>{
        try{


          response = await getPermission(Permissions.CAMERA_ROLL)
          if(!response){
            return
          }
          var allowsEditing = true
          if (Platform.OS == 'ios'){
            allowsEditing = false
          }
          let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes:ImagePicker.MediaTypeOptions.Images,
            allowsEditing:allowsEditing,
            exif:false
          });
          if(!result.cancelled){
            file_id = uuid.v4()
            
            temp = result.uri.split(".")  
            extention = temp[temp.length - 1]
            new_file_name = file_id + "." + extention
            file = result.uri
            
            // this.props.onSend({image:file,filename:new_file_name})
            this._textInput.focus()
            await this.setState({composer_show:true,comment_image:file,MainViewHeight:old_MainViewHeight - COMMMENT_IMAGE_HEIGHT})
            
            // console.log(result)
          }
        }catch(error){
            console.error(error)

          }
      },500)
  }

  async remove_image(){
    await this.setState({MainViewHeight:this.state.MainViewHeight + COMMMENT_IMAGE_HEIGHT,comment_image:null})  
    
  }

  make_comment(comment){
    if(this.state.make_comment.original_comment !== undefined && "cid" in this.state.make_comment.original_comment){
      if(this.state.make_comment.original_comment["cid"] !== comment.cid){
        this.setState({comment_image:null,input:'',place_holder:undefined})
      }
    }
    var place_holder = undefined
    switch(true){
      case (comment.content[0].type.includes("text") || comment.content[0].type.includes("Text")):
        place_holder = " " + Lan["Reply"] + " " +comment.nickname+" : "+comment.content.filename
        if(place_holder.length > 15){
          place_holder = place_holder.substring(0,15) + "..."
        }
      break;
      case (comment.content[0].type.includes("image") || comment.content[0].type.includes("Image")):
        place_holder = " " + Lan["Reply"] + " " +comment.nickname+" : "+comment.content.filename
      break;
    }
    
    this.setState({make_comment:{
      original_comment:comment,
      place_holder:place_holder
    }})
    if(this.state.composer_show){
      this._textInput.blur()
      this.setState({composer_show:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
    }else{
      setTimeout(async()=>{
        if(global.keyboardHeight == null){
          this.setState({composer_show:true})
          if(this.state.comment_image){
            setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT}),500)
          }else{
            setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height}),500)
          }
          
        }else{
          if(this.state.comment_image){
            this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT})  
          }else{
            this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height})  
          }
          
        }
        this._textInput.focus()
      },500)
    }
  }

  async send_comment(comment,original_comment){

    this.onScroll()
    body = []
    if(this.state.comment_image){
      this.notification(notifications['warn'].type,"Uploading image...")
      response = await chatImageMax2048(this.state.comment_image)
      if(response == "getPackSize_error"){
        this.notification(notifications['error'].type,"File cannot be found")
      }else if(response == false){
        //说明前面出现了error, 需要重连
        this.notification(notifications['error'].type,"Comment failed")
      }else if(response.ok){
        json = await response.json()
        var filename = json["filename"]
        body.push({"type":"image/jpg",filename:filename})
        if(!comment == ''){
          body.push({"type":"text/plain",filename:comment})
        }
      }else if(response.status == 401){
        this.notification(notifications['error'].type,"Comment failed")
      }else{
        this.notification(notifications['error'].type,"Comment failed")
      }
    }else{
      if(!comment.trim() == ''){
        body.push({"type":"text/plain",filename:comment})
      }else{
        return
      }
    }

    var db_type
    if(this.purpose == "searchRoast"){
      db_type = "ROASTS"
    }else if(this.purpose == "searchMasker"){
      db_type = "MASKERS"
    }


    original_comment_info = {}

    //parent_id
    if(original_comment.parent_id == "0"){
      original_comment_info["parent_id"] = original_comment.cid
    }else{
      original_comment_info["parent_id"] = original_comment.parent_id
    }

    //reply_id
    original_comment_info["reply_id"] = original_comment.cid

    //db_id
    original_comment_info["db_id"] = original_comment.db_id

    response = await sendComment(original_comment_info,body,db_type)
    
    if(response == false){
      //说明前面出现了error, 需要重连
      this.notification(notifications['error'].type,"Comment failed")
    }else if(response.ok){

      this.notification(notifications['success'].type,"Comment Success!")
    }else if(response.status == 401){
      this.notification(notifications['error'].type,"Comment failed")
    }else{
      this.notification(notifications['error'].type,"Comment failed")
    }
  }

  back(){
    this.props.navigation.goBack()
  }

  async like(object_type,object_id){
    response = await Like(object_type,object_id)
    if(response == false){
      //说明前面出现了error, 需要重连
      return false
    }else if(response.ok){
      return response
    }else if(response.status == 401){
      navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return false
    }
  }

  async dislike(object_type,object_id){
    response = await Dislike(object_type,object_id)
    if(response == false){
      //说明前面出现了error, 需要重连
      return false
    }else if(response.ok){
      return response
    }else if(response.status == 401){
      navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return false
    }
  }

  async fetchFurtherComments(){
    if(!this.unmount){
      await this.setState({show:false,caller:undefined})
    }
    response = await getComments(global.server+"/comments"+"/"+this.comment.cid+"/COMMENTS"+"/"+this.index.toString())
    if(response == false){
      //说明前面出现了error, 需要重连
    }else if(response.ok){
      var json = await response.json()
      if (json["index"] == -1){
        this.index = -1
        await this.setState({fetchComments:false})
        return
      }
      if (json["index"] > this.index){
        this.sub_comments = await this.sub_comments.concat(json["comments"])
        this.index = await json["index"]
        for (var i=0;i<this.sub_comments.length;i++){
          this.sub_comments[i]["key"] = i.toString()
        }
        await this.setState({fetchComments:false})
      }
    }else if(response.status == 401){
      navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return
    }
  }

  onEndReached = async ({ distanceFromEnd }) => {
    if(this.index == -1){
      return
    }
    if(!this.unmounted){
      await this.setState({fetchComments:false})
      if(!this.onEndReachedCalledDuringMomentum){
        await this.setState({fetchComments:true})
        await this.fetchFurtherComments()
        this.onEndReachedCalledDuringMomentum = true;
      }
    }
  }
  renderSpinner(){
    switch(true){
      //1  1
      case (this.state.fetchComments && this.sub_comments.length==0 ):
        return (null)
      break;
      
      //1  0 
      case (this.state.fetchComments && !(this.sub_comments.length==0) ):
        return (<TouchableOpacity
                  onPress={this.fetchFurtherComments}
                >
                 <Spinner color='#C4C4C4'/>
                </TouchableOpacity>)
      break;
      //0 1 
      case (!(this.state.fetchComments) && this.sub_comments.length==0 ):
        return (null)
      break;
      //0 0 1
      case (!(this.state.fetchComments) && !(this.sub_comments.length==0) ):
        return (null)
      break;

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

        return <View style={View_Comment_style.notificationBarImage}><WaveIndicator color={COLOR_View_Comment["NotificationBar"]["icon"]} waveMode='outline' size={25}/></View>
      break;
      case notifications['success'].type:
        return <View style={View_Comment_style.notificationBarImage}><Ionicons name="ios-checkmark" size={30} color={COLOR_View_Comment["NotificationBar"]["icon"]}/></View>
      break;
      case notifications['error'].type:
        return <View style={View_Comment_style.notificationBarImage}><Ionicons name="ios-close" size={30} color={COLOR_View_Comment["NotificationBar"]["icon"]}/></View>
      break;
      default:
       return (null)
    }
  }

  render(){
    composer = <CustomComposer setRef={el => this._textInput = el}
                               onInputSizeChanged={this.onInputSizeChanged}
                               setEmojiModalVisible={this.setEmojiModalVisible}
                               modalVisible={this.state.EmojiModalVisible}
                               EmojiCallback={this.EmojiCallback}
                               input={this.state.input}
                               onChangeText={this.onChangeText}
                               clearText={this.clearText}
                               imageOnPress={this.imageOnPress}
                               comment_image={this.state.comment_image}
                               remove_image={this.remove_image}
                               place_holder={this.state.make_comment.place_holder}
                               comment={this.state.make_comment.original_comment}
                               send_comment={this.send_comment}/>
    if(this.state.loading){
      return(
        <View style={{flex:1,backgroundColor:FILLING_COLOR}}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
          {ButtonHeader({layout:"left-center",
                        left_button_onPress:() => this.back(),
                        left_button_text:"Back"})}
          <View style={[View_Comment_style.scroll_view,{justifyContent:"center"}]}>
            <Spinner color='#C4C4C4'/>
          </View>
        </View>
      
    )}else{
      return(
          <View style={{flex:1,backgroundColor:FILLING_COLOR}}>
            {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"dark-content"})}
            {ButtonHeader({layout:"left-center",
                          left_button_onPress:() => this.back(),
                          left_button_text:"Back"})}
            <View style={{height:this.state.MainViewHeight,
                              width:width,
                              flexDirection:"column",
                              alignItems:'center',
                              justifyContent:'flex-start'}}>
              <Comments_container comments={this.sub_comments} 
                                  navigation={this.props.navigation}
                                  onEndReached={this.onEndReached}
                                  onEndReachedThreshold={0.1}
                                  ListFooterComponent={this.renderSpinner}
                                  onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                                  extraData={this.state.fetchComments}
                                  like={this.like}
                                  dislike={this.dislike}
                                  onScroll={this.onScroll}
                                  make_comment={this.make_comment}
                                  notification={this.notification}
                                  />
            </View>
            {composer}
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
              defaultContainer={{margin:0,  flexDirection: 'row',alignItems:"center", backgroundColor:TRANSPARENT, }}
              defaultTextContainer={{ flex: 1, margin: 8 ,alignSelf: 'center', flexDirection:'row',alignItems:'center',justifyContent:"flex-start"}}
              messageNumOfLines={3}
              messageStyle={{fontSize: 12, textAlign: 'left', fontWeight: '400', color: COLOR_View_Comment["message_text"], backgroundColor: TRANSPARENT}}
              closeInterval={0}
            />
          </View>
      )
    }
  }
}
const View_Comment_style = StyleSheet.create({
  scroll_view:{
    height:height - HEADER_HEIGHT - STATUSBAR_HEIGHT,
    width:width,
    backgroundColor:FILLING_COLOR,
  },
  content_wrapper:{
    marginTop:10,
    width:width - 20,
    backgroundColor:FILLING_COLOR,
    borderRadius:15,
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
})






