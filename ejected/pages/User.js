/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 声音用webview+html5
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.06
*/

import React, { Component } from 'react';

import { Vibration, Audio } from 'react-native'

import { View, 
         Text, 
         Image,
         Platform,
         ScrollView,
         StyleSheet,
         BackHandler,
         TouchableOpacity } from 'react-native';

//MASKOFF custom modules
import { MASKOFFStatusBar,
         User_Function_Bar,
         DisplayCard_roast,
         DisplayCard_masker,
         User_Post_Count_Bar } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//Official Modules
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         IMAGE_LIMITED_HEIGHT,
         IMAGE_LIMITED_WIDTH,
         getPermission } from '../utility/Util.js';

//Utility
import { MESSAGE_SOUND,
         MESSAGE_VIBRATION_PATTERN } from '../utility/Util.js'

//HttpRequests
import { changeThumbnail,
         getUserCount } from '../utility/HttpRequests.js'

//Expo
import { SecureStore,
         Permissions,
         ImagePicker } from 'expo';

import { Lan,
         setLanDict } from '../utility/Languages.js';

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         THEME_COLOR,
         COLOR_Users,
         HEADER_BAR_COLOR,
         SEPERATE_BAR_COLOR } from '../utility/colors.js'

export default class User extends Component {
  constructor(props){
    super(props)
    this.user_info = {
      "article_count":{
        "count":0,
        "likes":0,
        "comments":0
      },
      "roast_count":{
        "count":0,
        "likes":0,
        "comments":0
      }
    }
    this.state={
      show:false,
      type:undefined,

    }

    this.unmount = false

    this.getCount=this.getCount.bind(this)
    this.change_switch_value=this.change_switch_value.bind(this)
    this.change_roast_thumbnail=this.change_roast_thumbnail.bind(this)
    
  }

  componentWillUnmount(){
    this.unmount = true
  }

  componentDidMount(){
    this.getCount()
  }

  async getCount(){
    try{
      response = await getUserCount()
      if(!response){
        
      }   
      if(!response.ok){
        
      }else{
        json = await response.json()
        
        if(!this.unmount){
          this.user_info["article_count"] = json["articles"]
          this.user_info["roast_count"] = json["roasts"]
          await this.setState({})      
        }
        
      }
    }catch(error){
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice", title:Lan['No_Internet'], message:Lan['No_Internet_mes']})},100)
    }

  }

  async change_roast_thumbnail(){
    if(this.unmount){
      return
    }
    await this.setState({show:false})
    var response = getPermission(Permissions.CAMERA_ROLL)
    if(!response){
      return
    }
    
    var result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.Images,
      exif:false
    });
    if(!result.cancelled){
      //console.log(result.height,result.width)
      if(result.height > IMAGE_LIMITED_HEIGHT || result.height > IMAGE_LIMITED_WIDTH){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice", title:Lan['Wait'], message:Lan['Image_over_size']})},100)
        return
      }
      try{
        response = await changeThumbnail(result.uri)
        //console.log(response)
        if(!response){
          setTimeout(async ()=>{await this.setState({show:true,type:"Notice", title:Lan['No_Internet'], message:Lan['No_Internet_mes']})},100)
        }   
        if(!response.ok){
          setTimeout(async ()=>{await this.setState({show:true,type:"Notice", title:Lan['Bad_Response'], message:Lan['No_Internet_mes']})},100)
        }else{
          json = await response.json()
          global.roast_thumbnail = json.new_thumbnail
          if(!this.unmount){
            await this.setState({})      
          }
          
        }
      }catch(error){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice", title:Lan['No_Internet'], message:Lan['No_Internet_mes']})},100)
      }
    }
  }

  async change_switch_value(switch_type,value){
    // console.log("change_switch_value",value)
    // console.log(switch_type)
    switch(switch_type){
      case "Language_Conversion_Switch":
        global.local_settings.Language_Conversion_Switch = value
        global.local_settings.Language_Conversion_Switch?global.language = "English" : global.language = "Chinese"
        setLanDict(global.language)
        
        await SecureStore.setItemAsync("local_settings",JSON.stringify(global.local_settings))
        if(!this.unmount){
          await this.setState({})  
        }
        
        break
      case "Notification_Sound_Switch":
        global.local_settings.Notification_Sound_Switch = value
        if(global.local_settings.Notification_Sound_Switch){
          await MESSAGE_SOUND.setPositionAsync(0);
          await MESSAGE_SOUND.playAsync();
        }

        await SecureStore.setItemAsync("local_settings",JSON.stringify(global.local_settings))
        if(!this.unmount){
          await this.setState({})  
        }

        break
      case "Notification_Vibration_Switch":
        global.local_settings.Notification_Vibration_Switch = value
        if(global.local_settings.Notification_Vibration_Switch){
          Vibration.vibrate(MESSAGE_VIBRATION_PATTERN)  
        }
        
        await SecureStore.setItemAsync("local_settings",JSON.stringify(global.local_settings))
        if(!this.unmount){
          await this.setState({})  
        }
        
        break
    }
  }
  render() {
    
    return (
      <View style={{flex:1}}>
        {MASKOFFStatusBar({backgroundColor: STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
        <View style={styles.header}>
          
          <Text style={styles.header_text}>USER_NAME</Text>
        </View>
        <ScrollView style={styles.container}
                    contentContainerStyle={{justifyContent:"flex-start",
                                            alignItems:"center"}}>
          
          <View style={styles.thumbnails}>
            <View style={styles.thumbnail_roast_container}>
              <TouchableOpacity onPress={this.change_roast_thumbnail}>
                <Image source={{uri:global.bucket+global.roast_thumbnail}} style={styles.thumbnail_roast} />
              </TouchableOpacity>
              <Text style={styles.edit_thumbnail}>{Lan['edit_profile_picture_roast']}</Text>
            </View>
          </View>
          <View style={styles.articles}>

            <User_Post_Count_Bar iconName='ios-hammer' 
                                 name={Lan['Maskers']} 
                                 field1_name="count"
                                 field1={this.user_info["article_count"]["count"]} 
                                 field2_name="likes"
                                 field2={this.user_info["article_count"]["likes"]} 
                                 field3_name="comments"
                                 field3={this.user_info["article_count"]["comments"]}
                                 onPress={() =>this.props.navigation.navigate("Users_View_Self_Posts",{purpose:"selfMaskers"})}/>
            <View style={styles.divide_line}/>
            <User_Post_Count_Bar iconName='ios-megaphone' 
                                 name={Lan['Roasts']} 
                                 field1_name="count"
                                 field1={this.user_info["roast_count"]["count"]} 
                                 field2_name="likes"
                                 field2={this.user_info["roast_count"]["likes"]} 
                                 field3_name="comments"
                                 field3={this.user_info["roast_count"]["comments"]}
                                 onPress={() =>this.props.navigation.navigate("Users_View_Self_Posts",{purpose:"selfRoasts"})}/>
            
          </View>
          <View style={styles.functions}>
            <User_Function_Bar description={Lan['Chinese_English_Conversion']} switch={true} switch_type="Language_Conversion_Switch" on_value_change={this.change_switch_value}/>
            <View style={styles.divide_line}/>
            <User_Function_Bar description={Lan['Notification_Sound']} switch={true} switch_type="Notification_Sound_Switch" on_value_change={this.change_switch_value}/>
            <View style={styles.divide_line}/>
            <User_Function_Bar description={Lan['Notification_Vibration']} switch={true} switch_type="Notification_Vibration_Switch" on_value_change={this.change_switch_value}/>
            <View style={[styles.divide_line,{height:10,width:width}]}/>
            <User_Function_Bar description={Lan['Blocklist']} switch={false} onPress={() => this.props.navigation.navigate("Users_Block_List")}/>
            <View style={styles.divide_line}/>
            <User_Function_Bar description={Lan['Closing_Account']} switch={false} onPress={async ()=>{
                                                                                              await this.setState({show:false})
                                                                                              setTimeout(async () =>{await this.setState({show:true,message:Lan['Lose_all_info']+" "+Lan['Confirm_Close_Account'],type:"Close_Account_Confirm"})},50)
                                                                                              
                                                                                            }}/>
            <View style={styles.divide_line}/>
            <User_Function_Bar description={Lan['About_MASKOFF']} switch={false} onPress={() => this.props.navigation.navigate("Users_About_MASKOFF")}/>
          </View>
        </ScrollView>
        <MO_Alerts show={this.state.show} 
                   type={this.state.type} 
                   title={this.state.title}
                   message={this.state.message}
                   confirm={()=>{
                    BackHandler.exitApp()
                   }}/>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:"column",
    backgroundColor:BACKGROUND_COLOR,
  },
  header:{
    height:HEADER_HEIGHT,
    width:width,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:HEADER_BAR_COLOR
  },
  header_text:{
    width:width / 2,
    color:COLOR_Users["header_text"],
    fontWeight:"800",
    fontStyle:"italic",
    fontSize:20,
    textAlign: 'center',
  },
  thumbnails:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    width:width,
    backgroundColor:COLOR_Users["thumbnails"]["backgroundColor"],
    borderBottomWidth:10,
    borderColor:COLOR_Users["thumbnails"]["borderColor"],
  },
  articles:{
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    width:width,
    backgroundColor:COLOR_Users["articles"]["backgroundColor"],
    borderColor:COLOR_Users["articles"]["borderColor"],
    borderBottomWidth:20,
  },
  thumbnail_masker_container:{
    width:width / 2,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:BACKGROUND_COLOR,
    margin:10
  },
  thumbnail_masker:{
    height: width / 2 * 0.6,
    width: width / 2 * 0.6,
    borderRadius: width / 2 * 0.6 / 2,
    
  },
  thumbnail_roast_container:{
    width:width / 2,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:BACKGROUND_COLOR
  },
  thumbnail_roast:{
    height: width / 2 * 0.6,
    width: width / 2 * 0.6,
    borderRadius: width / 2 * 0.6 / 2,
  },
  edit_thumbnail:{
    color:COLOR_Users["edit_thumbnail"],
    marginTop:5,
    marginBottom:5,

  },
  divide_line:{
    width:width - 30,
    height:1,
    backgroundColor:SEPERATE_BAR_COLOR
  },
  functions:{
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  }

})