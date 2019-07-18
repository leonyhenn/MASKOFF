/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import {  StyleSheet,
          View,
          Text,
          Dimensions,
          TouchableOpacity, } from 'react-native';
import { MASKOFFStatusBar } from '../components/Modules.js';
import MapView, { Marker, ProviderPropType } from 'react-native-maps';

//Languages
import { Lan } from '../utility/Languages.js';
import { Constants, Location, Permissions } from 'expo';

import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT } from '../utility/Util.js';

import { STATUS_BAR_COLOR,
         THEME_COLOR,
         TRANSPARENT,
         COLOR_ViewLocationPage } from '../utility/colors.js'

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0322;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export default class ViewLocationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: LATITUDE,
        longitude: LONGITUDE,
        latitudeDelta: LATITUDE_DELTA,
        longitudeDelta: LONGITUDE_DELTA,
      },
      marker: {
        coordinate:{
          "latitude": 37.77605533163353,
          "longitude": -122.42829490453005,
          }
        },
      loading:true,
      show:false
    };
    this.back=this.back.bind(this)
    this.decoy_message = this.props.navigation.getParam("message")
  }
  componentWillMount() {
    // setLanDict("Chinese")
    this._getLocationAsync();
  }

  componentWillUnmount() {
    

  }

  back(){
    this.props.navigation.goBack()
  }

  _getLocationAsync = async () => {
    await this.setState({ 
      region:{
        latitude:this.decoy_message.location.latitude,
        latitudeDelta: LATITUDE_DELTA,
        longitude:this.decoy_message.location.longitude,
        longitudeDelta: LONGITUDE_DELTA,
      },
      marker:{
        coordinate:{
          "latitude":this.decoy_message.location.latitude,
          "longitude":this.decoy_message.location.longitude
        }
      },
      loading:false });
  };

  render() {
    if(this.state.loading){
      return(
        <View style={styles.container} />
      )
    }else{
      return (
        
        <View style={styles.container}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                           barStyle:"dark-content"})}
          <MapView
            provider={this.props.provider}
            style={styles.map}
            initialRegion={this.state.region}
          >
            <Marker
              coordinate={this.state.marker.coordinate}
            />
          </MapView>
          <View style={styles.buttonContainer}>
            
            <TouchableOpacity
              onPress={this.back}
              style={styles.bubble}
            >
              <Text style={styles.button_text}>{Lan['Location_Cancel']}</Text>
            </TouchableOpacity>
          </View>
        </View>
        
      );
    }
    
  }
}

ViewLocationPage.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    "bottom": 0,
    "left": 0,
    "position": "absolute",
    "right": 0,
    "top": 0,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor:STATUS_BAR_COLOR
  },
  map: {
    "bottom": 0,
    "left": 0,
    "position": "absolute",
    "right": 0,
    "top": STATUSBAR_HEIGHT,
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
  button: {
    width: 80,

    paddingHorizontal: 12,
    alignItems: 'center',
    marginHorizontal: 10,
  },
  button_text:{
    color:COLOR_ViewLocationPage["button_text"]
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: TRANSPARENT,
  },
});







