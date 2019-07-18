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
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  x7. 投票不能再更新
  解决status 413
  2019.Jan.04
*/
/*
TODO
  1. post location
*/
//official modules
import React, { Component } from 'react';
import { View,
         Text,
         ScrollView,
         StyleSheet,
         BackHandler } from 'react-native';

//MASKOFF custom modules
import { ButtonHeader,
         ProgressMeter,
         MASKOFFStatusBar,
         ContentDisplayPanel,
         NameAliasTagDisplayPanel } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//redux modules
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { clearCache } from '../store/actions.js';

//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         LAMBDA_LIMITED_SIZE,
         getPackSize } from '../utility/Util.js';

import { futch_lambda,
         futch_ec2 } from "../utility/HttpRequests"

import { Lan } from '../utility/Languages.js';

import { FILLING_COLOR,
         STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component 
class Post_PreviewPage extends Component{
  constructor(props){
    super(props)

    //function binding
    this.cancel=this.cancel.bind(this)
    this.publish=this.publish.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.packContent=this.packContent.bind(this)
    this.sendData=this.sendData.bind(this)

    //status bit
    this.purpose=this.props.navigation.getParam("purpose")

    this.state={
      show:false,
      type:"progress",
      progress:"0"
    }
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  packContent(){
    var content = []
    var i = 0
    for(const item of this.props.post.content){
      if (item["info_type"] == "Photo" ||item["info_type"] == "Video"){
          if(item["info_type"] == "Photo"){
            data_type = "image/jpeg"
          }else{
            data_type = "video/mp4"
          }
          data_filename = item['info'].split("/")
          data_filename = data_filename[data_filename.length - 1]
          data.append(i.toString(),{uri:item['info'],type:data_type,name:data_filename})
          content.push({"type":data_type,"filename":data_filename})  
          i += 1
      }else if(item["info_type"] == "Text"){
        content.push({"type":"text/plain","filename":item["info"]})
        i += 1
      }else if(item["info_type"] == "Location"){
        content.push({"type":"location","latitude":item["info"]["latitude"],"longitude":item["info"]["longitude"]})
        i += 1
      }else if(item["info_type"] == "Vote"){
        vote_options = []
        for(var i=0;i<item.info.length;i++){
          vote_options.push(item.info[i]["option"])
        }
        content.push({"type":"vote","options":vote_options})
        i += 1
      }
    }
    return content
    
  }

  async sendData(endpoint,method,body,total_size){
    if(total_size < LAMBDA_LIMITED_SIZE){
      //console.log("futch_lambda")
      futch_lambda(endpoint, {
        method: method,
        body: body
      }, async (progressEvent) => {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
        if(progress < 100){
          await this.setState({progress:progress.toString() + "%"})
        }else{
          await this.setState({progress:"99 %"})
          setTimeout(async () =>{await this.setState({show:false})}, 500);
        }
      }).then(async (res) => {
        if(res.status == 200){
          await this.setState({show:true,type:"HttpReqs_PreviewPage",message:Lan['Done'],title:Lan['Post_Success'],button_text:Lan['OK']})
          setTimeout(async () =>{await this.setState({show:false})},50)
        }else{
          await this.setState({show:true,type:"HttpReqs_PreviewPage",message:JSON.parse(res.responseText)["message"],title:Lan['Post_Failed'],button_text:Lan['OK']})
          setTimeout(async () =>{await  this.setState({show:false})},50)
        }
      }, async (err) => {
        await this.setState({show:true,type:"HttpReqs_PreviewPage",message:Lan['No_Internet'],title:Lan['Post_Failed'],button_text:Lan['Retry']})
        setTimeout(async () => {await this.setState({show:false})},50)
      })
    }else{
      futch_ec2(endpoint, {
        method: method,
        body: body
      }, async (progressEvent) => {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
        if(progress < 100){
          await this.setState({progress:progress.toString() + "%"})
        }else{
          await this.setState({progress:"99 %"})
          setTimeout(async () =>{await this.setState({show:false})}, 500);
        }
      }).then(async (res) => {
        if(res.status == 200){
          await this.setState({show:true,type:"HttpReqs_PreviewPage",message:Lan['Done'],title:Lan['Post_Success'],button_text:Lan['OK']})
          setTimeout(async () =>{await this.setState({show:false})},50)
        }else{
          await this.setState({show:true,type:"HttpReqs_PreviewPage",message:JSON.parse(res.responseText)["message"],title:Lan['Post_Failed'],button_text:Lan['OK']})
          setTimeout(async () =>{await  this.setState({show:false})},50)
        }
      }, async (err) => {
        await this.setState({show:true,type:"HttpReqs_PreviewPage",message:Lan['No_Internet'],title:Lan['Post_Failed'],button_text:Lan['Retry']})
        setTimeout(async () => {await this.setState({show:false})},50)
      })
    }
  }

  cancel(){
    this.props.navigation.goBack()
  }
  async publish(){
    this.setState({show:false})
    total_size = await getPackSize(this.props.post,"post")  
    if(total_size == false){
      setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['cannot_find_file'],title:Lan['Wait']})},50)
    }
    
    switch(this.purpose){
      case "postMasker":
        data = new FormData()
        masker = {}
        masker['name'] = this.props.post["name"]
        masker['alias'] = this.props.post["alias"]
        masker['tags'] = this.props.post["tags"]
  
        var content = this.packContent()
        masker['content'] = content
  
        data.append('masker',JSON.stringify(masker))
        
        await this.setState({show:true,type:"progress",progress:"0"})
        await this.sendData("/maskers",'post',data,total_size)
        break;
      case "postRoast":
        data = new FormData()
        roast = {}
        roast['title'] = this.props.post["title"]
        roast['tags'] = this.props.post["tags"]

        var content = this.packContent()
      
        roast['content'] = content
        data.append('roast',JSON.stringify(roast))
        await this.setState({show:true,type:"progress"})
        await this.sendData("/roasts",'post',data,total_size)
        break;
      case "updateRoast":
        data = new FormData()
        roast = {}
        roast['title'] = this.props.post["title"]
        roast['tags'] = this.props.post["tags"]
        roast['rid'] = this.props.navigation.getParam("rid")
  
        var content = this.packContent()
  
        roast['content'] = content
        data.append('roast',JSON.stringify(roast))
        await this.setState({show:true,type:"progress"})
        await this.sendData("/roasts",'put',data,total_size)
        break;
      case "postArticle":
        data = new FormData()
        masker = {}
        masker['mid'] =this.props.navigation.getParam("mid")
        masker['alias'] = this.props.post["alias"]
        masker['tags'] = this.props.post["tags"]
  
        var content = this.packContent()
  
        masker['content'] = content
        data.append('masker',JSON.stringify(masker))
        await this.setState({show:true,type:"progress"})
        await this.sendData("/articles",'post',data,total_size)
        break;
      case "updateArticle":
        data = new FormData()
        article = {}
        article['aid'] =this.props.navigation.getParam("aid")
        article['alias'] = this.props.post["alias"]
        article['tags'] = this.props.post["tags"]
  
        var content = this.packContent()
  
        article['content'] = content
        data.append('article',JSON.stringify(article))
        await this.setState({show:true,type:"progress"})
        await this.sendData("/articles",'PUT',data,total_size)
        break;
    }
  }

  render(){

    layout = []

    layout_info = this.props.post.content
    for (var i=0;i<this.props.post.content.length;i++){
      if(this.props.post.content[i].info_type !== "ToolBar")
        layout.push(
          <ContentDisplayPanel info_type={this.props.post.content[i].info_type}
                               info={this.props.post.content[i].info}
                               key={i}
                               info_index={this.props.post.content[i].info_index}
                               preview={true}/>)
    }

    if (this.purpose == "postMasker" || this.purpose == "postArticle"||this.purpose == "updateArticle"){
      progress = 5
      total = 5  
      review = <NameAliasTagDisplayPanel content={layout}
                                         name={this.props.post.name}
                                         alias={this.props.post.alias}
                                         tags={this.props.post.tags}
                                         purpose={this.purpose}/>
      header = ButtonHeader({layout:"left-center-right",
                      center_content:ProgressMeter({progress:progress,
                                                     total:total,
                                                     maskname:Lan['Preview'],
                                                     fontColor:"white"}),
                      fontColor:CANCEL_BUTTON_TEXT_COLOR,
                      right_button_color:THEME_COLOR,
                      left_button_onPress:this.cancel,
                      left_button_text:Lan["Back"],
                      right_button_onPress:this.publish,
                      right_button_text:Lan["Publish"]})
    }else if(this.purpose == "postRoast" || this.purpose == "updateRoast"){
      progress = 4
      total = 4
      review = <NameAliasTagDisplayPanel content={layout}
                                         title={this.props.post["title"]}
                                         purpose={this.purpose}
                                         tags={this.props.post.tags}/>
      header = ButtonHeader({layout:"left-center-right",
                      center_content:ProgressMeter({progress:progress,
                                                     total:total,
                                                    fontColor:"#D4AF37"}),
                      fontColor:CANCEL_BUTTON_TEXT_COLOR,
                      right_button_color:THEME_COLOR,
                      left_button_onPress:this.cancel,
                      left_button_text:Lan["Back"],
                      right_button_onPress:this.publish,
                      right_button_text:Lan["Publish"]})
    }
    return(
      <View style={{flex:1, backgroundColor:FILLING_COLOR}}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
        {header}
        <ScrollView style={PostMasker_style.scroll_view}
                    contentContainerStyle={{
                      justifyContent:"center",
                      alignItems:"center",
                    }}>
          {review}
        </ScrollView>
        <MO_Alerts show={this.state.show} 
                   type={this.state.type} 
                   progress={this.state.progress} 
                   message={this.state.message}
                   title={this.state.title}
                   button_text={this.state.button_text}
                   retry={this.publish}
                   navigation={this.props.navigation}/>
      </View>
    )
  }
}

const PostMasker_style = StyleSheet.create({
  scroll_view:{
    height:height - HEADER_HEIGHT - STATUSBAR_HEIGHT,
    width:width,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    alignSelf:"center"
  }
})

const getPropsFromState = state => ({
  post: state.post
})

export default connect(getPropsFromState)(Post_PreviewPage)

