/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 重新发送在不active的时候用淡绿色 / selection color淡绿色(Ted)
  0. 10改60
  x0. 改成MO_Alerts
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
// Official Modules
import React from 'react'
import { StyleSheet, 
         Text, 
         View, 
         TextInput,
         Keyboard,
         BackHandler } from 'react-native'

//storage
import { SecureStore } from 'expo';

//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//leancloud
import { Init_leancloud } from "../utility/Init_leancloud.js";

// Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';
import { ConfirmVerification,
         ForgetPassword,
         Register } from "../utility/HttpRequests"

// Custom Modules
import { MASKOFFStatusBar,
         ButtonHeader } from '../components/Modules.js';
import Ripple from 'react-native-material-ripple';
import TimerCountdown from 'react-native-timer-countdown';
import MO_Alerts from '../components/MO_Alerts.js'

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         TRANSPARENT,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR,
         COLOR_Post_confirm } from '../utility/colors.js'

class CountdownTimer extends React.Component{
  constructor(props){
    super(props)
    this.formatSecondsRemaining=this.formatSecondsRemaining.bind(this)
  }
  formatSecondsRemaining(milliseconds) {
    const totalSeconds = Math.round(milliseconds / 1000);
    let seconds = parseInt(totalSeconds % 60, 10);
    seconds = seconds < 10 ? '0' + seconds : seconds;
    return seconds;
  }
  render(){
    return(
      <TimerCountdown
        //测试用
        initialSecondsRemaining={1000*5}
        //测试用
        //正式用
        // initialSecondsRemaining={1000*59}
        //正式用
        onTimeElapsed={this.props.set_resend_active}
        allowFontScaling={true}
        style={{ fontSize: 10 }}
        formatSecondsRemaining={this.formatSecondsRemaining}
        style={[styles.resend_button_text,{color:COLOR_Post_confirm["button_text"],fontSize: 15}]}
      />
    )
  }
}

class InputDigits extends React.Component {
  constructor(props){
    super(props)
    this.state = {
      vcode1:"",
      vcode2:"",
      vcode3:"",
      vcode4:"",
      vcode5:"",
      vcode6:"",
    }
    this.input_vcode=this.input_vcode.bind(this)
  }
  async input_vcode(num,ref){
    if (ref == 1){
      await this.setState({vcode1:num})
      if(this.state.vcode1 && !this.state.vcode2){
        this.secondTextInput.focus()
      }
    }else if(ref == 2){
      await this.setState({vcode2:num})
      if(this.state.vcode2 && !this.state.vcode3){
        this.thirdTextInput.focus()
      }      
    }else if(ref == 3){
      await this.setState({vcode3:num})
      if(this.state.vcode3 && !this.state.vcode4){
        this.forthTextInput.focus()
      }
    }else if(ref == 4){
      await this.setState({vcode4:num})
      if(this.state.vcode4 && !this.state.vcode5){
        this.fifthTextInput.focus()
      }
    }else if(ref == 5){
      await this.setState({vcode5:num})
      if(this.state.vcode5 && !this.state.vcode6){
        this.sixthTextInput.focus()
      } 
    }else if(ref == 6){
      await this.setState({vcode6:num})
      if(this.state.vcode6 != ''){
        Keyboard.dismiss()
      } 
    }
  }
  get_vcode(){
    return this.state.vcode1 + 
    this.state.vcode2 + 
    this.state.vcode3 + 
    this.state.vcode4 + 
    this.state.vcode5 + 
    this.state.vcode6 
  }
  set_vcode(){
    this.setState({
      vcode1:"",
      vcode2:"",
      vcode3:"",
      vcode4:"",
      vcode5:"",
      vcode6:"",
    })
    this.firstTextInput.focus()
  }
  render(){
    return(
      <View style={styles.verification_code}>
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.firstTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,1)}}
          value={this.state.vcode1}
          style={styles.textInput}
          autoFocus={true}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.secondTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,2)}}
          value={this.state.vcode2}
          style={styles.textInput}
          autoFocus={false}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.thirdTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,3)}}
          value={this.state.vcode3}
          style={styles.textInput}
          autoFocus={false}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.forthTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,4)}}
          value={this.state.vcode4}
          style={styles.textInput}
          autoFocus={false}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.fifthTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,5)}}
          value={this.state.vcode5}
          style={styles.textInput}
          autoFocus={false}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
        <TextInput
          multiline={false}
          maxLength={1}
          ref={(input) => { this.sixthTextInput = input; }}
          onChangeText={(num) => {this.input_vcode(num,6)}}
          value={this.state.vcode6}
          style={styles.textInput}
          autoFocus={false}
          blurOnSubmit={true}
          keyboardAppearance="light"
          selectionColor="#2da157"
          keyboardType="phone-pad"
          underlineColorAndroid="transparent"
        />
      </View>
    )
  }
}


// UI checked
export default class Login_Confirm extends React.Component {
  constructor(props) {
    super(props)
    

    this.resend=this.resend.bind(this)
    this.set_resend_active=this.set_resend_active.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.confirm=this.confirm.bind(this)
    this.newPasswordInput=this.newPasswordInput.bind(this)
    this.inputVcode = React.createRef();
    this.purpose=this.props.navigation.getParam("purpose")
    this.idd=this.props.navigation.getParam("idd")
    this.phone_number=this.props.navigation.getParam("phone_number")
    this.verification_way=this.props.navigation.getParam("verification_way") //"phone","email"
    this.purpose=this.props.navigation.getParam("purpose") //"login","register","forget","verify_email_verification_code"
    this.state={
      show:false,
      title:'',
      message:'',
      type:'',
      resend_active:false,
      new_password:""
    }
  }

  async set_resend_active(){
    await this.setState({resend_active:true})
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount() {
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  _handleBackPress(){
    this.props.navigation.goBack()
    return true
  }

  async resend(){
    await this.setState({show:false})
    if(this.state.resend_active){
      if(this.verification_way == "phone"){
        if(this.purpose == "login" || this.purpose == "register"){
          if (global.language == undefined){
            global.language = "Chinese"
          }
          let password = this.props.navigation.getParam("password")
          if (password == undefined){
            return
          }
          if (this.purpose == 'register'){
            email = this.props.navigation.getParam("email")
          }
          
          let user_info = {
            "idd": "+" + this.idd,
            "language":global.language == "Chinese"?"Chi":"Eng",
            "password": password,
            "phone_number": this.phone_number,
            "purpose": this.purpose,
            "email":this.purpose == "register"?email:null
          }
          //console.log(user_info)
          let response = await Register(user_info)
          //console.log(response)

          if(response == false){
            //如果catch error
            setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
          }else if(response.status == 200){
            await this.setState({show:false})
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
        }else if(this.purpose == "forget"){
          try{
            if (global.language == undefined){
              global.language = "Chinese"
            }
            let info = {"idd":"+"+this.idd,"phone_number":this.phone_number,"language":global.language == "Chinese"?"Chi":"Eng","purpose":this.purpose}
            // 正式用
            let response = await ForgetPassword(info)
            // 正式用
            // 测试用
            // let response = {ok:true}
            // 测试用
            //console.log(info)
            //console.log(response)
            if(response == false){
              setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
            }else if(response.status == 422){
              setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
            }else if(response.status == 429){
              let json = await response.json()
              //console.log(json)
              setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
            }else if(response.ok){
              
            }else{
              setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
            }
          }catch(error){
            setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
          }
        }
        
      }else if(this.verification_way == "email"){
        try{
          if (global.language == undefined){
            global.language = "Chinese"
          }
          let info = {"idd":"+"+this.idd,"phone_number":this.phone_number,"language":global.language == "Chinese"?"Chi":"Eng",purpose:"resend_email"}
          // 正式用
          // let response = await ForgetPassword(info)
          // 正式用
          // 测试用
          let response = {ok:true}
          // 测试用
          //console.log(info)
          //console.log(response)
          if(response == false){
            setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
          }else if(response.status == 422){
            setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
          }else if(response.status == 429){
            let json = await response.json()
            setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
          }else if(response.ok){
            //console.log("ok")
          }else{
            setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
          }
        }catch(error){
          setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
        }
      }
    }
    await this.setState({resend_active:false})
  }
  async confirm(){
    await this.setState({show:false})
    vcode = this.refs.inputVcode.get_vcode().trim()
    if(vcode == ""){
      setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_password'],title:Lan['Wait']})},50)
      return
    }

    if(this.verification_way == "email"){
      if(this.state.new_password.trim() == ""){
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_password'],title:Lan['Wait']})},50)
        return
      }else if(!/^[a-zA-Z0-9!@#$%^&*]{6,20}$/.test(this.state.new_password.trim())){
        //6-20 char
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['password_requirement'],title:Lan['Wait']})},50)
        return
      }
    }

    try{
      let info = {"idd":"+"+this.idd,
                  "phone_number":this.phone_number,
                  "language":global.language == "Chinese"?"Chi":"Eng",
                  "vcode":vcode,
                  "purpose":this.purpose,
                  "email_verification_code":this.purpose == "verify_email_verification_code"?vcode:null,
                  "new_password":this.purpose == "verify_email_verification_code"?this.state.new_password.trim():null
                  }
      let response = await ConfirmVerification(info)
      
      //console.log(info)
      //console.log(response)
      if(response == false){
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
      }else if(response.status == 422){
        let json = await response.json()
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
      }else if(response.status == 500){
        let json = await response.json()
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
      }else if(response.status == 401){
        let json = await response.json()
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
      }else if(response.ok){
        let json = await response.json()
        //console.log(json)
        if(this.purpose == "forget"){
          if(this.verification_way == "phone"){
            this.verification_way = "email"
            this.purpose = "verify_email_verification_code"
            this.email_mask = json["email_mask"]
            this.refs.inputVcode.set_vcode()
            response = undefined
            json = undefined
            this.setState({})
          }else if(this.verification_way == "email"){
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
            await this.props.navigation.navigate("Footer")
          }
        }else{
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
          await this.props.navigation.navigate("Footer")
        }
      }else{
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
      }
    }catch(error){
      //console.log(error)
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet_mes'],title:Lan['No_Internet']})},100)
    }
  }

  newPasswordInput(){
    if(this.verification_way == "email"){
      return(
        <View style={styles.passwordTextInputContainer}>
          <TextInput
            multiline={false}
            onChangeText={async (num) =>{await this.setState({new_password:num})}}
            value={this.state.new_password}
            secureTextEntry={true} 
            style={[styles.passwordTextInput,{width:width / 2 + 30 + 5,marginLeft:10}]}
            autoFocus={false}
            blurOnSubmit={true}
            keyboardAppearance="light"
            selectionColor={THEME_COLOR}
            keyboardType="default"
            placeholder={"  "+Lan["Enter_new_password"]}
            placeholderTextColor={"#c4c4c4"}
          />
        </View>
      )
    }
    return null
  }
  render() {
    if(this.state.resend_active){
      resend_button = <Ripple style={styles.send_button}
                              onPress={() => this.resend()}
                              rippleColor={THEME_COLOR}
                              rippleOpacity={0.3} >
              <Text style={styles.resend_button_text}>
                {Lan["Resend"]}
              </Text>
            </Ripple>
    }else{
      if(global.language == "English"){
        retry_e = <Text style={styles.resend_button_text}>
                {Lan["Retry_in"]}
              </Text>
        retry_c = null
      }else if(global.language == "Chinese"){
        retry_e = null
        retry_c = <Text style={styles.resend_button_text}>
                {Lan["Retry_in"]}
              </Text>
      }
      resend_button = <Ripple style={styles.send_button}
                              disabled={true}
                              rippleColor={THEME_COLOR}
                              rippleOpacity={0.3} >
              {retry_e}
              <CountdownTimer set_resend_active={this.set_resend_active}/>
              {retry_c}
            </Ripple>
            
    }
    
    return (
      <View>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:BACKGROUND_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Post_confirm["button_text"]}}>{Lan['SMS_Verify']}</Text>,
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:Lan['Cancel']})}
        <View style={styles.content_container}>
          <Text style={styles.instructions}>
            {this.verification_way == "phone"?Lan["Verification_text_sent"] + "\n" + "+ " + this.idd + " " + this.phone_number:Lan["Verification_email_sent"] + this.email_mask }
          </Text>
          <InputDigits ref='inputVcode'/>   
          {this.newPasswordInput()}         
          <View style={styles.buttons}>
            {resend_button}
            <Ripple style={styles.send_button}
                    onPress={() => this.confirm()}
                    rippleColor={THEME_COLOR}
                    rippleOpacity={0.3} >
              <Text style={styles.send_button_text}>
                {Lan["Confirm"]}
              </Text>
            </Ripple>
          </View>
        </View>
        <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   title={this.state.title}
                   message={this.state.message}/>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  content_container:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width:width,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    backgroundColor:BACKGROUND_COLOR,
  },
  verification_code:{
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginTop:30,
  },
  buttons:{
    flexDirection:"row",
    justifyContent:"space-evenly",
    alignItems:"center",
    marginTop:20,
    width:width,

  },
  textInput: {
    marginLeft: 10,
    fontSize: 25,
    marginTop: 8,
    backgroundColor:TRANSPARENT,
    color:COLOR_Post_confirm["text_input_text"],
    width:18,
    borderBottomWidth:1,
    borderColor:COLOR_Post_confirm["text_input_border"],
  },
  send_button:{
    height:40,
    width:width / 3,
    borderRadius:5,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    borderColor:THEME_COLOR,
    borderWidth:1
  },
  send_button_text:{
    fontSize:15,
    fontWeight:"400",
    color:COLOR_Post_confirm["button_text"]
  },
  resend_button_text:{
    fontSize:15,
    fontWeight:"400",
    color:COLOR_Post_confirm["button_text"]
  },
  instructions: {
    width:width * (2 / 3),
    fontSize: 14,
    textAlign: 'center',
    color: COLOR_Post_confirm["instructions_text"],
    marginTop: 10,
    backgroundColor: TRANSPARENT,
    marginTop:height / 5
  },
  passwordTextInput:{
    fontSize: 18,
    backgroundColor:TRANSPARENT,
    color:COLOR_Post_confirm["text_input_text"],
    width:width / 2,
    borderBottomWidth:1,
    borderColor:COLOR_Post_confirm["text_input_border"],
  },
  passwordTextInputContainer:{
    justifyContent:"center",
    alignItems:"center",
    padding:20,
    borderColor:THEME_COLOR,
  }
})
