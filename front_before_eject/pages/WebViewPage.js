/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';

//React Native Offial Modules
import { StyleSheet,
         View,
         WebView } from 'react-native';

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ProgressMeter,
         ButtonHeader } from '../components/Modules.js';

//Utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';        

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR } from '../utility/colors.js'

export default class WebViewPage extends Component {
  constructor(props){
    super(props)
    this.uri=this.props.navigation.getParam("uri") 
    // this.uri = 'https://web.stanford.edu/class/cs193p/cgi-bin/.../assignments/Assignment%202_3.pdf'
    this.back=this.back.bind(this)
  }
  back(){
    this.props.navigation.goBack()
  }
  render() {
    return(
        <View style={WebViewPage_style.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
          {ButtonHeader({layout:"left-center",
                        center_content:ProgressMeter({maskname:this.uri.substring(this.uri.lastIndexOf('/')+1)}),
                        left_button_onPress:() => this.back(),
                        left_button_text:"Back"})}
          <WebView
            source={{uri: this.uri}}
            style={WebViewPage_style.webview}
          />
        </View>
    )
  }
}
const WebViewPage_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR
  },
  webview:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width: width,
  }
})