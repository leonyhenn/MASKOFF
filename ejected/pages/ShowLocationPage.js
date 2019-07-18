/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. BackHandler(_handleBackPress MO_Alerts挡住了)
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.04
*/
//React
import React from 'react';

//Official Modules
import {  View,
          Text,
          StatusBar,
          StyleSheet,
          BackHandler,
          TouchableOpacity } from 'react-native';

//Custom Modules
import { MASKOFFStatusBar } from '../components/Modules.js';
import MO_Alerts from '../components/MO_Alerts.js'

//Mapbox
import MapboxGL from '@mapbox/react-native-mapbox-gl';

//native-base
import { Spinner } from 'native-base'

//Languages
import { Lan } from '../utility/Languages.js';

//Expo
import { Constants, Location, Permissions } from 'expo';

//Utility
import { height, 
         width,
         STATUSBAR_HEIGHT,
         getPermission,
         MAP_STYLE } from '../utility/Util.js';


const ASPECT_RATIO = width / height;
const LATITUDE_DELTA = 0.0812;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

import {  STATUS_BAR_COLOR,
          BACKGROUND_COLOR,
          THEME_COLOR,
          TRANSPARENT,
          COLOR_PickLocationPage } from '../utility/colors.js'

MapboxGL.setAccessToken('pk.eyJ1IjoibGVvbnloZW5uIiwiYSI6ImNqdzAxMTFvbjA2OTY0OWtzeTNnOTF5MWUifQ.UqGq-ZkOQ1kSR-TlVwET6A');

export default class ShowLocationPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      unmounting:false,
      loading:true,
      show:false
    };

    //Function binding
    this.back=this.back.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.latitude=this.props.navigation.getParam("latitude")
    this.longitude=this.props.navigation.getParam("longitude")
  }

  _handleBackPress(){
    this.props.navigation.goBack()
    return true
  }
  
  componentWillMount() {
    this.setState({loading:false})
    StatusBar.setHidden(true)
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    StatusBar.setHidden(false)
    await this.setState({unmounting:true})
  }

  back(){
    this.props.navigation.goBack()
  }
  
  render() {
    if(this.state.loading){
      return(
        <View style={{flex:1,
                      flexDirection:"column",
                      justifyContent:"flex-start"}} >
          <View style={{flex:1,
                          backgroundColor:BACKGROUND_COLOR,
                          flexDirection:"column",
                          justifyContent:"center",
                          alignItems:"center"}}>
            <Spinner color="#c4c4c4"/>
          </View>
        </View>
      )
    }else{
      return (
          <View style={styles.container}>
            <MapboxGL.MapView
              showUserLocation={false}
              zoomLevel={15}
              centerCoordinate={[this.longitude,this.latitude]}
              pitch={0}
              style={styles.mapView}
              logoEnabled={false}
              attributionEnabled={false}
              compassEnabled={false}
              styleURL={"mapbox://styles/leonyhenn/cjw5mdwdt2zin1cntf3gk771m"}
            >
              <MapboxGL.PointAnnotation
                key={0}
                id={"0"}
                coordinate={[this.longitude,this.latitude]}
              >
              </MapboxGL.PointAnnotation>
            </MapboxGL.MapView>
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={this.back}
                style={styles.bubble}
              >
                <Text style={styles.button_text}>{Lan['Back']}</Text>
              </TouchableOpacity>

            </View>
          </View>
      );
    }
  }
}


const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-start',
    alignItems: 'center',
    // backgroundColor:"#1e6b3a"
  },
  bubble: {
    backgroundColor:THEME_COLOR,
    width:80,
    paddingVertical: 12,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  latlng: {
    width: 200,
    alignItems: 'stretch',
  },
  button_text:{
    color:"#f9f9f9"
  },
  buttonContainer: {
    flexDirection: 'row',
    backgroundColor: TRANSPARENT,
    position:'absolute',
    bottom:50,
    left:(width - 80 - 18) / 2,

  },
  mapView:{
    width: width,
    height:height,
  }
});







