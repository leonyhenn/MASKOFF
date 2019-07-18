/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//official modules
import React, { Component } from 'react';
import { View, 
         FlatList,
         StyleSheet,
         Text,
         Image } from 'react-native';

//Custom
import { MASKOFFStatusBar,
         ButtonHeader,
         ChatThumbnailWindow } from '../components/Modules.js';

//Utilities
import { height,
         width, 
         MASKOFF_LOGO, 
         MASKOFF_LOGO_welcome_page_height,
         MASKOFF_LOGO_welcome_page_width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

//Languages
import { Lan } from '../utility/Languages.js';

import { THEME_COLOR,
         STATUS_BAR_COLOR,
         COLOR_Users_about_MASKOFF } from '../utility/colors.js'

// Component UI--checked
export default class Users_About_MASKOFF extends Component {
  constructor(props){
    super(props)
    this.blocked_list = [
      {
        id:"6666666",
        maskname:"中条 彩未1",

      }, 
      {
                id:"777777",
        maskname:"中条 彩未2",

      }   
    ]
    
  }
  
  render() {
    let pic ='../ayami_nakajo/1.jpg'
    return (
      <View 
        style={styles.container}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:THEME_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Users_about_MASKOFF["About_MASKOFF"],}}> About MASKOFF </Text>,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:"Cancel"})}
        <View style={styles.display_panel_top}>
        <Image source={MASKOFF_LOGO} style={styles.MASKOFF_logo} />
        
        
          <Text style={styles.version}>MASKOFF 1.0.0</Text>
          <Text style={styles.version}>{Lan['Developed_by']}</Text>
          <Text style={styles.version}>HAPPY ROASTING</Text>
          
        </View>
        <View style={styles.display_panel_bottom}>
          <Text style={styles.laws}>{Lan["Law"]}</Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1,
  },
  display_panel_top:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - 50,
    width:width,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  display_panel_bottom:{
    height:50,
    width:width,
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
  },
  MASKOFF_logo:{
    margin:40,
    width: MASKOFF_LOGO_welcome_page_width / 2, 
    height: MASKOFF_LOGO_welcome_page_height / 2,
    borderRadius:3
  },
  version:{
    color:COLOR_Users_about_MASKOFF["version"],
    marginBottom:5
  },
  laws:{
    color:COLOR_Users_about_MASKOFF["laws"],
    fontStyle:"italic",
    marginBottom:5,
  }
  
  
})


