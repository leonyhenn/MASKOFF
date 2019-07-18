/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//official modules
import React, { Component } from 'react';
import { View, 
         Text,
         FlatList,
         Animated,
         Platform,
         ScrollView,
         StyleSheet } from 'react-native';
import MapboxGL from '@mapbox/react-native-mapbox-gl';

//MASKOFF custom modules
import { DisplayCard_roast, 
         DisplayCard_masker } from '../components/Modules.js';

//utilities
import { height, 
         width,
         MAP_STYLE,
         FOOTER_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT,
         STATUSBAR_HEIGHT } from '../utility/Util.js';
//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//Httprequests
import { Relogin,
         getRoastsAround } from '../utility/HttpRequests.js'

import {  BallIndicator,
          BarIndicator,
          DotIndicator,
          MaterialIndicator,
          PacmanIndicator,
          PulseIndicator,
          SkypeIndicator,
          UIActivityIndicator,
          WaveIndicator } from 'react-native-indicators';

//redux modules
import { connect } from 'react-redux'

import { SHADOW_COLOR,
         FILLING_COLOR,
         STANDARD_BORDER_COLOR,
         COLOR_Roast_Around } from '../utility/colors.js'
MapboxGL.setAccessToken('pk.eyJ1IjoibGVvbnloZW5uIiwiYSI6ImNqdzAxMTFvbjA2OTY0OWtzeTNnOTF5MWUifQ.UqGq-ZkOQ1kSR-TlVwET6A');

//Component UI--checked
class Roast_Around extends Component {
  constructor(props){
    super(props)

    this.state = {
      markers:[],
      mapLoadingDone:false,
      roastDataFetchingDone:false
    }
    this.onRegionDidChange=this.onRegionDidChange.bind(this)
    this.renderLoader=this.renderLoader.bind(this)
    this.onDidFinishRenderingMapFully=this.onDidFinishRenderingMapFully.bind(this)
  }

  async onRegionDidChange(Status){
    top = Status.properties.visibleBounds[0][0]
    right = Status.properties.visibleBounds[0][1]
    bottom = Status.properties.visibleBounds[1][0]
    left = Status.properties.visibleBounds[1][1]
    info = {coordinates:Status.geometry.coordinates,visibleBounds:Status.properties.visibleBounds}
    global.current_location_bounds = info
    if(!global.first_connect){
      global.first_connect = true
      let response = await Relogin(info)
      // console.log(response)
      if(response == false){
        //说明前面出现了error, 需要重连
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
      }else if(response.ok){
        let json = await response.json()  
        let valid = json["token_valid"]
        if(valid){
          let roasts = await json["roast"]
          
          let markers = []
          for(var i=0;i<roasts.length;i++){
            for(var j=0;j<roasts[i].content.length;j++) {
              if(roasts[i].content[j].type == "location" && 
                roasts[i].content[j]["latitude"] <= Math.max(right,left) &&
                roasts[i].content[j]["latitude"] >= Math.min(right,left) &&
                roasts[i].content[j]["longitude"] <= Math.max(top,bottom) &&
                roasts[i].content[j]["longitude"] >= Math.min(top,bottom)){
                markers.push({id:i,"coordinate":[roasts[i].content[j]["longitude"],roasts[i].content[j]["latitude"]],"roast":roasts[i]})
                break
              }
            }
          }
          this.setState({"markers":markers,roastDataFetchingDone:true})
        //token still valid
          //get new thumbnail
          if(global.roast_thumbnail !== json["roast_thumbnail"]){
            global.roast_thumbnail = json["roast_thumbnail"]
            await SecureStore.setItemAsync("roast_thumbnail",json["roast_thumbnail"])
          }
          await store.dispatch(pushFrontPage(json["front_page"]))
        }else{
        //toke not found, request new token  
          this.props.navigation.navigate("Login")
        }
      }else if(response.status == 401){
        this.props.navigation.navigate("Login")
      }else{
        //如果response不ok, 让用户重连试试
        // setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
        
      }
    }else{
      
      response = await getRoastsAround(info)
      // var r = Math.floor(Math.random() * Math.floor(2));if(r == 1){response = false}else{response = {status:405}}
      if(response == false){
        //说明前面出现了error, 需要重连
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
      }else if(response.ok){
        let json = await response.json()  
        let roasts = await json["roast"]
        let markers = []
        for(var i=0;i<roasts.length;i++){
          for(var j=0;j<roasts[i].content.length;j++) {
            if(roasts[i].content[j].type == "location" && 
              roasts[i].content[j]["latitude"] <= Math.max(right,left) &&
              roasts[i].content[j]["latitude"] >= Math.min(right,left) &&
              roasts[i].content[j]["longitude"] <= Math.max(top,bottom) &&
              roasts[i].content[j]["longitude"] >= Math.min(top,bottom)){
              markers.push({id:i,"coordinate":[roasts[i].content[j]["longitude"],roasts[i].content[j]["latitude"]],"roast":roasts[i]})
              break
            }
          }
        }
        this.setState({"markers":markers,roastDataFetchingDone:true})
      }else if(response.status == 401){
        this.props.navigation.navigate("Login")
      }else{
        //如果response不ok, 让用户重连试试
        // setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:''})},100)
        return
      }
    }
  }

  renderLoader(){
    if(!this.state.mapLoadingDone || !this.state.roastDataFetchingDone){
      return <View
        style={{
          height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
          width:width,
          flexDirection:"column",
          justifyContent:"center",
          alignItems:"center",
          position:"absolute",
          left:0,
          top:0,
          backgroundColor:"#888888",
          opacity:0.3,
        }}
        pointerEvents="none">
        <WaveIndicator color={COLOR_Roast_Around["NotificationBar"]["icon"]} waveMode='outline' size={height}/>
      </View>
    }else{
      return null
    }
  }

  async onDidFinishRenderingMapFully(){
    this.setState({mapLoadingDone:true})
    if(Platform.OS !== 'ios'){
      coordinates = await this.map.getCenter()
      visibleBounds = await this.map.getVisibleBounds()
      await this.onRegionDidChange({geometry:{coordinates:coordinates},properties:{visibleBounds:visibleBounds}})
    }
  }

  render() {
    const { region, markers } = this.state;
    return (
      <View 
        style={{
          height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
          width:width,
          flexDirection:"column",
          justifyContent:"center",
          alignItems:"center",
        }}>
        <MapboxGL.MapView
          ref={ref => (this.map = ref)}
          showUserLocation
          zoomLevel={15}
          userTrackingMode={MapboxGL.UserTrackingModes.Follow}
          pitch={60}
          style={{
            height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
            width:width,
          }}
          logoEnabled={false}
          attributionEnabled={false}
          compassEnabled={false}
          onRegionDidChange={this.onRegionDidChange}
          onDidFinishRenderingMapFully={this.onDidFinishRenderingMapFully}
          styleURL={"mapbox://styles/leonyhenn/cjw5mdwdt2zin1cntf3gk771m"}
        >
          {this.state.markers.map((marker:any)  => (  
              <MapboxGL.PointAnnotation
                ref={ref => (this.map = ref)}
                key={marker.id}
                id={marker.id.toString()}
                title="Test"
                coordinate={marker.coordinate}
                onSelected={()=>this.map.moveTo(marker.coordinate,200)}
              >
                <MapboxGL.Callout>
                  <DisplayCard_roast 
                    roast={marker.roast}
                    onPress={() => {"Article_Roast_Display",{info:marker.roast,purpose:"searchRoast"}}}/>
                </MapboxGL.Callout>
              </MapboxGL.PointAnnotation>
              ))
            }
        </MapboxGL.MapView>
        <View style={{position:'absolute',
                      top:0,
                      left:0,
                      height:2,
                      width:width,
                      backgroundColor:STANDARD_BORDER_COLOR,
                      elevation:4,
                      shadowOffset: { width: 5, height: 5 },
                      shadowColor: SHADOW_COLOR,
                      shadowOpacity: 0.5,
                      shadowRadius: 10,}}/>
        {this.renderLoader()}
      </View>
    );
  }
}
const ANNOTATION_SIZE = 45
const Roast_Around_style = StyleSheet.create({
  results_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
    width:width,
    backgroundColor:FILLING_COLOR,
  },
  plainView: {
    width: width,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  annotationContainer: {
    width: ANNOTATION_SIZE,
    height: ANNOTATION_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: ANNOTATION_SIZE / 2,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(0, 0, 0, 0.45)',
  },
  annotationFill: {
    width: ANNOTATION_SIZE - 3,
    height: ANNOTATION_SIZE - 3,
    borderRadius: (ANNOTATION_SIZE - 3) / 2,
    backgroundColor: 'orange',
    transform: [{scale: 0.6}],
  },
})
const getPropsFromState = state => ({
  frontPage: state.frontPage
})

export default connect(getPropsFromState)(Roast_Around)