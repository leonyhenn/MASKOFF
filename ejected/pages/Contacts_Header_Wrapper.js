/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';

//official component
import { View,
         StyleSheet,
         Alert,
         Text,
         Platform } from 'react-native';

//navigation
import { createMaterialTopTabNavigator } from 'react-navigation'; // 1.0.0-beta.14

//custom components
import { MASKOFFStatusBar,
         SearchBarHeaderDecoy } from '../components/Modules.js'

// Redux
import { connect } from 'react-redux';

//utility
import { height, 
         width,
         FOOTER_HEIGHT,
         TOP_TAB_HEIGHT,
         HEADER_HEIGHT,
         connect_to_server } from '../utility/Util.js';

//leancloud
import { Init_leancloud } from "../utility/Init_leancloud.js";

//colors
import { THEME_COLOR,
         HEADER_BAR_COLOR,
         BACKGROUND_COLOR,
         COLOR_Footer_Wrapper,
         STATUS_BAR_COLOR } from '../utility/colors.js'

//languages
import { Lan } from '../utility/Languages.js';

import Contact_Recent from "../pages/Contact_Recent.js";

const Contacts_Header =  createMaterialTopTabNavigator(
  {
    Recommend: { screen:Contact_Recent,
                          navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan['Recent']
                          }), 
                        },
  },
  {
    tabBarOptions:{ upperCaseLabel:false,
                    style:{
                      backgroundColor:"#3f3f3f",
                      height:0,
                    },
                    activeTintColor:"white",
                    inactiveTintColor:"#707070",
                    indicatorStyle:{
                      backgroundColor:"white"
                    },
                    pressOpacity:100,
                    tabStyle:{
                      height:0,
                      flexDirection:"column",
                      justifyContent:"center",
                      alignItems:"center",
                    },
                    labelStyle:{
                      height:12 + 5,
                      width:width / 3 - 5,
                      textAlignVertical:"center",
                      fontSize:12,
                      fontFamily:"Tencent",
                      textAlign:"center",
                    },
                    allowFontScaling:false,
                  },
    initialRouteName:"Recommend",
    style:{
      backgroundColor:HEADER_BAR_COLOR
    },
    swipeEnabled:false,
  }

);
class Contacts_Header_Wrapper extends Component{
  static router = Contacts_Header.router;
  constructor(props){
    super(props)
    this.alien_chat = this.alien_chat.bind(this)
    this.getLeancloudStatus=this.getLeancloudStatus.bind(this)
    this.getLeancloudStatusColor=this.getLeancloudStatusColor.bind(this)
  }
  async componentWillMount(){
    if(global.IMClient == undefined){
      await Init_leancloud()
      await this.setState({})
    }
  }
  getLeancloudStatus(){
    if(global.IMClient == undefined){
      return Lan["leancloud_inactive"]
    }
    switch(this.props.leancloudStatus.status){
      case "active":
        return Lan["leancloud_active"]
        break;
      case "inactive":
        return Lan["leancloud_inactive"]
        break;
      case "retrying":
        return Lan["leancloud_retrying"]
        break;
      default:
        return Lan["leancloud_inactive"] 
    }
  }
  getLeancloudStatusColor(){
    if(global.IMClient == undefined){
      return "#ff2400"
    }
    switch(this.props.leancloudStatus.status){
      case "active":
        return "#009e60"
        break;
      case "inactive":
        return "#ff2400"
        break;
      case "retrying":
        return "#F5CC23"
        break;
      default: 
        return "#ff2400"
    }

  }
  alien_chat(){
    this.props.navigation.navigate("Contact_AlienChat")
  }
  render(){
    console.log(this.props.leancloudStatus)
    return(
      <View style={Header_Tab_Nav_style.nav_page}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                           barStyle:"dark-content"})}
        <View style={Header_Tab_Nav_style.header}>
          <Text style={Header_Tab_Nav_style.header_text}>MASKOFF</Text>
          <Text style={[Header_Tab_Nav_style.status_text,{color:this.getLeancloudStatusColor()}]}>{this.getLeancloudStatus()}</Text>
        </View>
        <Contacts_Header navigation={this.props.navigation}/>
      </View>

    )
  }
}

const Header_Tab_Nav_style = StyleSheet.create({
  nav_page:{
    flex:1
  },
  header:{
    height:HEADER_HEIGHT,
    width:width,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:HEADER_BAR_COLOR
  },
  header_text:{
    width:width,
    color:COLOR_Footer_Wrapper["header_text"],
    fontWeight:"800",
    fontStyle:"italic",
    fontSize:20,
    textAlign: 'center',
  },
  status_text:{
    width:width,
    fontWeight:"400",
    fontSize:12,
    textAlign: 'center',
  },
})

const getPropsFromState = state => ({
  leancloudStatus:state.leancloudStatus
})

export default connect(getPropsFromState)(Contacts_Header_Wrapper)