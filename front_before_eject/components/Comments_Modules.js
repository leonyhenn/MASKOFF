/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//React
import React,{ Component } from 'react';

//Official components
import { Text, 
         View,
         StyleSheet,
         Platform,
         TextInput,
         TouchableOpacity,
         TouchableWithoutFeedback,
         Clipboard,
         Image,
         ViewPropTypes,
         Keyboard,
         Linking,
         ActivityIndicator } from 'react-native';

import PropTypes from 'prop-types';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';

//EmojiInput
import EmojiInput from '../components/EmojiInputindex.js';

//Utilities
import { height, 
         width,
         CLASSIFIED,
         HEADER_HEIGHT,
         getPermission } from '../utility/Util.js';

import { Lan } from '../utility/Languages.js';

export class CustomComposer extends React.Component {
  constructor(props){
    super(props)
    this.last_click = 0 
    this.onContentSizeChange=this.onContentSizeChange.bind(this)
  }
  
  onContentSizeChange(e) {
    const { contentSize } = e.nativeEvent;
    if (!contentSize) return;
    if (
      !this.contentSize ||
      this.contentSize.width !== contentSize.width ||
      this.contentSize.height !== contentSize.height
    ) {
      this.contentSize = contentSize;
      this.props.onInputSizeChanged({height:this.contentSize.height + 12,width:this.contentSize.width});
    }
    
  }

  render() {
      
      emoji = <View style={{width:width,
                            height:global.keyboardHeight == undefined?100:global.keyboardHeight,
                            flexDirection:"column",
                            justifyContent:"center",
                            alignItems:"center"}}>        
      <EmojiInput
          onEmojiSelected={(emoji) => {this.props.EmojiCallback(emoji.char)}}
          enableFrequentlyUsedEmoji={true}
          ref={emojiInput => this._emojiInput = emojiInput}
          numColumns={10}
          emojiFontSize={25}
          enableSearch={false}
          categoryFontSize={25}
          categoryLabelTextStyle={{
            fontSize:15,
            fontWeight:"400",
          }}
          keyboardBackgroundColor={"#eeeeee"}
          categoryLabelHeight={0}
          showCategoryTab
          categoryHighlightColor={"#2da157"}
          categoryUnhighlightedColor={"#cccccc"}
          showCategoryTab={true}
      />
      </View>
      if(this.props.comment_image){
        comment_image = <View>
          <Image source={{uri:this.props.comment_image}} 
                 style={CustomComposer_style.comment_image}
                 resizeMode="contain"/>
          <TouchableOpacity style={CustomComposer_style.remove_image_button}
                            onPress={this.props.remove_image}>
            <Ionicons name="ios-close-circle" size={20} color={"#2da157"}/>
          </TouchableOpacity>
        </View>
      }else{
        comment_image = null
      }

    return (

      <View style={CustomComposer_style.container}>
        {comment_image}
        <View style={CustomComposer_style.composer}>
          <TouchableOpacity style={CustomComposer_style.send}
                            onPress={this.props.imageOnPress}>
            <Ionicons name="ios-images" size={25} color={"steelblue"}/>
          </TouchableOpacity>
          <TouchableWithoutFeedback onPress={()=>{this._textInput.focus()}}>
            <TextInput
              multiline={true}
              onChange={(e) => this.onContentSizeChange(e)}
              onContentSizeChange={(e) => this.onContentSizeChange(e)}
              onChangeText={(text) => this.props.onChangeText(text)}
              onFocus={()=>{this.props.setEmojiModalVisible(false,"textinput")}}
              onBlur={()=>{this.props.setEmojiModalVisible(false,"textinputBlur")}}
              style={CustomComposer_style.textInput}
              autoFocus={false}
              enablesReturnKeyAutomatically
              onSelectionChange={(event) => this.props.onChangeText(this.props.input,event.nativeEvent.selection.start)}
              value={this.props.input}
              blurOnSubmit={false}
              underlineColorAndroid="transparent"
              keyboardAppearance="light"
              selectionColor="#2da157"
              placeholder={this.props.place_holder == undefined?Lan['Message']:this.props.place_holder}
              placeholderTextColor="#aaaaaa"
              ref={this.props.setRef}
              />
          </TouchableWithoutFeedback>
          <TouchableOpacity style={CustomComposer_style.send}
                            onPress={() => 
                              {
                              this.props.setEmojiModalVisible(true,"toolbar")
                              }
                            }
                            
  
                            >
            <Ionicons name="ios-happy" size={25} color={"#ffcc33"}/>
          </TouchableOpacity>
          <View style={[CustomComposer_style.send,{marginRight:5,}]}>
          <TouchableWithoutFeedback 
                            // disabled={this.props.input.trim() ==""?true:false}
                            onPress={async () => {
                              //Igore any rushing-clicking
                              now = new Date().getTime()
                              if((now - this.last_click)> 500){
                                this.last_click = now
                                var comment = this.props.input
                                await this.props.send_comment(comment,this.props.comment)
                                this.props.clearText()
                              }
                            }}>
            <Ionicons name="md-text" color={"#2da157"} size={28}/>
          </TouchableWithoutFeedback>
          </View>
        </View>
        {emoji}
      </View>
    );
  }
}
const CustomComposer_style = StyleSheet.create({
  container:{
    
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    backgroundColor:"white"
    
  },
  composer:{
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginLeft: 5,
    marginRight:10
  },
  textInput: {
    marginLeft: 5,
    marginRight:5,
    fontSize: 16,
    lineHeight: 20,
    marginTop: Platform.select({
      ios: 6,
      android: 6,
    }),
    marginBottom: Platform.select({
      ios: 6,
      android: 6,
    }),
    backgroundColor:"#eeeeee",
    color:"#555555",
    width:Platform.select({
      ios: width - 25 - 25 - 6 - 25 - 6 -25 - 6,
      android: width - 25 - 25 - 6 - 25 - 6 -25 - 6,
    }), 
    alignSelf:"center",
  },
  send:{
    marginBottom:(44-28)/2,
    marginTop:(44-28)/2,
    marginLeft:3,
    marginRight:3,
    width:25,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  comment_image:{
    height:100,
    width:100,
    margin:10

  },
  remove_image_button:{
    height:16,
    width:16,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    position:"absolute",
    top:5,
    left:100,
    borderRadius: 16 / 2,
    backgroundColor:"white"
  }

});

