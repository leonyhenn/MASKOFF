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
         ScrollView,
         StyleSheet } from 'react-native';
import MapView from 'react-native-maps';
import { Marker, 
         Callout, 
         PROVIDER_GOOGLE,
         ProviderPropType } from 'react-native-maps';

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

import { getRoastsAround } from '../utility/HttpRequests.js'

//redux modules
import { connect } from 'react-redux'

import { SHADOW_COLOR,
         FILLING_COLOR,
         STANDARD_BORDER_COLOR } from '../utility/colors.js'

const ASPECT_RATIO = width / height;
const LATITUDE = 43.666898; 
const LONGITUDE = -79.427443;
const LATITUDE_DELTA = 0.0922;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;

//Component UI--checked
class Roast_Around extends Component {
  constructor(props){
    super(props)
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      new_region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      markers:[]
    }
    this.onRegionChangeComplete=this.onRegionChangeComplete.bind(this)
  }
  
  async onRegionChangeComplete(Region){
    this.setState({new_region:Region})
    
    response = await getRoastsAround(Region)
    // var r = Math.floor(Math.random() * Math.floor(2));if(r == 1){response = false}else{response = {status:405}}
    if(response == false){
      //说明前面出现了error, 需要重连
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
    }else if(response.ok){
      json = await response.json()  
      roasts = await json["roast"]
      current_region = await json["info"]
      markers = []
      for(var i=0;i<roasts.length;i++){
        for(var j=0;j<roasts[i].content.length;j++) {
          if(roasts[i].content[j].type == "location" && 
            roasts[i].content[j]["latitude"] <= current_region.latitude + current_region.latitudeDelta &&
            roasts[i].content[j]["latitude"] >= current_region.latitude - current_region.latitudeDelta &&
            roasts[i].content[j]["longitude"] <= current_region.longitude + current_region.longitudeDelta &&
            roasts[i].content[j]["longitude"] >= current_region.longitude - current_region.longitudeDelta){
            markers.push({id:i,"coordinate":{"latitude":roasts[i].content[j]["latitude"],"longitude":roasts[i].content[j]["longitude"]},"roast":roasts[i]})
            break
          }
        }
      }
      this.setState({"markers":markers})
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      // setTimeout(()=>this.setState({show:true,type:"Bad_Response",message:'',title:''}),100)
      setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:''})},100)
      return
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
        <MapView
          provider={this.props.provider}
          style={Roast_Around_style.map}
          initialRegion={region}
          customMapStyle={MAP_STYLE}
          provider={PROVIDER_GOOGLE}
          onRegionChangeComplete={this.onRegionChangeComplete}
        >
          {this.state.markers.map((marker:any)  => (  
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              onCalloutPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:marker.roast,purpose:"searchRoast"})}>
              <Callout style={Roast_Around_style.plainView}>
                <DisplayCard_roast roast={marker.roast}/>
              </Callout>
            </Marker>
            ))
          }
        </MapView>
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
      </View>
    );
  }
}

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
})
const getPropsFromState = state => ({
  frontPage: state.frontPage
})

export default connect(getPropsFromState)(Roast_Around)