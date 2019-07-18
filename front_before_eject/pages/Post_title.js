/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x0. BackHandler
  0. 需要加提交的按钮吗?
  0. 检查onSelectionColor
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code

  2019.Jan.05
*/
//official modules
import React, { Component } from 'react';
import { View,
         Keyboard,
         TextInput,
         StyleSheet,
         BackHandler,
         Text } from 'react-native';

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ButtonHeader,
         ProgressMeter } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//redux modules
import { store } from '../store/store.js';
import { connect } from 'react-redux';
import { addInfoToPost,
         clearCache } from '../store/actions.js';

//utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         SEPERATE_BAR_COLOR,
         COLOR_Post_title,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

class Post_title extends Component{
  constructor(props){
    super(props)
    this.state={
      title:this.props.post.title,
      next_disabled:true,
      willmount:false,
      show:false
    }
    
    //Function binding
    this.submitTitle=this.submitTitle.bind(this)
    this.cancel=this.cancel.bind(this)
    this.next=this.next.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)

    //status bits
    this.purpose=this.props.navigation.getParam("purpose")
    this.onSelectionColor = "#2da157"
  }

  async componentWillMount(){
    await this.setState({willmount:true})
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    await this.setState({willmount:false})
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  //键盘enter
  async submitTitle(){
    await this.setState({show:false})
    Keyboard.dismiss()
    if (this.state.title.trim() == ""){
      setTimeout(async () => {await this.setState({show:true, mo_alert_title:Lan["Wait"], message:Lan['No_title_alert']})},100)
      return
    }else{
      
      await store.dispatch(addInfoToPost({
        info_type:"title",
        info:this.state.title,
      }))
      await this.setState({next_disabled:false})
      this.purpose == "postRoast" ?this.props.navigation.navigate("Post_content",{purpose:this.purpose}):this.props.navigation.navigate("Post_content",{purpose:this.purpose,rid:this.props.navigation.getParam("rid")})
    }
  }

  //键盘enter
  async cancel(){
    await store.dispatch(clearCache({}))
    this.props.navigation.goBack()
  }

  //按钮next
  next(){
    this.submitTitle()
  }

  render(){
    if(this.state.willmount){
      progress = 1
      buttonheader = ButtonHeader({layout:"left-center-right",
                      center_content:ProgressMeter({progress:progress,
                                                       total:4}),
                      fontColor:CANCEL_BUTTON_TEXT_COLOR,
                      right_button_color:THEME_COLOR,
                      left_button_onPress:this.cancel,
                      left_button_text:Lan["Cancel"],
                      right_button_text:Lan["Next"],
                      right_button_onPress:this.next})
      
      return(
        <View style={Post_title_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
          {buttonheader}
          <View style={Post_title_style.text_input_wrapper}>
            <Text style={Post_title_style.Please_enter_title}>{Lan['Title']}</Text>
            <TextInput style={Post_title_style.text_input}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onSubmitEditing={() => this.submitTitle()}
                       onChangeText={async (title) => {await this.setState({title:title})}}
                       keyboardAppearance="light"
                       defaultValue={this.props.post.title}
                       underlineColorAndroid="transparent"
                       blurOnSubmit={false}/>
            <View style={Post_title_style.segment_line}/>
          </View>
          <MO_Alerts show={this.state.show} 
                   type={"Notice"}
                   title={this.state.mo_alert_title}
                   message={this.state.message}/>
        </View>
      )
    }
  }
}
const Post_title_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
  },
  text_input_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width: width,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
  },
  segment_line:{
    height:1,
    width:width * 0.95,
    alignSelf:'center',
    backgroundColor:SEPERATE_BAR_COLOR
  },
  text_input:{
    marginLeft:10,
    width:width - 20,
    marginBottom:10,
    fontSize:25,
    fontWeight:"400",
    color:COLOR_Post_title["text_input_text"],
  },
  Please_enter_title:{
    marginLeft:10,
    marginTop:20,
    marginBottom:10,
    color:COLOR_Post_title["Please_enter_title"],
  }
})
const getPropsFromState = state => ({
  post: state.post
})
export default connect(getPropsFromState)(Post_title)

