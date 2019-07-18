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
import { createBottomTabNavigator,
         createStackNavigator,
         createMaterialTopTabNavigator } from 'react-navigation'; // 1.0.0-beta.14

//custom components
import { MASKOFFStatusBar,
         SearchBarHeaderDecoy } from '../components/Modules.js'
import RedDotWindow from '../components/RedDotWindow.js'

//icons
import { Ionicons } from '@expo/vector-icons';

//utility
import { height, 
         width,
         FOOTER_HEIGHT,
         TOP_TAB_HEIGHT,
         HEADER_HEIGHT,
         connect_to_server } from '../utility/Util.js';
import { CheckWriteAccess } from "../utility/HttpRequests.js"


//pages
import User from '../pages/User.js';
import Search_n_Recommend from "../pages/Search_n_Recommend.js";
import Roast_Follow from '../pages/Roast_Follow.js'
import Roast_Trending from '../pages/Roast_Trending.js'
import Roast_Recommend from '../pages/Roast_Recommend.js'
import Roast_Around from '../pages/Roast_Around.js'
import Masker_Follow from '../pages/Masker_Follow.js'
import Masker_Trending from '../pages/Masker_Trending.js'
import Masker_Recommend from '../pages/Masker_Recommend.js'
import Masker_Around from '../pages/Masker_Around.js'
import Contacts_Header_Wrapper from '../pages/Contacts_Header_Wrapper.js'

//languages
import { Lan } from '../utility/Languages.js';

//colors
import { THEME_COLOR,
         HEADER_BAR_COLOR,
         BACKGROUND_COLOR,
         COLOR_Footer_Wrapper,
         STATUS_BAR_COLOR } from '../utility/colors.js'

const Top_Header_Nav_Options_General = 
{
    tabBarOptions:{ upperCaseLabel:false,
                    style:{
                      backgroundColor:"white",
                      
                      height:TOP_TAB_HEIGHT,
                    },
                    activeTintColor:"#333333",
                    inactiveTintColor:"#999999",
                    indicatorStyle:{
                      backgroundColor:"#2da157",
                      height:2
                    },
                    tabStyle:{
                      height:TOP_TAB_HEIGHT,
                      flexDirection:"column",
                      justifyContent:"center",
                      alignItems:"center",
                    },
                    labelStyle:{
                      height:20,
                      width:width / 3 - 5,
                      textAlignVertical:"center",
                      fontSize:12,
                      fontFamily:"Tencent",
                      textAlign:"center",
                    },
                    allowFontScaling:false,
                  },
    optimizationsEnabled:true,
    initialRouteName:"Around",
    style:{
      backgroundColor:"white"
    },
  }

const Masker_Header =  createMaterialTopTabNavigator(
  {
    Follow: { screen:Masker_Follow,
                     navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Follow"]
                          }),  },
    Around: { screen:Masker_Around,
                       navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Around"]
                          }),  },
    Recommend: { screen:Masker_Recommend,
                        navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Recommand"]
                          }),  },
    
  },
  Top_Header_Nav_Options_General
);
class Masker_Header_Wrapper extends Component{
  static router = Masker_Header.router;
  constructor(props){
    super(props)
    this.post = this.post.bind(this)
  }
  async post(){
    try{
      var response = await CheckWriteAccess()
      var json = await response.json()
      if(json["write_access"]){
        this.props.navigation.navigate("Post_name_alias",{purpose:"postMasker"})    
      }else{
        this.props.navigation.navigate("Login")    
      }
    }catch(error){
      console.error(error)
      Alert.alert(
        'Alert',
        'Network Failed',
        [
          {text: 'Retry', onPress: async () => {await this.post()}},
        ],
        { cancelable: false }
      )
    }
  }
  render(){
    return(
      <View style={Header_Tab_Nav_style.nav_page}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                           barStyle:"dark-content"})}
        {SearchBarHeaderDecoy({placeholder:Lan["Him"],
                              right_icon:"ios-brush",
                              right_icon_text:Lan['Post'],
                              left_button_text_style:{fontFamily:"Tencent"},
                              right_button_text_style:{fontFamily:"Tencent"},
                              right_button_press:this.post,
                              navigate_search:() => this.props.navigation.navigate("Search_n_Recommend",{purpose:"searchMasker"}),
                              navigation:this.props.navigation})}
        <Masker_Header navigation={this.props.navigation}/>
      </View>

    )
  }
}

const Roast_Header =  createMaterialTopTabNavigator(
  {
    Follow: { screen: Roast_Follow,
                      navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Follow"]
                          }), },
    Around: { screen: Roast_Around,
                        navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Around"]
                          }), },
    Recommend: { screen:Roast_Recommend,
                        navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan["Recommand"]
                          }), },
  },
  Top_Header_Nav_Options_General
);
class Roast_Header_Wrapper extends Component{
  static router = Roast_Header.router;
  constructor(props){
    super(props)
    this.post = this.post.bind(this)
  }
  post(){
    this.props.navigation.navigate("Post_title",{purpose:"postRoast"})
  }
  render(){
    return(
      <View style={Header_Tab_Nav_style.nav_page}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                           barStyle:"dark-content"})}
        {SearchBarHeaderDecoy({placeholder:Lan["Theirs"],
                              right_icon:"ios-brush",
                              right_icon_text:Lan['Post'],
                              right_button_press:this.post,
                              left_button_text_style:{fontFamily:"Tencent"},
                              right_button_text_style:{fontFamily:"Tencent"},
                              navigate_search:() => this.props.navigation.navigate("Search_n_Recommend",{purpose:"searchRoast"}),
                              navigation:this.props.navigation})}
        <Roast_Header navigation={this.props.navigation}/>
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
    flexDirection:"row",
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
})

const Footer =  createBottomTabNavigator(
  {
    Maskers:{ screen:Masker_Header_Wrapper,
                     navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan['Maskers']
                          })},
    Roasts: { screen:Roast_Header_Wrapper,
                     navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan['Roasts']
                          }) },
    Contacts: { screen:Contacts_Header_Wrapper,
                       navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan['Contacts']
                          }) },
    You: { screen:User, 
                  navigationOptions:({navigation}) =>({
                            tabBarLabel:Lan['You']
                          })},
  },
  {
    defaultNavigationOptions: ({ navigation, screenProps }) => ({
      tabBarIcon: ({ focused, tintColor }) => {
        const { routeName } = navigation.state;
        let iconName;
        if (routeName === 'Maskers') {
          if (focused){
            iconName = 'ios-hammer'
            iconColor = tintColor
          }else{
            iconName = 'ios-hammer'
            iconColor = COLOR_Footer_Wrapper["iconColor_inactive"]
          }
        } else if (routeName === 'Roasts') {
          if (focused){
            iconName = 'ios-megaphone'
            iconColor = tintColor
          }else{
            iconName = 'ios-megaphone'
            iconColor = COLOR_Footer_Wrapper["iconColor_inactive"]
          }
        } else if (routeName === 'Contacts'){
          if (focused){
            iconName = 'ios-people'
            iconColor = tintColor
          }else{
            iconName = 'ios-people' 
            iconColor = COLOR_Footer_Wrapper["iconColor_inactive"]
          }
        } else if (routeName === 'You') {
          if (focused){
            iconName = 'ios-person'
            iconColor = tintColor
          }else{
            iconName = 'ios-person'
            iconColor = COLOR_Footer_Wrapper["iconColor_inactive"]
          }
        } 
        return <RedDotWindow left={width / 4 / 2 + 5}
                             right={0}
                             top={0}
                             bottom={0}
                             icon={<Ionicons name={iconName} size={30} color={iconColor} />}
                             usage={routeName}/>
        
      },
    }),
    tabBarOptions: {
      style: {
        borderTopWidth: 0,
        borderTopWidth:1,
        backgroundColor:HEADER_BAR_COLOR,
      },
      activeTintColor: THEME_COLOR,
      inactiveTintColor: '#707070',
      activeBackgroundColor: HEADER_BAR_COLOR,
      inactiveBackgroundColor: HEADER_BAR_COLOR,
      labelStyle:{
        fontFamily:"Tencent"
      },
      iconStyle:{
        width:width / 4
      }
    },
    lazy:true,
    initialRouteName:"Roasts",
  }
);
export default Footer;

