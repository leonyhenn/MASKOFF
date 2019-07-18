/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. Selection Color 需要淡一点的绿色(Ted)
  x0. 改成MO_Alerts
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
// Official modules
import React from 'react'
import { StyleSheet, 
         Text, 
         View, 
         TextInput,
         TouchableWithoutFeedback,
         Keyboard,
         BackHandler } from 'react-native'

// Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';
import { ForgetPassword } from "../utility/HttpRequests"

// Custom modules
import { MASKOFFStatusBar,
         ButtonHeader } from '../components/Modules.js';
import Ripple from 'react-native-material-ripple';
import MO_Alerts from '../components/MO_Alerts.js'

//Languages
import { Lan } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR,
         TRANSPARENT,
         COLOR_Post_Verify,
         COLOR_HEADER_RIPPLE } from '../utility/colors.js'

// UI--checked
export default class Login_Verify extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      idd: '86',
      phone_number:'',
      show:false,
      title:'',
      message:'',
      type:''
    }
    this.send_verification_code=this.send_verification_code.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
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

  async send_verification_code(){
    await this.setState({show:false})  
    Keyboard.dismiss()
    const phone_number = this.state.phone_number
    const idd = this.state.idd
    // check if phone number and country code are all valid
    numerics=["0","1","2","3","4","5","6","7","8","9"]
    for (var i=0;i<phone_number.length;i++){
      if(!numerics.includes(phone_number[i])){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Phone_Num_Not_Numeric'],title:Lan['Wait']})},100)
        return
      }
    }
    for (var i=0;i<idd.length;i++){
      if(!numerics.includes(idd[i])){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Country_Code_Not_Numeric'],title:Lan['Wait']})},100)
        return
      }
    }

    // 正式用
    // if(phone_number.trim() == ""){
    //   setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['empty_phone_number'],title:Lan['Wait']})},100)
    //   return
    // }
    // 正式用
    try{
      if (global.language == undefined){
        global.language = "Chinese"
      }
      let info = {"idd":"+"+this.state.idd,"phone_number":this.state.phone_number,"language":global.language == "Chinese"?"Chi":"Eng"}
      // 正式用
      // let response = await ForgetPassword(info)
      // 正式用
      // 测试用
      let response = {ok:true}
      // 测试用
      console.log(response)
      if(response == false){
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
      }else if(response.status == 422){
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
      }else if(response.status == 429){
        let json = await response.json()
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
      }else if(response.status == 500){
        let json = await response.json()
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:json["message"],title:Lan['Wait']})},100)
      }else if(response.ok){
        this.props.navigation.navigate("Login_Confirm",{"idd":idd,
                                                        "phone_number":phone_number,
                                                        "verification_way":"phone",
                                                        "purpose":"forget"})
      }else{
        setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['Bad_Response'],title:Lan['Wait']})},100)
      }
    }catch(error){
      setTimeout(async () =>{await this.setState({show:true,type:"Notice",message:Lan['No_Internet'],title:Lan['Wait']})},100) 
    }
  }
  render() {
    if(this.state.phone_number == ""){
      button = null
    }else{
      button = <Ripple style={[styles.send_button,{borderColor:COLOR_Post_Verify["ripple_border"]}]} 
                       onPress={this.send_verification_code}
                       rippleColor={THEME_COLOR}
                       rippleOpacity={0.3} >
        <Text style={styles.send_button_text}>
          {Lan["Send_Verification_Code"]}
        </Text>
      </Ripple>
    }
    return (
      <View>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:BACKGROUND_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Post_Verify["SMS_Verify"],}}>{Lan['SMS_Verify']}</Text>,
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:Lan['Cancel']})}
        <TouchableWithoutFeedback style={styles.content_container}
                          onPress={() => Keyboard.dismiss()}>
          <View style={styles.content_container}>
            <View style={styles.country_n_phone}>
              <Text style={styles.country_code}>{" "}+{" "}</Text>
              <TextInput
                multiline={false}
                onChangeText={async (num) =>{await this.setState({idd:num})}}
                value={this.state.idd}
                style={[styles.textInput,{width:null,marginLeft:0,color:THEME_COLOR}]}
                autoFocus={false}
                blurOnSubmit={true}
                keyboardAppearance="light"
                selectionColor="#2da157"
                keyboardType="numeric"
                underlineColorAndroid="transparent"
              />
              <TextInput
                multiline={false}
                onChangeText={async (num) => {await this.setState({phone_number:num})}}
                value={this.state.phone_number}
                style={styles.textInput}
                autoFocus={true}
                blurOnSubmit={true}
                keyboardAppearance="light"
                selectionColor="#2da157"
                keyboardType="numeric"
                underlineColorAndroid="transparent"
              />
            </View>
            <Text style={styles.instructions}>{Lan['please_enter_cellphone_number']}</Text>
            {button}
          </View>
      </TouchableWithoutFeedback>
      <MO_Alerts   show={this.state.show} 
                   type={this.state.type}
                   retry={this.send_verification_code}
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
    backgroundColor:BACKGROUND_COLOR
  },
  country_n_phone:{
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginTop:height / 5,
  },
  country_code:{
    color:THEME_COLOR,
    fontSize:15,
    marginTop:8,
  },
  instructions: {
    width:width * (2 / 3),
    fontSize: 12,
    textAlign: 'center',
    color: COLOR_Post_Verify["instructions_text"],
    marginTop: 10,
    backgroundColor: TRANSPARENT
  },
  textInput: {
    marginLeft: 10,
    fontSize: 20,
    marginTop: 8,
    backgroundColor:TRANSPARENT,
    color:COLOR_Post_Verify["text_input_text"],
    width:width / 2,
    borderBottomWidth:1,
    borderColor:COLOR_Post_Verify["text_input_border"]
  },
  send_button:{
    marginTop:20,
    borderRadius:3,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    borderWidth:1
  },
  send_button_text:{
    marginTop:10,
    marginBottom:10,
    marginLeft:20,
    marginRight:20,
    fontSize:20,
    fontWeight:"400",
    color:COLOR_Post_Verify["send_button_text"]
  },
})
