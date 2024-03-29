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
import { Lan, setLanDict } from '../utility/Languages.js';

//Expo
import { Constants, Location, Permissions } from 'expo';

//Utility
import { height, 
         width,
         STATUSBAR_HEIGHT,
         getPermission,
         MAP_STYLE } from '../utility/Util.js';

import {  STATUS_BAR_COLOR,
          BACKGROUND_COLOR,
          THEME_COLOR,
          TRANSPARENT,
          COLOR_PickLocationPage } from '../utility/colors.js'

MapboxGL.setAccessToken('pk.eyJ1IjoibGVvbnloZW5uIiwiYSI6ImNqdzAxMTFvbjA2OTY0OWtzeTNnOTF5MWUifQ.UqGq-ZkOQ1kSR-TlVwET6A');

export default class PickLocationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      marker: [0,0],
      unmounting:false,
      loading:true,
      show:false
    };

    //Function binding
    this.back=this.back.bind(this)
    this.onMapPress=this.onMapPress.bind(this)
    this.send_location=this.send_location.bind(this)
    this.confirm_pressed=this.confirm_pressed.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.onDidFinishRenderingMapFully=this.onDidFinishRenderingMapFully.bind(this)
  }

  _handleBackPress(){
    this.props.navigation.goBack()
    return true
  }
  
  // componentWillMount() {
  //   setLanDict("Chinese")
  // }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    await this.setState({unmounting:true})
  }

  back(){
    this.props.navigation.goBack()
  }
  
  async confirm_pressed(){
    await this.setState({show:true})
    setTimeout(async () =>{await this.setState({show:false})}, 500);
  }

  send_location(){
    const { params} = this.props.navigation.state;
    let info = {latitude:this.state.marker[1],longitude:this.state.marker[0]}
    params.send_back_location(info)
    this.props.navigation.goBack()
  }

  async onMapPress(Status) {
    let coordinates = Status.geometry.coordinates
    this.setState({loading:false,marker:coordinates})
  }

  async onDidFinishRenderingMapFully(){
    let coordinates = await this.map.getCenter()
    this.setState({loading:false,marker:coordinates})
  }

  render() {
    
    return (
        <View style={styles.container}>
          <MapboxGL.MapView
            ref={ref => (this.map = ref)}
            showUserLocation={true}
            zoomLevel={15}
            pitch={0}
            onPress={this.onMapPress}
            userTrackingMode={MapboxGL.UserTrackingModes.Follow}
            style={styles.mapView}
            logoEnabled={false}
            attributionEnabled={false}
            compassEnabled={false}
            styleURL={"mapbox://styles/leonyhenn/cjw5mdwdt2zin1cntf3gk771m"}
            onDidFinishRenderingMapFully={this.onDidFinishRenderingMapFully}
          >
            {this.state.loading?null:
                <MapboxGL.PointAnnotation
                  key={0}
                  id={"0"}
                  coordinate={this.state.marker}
                >
                </MapboxGL.PointAnnotation>
            }
          </MapboxGL.MapView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={this.confirm_pressed}
              style={styles.bubble}
            >
              <Text style={styles.button_text}>{Lan['Location_Confirm']}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={this.back}
              style={styles.bubble}
            >
              <Text style={styles.button_text}>{Lan['Location_Cancel']}</Text>
            </TouchableOpacity>
          </View>
          
          {/*<MO_Alerts show={this.state.show} 
                   type={"Location_Confirm"} 
                   confirm={this.send_location}
                   navigation={this.props.navigation}
                   location={
                    this.state.marker
          }/>*/}
          
        </View>
    );
    
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
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginLeft:10,
    marginRight:10,
    borderRadius: 3,
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
  },
  mapView:{
    width: width,
    height:height,
  }
});







