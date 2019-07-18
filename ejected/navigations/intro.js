/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';

//official component
import { View,
         Image,
         Platform,
         StatusBar,
         StyleSheet,
         InteractionManager } from 'react-native';
import MO_Alerts from '../components/MO_Alerts.js'

//storage 
import { SecureStore,
         Permissions,
         Location } from 'expo';

//navigation
import { createBottomTabNavigator,
         createStackNavigator,
         createMaterialTopTabNavigator,
         createAppContainer } from 'react-navigation'; // 1.0.0-beta.14

//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//supress warning
import { YellowBox } from 'react-native';
YellowBox.ignoreWarnings(['Warning: isMounted(...) is deprecated', 'Module RCTImageLoader']);
YellowBox.ignoreWarnings(['Setting a timer']);

import { WELCOME_COLOR } from '../utility/colors.js'

import { height,
         width, 
         MASKOFF_LOGO, 
         MASKOFF_LOGO_welcome_page_height,
         MASKOFF_LOGO_welcome_page_width } from '../utility/Util.js';

import { Relogin,
         signatureFactory,
         checkGFW } from "../utility/HttpRequests";
import { Init_leancloud } from "../utility/Init_leancloud.js";
import { Init_local_settings,
         First_init } from "../utility/Init_local_settings.js"

//language
import { Lan } from '../utility/Languages.js'

//pages
import Welcome from '../pages/welcome.js'
import Login from '../pages/login.js'
import Terms_And_Conditions from '../pages/Terms_And_Conditions.js'
import Search_n_Recommend from "../pages/Search_n_Recommend.js";
import { Contact_Recent }from "../pages/Contact_Recent.js";
import Chat from "../pages/ChatPage.js";
import Post_content from '../pages/Post_content.js';
import Post_PreviewPage from '../pages/Post_PreviewPage.js';
import Post_TextContent from '../pages/Post_TextContent.js';
import Post_name_alias from '../pages/Post_name_alias.js';
import Post_tags from '../pages/Post_tags.js';
import Post_vote from '../pages/Post_vote.js';
import Post_contacts from '../pages/Post_contacts.js'
import ImageZoomPage from '../pages/ImageZoomPage.js'
import Login_Verify from '../pages/Login_Verify.js'
import Login_Confirm from '../pages/Login_Confirm.js'
import Post_title from '../pages/Post_title.js'
import Article_Roast_Display from '../pages/Article_Roast_Display.js'
import Roast_Follow  from '../pages/Roast_Follow.js'
import Roast_Trending from '../pages/Roast_Trending.js'
import Roast_Recommend from '../pages/Roast_Recommend.js'
import Roast_Around from '../pages/Roast_Around.js'
import Masker_Follow from '../pages/Masker_Follow.js'
import Masker_Trending from '../pages/Masker_Trending.js'
import Masker_Recommend from '../pages/Masker_Recommend.js'
import Masker_Around from '../pages/Masker_Around.js'
import Masker_Display_page from '../pages/Masker_Display_page.js'
import Post_alias_post_article from '../pages/Post_alias_post_article.js'
import Comment_WriteComment from '../pages/Comment_WriteComment.js'
import View_Comment from '../pages/View_Comment.js'
import PickLocationPage from '../pages/PickLocationPage.js'
import Users_Block_List from '../pages/Users_Block_List.js'
import Users_About_MASKOFF from '../pages/Users_About_MASKOFF.js'
import Users_View_Self_Posts from '../pages/Users_View_Self_Posts.js'
import ViewLocationPage from '../pages/ViewLocationPage.js'
import WebViewPage from '../pages/WebViewPage.js'
import ShowLocationPage from '../pages/ShowLocationPage.js'
import MKOF_Image_manipulator from '../pages/MKOF_Image_manipulator.js'

//import sub-navigator
import Footer from '../navigations/Footer_Wrapper.js'




const General_Stack_Navigator = createStackNavigator(
  { 
    Footer: { screen: Footer },
    Chat:{ screen: Chat },
    Comment_WriteComment:{ screen:Comment_WriteComment },
    View_Comment:{ screen:View_Comment },
    Search_n_Recommend:{ screen: Search_n_Recommend },
    Post_content:{ screen:Post_content },
    Post_PreviewPage:{ screen:Post_PreviewPage },
    Post_title: { screen: Post_title },
    Post_vote: { screen: Post_vote },
    Post_contacts: { screen:Post_contacts },
    Post_TextContent: { screen:Post_TextContent },
    Post_tags: { screen:Post_tags },
    Post_name_alias: { screen:Post_name_alias },
    Post_alias_post_article:{ screen:Post_alias_post_article },
    ImageZoomPage:{ screen:ImageZoomPage },
    Masker_Recommend: { screen:Masker_Recommend },
    Masker_Follow: { screen:Masker_Follow },
    Masker_Trending: { screen:Masker_Trending },
    Masker_Around: { screen:Masker_Around },
    Masker_Display_page: { screen:Masker_Display_page },
    Roast_Recommend: { screen:Roast_Recommend },
    Roast_Follow: { screen:Roast_Follow },
    Roast_Trending: { screen:Roast_Trending },
    Roast_Around: { screen:Roast_Around },
    Article_Roast_Display:{ screen:Article_Roast_Display },
    PickLocationPage: { screen:PickLocationPage },
    ShowLocationPage: { screen:ShowLocationPage },
    Users_Block_List: { screen:Users_Block_List },
    Users_About_MASKOFF:{ screen:Users_About_MASKOFF },
    Users_View_Self_Posts:{ screen:Users_View_Self_Posts },
    ViewLocationPage:{ screen:ViewLocationPage },
    WebViewPage:{ screen:WebViewPage },
    MKOF_Image_manipulator: { screen:MKOF_Image_manipulator },
  },
  {
    headerMode: 'none',
    navigationOptions: 
    {
        headerVisible: false,
        gesturesEnabled: false,
    },
    transitionConfig: () => ({
      screenInterpolator: sceneProps => {
          const { layout, position, scene } = sceneProps;
          const { index } = scene;
  
          const translateX = position.interpolate({
              inputRange: [index - 1, index, index + 1],
              outputRange: [layout.initWidth, 0, 0]
          });
  
          const opacity = position.interpolate({
              inputRange: [
                  index - 1,
                  index - 0.99,
                  index,
                  index + 0.99,
                  index + 1
              ],
              outputRange: [0, 1, 1, 0.3, 0]
          });
          return { opacity, transform: [{ translateX }] };
      }
    })
  },

)

class General_Navigator extends Component{
  static router = General_Stack_Navigator.router;
  constructor(props){
    super(props);
    this.state=({
      done_loading: false,
      show:false,
      title:'',
      message:'',
      ready:false,
      navigate_into_mainpage:false })

    //function binding
    this.connect=this.connect.bind(this)
    this.notice=this.notice.bind(this)
    this._getLocationAsync=this._getLocationAsync.bind(this)

    //status bits
    this.locationPerm = false
  }

  componentWillMount(){
    StatusBar.setHidden(true)
  }

  async componentDidMount() {
    global.access_token = await SecureStore.getItemAsync("access_token")
    global.first_connect = false

    if(global.access_token == undefined){
      this.props.navigation.navigate("Login")
    }
    await First_init()
    await this.setState({ done_loading: true })
    // setTimeout(()=>this.setState({ready:true}),3000)
    InteractionManager.runAfterInteractions(() => {
      StatusBar.setHidden(false)
      setTimeout(()=>this.setState({ready:true}),2000)
      // this.setState({ready:true})
    });
    //sets global.GFW
    //check if user is in GFW
    //get permission for location
    
    
    await checkGFW()
    
    //Init sound/font/sqlite/local settings/language/server addr
    await Promise.all([
      { status: existingStatus } = await Permissions.getAsync(Permissions.LOCATION),
      await Init_local_settings()  
    ])
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['Need_location_perm_message'],title:Lan['Need_location_perm_title']})},100)
      
    }else{
      this.locationPerm=true
    }
    
    await this.setState({ done_loading: true })
    
    
    await this.connect("componentWillMount")
    
  }

  _getLocationAsync = async () => {
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
    
    await Promise.all([
      cur_coor = await this._getLocationAsync(),
      global.access_token = await SecureStore.getItemAsync("access_token"),
      global.uid = await SecureStore.getItemAsync("uid"),
      global.ruid = await SecureStore.getItemAsync("ruid"),
      global.roast_thumbnail = await SecureStore.getItemAsync("roast_thumbnail")
    ])

    if (global.uid == undefined || global.access_token == undefined || global.ruid == undefined || global.roast_thumbnail == undefined){
      navigation.navigate("Login")
      return
    }

    if (global.access_token){
      console.log("global.access_token",global.access_token)
      console.log("global.uid",global.uid)
      console.log("global.ruid",global.ruid)
      //get current location. Perm was sure open on componentWillMount
    }
    await Init_leancloud()
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

  render(){
    if(!this.state.ready){
      if(!this.state.done_loading){
        cover =  <View style={styles.container}>
          <Image source={MASKOFF_LOGO} style={styles.MASKOFF_logo} />
        </View>
      }else{
        cover = <View style={styles.container}>
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
      }
      
    }else{
      cover = null
    }
    if(!this.state.done_loading){
        return( <View style={styles.container}>
          <Image source={MASKOFF_LOGO} style={styles.MASKOFF_logo} />
        </View>
        )
      }else{
      return(
          <View style={{height:height,width:width}}>
            <General_Stack_Navigator navigation={this.props.navigation}/>
            {this.state.navigate_into_mainpage?null:cover}
          </View>
        )
      }
    
  }
}

const Access = createStackNavigator(
  {
    Login:{ screen: Login },
    Login_Confirm: { screen: Login_Confirm },
    Login_Verify: { screen: Login_Verify },
    General_Navigator: { screen: General_Navigator },
  },
  {
    headerMode: 'none',
    navigationOptions: 
    {
        headerVisible: false,
        gesturesEnabled: false,
    }
  },

);

const WelcomeNavigator = createStackNavigator(
  {
    General_Navigator: { screen: General_Navigator },
    Access: { screen: Access },
    Terms_And_Conditions: { screen:Terms_And_Conditions }
    
  },
  {
    headerMode: 'none',
    navigationOptions: 
    {
        headerVisible: false,
        gesturesEnabled: false,
    }
  }
);

const styles = StyleSheet.create({
  container:{
    height:height,
    width:width,
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    position:"absolute",
    top:0,
    left:0,
    backgroundColor:WELCOME_COLOR
  },
  MASKOFF_logo:{
    width: MASKOFF_LOGO_welcome_page_width, 
    height: MASKOFF_LOGO_welcome_page_height}
});
const App = createAppContainer(WelcomeNavigator);

export default App;


