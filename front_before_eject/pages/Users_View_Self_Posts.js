/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x0. 检查purpose
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.16
  
  x0. BackHandler
*/
//official modules
import React, { Component } from 'react';
import { View, 
         Text,
         FlatList,
         StyleSheet,
         BackHandler } from 'react-native';

//native-base
import { Spinner } from 'native-base'

//MASKOFF custom modules
import { ButtonHeader,
         MASKOFFStatusBar, 
         DisplayCard_roast,
         DisplayCard_masker } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//utilities
import { width,
         height, 
         HEADER_HEIGHT,
         STATUSBAR_HEIGHT } from '../utility/Util.js';

//languages
import { Lan } from '../utility/Languages.js'

//HttpRequests
import { selfPosts } from '../utility/HttpRequests.js'

import { FILLING_COLOR,
         STATUS_BAR_COLOR,
         THEME_COLOR,
         COLOR_Users_View_Self_Posts } from '../utility/colors.js'

//Component UI--checked
export default class Users_View_Self_Posts extends Component {
  constructor(props){
    super(props)
    
    this.state={
      loading:true,
      show:false,
      type:undefined,
      message:undefined,
      title:undefined
    }

    this.purpose = this.props.navigation.getParam("purpose")

    this.back=this.back.bind(this)
    this.retry=this.retry.bind(this)
    this.get_self_posts=this.get_self_posts.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)

    this.unmount = false

    this.articles = []
    this.roasts = []
  }

  async get_self_posts(){
    if(!this.unmount){
      await this.setState({isOpen:false,show:false,caller:undefined})
    }
    var response = await selfPosts()
    if(response == false){
      //说明前面出现了error, 需要重连
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
      }
    }else if(response.ok){
      json = await response.json()
      this.articles = await json["articles"]
      this.roasts = await json["roasts"]
      if(!this.unmount){
        await this.setState({loading:false})
      }
    }else if(response.status == 401){Z
      navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:''})},100)
      }
      return
    }
  }

  async componentWillMount(){
    await this.get_self_posts()
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    this.unmount = true
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  _handleBackPress(){
    this.back()
    return
  }

  back(){
    this.props.navigation.goBack()
  }

  async retry(caller){
    await this.get_self_posts()
  }

  render() {
    if(this.state.loading){
      return(
        <View style={{flex:1,backgroundColor:FILLING_COLOR}}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
          {ButtonHeader({layout:"searchMasker",
                        left_button_onPress:() => this.back(),
                        left_button_text:Lan["Back"],
                        right_button_text:Lan["More"]})}
          <View style={Roast_Recommend_style.results_wrapper}>
            <Spinner color='#C4C4C4'/>
          </View>
          <MO_Alerts show={this.state.show} 
                     type={this.state.type}
                     retry={async () => {await this.retry(this.state.caller)}}
                     showCancelButton={false}
                     title={this.state.title}
                     message={this.state.message}/>
        </View>
      )
    }else{
      return (
        <View 
          style={{
            flex:1
          }}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"light-content"})}
          {ButtonHeader({layout:"left-center",
                          center_content:<Text style={{backgroundColor:THEME_COLOR,
                                                       fontSize:HEADER_HEIGHT / 3,
                                                       color:COLOR_Users_View_Self_Posts["Your"],}}> {this.purpose=="selfMaskers"?Lan["Your_Maskers"]:Lan["Your_Roasts"]} </Text>,
                          left_button_onPress:() => this.back(),
                          left_button_text:Lan["Cancel"]})}
          <View style={Roast_Recommend_style.results_wrapper}>
            <FlatList
              data={this.purpose == "selfMaskers"?this.articles:this.roasts}
              keyExtractor={item =>"selfMaskers"? item.aid:item.rid}
              renderItem={({item}) => {
                switch(this.purpose){
                  case "selfRoasts":
                  return <DisplayCard_roast title={item.title} tags={item.tags} content={item.content} onPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchRoast"})}/>
                  break;
                  case "selfMaskers":
                  return <DisplayCard_masker info={item} onPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})}/>
                }
              }}
              onEndReached={this._onRefresh}
            />
          </View>
          <MO_Alerts show={this.state.show} 
                     type={this.state.type}
                     retry={async () => {await this.retry(this.state.caller)}}
                     showCancelButton={false}
                     title={this.state.title}
                     message={this.state.message}/>
        </View>
      );
    }
  }
}
const Roast_Recommend_style = StyleSheet.create({
  results_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width:width,
    backgroundColor:FILLING_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center"
  }
})

