/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 检查purpose
  1. 检查console.error
  2. 检查network failure
  3. 中英文
  4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  7. 解决flatlist 不render spinner的问题
  8. 解决article的评论
  9. 解决评论区的头像
  10. 给article加上评论和like
  2019.Jan.09

  x将所有setState / dispatch改为async/await, 取消所有除了show:false之外的取消设定
  重新测试
  2019.Jan.17
  
  x0. BackHandler
*/
import React, { Component } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { StyleSheet,
         View,
         ScrollView,
         TouchableOpacity,
         Text,
         TextInput,
         Alert,
         Image,
         Platform,
         BackHandler } from 'react-native';
import { MASKOFFStatusBar,
         SearchBarHeader,
         DisplayCard_masker,
         ButtonHeader,
         CheckMarkProgressBar,
         ProgressMeter,
         ToolBar,
         ReminderWindow,
         ScaledImage_Comment } from '../components/Modules.js';
import { ImagePicker,
         Permissions } from 'expo';
import { decoy_masker_1,
         decoy_masker_2 } from '../decoy/data.js';
import { connect } from 'react-redux';
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT,
         IMAGE_PLACEHOLDER,
         getPermission } from '../utility/Util.js';
import { NavigationActions } from 'react-navigation';
import { store } from '../store/store.js';
import { addInfoToPost,
         updateInfoToPost,
         clearCache } from '../store/actions.js';

import Ionicons from 'react-native-vector-icons/Ionicons';

export default class Comment_WriteComment extends Component{
  constructor(props){
    super(props)
    this.state = {
      comment:"",
      image:null,
      image_comment:false,
      image_height:null,
      image_width:null
    }

    this.comment = this.props.navigation.getParam("comment")
    this.cancel=this.cancel.bind(this)
    this.Done=this.Done.bind(this)
    this.image_pressed=this.image_pressed.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    Platform.OS === 'ios' ? this.onSelectionColor = "white" : this.onSelectionColor = "#707070"
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }


  cancel(){
    this.props.navigation.goBack()
  }
  async image_pressed(){
    if (this.state.image_comment){
      await this.setState({image_comment:false})
    }else{
      await this.setState({image_comment:true})
    }
    
    response = await getPermission(Permissions.CAMERA_ROLL)
    if(!response){
      return
    }
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images,
        exif:false
      });
    if(!result.cancelled){
      if(result.width < width - 30){
        await this.setState({image:result.uri,
                     image_width:result.width,
                     image_height:result.height
                   })
      }else{
        await this.setState({image:result.uri,
                     image_width:width - 30,
                     image_height:result.height * ((width - 30) / result.width)
                   })
      }
      
    }else{
      await this.setState({image_comment:false,
                     image:null,
                     image_height:null,
                     image_width:null})
    }

  }
  async Done(){
    
    // if(this.state.image_comment){
    //   try{
    //     var response = await fetch(this.state.image)
    //     data = new FormData()
    //     data_type = response["headers"]["map"]["content-type"][0]
    //     data_filename = response["_bodyInit"]["_data"]["name"]
    //     data.append('file',{uri:this.state.image,type: data_type,name: data_filename})
    //     data.append('filename',data_filename)
    //     var response = await fetch(global.server+"/upload",{
    //       method:"POST",
    //       headers:{'Content-type':'multipart/form-data',
    //                'access-token':global.access_token},
    //       body:data
    //     });
    //     while(response.status !== 200){
    //       var response = await fetch(global.server+"/upload",{
    //         method:"POST",
    //         headers:{'Accept':'application/json',
    //                 'Content-type':'application/json',
    //                 'access-token':global.access_token
    //                 },
    //         body:data
    //       });
    //     }
    //     var json = await response.json();
    //     body = {
    //       'type':data_type,
    //       'filename':json["filename"]
    //     }
    //   }catch(error){
    //     console.error(error)
    //   }
      
    // }else{
    //   body = {
    //     'type':'text/plain',
    //     'filename':this.state.comment
    //   }
    // }
    // try{
    //   var response = await fetch(global.server+"/"+"comments",{
    //     method:"POST",
    //     headers:{'Accept':'application/json',
    //             'Content-type':'application/json',
    //             'access-token':global.access_token
    //             },
    //     body:JSON.stringify({
    //         'mrid':this.comment.mrid,
    //         'is_masker':this.comment.is_masker,
    //         'content':body,
    //         'reply_id':this.comment.cid,
    //         'parent_id':this.comment.cid
    //         })
    //     });
    //   var json = await response.json();
      
    //   while(response.status !== 200){
    //     var response = await fetch(global.server+"/"+"comments",{
    //     method:"POST",
    //     headers:{'Accept':'application/json',
    //             'Content-type':'application/json',
    //             'access-token':global.access_token
    //             }
    //     });
    //   }
    // }catch(error) {
    //   console.error(error)
    // }
    this.props.navigation.goBack()
  }
  render(){
    if (this.props.navigation.getParam("update_purpose")){
      this.default_value = this.props.navigation.getParam("info")
    }
    if(this.comment.content !== undefined){
      
        if(this.comment.content.type.includes("text") || this.comment.content.type.includes("Text")){
          comment = <View style={Comment_WriteComment_style.original_comment_wrapper}>
          <Text style={Comment_WriteComment_style.original_comment}>{"回复 "+this.comment.nickname+" : "+this.comment.content.filename}</Text>
          </View>
        }else if(this.comment.content.type.includes("image") || this.comment.content.type.includes("Image")){
          comment = <View style={Comment_WriteComment_style.original_comment_wrapper}>
          <Text style={Comment_WriteComment_style.original_comment}>{"回复 "+this.comment.nickname+" : "+" [图片]"}</Text>
          <ScaledImage_Comment info={global.bucket.concat(this.comment.content.filename)} 
                                 style={Comment_WriteComment_style.image}
                                 navigation={this.props.navigation}/> 
          </View>
        }
    }else{
      comment = null
    }
    if(! this.state.image_comment){
      input = <View style={Comment_WriteComment_style.text_input_wrapper}>
          <TextInput style={Comment_WriteComment_style.text_input}
                     autoFocus={true}
                     selectionColor={this.onSelectionColor}
                     placeholderTextColor="#707070"
                     onChangeText={async (comment) => {await this.setState({comment:comment})}}
                     keyboardAppearance="dark"
                     underlineColorAndroid="transparent"
                     multiline={true}
                     defaultValue={this.state.comment}/>
        </View>
    }else{
      input = <View style={{flex:1,flexDirection:"row",justifyContent:"center",alignItems:"flex-start",marginTop:20}}>
      <Image source={this.state.image==null? IMAGE_PLACEHOLDER:{uri:this.state.image}} style={[Comment_WriteComment_style.image,{width:this.state.image_width==null? width:this.state.image_width,height:this.state.image_height==null? width:this.state.image_height}]}/>
      </View>
    }
    return(
      <View style={{flex:1, backgroundColor:"#bbbbbb"}}>
        {MASKOFFStatusBar({backgroundColor:"black", 
                             barStyle:"dark-content"})}
        {ButtonHeader({layout:"left-center-right",
                       left_button_onPress:() => this.props.navigation.goBack(),
                       right_button_onPress:() => this.Done(),
                       left_button_text:"Cancel",
                       right_button_text:"Done"})}
        {comment}
        <View style={Comment_WriteComment_style.button_section}>
          <TouchableOpacity style={Comment_WriteComment_style.button_image}
                            onPress={this.image_pressed}>
            <Ionicons name="ios-image" size={25} color={this.state.image_comment ? "black" : "#C4C4C4"  }/>
          </TouchableOpacity>
        </View>
        {input}
        
      </View>

    )
  }
}
const Comment_WriteComment_style = StyleSheet.create({
  text_input_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width:width,
    backgroundColor:"#bbbbbb",
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
  },
  text_input:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width:width,
    fontSize:20,
    textAlignVertical:"top",
    color:"white"
  },
  original_comment_wrapper:{
    marginLeft:10,
    marginTop:10,
    backgroundColor:"transparent"
  },
  original_comment:{
    fontSize:17,
    color:"black",
    fontWeight:"600",
    fontStyle:"italic",
    backgroundColor:"transparent"
  },
  image:{
    width:width - 30,
    height:width - 30
  },
  button_section:{
    marginLeft:10,
    marginTop:5,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"flex-start"
  },
  button_image:{
    width:25,
    height:25,
    borderRadius:5,
    backgroundColor:"transparent",
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center"
  }

})

