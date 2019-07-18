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
         TouchableWithoutFeedback,
         Image,
         ImageBackground,
         StatusBar,
         Keyboard,
         TextInput,
         Text,
         BackHandler } from 'react-native';

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
import { Register,
         Forget } from "../utility/HttpRequests"
import { Init_leancloud } from "../utility/Init_leancloud.js";

//languages
import { Lan,
         setLanDict } from '../utility/Languages.js';

import resolveAssetSource from 'resolveAssetSource';
const mask_bg = '../assets/images/mask_bg.jpg';
const login_bg = '../assets/images/MASKOFF_type.png';
const Facebook = '../assets/images/facebook_bw.png';
const Wechat = '../assets/images/WeChat_bw.png'
const bg_original_height = resolveAssetSource(require(login_bg)).height;
const bg_original_width = resolveAssetSource(require(login_bg)).width;
//bg_height is determined by the section that contains it(height * 25%)
const bg_height = (height / 4) * 0.8
const bg_width = (bg_height/bg_original_height) * bg_original_width;
const login_button_height = 50;
const login_button_width = width / 2 * 0.85;

import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import { STATUS_BAR_COLOR,
         WELCOME_COLOR,
         TRANSPARENT,
         THEME_COLOR,
         COLOR_login } from '../utility/colors.js'

// Component -- UI checked
export default class Login extends Component {
  constructor(props){
    super(props);
    this.setLanguage = this.setLanguage.bind(this)
    this.Login_Register = this.Login_Register.bind(this);
    this.Forget_password = this.Forget_password.bind(this)
    this._handleBackPress = this._handleBackPress.bind(this)
    this.state=({
      done_loading: false,
      show:false,
      title:'',
      message:'',
      progress:'',
      closeOnTouchOutside:true,
      idd:"86",
      phone_number:"",
      password:"",
      language:"Chi",
      email:""
    })
    this.user_info = {}
    if(global.language == undefined){
      global.language = "Chinese"
    }
  }

  componentWillMount(){
    setLanDict("Chinese")
    StatusBar.setHidden(true)
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
   StatusBar.setHidden(false)
   BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  _handleBackPress(){
    return true
  }

  async setLanguage(language){
    global.language = language
    language == "Chi"?setLanDict("Chinese"):setLanDict("English")
    this.setState({language:language})
    global.local_settings = await SecureStore.getItemAsync("local_settings");
    if(global.local_settings == undefined){
      await SecureStore.setItemAsync("local_settings",JSON.stringify({Language_Conversion_Switch:language == "Eng"?true:false,
                                                     Notification_Sound_Switch:false,
                                                     Notification_Vibration_Switch:false})).catch(error => console.error(error.message))
      global.local_settings = await SecureStore.getItemAsync("local_settings");
    }
    return
  }

  async Login_Register(purpose){
    try{
      // 实际用
      // await this.setState({show:false})
      // if(this.state.idd == ""){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_idd'],title:Lan['Wait']})},50)
      //   return
      // }else if(!/^\d+$/.test(this.state.idd)){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['numeric_idd'],title:Lan['Wait']})},50)
      //   return
      // }else if(this.state.phone_number == ""){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_phone_number'],title:Lan['Wait']})},50)
      //   return
      // }else if(!/^\d+$/.test(this.state.phone_number)){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['numeric_phone_number'],title:Lan['Wait']})},50)
      //   return
      // }else if(this.state.password.trim() == ""){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_password'],title:Lan['Wait']})},50)
      //   return
      // }else if(!/^[a-zA-Z0-9!@#$%^&*]{6,20}$/.test(this.state.password.trim())){
      //   //6-20 char
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['password_requirement'],title:Lan['Wait']})},50)
      //   return
      // }else if(purpose == "register" && this.state.email == ""){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_email'],title:Lan['Wait']})},50)
      //   return
      // }else if(purpose == "register" && !/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(String(this.state.email).toLowerCase())){
      //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['email_illegal_symbol'],title:Lan['Wait']})},50)
      //   return
      // }else{
      //   setTimeout(async ()=>{await this.setState({show:true,type:"progress",progress:Lan["connecting"],closeOnTouchOutside:false})},100)  
      // }
      
      // this.user_info = {
      //   "phone_number":this.state.phone_number.trim(),
      //   "password":this.state.password.trim(),
      //   "idd":"+"+this.state.idd.trim(),
      //   "purpose":purpose,
      //   "language":global.language == "Chinese"?"Chi":"Eng"
      // }

      // console.log(this.user_info)
      // let response = await Register(this.user_info)
      // console.log(response)
      // 实际用

      // 测试用
      this.user_info = {
        "idd": "+1",
        "language": "Eng",
        "password": "Jsjsjsjs",
        "phone_number": "6479862310",
        "purpose": "login",
        "email":purpose == "register"?this.state.email.trim():null
      }
      // setTimeout(async ()=>{await this.setState({show:true,type:"progress",progress:Lan["connecting"],closeOnTouchOutside:false})},100)  
      let response = {status:200}
      //console.log(response)
      // 测试用

      if(response == false){
        //如果catch error
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
      }else if(response.status == 200){
        //如果连接成功
        // let json = await response.json();
        // global.access_token = await json["access_token"]
        // global.uid = await json["uid"]
        // global.ruid = await json["ruid"]
        // global.roast_thumbnail = await json["roast_thumbnail"]
        // await SecureStore.setItemAsync("roast_thumbnail",json["roast_thumbnail"])
        // await SecureStore.setItemAsync("ruid",json["ruid"])
        // await SecureStore.setItemAsync("uid",json["uid"])
        // await SecureStore.setItemAsync("access_token",json["access_token"])
        // await store.dispatch(pushFrontPage(json["front_page"]))  
        // await Init_leancloud()
        StatusBar.setHidden(false)
        await this.setState({show:false})
        await this.props.navigation.navigate("Login_Confirm",{"idd":this.state.idd.trim(),"phone_number":this.state.phone_number.trim(),"purpose":purpose,"verification_way":"phone",password:this.state.password.trim(),email:this.state.email.trim()})
      }else if(response.status == 400){
        let json = await response.json();
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},50)
      }else if(response.status == 401){
        let json = await response.json();
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},50)
      }else if(response.status == 429 ){
        let json = await response.json();
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
      }else{
        //如果response 不ok 让用户重连试试看
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
        await this.setState({show:false})
      }
    }catch(error){ 
      //console.log(error)
      //无网络
      setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
      await this.setState({show:false})
    }
  }
  async Forget_password(){
    StatusBar.setHidden(false)
    this.props.navigation.navigate("Login_Verify")
    // await this.setState({show:false})
    // try{
    //   if(this.state.idd == ""){
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_idd'],title:Lan['Wait']})},50)
    //     return
    //   }else if(!/^\d+$/.test(this.state.idd)){
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['numeric_idd'],title:Lan['Wait']})},50)
    //     return
    //   }else if(this.state.phone_number == ""){
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_phone_number'],title:Lan['Wait']})},50)
    //     return
    //   }else if(!/^\d+$/.test(this.state.phone_number)){
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['numeric_phone_number'],title:Lan['Wait']})},50)
    //     return
    //   }else{
    //     setTimeout(async ()=>{await this.setState({show:true,type:"progress",progress:Lan["connecting"],closeOnTouchOutside:false})},100)  
    //   }
      
    //   this.user_info = {
    //     "phone_number":this.state.phone_number,
    //     "idd":"+"+this.state.idd
    //   }

    //   let response = await Forget(this.user_info)

    //   if(response == false){
    //     //如果catch error
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
    //   }else if(response.status == 200){
    //     this.props.navigation.navigate("Post_Verify")
    //   }else if(response.status == 601){
    //     setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['request_too_often'],title:Lan['Wait']})},50)
    //   }else{
    //     //如果response 不ok 让用户重连试试看
    //     setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',closeOnTouchOutside:true})},100)
    //   }
    // }catch(error){
    //   console.log(error)
    //   //无网络
    //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
    // }
  }
  render() {
    // console.log(this.state)
    return (
        <Grid>
          {/* MASKOFF background logo */}
          
          <Row style={styles.login_row} size={30}>
            <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}
              style={styles.login_row}>
              <ImageBackground 
                  style={styles.image_container} 
                  source={require(mask_bg)}
                  >
                <Image source={require(login_bg)} style={styles.login_bg} resizeMode="contain"/>
              </ImageBackground>
            </TouchableWithoutFeedback>
          </Row>
          
          <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
            <Row style={[styles.login_col]} size={40}>
              <View style={[styles.subinput_container,{marginTop:15}]}>
                <TouchableOpacity style={[styles.lan_select_button,{borderRightWidth:0, 
                                                                    borderTopLeftRadius:3,
                                                                    borderBottomLeftRadius:3,
                                                                    backgroundColor:this.state.language == "Eng"? THEME_COLOR:"white",}]}
                                  onPress={()=>this.setLanguage("Eng")}>
                  <Text style={{fontWeight:this.state.language == "Eng"? "600":"400",
                                color:this.state.language == "Eng"? "white":THEME_COLOR}}>
                    {"Eng"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.lan_select_button,{borderTopRightRadius:3,
                                                                    borderBottomRightRadius:3,
                                                                    backgroundColor:this.state.language == "Chi"? THEME_COLOR:"white",}]}
                                  onPress={()=>this.setLanguage("Chi")}>
                  <Text style={{fontWeight:this.state.language == "Chi"? "600":"400",
                                color:this.state.language == "Chi"? "white":THEME_COLOR}}>
                    {"中文"}
                  </Text>
                </TouchableOpacity>
              </View>
              <View 
                  style={[styles.textinput_container,{marginTop: 15,}]}
                  onPress={()=>Keyboard.dismiss()}>
                  <View style={[styles.subinput_container,{marginTop: 30,}]}>
                      <View style={{alignSelf:"flex-end"}}>
                          <Ionicons name="ios-call"
                              size={25}
                              color={THEME_COLOR}/>
                      </View>
                      <TextInput
                        multiline={false}
                        onChangeText={async (num) =>{await this.setState({idd:num})}}
                        value={this.state.idd}
                        style={[styles.textinput,{width:30,marginRight:5,marginLeft:10}]}
                        autoFocus={false}
                        blurOnSubmit={true}
                        keyboardAppearance="light"
                        selectionColor={THEME_COLOR}
                        keyboardType="numeric"
                        // underlineColorAndroid="transparent"
                      />
                      <TextInput
                        multiline={false}
                        onChangeText={async (num) => {await this.setState({phone_number:num})}}
                        value={this.state.phone_number}
                        style={styles.textinput}
                        autoFocus={false}
                        blurOnSubmit={true}
                        keyboardAppearance="light"
                        selectionColor={THEME_COLOR}
                        keyboardType="numeric"
                        // underlineColorAndroid="transparent"
                      />
                  </View>
                  
                  <View style={[styles.subinput_container,{marginTop: 30}]}>
                      <View style={{alignSelf:"flex-end"}}>
                          <Ionicons name="ios-keypad"
                              size={25}
                              color={THEME_COLOR}/>
                      </View>
                      <TextInput
                        multiline={false}
                        onChangeText={async (num) =>{await this.setState({password:num})}}
                        value={this.state.password}
                        secureTextEntry={true} 
                        style={[styles.textinput,{width:width / 2 + 30 + 5,marginLeft:10}]}
                        autoFocus={false}
                        blurOnSubmit={true}
                        keyboardAppearance="light"
                        selectionColor={THEME_COLOR}
                        keyboardType="default"
                        // underlineColorAndroid="transparent"
                      />
                  </View>

                  <View style={[styles.subinput_container,{marginTop: 30,marginBottom: 40}]}>
                      <View style={{alignSelf:"flex-end"}}>
                          <Ionicons name="ios-mail"
                              size={25}
                              color={THEME_COLOR}/>
                      </View>
                      <TextInput
                        multiline={false}
                        onChangeText={async (num) =>{this.setState({email:num})}}
                        value={this.state.email}
                        style={[styles.textinput,{width:width / 2 + 30 + 5,marginLeft:10}]}
                        autoFocus={false}
                        blurOnSubmit={true}
                        keyboardAppearance="light"
                        selectionColor={THEME_COLOR}
                        keyboardType="default"
                        placeholder={"  "+Lan["For_account_recovery"]}
                        placeholderTextColor={"#c4c4c4"}
                      />
                  </View>
              </View>
              </Row>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={()=>Keyboard.dismiss()}>
              <Row style={[styles.login_col,{justifyContent: 'center'}]} size={30}>
              <View style={styles.button_container}>
                  {/*  Login/Register Button */}
                  <TouchableOpacity onPress={() => {this.Login_Register("login");}} style={styles.login_button}>
                    <Text style={styles.login_button_text}>{Lan['Sign_in']}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => {this.Login_Register("register");}} style={styles.login_button}>
                    <Text style={styles.login_button_text}>{Lan['Sign_up']}</Text>
                  </TouchableOpacity>
                  {/* Privacy disclamer */}
              </View>
              <TouchableOpacity style={{flexDirection:"row"}}
                onPress={this.Forget_password}>
                <View style={{marginRight:3}}>
                  <MaterialCommunityIcons name={"lock-question"} size={15} color={THEME_COLOR}/>
                </View>
                <Text style={[styles.terms_text,{color:THEME_COLOR,fontStyle:"normal",textDecorationLine:'underline'}]}>
                    {Lan["Forget_password"]}
                </Text>
              </TouchableOpacity>
              <View style={styles.terms_view}>
                  <Text style={styles.terms_text}>{Lan['Encryption_claim']}</Text>
              </View>
              {/* Terms and Condition */}
              <TouchableOpacity style={styles.terms_view}
                    onPress={()=>{this.props.navigation.navigate("Terms_And_Conditions")}}>
                  <Text style={[styles.terms_text,{textDecorationLine:"underline",color:COLOR_login["agree_text"]}]}>{Lan['Legal_claim']}</Text>
              </TouchableOpacity>
              {/* Margin Bottom */}
            </Row>
          </TouchableWithoutFeedback>
          <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   title={this.state.title}
                   message={this.state.message}
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
    backgroundColor:TRANSPARENT,
  },
  login_col:{
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor:"white",
  },
  image_container:{
    width:width,
    height:height * (0.25+0.15),
    backgroundColor:TRANSPARENT,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  login_bg:{
    width:bg_width,
    height:bg_height,
    // marginTop:height * 0.1,
    backgroundColor:TRANSPARENT
  },
  lan_select_button:{
    borderWidth:1,
    paddingTop:5,
    paddingBottom:5,
    paddingLeft:10,
    paddingRight:10,
    borderColor:THEME_COLOR
  },
  login_button:{
    width:login_button_width,
    height:login_button_height,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:TRANSPARENT,
    borderColor:COLOR_login["button_border"],
    justifyContent: 'center',
    borderWidth: 1,
    marginBottom:20,
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
    width:width * 0.85,
    flexDirection:"row",
    alignItems:"center",
    backgroundColor:TRANSPARENT,
    borderColor:TRANSPARENT,
    justifyContent: 'center',
    marginBottom:10,
    marginTop:20,
  },
  button_container:{
    width:width,
    flexDirection:'row',
    justifyContent:'space-evenly',
    alignItems:'center'
  },
  textinput_container:{
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    borderColor:THEME_COLOR,
    borderRadius:3,
    paddingLeft:40,
    paddingRight:40
  },
  subinput_container:{
    flexDirection:'row',
    justifyContent:'center',
    alignItems:'center',
  },
  textinput:{
    fontSize: 18,
    backgroundColor:TRANSPARENT,
    color:COLOR_login["text_input_text"],
    width:width / 2,
    borderBottomWidth:1,
    borderColor:COLOR_login["text_input_border"],
  }
});
