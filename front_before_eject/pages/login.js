/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. GFW
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  x7. 法律条文
  2019.Jan.03
*/

import React, { Component } from 'react';

//official components
import { View,
         StyleSheet,
         TouchableOpacity,
         Image,
         Text } from 'react-native';

import { Col, 
         Row, 
         Grid } from "react-native-easy-grid";

//storage
import { SecureStore,
         Permissions,
         Location } from 'expo';

//custom module
import { MASKOFFStatusBar } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//utilities
import { height, 
         width,
         getExpoNotificationToken,
         getExpoConstantsInstallationId } from '../utility/Util.js';
import { Register } from "../utility/HttpRequests"
import { Init_leancloud } from "../utility/Init_leancloud.js";

//languages
import { Lan } from '../utility/Languages.js';

import resolveAssetSource from 'resolveAssetSource';
const login_bg = '../assets/images/MASKOFF_type.png';
const Facebook = '../assets/images/facebook_bw.png';
const Wechat = '../assets/images/WeChat_bw.png'
const bg_original_height = resolveAssetSource(require(login_bg)).height;
const bg_original_width = resolveAssetSource(require(login_bg)).width;
//bg_height is determined by the section that contains it(height * 25%)
const bg_height = (height / 4) * 0.8
const bg_width = (bg_height/bg_original_height) * bg_original_width;
const login_button_height = 50;
const login_button_width = width * 0.85;

import { STATUS_BAR_COLOR,
         WELCOME_COLOR,
         TRANSPARENT,
         COLOR_login } from '../utility/colors.js'

// Component -- UI checked
export default class Login extends Component {
  constructor(props){
    super(props);
    this.handleFB = this.handleFB.bind(this);
    this.handleWX = this.handleWX.bind(this);
    this._getLocationAsync=this._getLocationAsync.bind(this)
    this.state=({
      done_loading: false,
      show:false,
      title:'',
      message:'',
      progress:'',
      closeOnTouchOutside:true })
    this.userInfo = {}
  }
  async retry(){
    if(this.userInfo.smacc_type == "Facebook"){
      this.handleFB()
    }else if(this.userInfo.smacc_type == "WeChat"){
      this.handleWX()
    }
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Need_location_perm_message'],title:Lan['Need_location_perm_title']})},100)
    }
    let location = await Location.getCurrentPositionAsync({});
    var cur_coor = location.coords
    return cur_coor;
  };

  async handleFB(){
    try{
      await this.setState({show:false})
      setTimeout(async ()=>{await this.setState({show:true,type:"progress",progress:Lan["connecting"],closeOnTouchOutside:false})},100)
      var cur_coor = await this._getLocationAsync()
      this.userInfo = {
        "smacc":"codenamejoker",
        "smacc_type":"Facebook",
        "gender":"1",
        "coordinate":cur_coor
      }
      var expo_installationId = getExpoConstantsInstallationId()
      console.log("InstallationId",expo_installationId)
      var expo_token = await getExpoNotificationToken()
      console.log("expo_token",expo_token)
      this.userInfo["expo_token"] = expo_token
      var response = await Register(this.userInfo)
      
      if(response == false){
        //如果catch error
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',closeOnTouchOutside:true})},100)  
      }else if(response.status == 200){
        //如果连接成功
        var json = await response.json();
        global.access_token = await json["access_token"]
        global.uid = await json["uid"]
        global.ruid = await json["ruid"]
        global.roast_thumbnail = await json["roast_thumbnail"]
        await SecureStore.setItemAsync("roast_thumbnail",json["roast_thumbnail"])
        await SecureStore.setItemAsync("ruid",json["ruid"])
        await SecureStore.setItemAsync("uid",json["uid"])
        await SecureStore.setItemAsync("access_token",json["access_token"])
        await store.dispatch(pushFrontPage(json["front_page"]))  
        await Init_leancloud()
        await this.setState({show:false})
        this.props.navigation.navigate("General_Navigator")
      }else{
        //如果response 不ok 让用户重连试试看
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',closeOnTouchOutside:true})},100)
        await this.setState({show:false})
      }
    }catch(error){ 
      //无网络
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',closeOnTouchOutside:true})},100)
      await this.setState({show:false})
    }
  }
  async handleWX(){
    try{
      await this.setState({show:false})
      setTimeout(async ()=>{await this.setState({show:true,type:"progress",progress:Lan["connecting"],closeOnTouchOutside:false})},100)
      var cur_coor = await this._getLocationAsync()
      this.userInfo = {
        "smacc":"codenamejoker",
        "smacc_type":"WeChat",
        "gender":"1",
        "coordinate":cur_coor
      }
      var expo_installationId = getExpoConstantsInstallationId()
      console.log("InstallationId",expo_installationId)
      var expo_token = await getExpoNotificationToken()
      console.log("expo_token",expo_token)
      this.userInfo["expo_token"] = expo_token
      var response = await Register(this.userInfo)
      if(response == false){
        //如果catch error
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',closeOnTouchOutside:true})},100)  
      }else if(response.status == 200){
        
        //如果连接成功
        var json = await response.json();
        global.access_token = await json["access_token"]
        global.uid = await json["uid"]
        global.ruid = await json["ruid"]
        global.roast_thumbnail = await json["roast_thumbnail"]
        await SecureStore.setItemAsync("roast_thumbnail",json["roast_thumbnail"])
        await SecureStore.setItemAsync("uid",json["uid"])
        await SecureStore.setItemAsync("ruid",json["ruid"])
        await SecureStore.setItemAsync("access_token",json["access_token"])
        await store.dispatch(pushFrontPage(json["front_page"]))  
        await this.setState({show:false})
        this.props.navigation.navigate("General_Navigator")
      }else{
        //如果response 不ok 让用户重连试试看
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',closeOnTouchOutside:true})},100)
      }
    }catch(error){
      //无网络
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',closeOnTouchOutside:true})},100)
    }
  }
  render() {
    // console.log(this.state)
    return (
        <Grid>
          {/* MadginTop */}
          <Row style={styles.login_row} size={15}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
          </Row>
          {/* MASKOFF background logo */}
          <Row style={styles.login_row} size={25}>
            <View style={styles.image_container}>
              <Image source={require(login_bg)} style={styles.login_bg} resizeMode="contain"/>
            </View>
          </Row>
          
          <Row style={styles.login_col} size={60}>
            {/*  FaceBook Login Button */}
            <TouchableOpacity onPress={() => {this.handleFB();}} style={styles.login_button}>
              <Image source={require(Facebook)} style={styles.login_button_thumbnail}/>
              <View style={styles.login_button_separator} />
              <Text style={styles.login_button_text}>{Lan['Access_via_FaceBook']}</Text>
            </TouchableOpacity>
            {/*  WeChat Login Button */}
            <TouchableOpacity onPress={() => {this.handleWX();}} style={styles.login_button}>
              <Image source={require(Wechat)} style={styles.login_button_thumbnail}/>
              <View style={styles.login_button_separator} />
              <Text style={styles.login_button_text}>{Lan['Access_via_WeChat']}</Text>
            </TouchableOpacity>
            {/* Privacy disclamer */}
            <View style={styles.terms_view}>
                <Text style={styles.terms_text}>{Lan['Encryption_claim']}</Text>
            </View>
            {/* Terms and Condition */}
            <TouchableOpacity style={styles.terms_view}
                  onPress={()=>{this.props.navigation.navigate("Terms_And_Conditions")}}>
                <Text style={[styles.terms_text,{textDecorationLine:"underline"}]}>{Lan['Legal_claim']}</Text>
            </TouchableOpacity>
            {/* Margin Bottom */}
          </Row>
          <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   retry={async () => {await this.retry()}}
                   showCancelButton={false}
                   closeOnTouchOutside={this.state.closeOnTouchOutside}
                   progress={this.state.progress}/>
        </Grid>
    );
  }
}
//-----------------------------------Navigation------------------------------------


//-----------------------------------StyleSheet------------------------------------
const styles = StyleSheet.create({
  login_row:{
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor:WELCOME_COLOR,
  },
  login_col:{
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor:WELCOME_COLOR,
    
  },
  image_container:{
    width:bg_width + 20,
    height:bg_height + 15,
    backgroundColor:WELCOME_COLOR,
    flexDirection:"column",
    justifyContent:"flex-end",
    alignItems:"center",
    borderRadius:3
  },
  login_bg:{
    width:bg_width,
    height:bg_height,
    backgroundColor:TRANSPARENT
  },
  login_button:{
    width:login_button_width,
    height:login_button_height,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:WELCOME_COLOR,
    borderColor:COLOR_login["button_border"],
    justifyContent: 'flex-start',
    borderWidth: 1,
    marginBottom:20,
    marginTop:20,
    
  },
  login_button_thumbnail:{
    width:login_button_height - 20,
    height:login_button_height - 20,
    marginLeft:5,
    marginRight:5,
    
  },
  login_button_separator:{
    width:1,
    height:login_button_height,
    backgroundColor:COLOR_login["login_button_separator"],
    marginLeft:5,
    marginRight:10,
    
  },
  login_button_text:{
    color:COLOR_login["login_button_text"],
    fontSize:18,
    fontFamily:"Arial"
  },
  terms_text:{
    color:COLOR_login["terms_text"],
    fontSize:12,
    fontFamily:"Arial",
    fontStyle:"italic"
  },
  terms_view:{
    width:login_button_width - 50,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:WELCOME_COLOR,
    borderColor:WELCOME_COLOR,
    justifyContent: 'center',
    marginBottom:10,
    marginTop:20,
  },
});
