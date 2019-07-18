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
  0. onSelectionColor换淡绿色
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
         Text,
         Platform,
         Keyboard,
         TextInput,
         BackHandler } from 'react-native';

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ButtonHeader,
         ProgressMeter } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

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

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         SEPERATE_BAR_COLOR,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR,
         COLOR_Post_name_alias } from '../utility/colors.js'

// Component UI--checked
class Post_name_alias extends Component{
  constructor(props){
    super(props)
    this.state={
      name:this.props.post.name,
      alias_show:false,
      alias:this.props.post.alias.join(" "),
      next_disabled:true,
      submitAlias_called:false,
      willmount:false,
      show:false
    }
    this.submitName=this.submitName.bind(this)
    this.submitAlias=this.submitAlias.bind(this)
    this.cancel=this.cancel.bind(this)
    this.next=this.next.bind(this)
    this.onSelectionColor = "#2da157"
  }

  async componentWillMount(){
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
  async submitName(){
    await this.setState({show:false})
    Keyboard.dismiss() 
    if (this.state.name.trim() == ""){
       setTimeout(async()=> {await this.setState({show:true, title:"Wait...", message:Lan['No_name_alert']})},100)
      return
    }else{
      await store.dispatch(addInfoToPost({
        info_type:"name",
        info:this.state.name,
      }))
      await this.setState({alias_show:true,
                     next_disabled:false})
    }
  }
  //键盘enter
  async submitAlias(){
    await store.dispatch(addInfoToPost({
      info_type:"alias",
      info:this.state.alias.trim().split(/[\n ,]+/),
    }))
    await this.setState({submitAlias_called:true})
    this.aliasInput.focus();
    this.props.navigation.navigate("Post_content",{purpose:"postMasker"})
  }
  //按钮cancel
  async cancel(){
    await store.dispatch(clearCache({}))
    this.props.navigation.goBack()
    return true;
  }
  //按钮next
  async next(){
    await this.setState({show:false})
    Keyboard.dismiss()
    if (!this.state.alias_show || this.state.name.trim() == "" || this.props.post.name.trim() == ""){
      setTimeout(async()=> {await this.setState({show:true, title:"Wait...", message:Lan['No_name_alert']})},100)
      return
    }else{
      if (!this.submitAlias_called){
        await store.dispatch(addInfoToPost({
          info_type:"alias",
          info:this.state.alias.trim().split(/[\n ,]+/),
        }))
      }
      if(this.state.name !== this.props.post.name){
        await store.dispatch(addInfoToPost({
          info_type:"name",
          info:this.state.name,
        }))
      }
      this.props.navigation.navigate("Post_content",{purpose:"postMasker"})
    }
  }

  render(){
    if(this.state.willmount){
      alias = null
      progress = 1
      buttonheader = ButtonHeader({layout:"left-center-right",
                        center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:this.cancel,
                        left_button_text:Lan["Cancel"],
                        right_button_text:Lan["Next"],
                        right_button_onPress:this.submitName,
                        right_button_disabled:false
                      })
      //如果输完姓名按了enter之后,显示next按钮
      if (this.state.alias_show){
        alias = <View>
        <Text style={Post_name_alias_style.Please_enter_his_alias}>{Lan['Please_enter_his_alias']}</Text>
        <Text style={Post_name_alias_style.Display_instruction}>{Lan['Use_space_seperate_alias']}</Text>
        <TextInput style={[Post_name_alias_style.text_input,{height:120,fontSize:20,}]}
                           autoFocus={true}
                           selectionColor={this.onSelectionColor}
                           multiline={true}
                           numberOfLines={3}
                           underlineColorAndroid="transparent"
                           keyboardType="web-search"
                           onSubmitEditing={() => this.submitAlias()}
                           onChangeText={async (alias) =>{await this.setState({alias:alias})}}
                           keyboardAppearance="light"
                           textAlignVertical="top"
                           ref={(alias) => { this.aliasInput = alias; }}/>
          
        </View>
        progress = 2
        buttonheader = ButtonHeader({layout:"left-center-right",
                        center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                        left_button_onPress:this.cancel,
                        left_button_text:Lan["Cancel"],
                        right_button_text:Lan["Next"],
                        right_button_onPress:this.next,
                        
                      })
      }
      return(
        <View style={Post_name_alias_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR,
                             barStyle:"light-content"})}
          {buttonheader}
          <View style={Post_name_alias_style.text_input_wrapper}>
            <Text style={Post_name_alias_style.Please_enter_his_name}>{Lan['Please_enter_his_name']}</Text>
            <TextInput style={[Post_name_alias_style.text_input]}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onSubmitEditing={() => this.submitName()}
                       onChangeText={async (name) => {await this.setState({name:name})}}
                       keyboardAppearance="light"
                       underlineColorAndroid="transparent"
                       blurOnSubmit={false}/>
            <View style={Post_name_alias_style.segment_line}/>
            {alias}
          </View>
          <MO_Alerts show={this.state.show} 
                   type={"Notice"}
                   title={this.state.title}
                   message={this.state.message}/>
        </View>
      )
    }else{
      return(
        <View style={Post_name_alias_style.container}>
          <Spinner color='#f9f9f9'/>
        </View>
      )
    }
  }
}
const Post_name_alias_style = StyleSheet.create({
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
    alignItems:"flex-start"
  },
  text_input:{
    marginLeft:10,
    width:width - 20,
    marginBottom:20,
    fontSize:25,
    fontWeight:"400",
    color:COLOR_Post_name_alias["text_input_text"],
    //test
    // borderWidth:1,

  },
  segment_line:{
    height:1,
    width:width * 0.95,
    alignSelf:'center',
    backgroundColor:SEPERATE_BAR_COLOR
  },
  Please_enter_his_name:{
    marginLeft:10,
    marginTop:20,
    marginBottom:10,
    color:COLOR_Post_name_alias["Please_enter_his_name"],
  },
  Please_enter_his_alias:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_name_alias["Please_enter_his_alias"],
    
  },
  Display_instruction:{
    marginLeft:10,
    marginTop:3,
    marginBottom:3,
    color:COLOR_Post_name_alias["Display_instruction"],
    fontSize:10,
  }
})

const getPropsFromState = state => ({
  post: state.post
})

export default connect(getPropsFromState)(Post_name_alias)
