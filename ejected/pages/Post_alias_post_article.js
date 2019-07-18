/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 用户可能不知道键盘提交, 要不要加个按钮?
  0. onSelectionColor换淡绿色(Ted)
  x0. BackHandler
  x0. 检查purpose
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  x7. hardware back
  2019.Jan.04
*/
//official modules
import React, { Component } from 'react';
import { StyleSheet,
         View,
         TextInput,
         Platform,
         BackHandler,
         Text } from 'react-native';

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ButtonHeader,
         ProgressMeter } from '../components/Modules.js';

//native-base
import { Spinner } from 'native-base'

//redux modules
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { addInfoToPost,
         clearCache } from '../store/actions.js';

//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

//languages
import { Lan } from '../utility/Languages.js'

import { FILLING_COLOR,
         BACKGROUND_COLOR,
         THEME_COLOR,
         STATUS_BAR_COLOR,
         CANCEL_BUTTON_TEXT_COLOR,
         COLOR_Post_alias_post_article } from '../utility/colors.js'

class Post_alias_post_article extends Component{
  constructor(props){
    super(props)
    this.default_value = ""
    if(this.props.post.alias.length >= 1){
      this.default_value = this.props.post.alias.join(" ")
      this.state = {
        alias:this.default_value,
        willmount:false
      }
    }else{
      this.state={
        alias:"",
        willmount:false
      }
    }
    this.submitAlias=this.submitAlias.bind(this)
    this.cancel=this.cancel.bind(this)
    this.next=this.next.bind(this)
    this.purpose=this.props.navigation.getParam("purpose")
    // console.log("purpose",this.purpose)
    this.name=this.props.navigation.getParam("name")
    this.onSelectionColor = "#2da157"
  }
  async componentWillMount(){
    await store.dispatch(addInfoToPost({
      info_type:"name",
      info:this.name
    }))
    await this.setState({willmount:true})
  }
  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this.cancel);
  }

  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this.cancel);
    await this.setState({willmount:false})
  }
  
  //键盘enter
  async submitAlias(){
    if (this.purpose == "postArticle" || this.purpose == "updateArticle"){
      await store.dispatch(addInfoToPost({
        info_type:"alias",
        info:this.state.alias.trim().split(/[\n ,]+/)
      }))
      this.purpose == "postArticle" ? this.props.navigation.navigate("Post_contacts",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_contacts",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
    }
  }
  //按钮cancel
  async cancel(){
    await store.dispatch(clearCache({}))
    this.props.navigation.goBack()
    return true
  }
  //按钮next
  async next(){
    console.log(this.state)
    await store.dispatch(addInfoToPost({
        info_type:"alias",
        info:this.state.alias.trim().split(/[\n ,]+/)
    }))
    this.purpose == "postArticle" ? this.props.navigation.navigate("Post_contacts",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_contacts",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
  }
  render(){

    progress = 2
    total = 5  

    if(this.state.willmount){

        buttonheader = ButtonHeader({layout:"left-center-right",
                        center_content:ProgressMeter({progress:progress,
                                                       total:5}),
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:this.cancel,
                        left_button_text:Lan["Cancel"],
                        right_button_onPress:this.next,
                        right_button_text:Lan["Next"]})
      return(
        <View style={Post_alias_post_masker_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
          {buttonheader}
          <View style={Post_alias_post_masker_style.text_input_wrapper}>
            <Text style={Post_alias_post_masker_style.name}>{this.name}</Text>
            <Text style={Post_alias_post_masker_style.Please_enter_his_alias}>{Lan['Please_enter_his_alias']}</Text>
            <Text style={Post_alias_post_masker_style.Display_instruction}>{Lan['Use_space_seperate_alias']}</Text>
            <TextInput style={[Post_alias_post_masker_style.text_input,{height:120,fontSize:20,}]}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onSubmitEditing={() => this.submitAlias()}
                       onChangeText={async (alias) => {await this.setState({alias:alias})}}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       multiline={true}
                       defaultValue={this.default_value}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
          </View>
        </View>
      )
    }else{
      return(
        <View style={Post_alias_post_masker_style.container}>
          <Spinner color='#f9f9f9'/>
        </View>
      )
    }
  }
}
const Post_alias_post_masker_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR
  },
  text_input_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width: width,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
  },
  text_input:{
    marginLeft:10,
    width:width - 20,
    marginBottom:20,
    fontSize:25,
    textAlignVertical: 'top',
    fontWeight:"400",
    color:COLOR_Post_alias_post_article["text_input_text"],
  },
  name:{
    marginLeft:10,
    marginTop:10,
    fontSize:40,
    fontWeight:"600",
    color:THEME_COLOR
  },
  Please_enter_his_alias:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_alias_post_article["Please_enter_his_alias"],
  },
  Display_instruction:{
    marginLeft:10,
    marginTop:3,
    marginBottom:3,
    color:COLOR_Post_alias_post_article["Display_instruction"],
    fontSize:10,
  }
})
const getPropsFromState = state => ({
  post: state.post
})

export default connect(getPropsFromState)(Post_alias_post_article)


