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
  x0. 检查purpose
  x1. 检查console.error
  x2. 检查network failure
  x0. 工具栏检查permission
  x0. Screen Recorder
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
//official modules
import React, { Component } from 'react';
import { View,
         Platform,
         Keyboard,
         StyleSheet,
         ScrollView,
         BackHandler } from 'react-native';

//MASKOFF custom modules
import { ToolBar,
         ButtonHeader,
         ProgressMeter,
         ReminderWindow,
         MASKOFFStatusBar,
         ContentDisplayPanel } from '../components/Modules.js';
import { CustomComposer } from '../components/Comments_Modules.js'
import MO_Alerts from '../components/MO_Alerts.js'

//native-base
import { Spinner } from 'native-base'

//redux modules
import { connect } from 'react-redux';

//utilities
import { height, 
         width,
         HEADER_HEIGHT,
         STATUSBAR_HEIGHT, } from '../utility/Util.js';

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         COLOR_ButtonHeader,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component UI--checked
class Post_content extends Component{
  constructor(props){
    super(props)
    this.state = {
      //indicates if a reminder window will appear
      showReminderWindow:true,
      willmount:false,
      show:false,
      composer_show:false,
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
      inputSize:{height:44,width:0},
      EmojiModalVisible:false
    }

    //function binding
    this.next=this.next.bind(this)
    this.cancel=this.cancel.bind(this)
    this.handleVoteTwice=this.handleVoteTwice.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.updateVoteRejection=this.updateVoteRejection.bind(this)
    this.closeReminderWindow=this.closeReminderWindow.bind(this)
    this.handleScreenRecorder=this.handleScreenRecorder.bind(this)
    
    //status bits
    this.purpose = this.props.navigation.getParam("purpose")
  }
  _handleBackPress(){
    this.cancel()
    return true
  }

  async handleScreenRecorder(){
    await this.setState({show:false})
    setTimeout(async () =>{await this.setState({show:true, title:Lan["Wait"], message:Lan['Screen_Recorder_Instruction']})},100)
  }

  async handleVoteTwice(){
    await this.setState({show:false})
    setTimeout(async () =>{await  this.setState({show:true, title:Lan["Wait"], message:Lan['handleVoteTwice']})},100)
  }

  async updateVoteRejection(){
    await this.setState({show:false})
    setTimeout(async () => {await this.setState({show:true, title:Lan["Wait"], message:Lan['updateVoteRejection']})},100)
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillMount(){
    await this.setState({willmount:true})
  }
  
  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    await this.setState({willmount:false})
  }
  
  cancel(){
    this.props.navigation.goBack()
  }
  
  async next(){
    await this.setState({show:false})
    if(this.props.post.content.length < 2){
      setTimeout(async () =>{await this.setState({show:true, title:"Wait...", message:Lan['No_content_alert']})},100)
      
      return
    }else{
      if(this.purpose == "postArticle" ||this.purpose == "updateArticle"){
        this.purpose == "postArticle" ? this.props.navigation.navigate("Post_tags",{purpose:this.purpose,mid:this.props.navigation.getParam("mid")}) : this.props.navigation.navigate("Post_tags",{purpose:this.purpose,aid:this.props.navigation.getParam("aid")})
      }else if(this.purpose == "updateRoast" || "postRoast"){
        this.purpose == "postRoast" ?this.props.navigation.navigate("Post_tags",{purpose:this.purpose}):this.props.navigation.navigate("Post_tags",{purpose:this.purpose,rid:this.props.navigation.getParam("rid")})
      }else{
        this.props.navigation.navigate("Post_tags",{purpose:this.purpose})
      }
    }
  }
  async closeReminderWindow(){
    await this.setState({
      showReminderWindow:false
    })
  }

  render(){
    // console.log(this.props.post.content)
    if(this.state.willmount){
      //这是post masker的第三步
      if (this.purpose == "postMasker" || this.purpose == "updateArticle"){
        progress = 3
        total = 5  
      }else if(this.purpose == "postRoast" || this.purpose == "updateRoast"){
        progress = 2
        total = 4
      }
  
      //如果没有输入任何内容(redux的post.content中只有toolbar),不允许进入下一步

      buttonheader = ButtonHeader({layout:"left-center-right",
                      center_content:ProgressMeter({progress:progress,
                                                     total:total}),
                      fontColor:CANCEL_BUTTON_TEXT_COLOR,
                      right_button_color:THEME_COLOR,
                      left_button_onPress:this.cancel,
                      left_button_text:Lan["Back"],
                      right_button_onPress:this.next,
                      right_button_text:Lan["Next"]})
      
  
      //content页面的显示内容    
      layout = []
  
      //直接从post中拿信息
      layout_info = this.props.post.content
  
      for (var i=0;i<layout_info.length;i++){
        if (layout_info[i].info_type == "ToolBar"){
          layout.push(<ToolBar 
                         key={i} 
                         info_index={i}
                         post={this.props.post}
                         navigation={this.props.navigation}
                         handleScreenRecorder={this.handleScreenRecorder}
                         handleVoteTwice={this.handleVoteTwice}/>)
        }else if(["Text","Photo","Video","Location"].includes(layout_info[i].info_type)){
          layout.push(
            <ContentDisplayPanel info_type={layout_info[i].info_type}
                                 info={layout_info[i].info}
                                 key={i}
                                 info_index={layout_info[i].info_index}
                                 navigation={this.props.navigation}/>)
        }else if(layout_info[i].info_type == "Vote"){
          layout.push(
            <ContentDisplayPanel info_type={layout_info[i].info_type}
                                 info={layout_info[i].info}
                                 key={i}
                                 info_index={layout_info[i].info_index}
                                 updateVoteRejection={this.updateVoteRejection}
                                 navigation={this.props.navigation}/>)
        }
      }
      return(
        <View style={Post_content_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
          {buttonheader}
          <ScrollView style={Post_content_style.wrapper}
                      contentContainerStyle={{
                        justifyContent:"flex-start",
                        alignItems:"flex-start",
                      }}>
            {layout}
          </ScrollView>
          <MO_Alerts show={this.state.show} 
                     type={"Notice"}
                     title={this.state.title}
                     message={this.state.message}/>
        </View>
      )
    }else{
      return(
        <View style={Post_content_style.container}>
          <ScrollView style={Post_content_style.wrapper}
                      contentContainerStyle={{
                        justifyContent:"flex-start",
                        alignItems:"flex-start",
                      }}>
            <Spinner color='#C4C4C4'/>
          </ScrollView>
        </View>

      )
    }
  }
}
const Post_content_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
  },
  wrapper:{
    height:height - HEADER_HEIGHT - STATUSBAR_HEIGHT,
    width:width,
    alignSelf:"center",
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
  },
})
const getPropsFromState = state => ({
  post: state.post
})
export default connect(getPropsFromState)(Post_content)

