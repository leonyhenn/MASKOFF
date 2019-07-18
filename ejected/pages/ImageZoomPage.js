/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import { Image, 
         TouchableOpacity,
         BackHandler,
         StatusBar,
         Alert, 
         View, 
         StyleSheet } from 'react-native';
import ImageZoom from 'react-native-image-pan-zoom';
import { image_resize_by_width } from '../utility/Util.js'
import { height, 
         width,
         STATUSBAR_HEIGHT,
         getPermission } from '../utility/Util.js';
import { Permissions,
         FileSystem,
         MediaLibrary } from 'expo'
import ZoomableImage from '../components/ZoomableImage.js'

import Ionicons from 'react-native-vector-icons/Ionicons';
import { Spinner } from 'native-base'
import {  WaveIndicator } from 'react-native-indicators'

import { COLOR_ImageZoomPage,
         TRANSPARENT,
          } from '../utility/colors.js'

import DropdownAlert from 'react-native-dropdownalert';
import { notifications } from '../components/Dropdown_Alert_helpers.js'
import { Lan } from '../utility/Languages.js'
export default class ImageZoomPage extends React.Component {
  constructor(props){
    super(props)

    this.state={
      notificationBarType:undefined
    }

    this.download=this.download.bind(this)
    this.notification=this.notification.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.renderNotificationBarImage=this.renderNotificationBarImage.bind(this)
  }
  componentWillMount(){
    StatusBar.setHidden(true)
  }
  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    StatusBar.setHidden(false)
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }
  _handleBackPress(){
    this.props.navigation.goBack()
    return true
  }
  async download(){
    info = this.props.navigation.getParam("info")
    this.notification(notifications['warn'].type,"Downloading...")
    try{

      result = await getPermission(Permissions.CAMERA_ROLL)

      if(!result){
        return
      }
      var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/images/")
      if(!response.exists){
        var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/images/",{intermediates: true})
      }
      url = info.uri
      var filename = url.substring(url.lastIndexOf('/')+1);
      var filePath = FileSystem.documentDirectory + "MASKOFF/images/" + filename
      var response = await FileSystem.downloadAsync(url, filePath)

      var response = await MediaLibrary.getAlbumAsync('MASKOFF')
      var asset = await MediaLibrary.createAssetAsync(filePath);
      if(response === null){
        var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
      }else{
        var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
      }
      this.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
    }catch(error){
      this.notification(notifications['error'].type,"Download failed")
    }
  }

  async notification(type,message){
    this.dropdown.alertWithType(type,
                                null,
                                message);
    await this.setState({notificationBarType:type})
  }
  renderNotificationBarImage(){
    switch(this.state.notificationBarType){
      case notifications['warn'].type:
        return <View style={styles.notificationBarImage}><WaveIndicator color={COLOR_ImageZoomPage["NotificationBar"]["icon"]} waveMode='outline' size={25}/></View>
      break;
      case notifications['success'].type:
        return <View style={styles.notificationBarImage}><Ionicons name="ios-checkmark" size={30} color={COLOR_ImageZoomPage["NotificationBar"]["icon"]}/></View>
      break;
      case notifications['error'].type:
        return <View style={styles.notificationBarImage}><Ionicons name="ios-close" size={30} color={COLOR_ImageZoomPage["NotificationBar"]["icon"]}/></View>
      break;
      default:
       return (null)
    }
  }
  render() {
    info = this.props.navigation.getParam("info")
    return (
      <View style={styles.container}>
          <ZoomableImage imageWidth={info.width} imageHeight={info.height} source={{uri:info.uri}} style={{height:height,width:width}}/>
          <TouchableOpacity style={styles.back_button}
                            onPress={() => this.props.navigation.goBack()}>
            <Ionicons name="ios-arrow-back"
                      size={20}
                      color={COLOR_ImageZoomPage["icon"]}/>
          </TouchableOpacity>
          <TouchableOpacity style={styles.download_button}
                            onPress={this.download}>
            <Ionicons name="md-arrow-down"
                      size={20}
                      color={COLOR_ImageZoomPage["icon"]}/>
          </TouchableOpacity>
          <DropdownAlert
            ref={ref => this.dropdown = ref}
            showCancel={false}
            startDelta={0}
            endDelta={0}
            updateStatusBar={false}
            replaceEnabled
            tapToCloseEnabled
            panResponderEnabled
            renderTitle={()=>{return(null)}}
            renderImage={this.renderNotificationBarImage}
            defaultContainer={{margin:0,  flexDirection: 'row',alignItems:"center", backgroundColor: TRANSPARENT, }}
            defaultTextContainer={{ flex: 1, margin: 8 ,alignSelf: 'center', flexDirection:'row',alignItems:'center',justifyContent:"flex-start"}}
            messageNumOfLines={3}
            messageStyle={{fontSize: 12, textAlign: 'left', fontWeight: '400', color: COLOR_ImageZoomPage["DropdownAlert"]["messageText"], backgroundColor: TRANSPARENT}}
            closeInterval={0}
          />
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:COLOR_ImageZoomPage["container"]
  },
  back_button:{
    backgroundColor:COLOR_ImageZoomPage["back_button"],
    top:40,
    left:10,
    width:30,
    height:30,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    borderRadius:5,
    position:"absolute"
  },
  download_button:{
    backgroundColor:COLOR_ImageZoomPage["back_button"],
    top:height - 70,
    left:10,
    width:30,
    height:30,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    borderRadius:5,
    position:"absolute"
  }
})