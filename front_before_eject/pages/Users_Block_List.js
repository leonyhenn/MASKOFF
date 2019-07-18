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
         Text } from 'react-native';

//Custom
import { MASKOFFStatusBar,
         ButtonHeader,
         ChatThumbnailWindow } from '../components/Modules.js';

//Utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT } from '../utility/Util.js';

import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers

//Languages
import { Lan } from '../utility/Languages.js';

import { THEME_COLOR,
         STATUS_BAR_COLOR,
         COLOR_Users_Block_List } from '../utility/colors.js'

// Component UI--checked
export default class Users_Block_List extends Component {
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
                             barStyle:"light-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:THEME_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Users_Block_List["Blocklist"],}}> {Lan["Blocklist"]} </Text>,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:Lan["Cancel"]})}
        <FlatList
          // data={this.props.conversations}
          data={this.blocked_list}
          keyExtractor={item => item.id}
          renderItem={({item}) => <ChatThumbnailWindow maskname={item.maskname}
                                    last_chat_date="Today"
                                    
                                    type="Black_list"/>}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container:{
    flex:1
  },
  
  
})


