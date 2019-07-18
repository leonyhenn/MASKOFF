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

// Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';
import { UpgradeToWriteAccess,
         RequestSMSCode } from "../utility/HttpRequests"

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
        initialSecondsRemaining={1000*59}
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
      countdown:60,
      
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
export default class Post_Confirm extends React.Component {
  constructor(props) {
    super(props)
    this.state={resend_active:false}

    this.resend=this.resend.bind(this)
    this.set_resend_active=this.set_resend_active.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.confirm=this.confirm.bind(this)
    
    this.inputVcode = React.createRef();
    this.purpose=this.props.navigation.getParam("purpose")
    this.callingCode=this.props.navigation.getParam("callingCode")
    this.phoneNum=this.props.navigation.getParam("phoneNum")
    
    this.state={
      show:false,
      title:'',
      message:'',
      type:''
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
      try{
        response = await RequestSMSCode(this.callingCode,this.phoneNum)
        json = await response.json()

        if (json["code"] == 601){
          setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Too_soon'],title:Lan['Wait']})},100)
          return
        }
      }catch(error){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet_mes'],title:Lan['No_Internet']})},100)
      }
      await this.setState({resend_active:false})
    }
  }
  async confirm(){
    await this.setState({show:false})
    vcode = this.refs.inputVcode.get_vcode()
    try{
      response = await UpgradeToWriteAccess(this.callingCode,this.phoneNum,vcode)
      json = await response.json
      
      if(response.status !== 200){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Invalid_code'],title:Lan['Wait']})},100)
      }else{
        this.props.navigation.navigate("Post_name_alias",{purpose:this.purpose})    
      }
    }catch(error){
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet_mes'],title:Lan['No_Internet']})},100)
    }
  }
  render() {
    if(this.state.resend_active){
      resend_button = <Ripple style={styles.send_button}
                              onPress={() => this.resend()}
                              rippleColor="#FFFFFF"
                              rippleOpacity={0.5} >
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
                              rippleColor="#FFFFFF"
                              rippleOpacity={0.5} >
              {retry_e}
              <CountdownTimer set_resend_active={this.set_resend_active}/>
              {retry_c}
            </Ripple>
            
    }
    
    return (
      <View>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:BACKGROUND_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Post_confirm["button_text"]}}>{Lan['SMS_Verify']}</Text>,
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:Lan['Cancel']})}
        <View style={styles.content_container}>
          <InputDigits ref='inputVcode'/>            
          <View style={styles.buttons}>
            {resend_button}
            <Ripple style={styles.send_button}
                    onPress={() => this.confirm()}
                    rippleColor="#FFFFFF"
                    rippleOpacity={0.5} >
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
    marginTop:height / 5,
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
    backgroundColor:THEME_COLOR,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
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
})
