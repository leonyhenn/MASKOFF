/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';
import {
  Text,
  View,
  Image,
  Platform,
  StatusBar,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback
} from 'react-native'

import RNSketchCanvas from '../RN_mosaic/index.js';
import AmazingCropper from '../RN_cropper/index.js';
var RNFS = require('react-native-fs');
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { FileSystem } from 'expo';
const uuidv1 = require('uuid/v1');

const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;
const THEME_COLOR = "#2da157"
const SHADOW_COLOR = "#808080"
const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;

Platform.OS == 'ios'?IMAGE_PREFIX="file://"
                    :IMAGE_PREFIX="file:"

// Platform.OS == 'ios'?this.ImagePicker_uri="/var/mobile/Containers/Data/Application/8B1FCA6B-7A99-4B57-94D7-07DB57A8A72C/Documents/MASKOFF/sample_image.jpg"
//                     :this.ImagePicker_uri="/data/user/0/maskoff.mosaic/files/MASKOFF/sample_image.png"

Platform.OS == 'ios'?SAVE_PATH="/var/mobile/Containers/Data/Application/36694AF6-BF1C-4026-B92C-630C87C0AA67/Documents/MASKOFF_TEMP/modified_image.jpg"
                    :SAVE_PATH="/data/user/0/maskoff.mosaic/files/MASKOFF_TEMP/modified_image.jpg"
                    
export default class MASKOFFImageManipulator extends Component {
  constructor(props){
    super(props)
    this.state={
      page:"annotate",//["crop-rotate","annotate"]
      ready:false,
      imageHeight:0,
      imageWidth:0,
      modifyPath:null,
      imageType:'jpg'
    }

    this._canvas = null
    this._cropper = null

    this.done=this.done.bind(this)
    this.cancel=this.cancel.bind(this)
    // this.ImagePicker_uri = this.props.navigation.getParam("ImagePicker_uri")
    Platform.OS == "ios"?this.ImagePicker_uri ="file:/data/user/0/maskoff.ejected/cache/ExperienceData/%2540leonyhenn%252Ffront-by-component/ImagePicker/36ca8a10-d391-49af-984c-29fc223cb656.png"
                        :this.ImagePicker_uri ="file:///var/mobile/Containers/Data/Application/663707A1-D7A4-42B7-8742-4FCBC048BA3D/Library/Caches/ExponentExperienceData/%2540leonyhenn%252Ffront-by-component/ImagePicker/D0F4B833-2878-4356-ACB4-DF3821431CF3.jpg"
    

    this.renderHeader=this.renderHeader.bind(this)
    this.cropperOnDone=this.cropperOnDone.bind(this)
    this.cropperOnCancel=this.cropperOnCancel.bind(this)
    this.renderNavigator=this.renderNavigator.bind(this)
    this.switchToAnnotate=this.switchToAnnotate.bind(this)
    this.getCanvasDimension=this.getCanvasDimension.bind(this)
    this.switchToCropRotate=this.switchToCropRotate.bind(this)
    this.renderAnnotateCanvas=this.renderAnnotateCanvas.bind(this)
  }

  async cancel(){
    try{
      this._canvas.clear()
      let result = await FileSystem.readAsStringAsync(result.uri, {encoding:FileSystem.EncodingTypes.Base64})
      base64 = result
      extension =  this.ImagePicker_uri.split('.').pop();
      var path = RNFS.DocumentDirectoryPath + '/MASKOFF_TEMP';
      var temp_filename = path+"/temp_image."+extension
      result = await RNFS.mkdir(path)
      result = await RNFS.writeFile(temp_filename, base64, 'base64')
      
      var imageType = 'jpg'
      if (extension == 'jpg' || extension == 'png'){
        imageType = extension 
      }
      
      if(Platform.OS == 'ios'){
        this.setState({ modifyPath: temp_filename, imageType:imageType });
      }else{
        this.setState({ modifyPath: temp_filename, imageType:imageType });  
      }

      //this.props.navigation.goBack()
    }catch(err){
      console.log(err)
    }
  }
  done(){

  }
  async componentWillMount(){
    try{
      await Image.getSize(IMAGE_PREFIX + this.ImagePicker_uri, (width, height) => {this.setState({imageWidth:width, imageHeight:height})});
      base64 = await RNFS.readFile(IMAGE_PREFIX + this.ImagePicker_uri,"base64")
      extension =  this.ImagePicker_uri.split('.').pop();
      var path = RNFS.DocumentDirectoryPath + '/MASKOFF_TEMP';
      var temp_filename = path+"/"+uuidv1()+"."+extension

      try{
        result = await RNFS.unlink(path)
      }catch(err){

      }

      result = await RNFS.mkdir(path)

      result = await RNFS.writeFile(temp_filename, base64, 'base64')

      result = await RNFS.readdir(RNFS.DocumentDirectoryPath + '/MASKOFF_TEMP')      
      
      
      var imageType = 'jpg'
      if (extension == 'jpg' || extension == 'png'){
        imageType = extension 
      }
      
      if(Platform.OS == 'ios'){
        this.setState({ modifyPath: temp_filename, imageType:imageType, ready:true });
      }else{
        this.setState({ modifyPath: temp_filename, imageType:imageType, ready:true });  
      }
      console.log(temp_filename)
    }catch(err){
      console.log("err:"+err)
    }
    
  }
  async switchToAnnotate(){
    if(this.state.page == "crop-rotate"){
      var temp_filename = await this._canvas.save()  
      await this.setState({ 
        modifyPath: temp_filename,
        page:"annotate"
      });
    }else{
      return
    }
  }

  async cropperOnDone(croppedUri){
    await Image.getSize(croppedUri, (width, height) => {this.setState({imageWidth:width, imageHeight:height})},(err)=>{console.log(err)});
    if(this.state.page == "crop-rotate"){
      await this.setState({ 
        modifyPath:Platform.OS == 'ios'? croppedUri.replace('file://', ''):croppedUri.replace('file:', ''),
        page:"annotate"
      });
    }else{
      return
    }
  }

  async cropperOnCancel(){
    await this.setState({ 
        page:"annotate"
      });
  }

  async switchToCropRotate(){
    if(this.state.page == "annotate"){
      var temp_filename = await this._canvas.save()  
      await this.setState({ 
        modifyPath: temp_filename,
        page:"crop-rotate"
      });
    }else{
      return
    }
  }
  getCanvasDimension(){
    
    CanvasDimension = {
      height:this.state.imageHeight,
      width:this.state.imageWidth,
    }
    
    if(CanvasDimension.height > (height - STATUSBAR_HEIGHT - 50 - 50 - 30 -46)){
      prev_height = CanvasDimension.height
      CanvasDimension.height = (height - STATUSBAR_HEIGHT - 50 - 50 - 30 -46)
      CanvasDimension.width = CanvasDimension.width * ((height - STATUSBAR_HEIGHT - 50 - 50 - 30 -46) / prev_height)
    }
    
    if(CanvasDimension.width > width){
      prev_width = CanvasDimension.width
      CanvasDimension.width = width
      CanvasDimension.height = CanvasDimension.height *(width / prev_width)
    }
    
    return CanvasDimension
  }
  renderAnnotateCanvas(){
    console.log("renderAnnotateCanvas()",this.state.modifyPath)
    return(
      <View style={{ height:height - STATUSBAR_HEIGHT - 50 - 50,width:width, flexDirection: 'row',justifyContent:'center',alignItems:'center' }}>
        <RNSketchCanvas
          ref={(canvas) => this._canvas = canvas}
          localSourceImage={{ filename: this.state.modifyPath, directory: null, mode: 'AspectFit' }}
          containerStyle={{ backgroundColor: 'black', flex: 1, flexDirection: 'column',justifyContent:'flex-start',alignItems:'center'  }}
          canvasStyle={{ backgroundColor: 'black',height:this.getCanvasDimension().height,width:this.getCanvasDimension().width }}
          onStrokeEnd={data => {
          }}
          onUndoPressed={(id) => {
            // Alert.alert('do something')
          }}
          strokeComponent={color => (
            <View style={[{ backgroundColor: color ,borderWidth: 1, borderColor:"white",height:30}, styles.strokeColorButton]} />
          )}
          strokeSelectedComponent={(color, index, changed) => {
            return (
              <View style={[{ backgroundColor: color, borderWidth: 3, borderColor:"white",height:30 }, styles.strokeColorButton]} />
            )
          }}
          defaultStrokeIndex={0}
          defaultStrokeWidth={6}
          savePreference={() => {
            return {
              folder: "RNSketchCanvas",
              filename: String(Math.ceil(Math.random() * 100000000)),
              transparent: false,
              imageType: "png"
            }
          }}
          onSketchSaved={(success, path) => {
            alert(success ? 'Image saved!' : 'Failed to save image!', path)
          }}
          onPathsChange={(pathsCount) => {
            console.log('pathsCount', pathsCount)
          }}
          imageHeight={this.state.imageHeight}
          imageWidth={this.state.imageWidth}
        />
      </View>
    )
  }

  renderNavigator(){
    return(
      <View style={styles.navigator}>
        <TouchableWithoutFeedback
          style={[styles.top_panel_button]}
          onPress={this.switchToAnnotate}>
          <MaterialCommunityIcons
            name="pencil"
            size={25}
            color={this.state.page == "annotate"?THEME_COLOR:SHADOW_COLOR} />
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          style={[styles.top_panel_button]}
          onPress={this.switchToCropRotate}>
          <MaterialCommunityIcons
            name="crop-rotate"
            size={25}
            color={this.state.page == "crop-rotate"?THEME_COLOR:SHADOW_COLOR} />
        </TouchableWithoutFeedback>
      </View>
    )
  }
  renderHeader(){
    return(
      <View style={styles.top_panel}>
        <TouchableOpacity
          style={[styles.top_panel_button,{marginLeft:20}]}
          onPress={this.cancel}>
          <Text 
            style={styles.top_panel_text}>
          取消
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.top_panel_button,{marginRight:20}]}
          onPress={this.done}>
          <Text 
            style={styles.top_panel_text}>
          完成
          </Text>
        </TouchableOpacity>
      </View>
    )
  }
  renderCropRotatePage(){
    
    return (
      <View style={{ height:height - STATUSBAR_HEIGHT  - 50, flexDirection: 'row' }}>
        <AmazingCropper
          onDone={this.cropperOnDone}
          onCancel={this.cropperOnCancel}
          imageUri={IMAGE_PREFIX + this.state.modifyPath}
          imageWidth={this.state.imageWidth}
          imageHeight={this.state.imageHeight}
          NOT_SELECTED_AREA_OPACITY={0.3}
          BORDER_WIDTH={20}
        />
        {/*<Image
          style={{width: 200, height: 200}}
          source={{uri: IMAGE_PREFIX + this.state.modifyPath}}
        />*/}
      </View>
    )
  }
  render(){
    if(this.state.ready){
      if(this.state.page == "annotate"){
        mid_component = this.renderAnnotateCanvas()
      }else{
        mid_component = this.renderCropRotatePage()
      }
      return(
        <View>
          <View style={[styles.statusBar, { backgroundColor:'black' }]}>
            <StatusBar 
              translucent 
              backgroundColor='black'
              barStyle="light-content"
            />
          </View>
          <View style={styles.container}>
            {this.renderHeader()}
            {mid_component}
            {this.state.page == "annotate"?this.renderNavigator():null}
          </View>
        </View>
      )
    }else{
      return(
        <View style={{flex:1,backgroundColor:"black"}}/>
      )
    }
  }
}

styles = StyleSheet.create({
  top_panel:{
    height:50,
    width:width,
    flexDirection:"row",
    justifyContent:"space-between",
    alignItems:"center",
    backgroundColor:"black"
  },
  top_panel_button:{
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  top_panel_text:{
    fontSize:18,
    color:THEME_COLOR
  },
  bottom_panel:{
    height:50,
    width:width,
    flexDirection:"column",
    justifyContent:"space-evenly",
    alignItems:"center",
    backgroundColor:"black"
  },
  navigator:{
    height:50,
    width:width,
    flexDirection:"row",
    justifyContent:"space-evenly",
    alignItems:"center",
    backgroundColor:"black"
  },
  container:{
    height:height - STATUSBAR_HEIGHT,
    width:width,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    backgroundColor:"white"
  },
  image:{
    height:height - STATUSBAR_HEIGHT - 50 - 50,
    width:width - 40,
    resizeMode:"contain"
  },
  statusBar: {
    height: STATUSBAR_HEIGHT,
  },
  strokeColorButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  strokeWidthButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#39579A'
  },
  functionButton: {
    marginHorizontal: 2.5,
    marginVertical: 8,
    height: 30,
    width: 60,
    backgroundColor: '#39579A',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 5,
  }
})