/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';

//official component
import { Alert } from 'react-native';

//navigation
import { createBottomTabNavigator,
         createStackNavigator,
         createMaterialTopTabNavigator,
         createAppContainer } from 'react-navigation'; // 1.0.0-beta.14

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
import ImageZoomPage from '../pages/ImageZoomPage.js'
import Post_Verify from '../pages/Post_Verify.js'
import Post_Confirm from '../pages/Post_Confirm.js'
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
//import sub-navigator
import Footer from '../navigations/Footer_Wrapper.js'




const General_Navigator = createStackNavigator(
  { 
    Footer: { screen: Footer },
    Chat:{ screen: Chat },
    Post_Verify: { screen: Post_Verify },
    Comment_WriteComment:{ screen:Comment_WriteComment },
    View_Comment:{ screen:View_Comment },
    Search_n_Recommend:{ screen: Search_n_Recommend },
    Post_content:{ screen:Post_content },
    Post_PreviewPage:{ screen:Post_PreviewPage },
    Post_title: { screen: Post_title },
    Post_Confirm: { screen: Post_Confirm },
    Post_vote: { screen: Post_vote },
    ImageZoomPage:{ screen:ImageZoomPage },
    Post_TextContent: { screen:Post_TextContent },
    Post_tags: { screen:Post_tags },
    Post_name_alias: { screen:Post_name_alias },
    Post_alias_post_article:{ screen:Post_alias_post_article },
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
    WebViewPage:{ screen:WebViewPage }
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

const Access = createStackNavigator(
  {
    Login:{ screen: Login },
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
    Welcome:{ screen: Welcome },
    Access: { screen: Access },
    Terms_And_Conditions: { screen:Terms_And_Conditions },
    General_Navigator: { screen: General_Navigator },
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


const App = createAppContainer(WelcomeNavigator);

export default App;


