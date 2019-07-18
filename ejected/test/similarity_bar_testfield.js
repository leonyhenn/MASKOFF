/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import { View, FlatList, Text, StyleSheet, Animated, ScrollView } from 'react-native';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import { Svg } from 'expo';
import { DisplayCard_roast_image_spinner,
         DisplayCard_roast_text_spinner,
         DisplayCard_masker_text_spinner,
         DisplayCard_masker_full_spinner,
         Comment_image_spinner,
         Comment_text_spinner,
         ScaledImage_spinner,
         ScaledImage_comment_spinner,
         DisplayCard_roast_full_spinner } from '../components/Svg_Spinners.js'
import { SearchBarHeader,
         MASKOFFStatusBar,
         DisplayCard_roast,
         DisplayCard_masker_search,
         SearchReminderContainer,
         SearchRecommendContainer,
         Similarity_bar } from '../components/Modules.js';
//utilities
import { width,
         height, 
         HEADER_HEIGHT,
         STATUSBAR_HEIGHT } from '../utility/Util.js';

import { Lan, 
         setLanDict } from '../utility/Languages.js';


export default class AnimatedHeader extends React.Component {
  async componentWillMount(){
    await setLanDict("Chinese")
  }
  render() {
    return (
      <View style={{flex:1,flexDirection:"column",justifyContent:"center",alignItems:"center",backgroundColor:"white"}}>
        <Similarity_bar sim={0.05}/>
        <Similarity_bar sim={0.1}/>
        <Similarity_bar sim={0.2}/>
        <Similarity_bar sim={0.3}/>
        <Similarity_bar sim={0.4}/>
        <Similarity_bar sim={0.5}/>
        <Similarity_bar sim={0.6}/>
        <Similarity_bar sim={0.7}/>
        <Similarity_bar sim={0.8}/>
        <Similarity_bar sim={0.9}/>
        <Similarity_bar sim={1}/>
        <Similarity_bar sim={0.05} highest={true} />
        <Similarity_bar sim={0.1}  highest={true} />
        <Similarity_bar sim={0.2}  highest={true} />
        <Similarity_bar sim={0.3}  highest={true} />
        <Similarity_bar sim={0.4}  highest={true} />
        <Similarity_bar sim={0.5}  highest={true} />
        <Similarity_bar sim={0.6}  highest={true} />
        <Similarity_bar sim={0.7}  highest={true} />
        <Similarity_bar sim={0.8}  highest={true} />
        <Similarity_bar sim={0.9}  highest={true} />
        <Similarity_bar sim={1}    highest={true} />

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
