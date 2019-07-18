/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x0. 加入字数检测
  x0. 解决屏幕不上移的问题
  x0. BackHandler
  x1. 检查console.error
  x2. 检查network failure
  x0. 工具栏检查permission
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
// Official Modules
import React, { Component } from 'react';
import { View,
         Text,
         Keyboard,
         TextInput,
         Dimensions,
         StyleSheet,
         BackHandler,
         TouchableOpacity } from 'react-native';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';

import { Spinner } from 'native-base'
// Custom Modules
import MO_Alerts from '../components/MO_Alerts.js'
import { ButtonHeader,
         MASKOFFStatusBar } from '../components/Modules.js';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

//EmojiInput
import EmojiInput from '../components/EmojiInputindex.js';

// Utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT } from '../utility/Util.js';
import { Lan,setLanDict } from '../utility/Languages.js'

// Redux 
import { store } from '../store/store.js';
import { addInfoToPost,
         updateInfoToPost } from '../store/actions.js';

import { BACKGROUND_COLOR,
         STATUS_BAR_COLOR,
         THEME_COLOR,
         TRANSPARENT,
         COLOR_Post_TextContent,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component UI--checked
export default class Post_TextContent extends Component{
  constructor(props){
    super(props)
    this.state = {
      content:"",
      selection:0,
      keyboardDidShow:true,
      show:false,
      mounted:false,
      EmojiModalVisible:false
    }
    this.info_index = this.props.navigation.getParam("info_index")
    this.default_value = ''
    if (this.props.navigation.getParam("update_purpose")){
      this.default_value = this.props.navigation.getParam("info")
    }

    //function binding
    
    this.Done=this.Done.bind(this)
    this.cancel=this.cancel.bind(this)
    this.onChangeText=this.onChangeText.bind(this)
    this.EmojiCallback=this.EmojiCallback.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this)
    this._keyboardDidHide=this._keyboardDidHide.bind(this)
    this.getTextInputHeight=this.getTextInputHeight.bind(this)
    this.setEmojiModalVisible=this.setEmojiModalVisible.bind(this)
    this.onSelectionColor = "#2da157"
  }
  cancel(){
    this.props.navigation.goBack()
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  async componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    if (this.props.navigation.getParam("update_purpose")){
      await this.setState({mounted:true,content:this.default_value})
    }else{
      await this.setState({mounted:true})
    }


  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillUnmount(){
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    await this.setState({mounted:false})
  }

  async _keyboardDidShow(e) {
    global.keyboardHeight = e.endCoordinates.height + Dimensions.get('screen').height - Dimensions.get('window').height
    await this.setState({keyboardDidShow:true,EmojiModalVisible:false})
  }

  async _keyboardDidHide(e) {
    await this.setState({keyboardDidShow:false})
  }

  async Done(){
    await this.setState({show:false})
    if(this.state.content.length > 1500){
      await this.setState({show:true, title:Lan["Wait"], message:Lan['Maxmun_length_exceeded']})
      return 
    }
    if(!this.props.navigation.getParam("update_purpose")){
      await store.dispatch(addInfoToPost({
        info_index:this.info_index,
        info_type:"Text",
        info:this.state.content
      }))
      await store.dispatch(addInfoToPost({
        info_type:"ToolBar",
        info_index:this.info_index + 1,
      }))
    }else{
      await store.dispatch(updateInfoToPost({
        info_index:this.info_index,
        info_type:"Text",
        info:this.state.content
      }))
    }
    this.props.navigation.goBack()
  }
  getTextInputHeight(){
    result = null
    switch(true){
      case this.state.EmojiModalVisible && this.state.keyboardDidShow:
        result =  height - HEADER_HEIGHT - STATUSBAR_HEIGHT - global.keyboardHeight 
      break
      case this.state.EmojiModalVisible && !this.state.keyboardDidShow:
        result =  height - HEADER_HEIGHT - STATUSBAR_HEIGHT - global.keyboardHeight 
      break;
      case !this.state.EmojiModalVisible && this.state.keyboardDidShow:
        result =  height - HEADER_HEIGHT - STATUSBAR_HEIGHT - global.keyboardHeight 
      break;
      case !this.state.EmojiModalVisible && !this.state.keyboardDidShow:
        result =  height - HEADER_HEIGHT - STATUSBAR_HEIGHT  
      break;
    }
    if(result == null){
      return height - HEADER_HEIGHT - STATUSBAR_HEIGHT  
    }
    return result

  }
  async setEmojiModalVisible(){
    switch(true){
      case this.state.EmojiModalVisible && this.state.keyboardDidShow:
        // console.log("1")
        this._textInput.focus()
        setTimeout(async()=>await this.setState({EmojiModalVisible:false}),500)
      break;
      case this.state.EmojiModalVisible && !this.state.keyboardDidShow:
        // console.log("2")
        this._textInput.focus()
        setTimeout(async()=>await this.setState({EmojiModalVisible:false}),500)
      break;
      case !this.state.EmojiModalVisible && this.state.keyboardDidShow:
        // console.log("3")
        this._textInput.blur()
        await this.setState({EmojiModalVisible:true})
      break;
      case !this.state.EmojiModalVisible && !this.state.keyboardDidShow:
        // console.log("4")
        this._textInput.blur()
        await this.setState({EmojiModalVisible:true})
      break;
    }
  }

  async EmojiCallback(emoji){
    if(!this.unmount){
      //set emoji selected to input value, and move cursor 1 pos back
      await this.setState({content:[this.state.content.slice(0, this.state.selection), emoji, this.state.content.slice(this.state.selection)].join(''),selection:this.state.selection + emoji.length})  
    }
  }

  async onChangeText(text,selection=null){
    //get newest cursor and input value
    if(!this.unmount){
      if(selection == null){
        await this.setState({content:text})
      }else{
        await this.setState({selection:selection})
      }
    }
  }

  render(){
    

    emoji = <View style={{width:width,
                            height:global.keyboardHeight == undefined?100:global.keyboardHeight,
                            flexDirection:"column",
                            justifyContent:"center",
                            alignItems:"center"}}>        
      <EmojiInput
          onEmojiSelected={emoji => this.EmojiCallback(emoji.char)}
          enableFrequentlyUsedEmoji={false}
          ref={emojiInput => this._emojiInput = emojiInput}


          numColumns={10}
          emojiFontSize={25}
          enableSearch={false}
          categoryFontSize={25}
          categoryLabelTextStyle={{
            fontSize:15,
            fontWeight:"400",
          }}
          keyboardBackgroundColor={"#ffffff"}
          categoryLabelHeight={0}
          showCategoryTab
          categoryHighlightColor={"#2da157"}
          categoryUnhighlightedColor={"#cccccc"}
          showCategoryTab={false}
      />
      </View>
    if(this.state.mounted){
      return(
        <View style={{backgroundColor:BACKGROUND_COLOR}}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"light-content"})}
          {ButtonHeader({layout:"left-center-right",
                         fontColor:CANCEL_BUTTON_TEXT_COLOR,
                         right_button_color:THEME_COLOR,
                         left_button_onPress:() => this.props.navigation.goBack(),
                         right_button_onPress:this.Done,
                         left_button_text:Lan["Cancel"],
                         right_button_text:Lan["Done"]})}
          <KeyboardAwareScrollView style={[PostMasker_style.text_input_wrapper,{height:(isNaN(parseFloat(this.getTextInputHeight())))?(height - HEADER_HEIGHT - STATUSBAR_HEIGHT):this.getTextInputHeight()-40}]}
                                   contentContainerStyle={{
                                    justifyContent:"flex-start",
                                    alignItems:"center",
                                   }}>
            <TextInput style={[PostMasker_style.text_input,{height:(isNaN(parseFloat(this.getTextInputHeight())))?(height - HEADER_HEIGHT - STATUSBAR_HEIGHT):this.getTextInputHeight()-40}]}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       onChangeText={(text) => this.onChangeText(text)}
                       onSelectionChange={(event) => this.onChangeText(this.props.content,event.nativeEvent.selection.start)}
                       keyboardAppearance="light"
                       underlineColorAndroid="transparent"
                       multiline={true}
                       value={this.state.content}
                       ref={textInput => this._textInput = textInput}
                       >
            </TextInput>
            
          </KeyboardAwareScrollView>
          <View style={PostMasker_style.length_indicator_wrapper}>
              <TouchableOpacity style={PostMasker_style.emoji_swapper}
                                onPress={this.setEmojiModalVisible}>
                <Ionicons name="ios-happy" size={25} color={COLOR_Post_TextContent["emoji_icon"]}/>
              </TouchableOpacity>
              <Text style={PostMasker_style.length_indicator}>{this.state.content.length + " / 1500"}</Text>
            </View>
          {emoji}
          <MO_Alerts show={this.state.show} 
                     type={"Notice"}
                     title={this.state.title}
                     message={this.state.message}/>
        </View>
      )
    }else{
      return(
        <View style={{flex:1,
                      backgroundColor:BACKGROUND_COLOR}}>
          <Spinner color="#c4c4c4" />
        </View>
      )
    }
    
  }
}
const PostMasker_style = StyleSheet.create({
  text_input_wrapper:{
    width:width,
    backgroundColor:BACKGROUND_COLOR,
    alignSelf:"center",
    flexDirection:"column",
    borderRadius:5
  },
  text_input:{
    width:width - 15,
    lineHeight: 30,
    fontSize:14,
    textAlignVertical:"top",
    color:COLOR_Post_TextContent["text_input_text"],
    backgroundColor:TRANSPARENT,
  },
  length_indicator_wrapper:{
    height:40,
    width:width,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
  },
  length_indicator:{

    fontSize:15,
    color:THEME_COLOR,
    fontStyle:"italic",
    fontWeight:"400",
    marginRight:15
  },
  emoji_swapper:{
    height:40,
    width:40,
    marginLeft:15,
    alignSelf:"center",
    flexDirection:"column",
    justifyContent:"center"
  }
})

