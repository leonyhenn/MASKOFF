/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 后端实现
  1. 检查console.error
  2. 检查network failure
  3. 中英文
  4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.03
*/

//official modules
import React, { Component } from 'react';
import { View, 
         Text,
         FlatList,
         ScrollView,
         StyleSheet } from 'react-native';

import { Location,
         Permissions } from 'expo'

import MapView from 'react-native-maps';
import { Marker, Callout, ProviderPropType, PROVIDER_GOOGLE } from 'react-native-maps';

//MASKOFF custom modules
import { DisplayCard_masker_Around } from '../components/Modules.js';

//DECOY DATA DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
import { LATITUDE,
         LONGITUDE } from '../decoy/data.js'
//DECOY DATA DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

//utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT,
         MAP_STYLE } from '../utility/Util.js';
import { getArticlesAround } from '../utility/HttpRequests.js'

//redux modules
import { connect } from 'react-redux'

//DECOY DATA DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.018;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
const SPACE = 0.01;
//DECOY DATA DELETE!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

import { SHADOW_COLOR,
         FILLING_COLOR,
         STANDARD_BORDER_COLOR } from '../utility/colors.js'

//Component UI--checked
class Masker_Around extends Component {
  constructor(props){
    super(props)
    this.state = {
      update_region:{},
      isLoading:true,
      markers:[]
    }
    this.viewDetail=this.viewDetail.bind(this)
    this._getLocationAsync=this._getLocationAsync.bind(this)
    this.onRegionChangeComplete=this.onRegionChangeComplete.bind(this)
  }
  async componentWillMount() {
    await this._getLocationAsync();
    await this.setState({isLoading:false})
  }

  async onRegionChangeComplete(Region){
    this.setState({new_region:Region})
    
    response = await getArticlesAround(Region)
    //console.log(response)
    // var r = Math.floor(Math.random() * Math.floor(2));if(r == 1){response = false}else{response = {status:405}}
    if(response == false){
      //说明前面出现了error, 需要重连
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:''})},100)
    }else if(response.ok){
      json = await response.json()
      articles = await json["masker"]
      current_region = await json["info"]
      markers = []
      for(var i=0;i<articles.length;i++){

        markers.push({id:i,"coordinate":{"latitude":articles[i]["coordinate"]["latitude"],"longitude":articles[i]["coordinate"]["longitude"]},"article":articles[i]})
      }
      console.log(this.state.markers.length)
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

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      await this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    var cur_coor = location.coords
    this.setState({ 
      region:{
        latitude:cur_coor.latitude,
        latitudeDelta: LATITUDE_DELTA,
        longitude:cur_coor.longitude,
        longitudeDelta: LONGITUDE_DELTA,
      },
      loading:false,
      update_region:{
        n:cur_coor.latitude + LATITUDE_DELTA,
        s:cur_coor.latitude - LATITUDE_DELTA,
        w:cur_coor.longitude - LONGITUDE_DELTA,
        e:cur_coor.longitude + LONGITUDE_DELTA,
        latitudeDelta:LATITUDE_DELTA,
        longitudeDelta:LONGITUDE_DELTA
      } });
  };

  viewDetail(item){
    this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})
  }

  render() {
    const { region, markers } = this.state;
    if(this.state.isLoading){
      return(
        <View 
            style={{
              height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
              width:width,
              flexDirection:"column",
              justifyContent:"center",
              alignItems:"center",
            }}>
        </View>
      )
    }else{
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
            style={Masker_Around_style.map}
            initialRegion={region}
            showsUserLocation
            onRegionChangeComplete={this.onRegionChangeComplete}
            showsBuildings={true}
            customMapStyle={MAP_STYLE}
            provider={PROVIDER_GOOGLE}
          >
            {this.state.markers.map((marker:any)  => (  
              <Marker
                key={marker.id}
                coordinate={marker.coordinate}
                // onCalloutPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:marker.roast,purpose:"searchRoast"})}
              >
                <Callout style={Masker_Around_style.plainView}>
                  <DisplayCard_masker_Around info={marker.article}/>
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
                      shadowRadius: 10}}/>
        </View>
      );
    }
    
  }
}
const Masker_Around_style = StyleSheet.create({
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

export default connect(getPropsFromState)(Masker_Around)