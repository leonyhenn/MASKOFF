/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { PureComponent } from 'react';

//official component
import { View,
         StyleSheet,
         Alert,
         Platform } from 'react-native';

//custom components
import { RedDot } from '../components/Modules.js'

//utility
import { height, 
         width,
         FOOTER_HEIGHT,
         TOP_TAB_HEIGHT,
         connect_to_server } from '../utility/Util.js';

// Redux
import { connect } from 'react-redux';

class RedDotWindow extends React.PureComponent {
  constructor(props){
    super(props)
    this.RedDotWindow_height = 24
    this.RedDotWindow_width = width / 4
    
  }
  
  render(){
    if(this.props.usage == "Contacts"){
      this.number = this.props.conversations.map(convesation => convesation.unread)
      this.number = this.number.reduce((a, b) => a + b, 0);
    }
    
    return (
      <View style={[RedDotWindow_style.container,{height:this.RedDotWindow_height,width:this.RedDotWindow_width}]}>
        {this.props.icon}
        {this.number > 0?<RedDot number={this.number} 
                            left={this.props.left} 
                            right={this.props.right}
                            top={this.props.top}
                            bottom={this.props.bottom} />:null}
      </View>
    )
  }
}
const RedDotWindow_style = StyleSheet.create({
  container:{
    justifyContent:'center',
    alignItems:'center'
  },

})

const getPropsFromState = state => ({
  conversations:state.conversations,
  messages:state.messages
})

export default connect(getPropsFromState)(RedDotWindow)