/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.06
  
  x0. BackHandler
*/
// Official Modules
import React, { Component } from 'react';
import { View,
         Keyboard,
         Dimensions,
         StyleSheet,
         ScrollView,
         BackHandler } from 'react-native';

// Custom Modules
import { ButtonHeader,
         ProgressMeter,
         VoteDisplayBar,
         VoteTextInputBar,
         MASKOFFStatusBar } from '../components/Modules.js';

// Utilities
import { width,
         height, 
         HEADER_HEIGHT,
         STATUSBAR_HEIGHT } from '../utility/Util.js';

// Redux 
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { addInfoToPost,
         clearCacheVote,
         updateInfoToPost } from '../store/actions.js';

//Language
import { Lan } from '../utility/Languages.js'

import { STATUS_BAR_COLOR,
         BACKGROUND_COLOR,
         THEME_COLOR,
         CANCEL_BUTTON_TEXT_COLOR } from '../utility/colors.js'

// Component UI--checked
class Post_vote extends Component{
  constructor(props){
    super(props)

    this.state = {
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    }

    this.info_index = this.props.navigation.getParam("info_index")
    this.cancel=this.cancel.bind(this)
    this.Done=this.Done.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this) 
    this._keyboardDidHide=this._keyboardDidHide.bind(this)
  }

  async componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  _keyboardDidShow(e) {
    //get keyboard height
    // console.log("_keyboardDidShow")
    global.keyboardHeight = e.endCoordinates.height + Dimensions.get('screen').height - Dimensions.get('window').height
    this.setState({
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight
    })
    // console.log("global.keyboardHeight",global.keyboardHeight)
  }

  _keyboardDidHide(e){
    this.setState({
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT
    })
    // console.log("_keyboardDidHide")

  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  async cancel(){
    await store.dispatch(clearCacheVote({}))
    this.props.navigation.goBack()
  }

  async Done(){
    if(!this.props.navigation.getParam("update_purpose")){
      await store.dispatch(addInfoToPost({
        info_index:this.info_index,
        info_type:"Vote",
        info:this.props.vote
      }))
      await store.dispatch(addInfoToPost({
        info_type:"ToolBar",
        info_index:this.info_index + 1,
      }))
      await store.dispatch(clearCacheVote({}))
    }else{
      await store.dispatch(updateInfoToPost({
        info_index:this.info_index,
        info_type:"Vote",
        info:this.props.vote
      }))
      await store.dispatch(clearCacheVote({}))
    }
    this.props.navigation.goBack()
  }

  render(){
    layout = []
    if (this.props.vote.length < 2){
      buttonheader = ButtonHeader({layout:"left-center",
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:this.cancel,
                        center_content:ProgressMeter({maskname:Lan["Vote"]}),
                        left_button_text:Lan["Back"]})
    }else{
        buttonheader = ButtonHeader({layout:"left-center-right",
                        fontColor:CANCEL_BUTTON_TEXT_COLOR,
                        right_button_color:THEME_COLOR,
                        left_button_onPress:this.cancel,
                        left_button_text:Lan["Back"],
                        center_content:ProgressMeter({maskname:Lan["Vote"]}),
                        right_button_onPress:this.Done,
                        right_button_text:Lan["Done"]})
    }

    for (var i=0;i<this.props.vote.length;i++){
        layout.push(<VoteDisplayBar 
                      key={i} 
                      vote_index={i}
                      total_count={this.props.vote.length}
                      vote={this.props.vote[i]}/>)
    }
    return(
      <View style={PostMasker_style.container}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                           barStyle:"light-content"})}
        {buttonheader}
        <View style={[PostMasker_style.wrapper,{height:this.state.MainViewHeight,flexDirection:"column",
            justifyContent:"flex-start",
            alignItems:"center",    }]}>
        <ScrollView style={[PostMasker_style.wrapper,{height:this.state.MainViewHeight}]}
          contentContainerStyle={{
            flexDirection:"column",
            justifyContent:"flex-start",
            alignItems:"center",    
          }}>
          {layout}
          <VoteTextInputBar vote_index={this.props.vote.length}/>
        </ScrollView>
        </View>
      </View>
    )
  }
}
const PostMasker_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignSelf:"center"
  },
  wrapper:{
    width:width,
    backgroundColor:BACKGROUND_COLOR,
    
  },
})

const getPropsFromState = state => ({
  vote: state.vote
})
export default connect(getPropsFromState)(Post_vote)

