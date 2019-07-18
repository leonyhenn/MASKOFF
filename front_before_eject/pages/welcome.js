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
  x4.实机测验
  5. GFW
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  x7. 在request和后端中加入实时位置, 返回位置旁的masker和roast
  2019.Jan.02
  
  x将所有setState / dispatch改为async/await, 取消所有除了show:false之外的取消设定 
  x重新测试
  2019.Jan.17
*/

import React, { Component } from 'react';

//official components
import { View,
         Image,
         StyleSheet } from 'react-native';
import MO_Alerts from '../components/MO_Alerts.js'

//storage 
import { SecureStore,
         Permissions,
         Location } from 'expo';

//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//supress warning
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Setting a timer']);

//utility
import { height,
         width, 
         MASKOFF_LOGO, 
         MASKOFF_LOGO_welcome_page_height,
         MASKOFF_LOGO_welcome_page_width } from '../utility/Util.js';
import { Relogin,
         signatureFactory,
         checkGFW } from "../utility/HttpRequests";
import { Init_leancloud } from "../utility/Init_leancloud.js";
import { Init_local_settings } from "../utility/Init_local_settings.js"

//language
import { Lan } from '../utility/Languages.js'

//Colors
import { WELCOME_COLOR } from '../utility/colors.js'

const TIMEOUT = 500;

// Component -- UI check complete
export default class Welcome extends Component {
  constructor(props){
    super(props);
    this.state=({done_loading: false,
                 show:false,
                 title:'',
                 message:'' })

    //function binding
    this.connect=this.connect.bind(this)
    this.notice=this.notice.bind(this)
    this._getLocationAsync=this._getLocationAsync.bind(this)

    //status bits
    this.locationPerm = false
  }

  async componentWillMount() {
    //sets global.GFW
    //check if user is in GFW
    await checkGFW()
    
    //Init sound/font/sqlite/local settings/language/server addr
    await Init_local_settings()
    await this.setState({ done_loading: true })
    
    //get permission for location
    const { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION);
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Need_location_perm_message'],title:Lan['Need_location_perm_title']})},100)
      
    }else{
      this.locationPerm=true
    }
    await this.connect("componentWillMount")
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

  async connect(caller){
    if(caller !== "Notice"){
      await this.setState({show:false})
    }
    if(!this.locationPerm){
      return
    }

    const navigation  = this.props.navigation;

    //get local access_token and uid, if none redirect user to login, otherwise relogin to verify
    global.access_token = await SecureStore.getItemAsync("access_token");
    global.uid = await SecureStore.getItemAsync("uid");
    global.ruid = await SecureStore.getItemAsync("ruid");
    global.roast_thumbnail = await SecureStore.getItemAsync("roast_thumbnail");

    if (global.uid == undefined || global.access_token == undefined || global.ruid == undefined || global.roast_thumbnail == undefined){
      navigation.navigate("Login")
      return
    }

    if (global.access_token){
      console.log("global.access_token",global.access_token)
      console.log("global.uid",global.uid)
      console.log("global.ruid",global.ruid)
      //get current location. Perm was sure open on componentWillMount
      var cur_coor = await this._getLocationAsync()
      
      response = await Relogin({coordinate:cur_coor})
      // var r = Math.floor(Math.random() * Math.floor(2));if(r == 1){response = false}else{response = {status:405}}
      if(response == false){
        //说明前面出现了error, 需要重连
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
      }else if(response.ok){
        json = await response.json()  
        valid = json["token_valid"]
        if(valid){
        //token still valid
          //get new thumbnail
          global.roast_thumbnail = json["roast_thumbnail"]
          await SecureStore.setItemAsync("roast_thumbnail",json["roast_thumbnail"])
          //init leancloud with uid
          await Init_leancloud()
          await store.dispatch(pushFrontPage(json["front_page"]))
          navigation.navigate("General_Navigator")
        }else{
        //toke not found, request new token  
          navigation.navigate("Login")
        }
      }else if(response.status == 401){
        navigation.navigate("Login")
      }else{
        //如果response不ok, 让用户重连试试
        // setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:''})},100)
        return
      }
    }else{
    //no token
      navigation.navigate("Login")
    }
  }
  async notice(){
    const navigation  = this.props.navigation;
    const { status } = await Permissions.askAsync(Permissions.LOCATION);
    finalStatus = status;     
    if (finalStatus !== 'granted') {
      return;
    }
    this.locationPerm = true
    //get front page
    await this.connect("Notice")

  }
  render() {
    if(!this.state.done_loading){
      return(
        <View style={styles.container}>
          <Image source={MASKOFF_LOGO} style={styles.MASKOFF_logo} />
        </View>
      )
    }
    return(
      <View style={styles.container}>
        <Image source={MASKOFF_LOGO} style={styles.MASKOFF_logo} />
        <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   retry={async () => {await this.connect("retry")}}
                   showCancelButton={false}
                   closeOnTouchOutside={false}
                   onConfirmPressed={this.notice}
                   title={this.state.title}
                   message={this.state.message}/>
      </View>
    )
  }
}
//-----------------------------------Navigation------------------------------------
const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor:WELCOME_COLOR
  },
  MASKOFF_logo:{
    width: MASKOFF_LOGO_welcome_page_width, 
    height: MASKOFF_LOGO_welcome_page_height}
});
