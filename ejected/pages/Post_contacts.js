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
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
//Official modules
import React, { Component } from 'react';
import { Text,
         View,
         TextInput,
         StyleSheet,
         Keyboard,
         BackHandler } from 'react-native';

//MASKOFF custom modules
import { ButtonHeader,
         ProgressMeter,
         MASKOFFStatusBar, } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//Native-base
import { Spinner } from 'native-base'

//Redux modules
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { addInfoToPost } from '../store/actions.js';

//Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

//languages
import { Lan,
         setLanDict } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         COLOR_Post_contacts,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component--UI checked
class Post_contacts extends Component{
  constructor(props){
    super(props)
    this.default_value = ""
    if(this.props.post.wechat || this.props.post.cellphone || this.props.post.other_key || this.props.post.other_value){
      this.state={
        wechat:this.props.post.wechat,
        cellphone:this.props.post.cellphone,
        other_key:this.props.post.other_key,
        other_value:this.props.post.other_value,
        show:false
      }
    }else{
      this.state={
        wechat:"",
        cellphone:"",
        other_key:"",
        other_value:"",
        show:false
      }
    }

    //Funtion Binding
    this.cancel=this.cancel.bind(this)
    this.next=this.next.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)

    //Status bits
    this.onSelectionColor = "black"
    // this.purpose=this.props.navigation.getParam("purpose")
    this.purpose = "postMasker"
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  async componentWillMount(){
    setLanDict("Chinese")
    await this.setState({willmount:true})
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    await this.setState({willmount:false})
  }

  //按钮cancel
  cancel(){
    this.props.navigation.goBack()
  }

  //按钮next
  async next(){
    await this.setState({show:false})
    Keyboard.dismiss()
    
      await store.dispatch(addInfoToPost({
        info_type:"wechat",
        info:this.state.wechat.trim()
      }))
      await store.dispatch(addInfoToPost({
        info_type:"cellphone",
        info:this.state.cellphone.trim()
      }))
      await store.dispatch(addInfoToPost({
        info_type:"other_key",
        info:this.state.other_key.trim()
      }))
      await store.dispatch(addInfoToPost({
        info_type:"other_value",
        info:this.state.other_value.trim()
      }))
      
    if (this.purpose == "postMasker"){
      this.props.navigation.navigate("Post_content",{purpose:"postMasker"})
    }else if(this.purpose == "postArticle"||this.purpose == "updateArticle"){
      this.purpose == "postArticle" ? this.props.navigation.navigate("Post_content",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_content",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
    }
  }

  render(){
       progress = 3
       total = 6  
    if(this.state.willmount){
      if(this.purpose == "postMasker"){
          buttonheader = ButtonHeader({layout:"left-center-right",
                          center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                          fontColor:CANCEL_BUTTON_TEXT_COLOR,
                          right_button_color:THEME_COLOR,
                          left_button_onPress:this.cancel,
                          left_button_text:Lan["Back"],
                          right_button_onPress:this.next,
                          right_button_text:Lan["Next"]})
      }
      
      return(
        <View style={Post_contacts_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
          {buttonheader}
          <View style={Post_contacts_style.text_input_wrapper}>
            <Text style={[Post_contacts_style.Please_enter,{fontWeight:"600",color:"black",marginTop:5}]}>{Lan['Contacts_high_efficiency_search']}</Text>
            <Text style={Post_contacts_style.Display_instruction}>{Lan['In_order_to_avoid_cyber_bulling']}</Text>
            <Text style={[Post_contacts_style.Please_enter,{marginTop:5}]}>{Lan['Input_contacts_wechat']}</Text>
            <TextInput style={Post_contacts_style.text_input}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onChangeText={async (wechat) => {await this.setState({wechat:wechat})}}
                       value={this.state.wechat}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
            <Text style={Post_contacts_style.Please_enter}>{Lan['Input_contacts_cellphone']}</Text>
            <TextInput style={Post_contacts_style.text_input}
                       autoFocus={false}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onChangeText={async (cellphone) => {await this.setState({cellphone:cellphone})}}
                       value={this.state.cellphone}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
            <Text style={Post_contacts_style.Please_enter}>{Lan['Input_contacts_other_key']}</Text>
            <Text style={[Post_contacts_style.Display_instruction,{fontWeight:"600"}]}>{Lan['Other_Account_key']+", "+Lan["Like_Instagram_Email"]}</Text>
            <TextInput style={Post_contacts_style.text_input}
                       autoFocus={false}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onChangeText={async (other_key) => {await this.setState({other_key:other_key})}}
                       value={this.state.other_key}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
            <Text style={[Post_contacts_style.Display_instruction,{fontWeight:"600"}]}>{Lan['Other_Account_value']}</Text>
            <TextInput style={Post_contacts_style.text_input}
                       autoFocus={false}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onChangeText={async (other_value) => {await this.setState({other_value:other_value})}}
                       value={this.state.other_value}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
          </View>
          <MO_Alerts show={this.state.show} 
                   type={"Notice"}
                   title={this.state.title}
                   message={this.state.message}/>
        </View>
      )
    }else{
      return(
        <View style={Post_contacts_style.container}>
          <Spinner color='#C4C4C4'/>
        </View>
      )
    }
  }
}

const Post_contacts_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
  },
  text_input_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width: width,
    alignSelf:"center",
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
  },
  text_input:{
    width:width - 40,
    fontSize:18,
    textAlignVertical:"top",
    color:COLOR_Post_contacts["text_input_text"],
    marginLeft:10,
    borderBottomWidth:1,
    borderColor:THEME_COLOR
  },
  Please_enter:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_contacts["Please_enter_his_tags"],
  },
  Display_instruction:{
    marginLeft:10,
    marginTop:3,
    color:COLOR_Post_contacts["Display_instruction"],
    fontSize:10
  },
  Display_tags:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_contacts["Display_tags"],
  }
})
const getPropsFromState = state => ({
  post: state.post
})

export default connect(getPropsFromState)(Post_contacts)

