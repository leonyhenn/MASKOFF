/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import { View, FlatList, Text, StyleSheet, Animated } from 'react-native';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import { Svg } from 'expo';
import { DisplayCard_roast_image_spinner,
         DisplayCard_roast_text_spinner,
         DisplayCard_masker_text_spinner,
         DisplayCard_masker_full_spinner,
         Comment_image_spinner,
         Comment_text_spinner,
         ScaledImage_spinner,
         DisplayCard_roast_full_spinner } from '../components/Svg_Spinners.js'




export default class AnimatedHeader extends React.Component {
  render() {    
    return (
            <View style={{
        flex:1,
        flexDirection:"column",
        alignItems:"center",
        justifyContent:"flex-start",
      }}>
      <DisplayCard_roast_full_spinner start={"0"} end={"925"}/>
      <DisplayCard_roast_full_spinner start={"0"} end={"925"}/>
      
      
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'lightblue',
  },
  nonsenseItem: {
    backgroundColor: 'red',
    margin: 8,
  },
  itemText: {
    backgroundColor: 'blue',
    fontSize: 20,
    padding: 20,
  },
  headerWrapper: {
    position: 'absolute',
    backgroundColor: 'red',
    height: 200,
    left: 0,
    right: 0,
  }
});


// <DisplayCard_roast_image_spinner  start={"0"} end={"395"}/>
// <DisplayCard_roast_image_spinner  start={"395"} end={"890"}/>

// <DisplayCard_roast_text_spinner  start={"0"} end={"190"}/>
// <DisplayCard_roast_text_spinner  start={"190"} end={"380"}/>