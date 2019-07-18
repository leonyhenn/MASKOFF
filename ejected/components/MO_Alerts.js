/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//Official modules
import React, { Component } from 'react';
import { StyleSheet, 
         View, 
         Platform,
         Image } from 'react-native';

// Redux store
import { store } from '../store/store.js';
import { clearCache } from '../store/actions.js';

// Expo
import { Video } from 'expo';

// AwesomeAlert
import AwesomeAlert from 'react-native-awesome-alerts';

//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';
import { Lan } from '../utility/Languages.js';

//MapView
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import { THEME_COLOR,
         BACKGROUND_COLOR,
         TRANSPARENT,
         COLOR_MO_Alerts } from '../utility/colors.js'
export default class MO_Alerts extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false};
    this.showAlert=this.showAlert.bind(this)
    this.hideAlert=this.hideAlert.bind(this)
    this.renderImageView=this.renderImageView.bind(this)
    this.renderVideoView=this.renderVideoView.bind(this)
    this.renderLocationView=this.renderLocationView.bind(this)
  }

  async showAlert(){
    await this.setState({
      show: true
    });
  };

  async hideAlert(){
    await this.setState({
      show: false
    });
  };

  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.show !== prevProps.show) {
      if(this.props.show == true){
        this.showAlert()
      }
    }
  }
  renderImageView(){
    return(
      <Image source={{uri:this.props.uri}} style={styles.imageView} resizeMode="contain"/>
    )
  }

  renderVideoView(){
    return(
      <Video source={{uri:this.props.uri}}
             resizeMode={Video.RESIZE_MODE_CONTAIN}
             muted={true}
             shouldPlay={true}
             useNativeControls
             style={styles.videoView}/>
    )
  }

  renderLocationView(){
    return(
      <MapView
        provider="google"
        style={styles.mapView}
        region={{
          latitude: this.props.location.latitude,
          longitude: this.props.location.longitude,
          latitudeDelta: 0.0012,
          longitudeDelta: 0.0012,
        }}
        scrollEnabled={false}
        zoomEnabled={false}>
        <Marker coordinate={{
                  latitude: this.props.location.latitude,
                  longitude: this.props.location.longitude,
                }}/>
      </MapView>
    )
  }  

  getProps = () => {
    let alertProps = {};
    switch (this.props.type) {
      case "progress":
        alertProps = {
          showProgress: true,
          closeOnTouchOutside:this.props.closeOnTouchOutside?true:false,
          title: this.props.progress,
          closeOnHardwareBackPress: false,
          progressSize: 'small',
          progressColor: THEME_COLOR,
          alertContainerStyle:{
            height:height,
            backgroundColor:TRANSPARENT
          },
          overlayStyle:{
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR
          },
          titleStyle:{
            color:THEME_COLOR,
            fontWeight:"600",
            fontStyle:"italic"
          }
        };
        break;
      case "Notice":
        alertProps = {
          title: this.props.title,
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          alertContainerStyle:{
            height:height,
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: this.props.message,
          showConfirmButton: true,
          confirmText: "OK",
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onConfirmPressed: () => {
            if(this.props.onConfirmPressed){
              this.props.onConfirmPressed()
            }
            this.hideAlert();
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            width:width * 0.85 / 2,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          }
        };
        break;
      case "HttpReqs_PreviewPage":
        alertProps = {
          title: this.props.title,
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          alertContainerStyle:{
            height:height,
            
          },
          message: this.props.message,
          showConfirmButton: true,
          confirmText: this.props.button_text,
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onConfirmPressed: async () => {
            if(this.props.message == Lan['No_Internet']){
              this.props.retry()
            }else{
              this.hideAlert();
              await store.dispatch(clearCache())
              this.props.navigation.navigate("Footer")
            }
          },
          onDismiss: () => {
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["HttpReqs_PreviewPage_overlay"],
            opacity: 0.5,
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            width:width * 0.85 / 2,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          }
        };
        break;
      case "No_Internet":
        alertProps = {
          title: Lan['No_Internet'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: Lan['No_Internet_mes'],
          showCancelButton: this.props.showCancelButton == undefined?true:false,
          showConfirmButton: true,
          confirmText: Lan['Retry'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.retry()
            this.hideAlert();
          },

          alertContainerStyle:{
            height:height,
          },
          overlayStyle:{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          }
        };
        break;
      case "Location_Confirm":
        alertProps = {
          title: Lan['Wait'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: Lan['Location_Send_Confirm'],
          showCancelButton: true,
          showConfirmButton: true,
          confirmText: Lan['Confirm'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.confirm()
            this.hideAlert();
          },
          overlayStyle :{
            height:height,
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
          },
          alertContainerStyle:{
            height:height,
          },
          
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            borderWidth:1,
            borderColor:"#f9f9f9",
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          },
          customView:this.renderLocationView()
        };
        break;
      case "Close_Account_Confirm":
        alertProps = {
          title: Lan['Wait'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: this.props.message,
          showCancelButton: true,
          showConfirmButton: true,
          confirmText: Lan['Confirm'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.confirm()
            this.hideAlert();
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height,
          },
          alertContainerStyle:{
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            borderWidth:1,
            borderColor:"#f9f9f9",
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          }
        };
        break;
      
      case "Chat_Picture_Send_Confirm":
        alertProps = {
          title: Lan['Wait'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: Lan['Chat_Picture_Send_Confirm'],
          showCancelButton: true,
          showConfirmButton: true,
          confirmText: Lan['Confirm'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.confirm()
            this.hideAlert();
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height,
          },
          alertContainerStyle:{
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            borderWidth:1,
            borderColor:"#f9f9f9",
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          },
          customView:this.renderImageView()
        };
        break;
      case "Chat_Video_Send_Confirm":
        alertProps = {
          title: Lan['Wait'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: Lan['Chat_Video_Send_Confirm'],
          showCancelButton: true,
          showConfirmButton: true,
          confirmText: Lan['Confirm'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.confirm()
            this.hideAlert();
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height,
          },
          alertContainerStyle:{
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            borderWidth:1,
            borderColor:"#f9f9f9",
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          },
          customView:this.renderVideoView()
        };
        break;
      case "Bad_Response":
        alertProps = {
          title: Lan['Bad_Response'],
          titleStyle:{
            color:COLOR_MO_Alerts["title_text"],
            fontSize:18,
            fontWeight:"600"
          },
          messageStyle:{
            color:COLOR_MO_Alerts["message_text"],
            fontSize:18,
            fontStyle:"italic"
          },
          message: Lan['No_Internet_mes'],
          showCancelButton: this.props.showCancelButton == undefined?true:false,
          showConfirmButton: true,
          confirmText: Lan['Retry'],
          cancelText: Lan['Cancel'],
          closeOnHardwareBackPress: false,
          confirmButtonColor: "red",
          onCancelPressed: () => {
            this.hideAlert();
          },
          onConfirmPressed: () => {
            this.props.retry()
            this.hideAlert();
          },
          overlayStyle :{
            backgroundColor:COLOR_MO_Alerts["overlay"],
            opacity: 0.5,
            height:height,
          },
          alertContainerStyle:{
            height:height,
          },
          contentContainerStyle:{
            backgroundColor:BACKGROUND_COLOR,
            borderRadius:5,
            width:width * 0.85,
          },
          confirmButtonStyle:{
            backgroundColor:THEME_COLOR,
            borderRadius:5,
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          
          cancelButtonStyle:{
            backgroundColor:COLOR_MO_Alerts["cancelButton"],
            borderRadius:5,
            width:width * 0.85 / 3,
            height:40,
            flexDirection:"row",
            justifyContent:"center",
            alignItems:"center"
          },
          confirmButtonTextStyle:{
            fontSize:18
          },
          cancelButtonTextStyle:{
            fontSize:18
          },
          closeOnTouchOutside:this.props.closeOnTouchOutside == undefined?true:false
        };
      break;

    }

    return alertProps;
  };

  render() {
    let props = this.getProps();
    return (
        <AwesomeAlert show={this.state.show} {...props} />
    );
  }
}

const styles = StyleSheet.create({
  mapView:{
    width: width * (1 / 2),
    height: width * (1 / 2),
    borderRadius: 5,
    margin: 1,
  },
  imageView:{
    height:width / 2,
    width:width / 2
  },
  videoView:{
    height:(width / 2) * (9 / 16),
    width:width / 2,
    borderRadius:5,
    backgroundColor:COLOR_MO_Alerts["title_text"]
  }
});