/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//official modules
import React, { Component } from 'react';
import { View, 
         ScrollView,
         StyleSheet,
         FlatList } from 'react-native';

//MASKOFF custom modules
import { DisplayCard_masker } from '../components/Modules.js';

//utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT } from '../utility/Util.js';

//redux modules
import { connect } from 'react-redux'

//Component UI--checked
class Masker_Recommend extends Component {
  constructor(props){
    super(props)
    this.viewDetail=this.viewDetail.bind(this)
  }
  viewDetail(item){
    this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})
    
  }
  render() {
    return (
      <View 
        style={{
          height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
          width:width,
          flexDirection:"column",
          justifyContent:"center",
          alignItems:"center",
        }}>
        <ScrollView style={Roast_Recommend_style.results_wrapper}
                                 contentContainerStyle={{    
                                   flexDirection:"column",
                                  justifyContent:"flex-start",
                                      alignItems:"center",}}>
          <FlatList
            data={this.props.frontPage["Masker"]["Recommend"]}
            keyExtractor={item => item.aid}
            renderItem={({item}) => <DisplayCard_masker info={item} onPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})}/>}
            onEndReached={this._onRefresh}
          />
        </ScrollView>
      </View>
    );
  }
}
const Roast_Recommend_style = StyleSheet.create({
  results_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
    width:width,
    backgroundColor:"#bbbbbb",

  }
})
const getPropsFromState = state => ({
  frontPage: state.frontPage
})

export default connect(getPropsFromState)(Masker_Recommend)