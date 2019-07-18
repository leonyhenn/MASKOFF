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

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         COLOR_Post_tags,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component--UI checked
class Post_tags extends Component{
  constructor(props){
    super(props)
    this.default_value = ""
    if(this.props.post.tags.length >= 1){
      this.default_value = this.props.post.tags.join(" ")
      this.state={
        tags:this.default_value,
        preview_disabled:false,
        show:false
      }
    }else{
      this.state={
        tags:"",
        preview_disabled:true,
        show:false
      }
    }

    //Funtion Binding
    this.cancel=this.cancel.bind(this)
    this.preview=this.preview.bind(this)
    this.printTag=this.printTag.bind(this)
    this.submitTags=this.submitTags.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)

    //Status bits
    this.onSelectionColor = "black"
    this.purpose=this.props.navigation.getParam("purpose")
  }

  _handleBackPress(){
    this.cancel()
    return true
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

  //键盘enter
  async submitTags(){
    await this.setState({show:false})
    Keyboard.dismiss()
    if (this.purpose == "postMasker"){
      if (this.state.tags == ""){
        setTimeout(async () =>{await this.setState({show:true, title:Lan["Wait"], message:Lan['Tags']})},100)

      }else{
        await this.setState({preview_disabled:false})
        await store.dispatch(addInfoToPost({
          info_type:"tags",
          info:this.state.tags.trim().split(/[\n ,]+/) 
        }))
        this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose})
      }
    }else if(this.purpose == "postArticle"||this.purpose == "updateArticle"){
      if (this.state.tags == ""){
        setTimeout(async () =>{await this.setState({show:true, title:Lan["Wait"], message:Lan['Tags']})},100)

      }else{
        await this.setState({preview_disabled:false})
        await store.dispatch(addInfoToPost({
          info_type:"tags",
          info:this.state.tags.trim().split(/[\n ,]+/)
        }))
        this.purpose == "postArticle" ? this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
      }
    }else if(this.purpose == "postRoast"||this.purpose == "updateRoast"){
      await store.dispatch(addInfoToPost({
        info_type:"tags",
        info:this.state.tags.trim().split(/[\n ,]+/)
      }))
      this.purpose == "postRoast" ?this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose}):this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,rid:this.props.navigation.getParam("rid")})
    }else{
      await store.dispatch(addInfoToPost({
        info_type:"tags",
        info:this.state.tags.trim().split(/[\n ,]+/)
      }))
      this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose})
    }
  }

  //按钮cancel
  cancel(){
    this.props.navigation.goBack()
  }

  //按钮preview
  async preview(){
    await this.setState({show:false})
    Keyboard.dismiss()
    if (this.purpose == "postMasker"){
      if (this.state.tags.trim() == ""){
        setTimeout(async () =>{await this.setState({show:true, title:Lan["Wait"], message:Lan['Tags']})},100)
        
      }else{
        await this.setState({preview_disabled:false})
        await store.dispatch(addInfoToPost({
          info_type:"tags",
          info:this.state.tags.trim().split(/[\n ,]+/)
        }))
        this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose})
      }
    }else if(this.purpose == "postArticle"||this.purpose == "updateArticle"){
      if (this.state.tags.trim() == ""){
        setTimeout(async () =>{await this.setState({show:true, title:Lan["Wait"], message:Lan['Tags']})},100)

      }else{
        await this.setState({preview_disabled:false})
        await store.dispatch(addInfoToPost({
          info_type:"tags",
          info:this.state.tags.trim().split(/[\n ,]+/)
        }))
        this.purpose == "postArticle" ? this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
      }
    }else if(this.purpose == "postRoast"||this.purpose == "updateRoast"){
      await store.dispatch(addInfoToPost({
        info_type:"tags",
        info:this.state.tags.trim().split(/[\n ,]+/)
      }))
      this.purpose == "postRoast" ?this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose}):this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose,rid:this.props.navigation.getParam("rid")})
    }else{
      await store.dispatch(addInfoToPost({
        info_type:"tags",
        info:this.state.tags.trim().split(/[\n ,]+/)
      }))
      this.props.navigation.navigate("Post_PreviewPage",{purpose:this.purpose})
    }
  }

  printTag(){
    if (this.state.tags !== ""){
      return this.state.tags.trim().split(/[\n ,]+/).map(x => "#"+x+"# ")
    }
    return null
  }

  render(){
    if (this.purpose == "postMasker"){
       progress = 5
       total = 6  
     }else if(this.purpose == "postRoast"){
       progress = 3
       total = 4
     }
    if(this.state.willmount){
      if(this.purpose == "postMasker"){
        buttonheader = ButtonHeader({layout:"left-center",
                          center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                          left_button_onPress:() => this.cancel(),
                          left_button_text:Lan["Back"]})
        //如果输完姓名按了enter之后,显示next按钮
        if (!this.state.preview_disabled){
          buttonheader = ButtonHeader({layout:"left-center-right",
                          center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                          fontColor:CANCEL_BUTTON_TEXT_COLOR,
                          right_button_color:THEME_COLOR,
                          left_button_onPress:this.cancel,
                          left_button_text:Lan["Back"],
                          right_button_onPress:this.preview,
                          right_button_text:Lan["Preview"]})
        }
      }else{
        buttonheader = ButtonHeader({layout:"left-center-right",
                          center_content:ProgressMeter({progress:progress,
                                                         total:5}),
                          fontColor:CANCEL_BUTTON_TEXT_COLOR,
                          right_button_color:THEME_COLOR,
                          left_button_onPress:this.cancel,
                          left_button_text:Lan["Back"],
                          right_button_onPress:this.preview,
                          right_button_text:Lan["Preview"]})
      }
      
      return(
        <View style={Post_tags_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
          {buttonheader}
          <View style={Post_tags_style.text_input_wrapper}>
            <Text style={Post_tags_style.Please_enter_his_tags}>{this.purpose == "postMasker" ? Lan['Tags']:Lan['Tags_roast']}</Text>
            <Text style={Post_tags_style.Display_instruction}>{Lan['Use_space_seperate_tags']}</Text>
            <TextInput style={Post_tags_style.text_input}
                       autoFocus={true}
                       selectionColor={this.onSelectionColor}
                       keyboardType="web-search"
                       onSubmitEditing={() => this.submitTags()}
                       onChangeText={async (tags) => {
                        await this.setState({tags:tags})
                        if (tags.trim() !== ""){
                          await this.setState({preview_disabled:false})
                        }
                      }}
                       underlineColorAndroid="transparent"
                       keyboardAppearance="light"
                       blurOnSubmit={false}
                       multiline={true}
                       numberOfLines={3}
                       defaultValue={this.default_value}
                       returnKeyType="done"
                       blurOnSubmit={true}/>
          <Text style={Post_tags_style.Display_tags}> {this.printTag()}</Text>
          </View>
          <MO_Alerts show={this.state.show} 
                   type={"Notice"}
                   title={this.state.title}
                   message={this.state.message}/>
        </View>
      )
    }else{
      return(
        <View style={Post_tags_style.container}>
          <Spinner color='#C4C4C4'/>
        </View>
      )
    }
  }
}

const Post_tags_style = StyleSheet.create({
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
    height:120,
    width:width,
    fontSize:23,
    textAlignVertical:"top",
    color:COLOR_Post_tags["text_input_text"],
    marginLeft:10,
  },
  Please_enter_his_tags:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_tags["Please_enter_his_tags"],
  },
  Display_instruction:{
    marginLeft:10,
    marginTop:3,
    color:COLOR_Post_tags["Display_instruction"],
    fontSize:10
  },
  Display_tags:{
    marginLeft:10,
    marginTop:20,
    color:COLOR_Post_tags["Display_tags"],
  }
})
const getPropsFromState = state => ({
  post: state.post
})

export default connect(getPropsFromState)(Post_tags)

