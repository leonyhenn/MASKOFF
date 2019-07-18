/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  TouchableOpacity,
} from 'react-native';

import MapView, { Marker, ProviderPropType } from 'react-native-maps';
import { MapStyle } from '../utility/Util.js';
//Languages
import { Lan } from '../utility/Languages.js';
import { Constants, Location, Permissions } from 'expo';
const { width, height } = Dimensions.get('window');

const ASPECT_RATIO = width / height;
const LATITUDE = 37.78825;
const LONGITUDE = -122.4324;
const LATITUDE_DELTA = 0.0322;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
let id = 0;

function randomColor() {
  return `#${Math.floor(Math.random() * 16777215).toString(16)}`;
}

export default class DefaultMarkers extends React.Component {
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
      loading:true
    };
  }
  componentWillMount() {
    this._getLocationAsync();
  }

  _getLocationAsync = async () => {
    let { status } = await Permissions.askAsync(Permissions.LOCATION);
    if (status !== 'granted') {
      this.setState({
        errorMessage: 'Permission to access location was denied',
      });
    }

    let location = await Location.getCurrentPositionAsync({});
    console.log("location:",location)
    await this.setState({ 
                    region:{
                      latitude:location.coords.latitude,
                      latitudeDelta: LATITUDE_DELTA,
                      longitude:location.coords.longitude,
                      longitudeDelta: LONGITUDE_DELTA,
                    },
                    marker:{
                      coordinate:{
                        "latitude":location.coords.latitude,
                        "longitude":location.coords.longitude
                      }
                    },
                    loading:false });

  };

  onMapPress(e) {
    console.log("PickLocationPage.js, 46",e.nativeEvent.coordinate)
    this.setState({
      marker: 
        {
          coordinate: e.nativeEvent.coordinate,
        },
    });
  }

  render() {
    console.log(this.state)
    if(this.state.loading){
      return(
        <View style={styles.container} />
      )
    }else{
      return (
        <View style={styles.container}>
          <MapView
            provider={this.props.provider}
            style={styles.map}
            initialRegion={this.state.region}
            onPress={(e) => this.onMapPress(e)}
            customMapStyle={MapStyle}
          >
            <Marker
              coordinate={this.state.marker.coordinate}
              pinColor={"red"}
            />
          </MapView>
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              onPress={() => this.setState({ markers: [] })}
              style={styles.bubble}
            >
              <Text>{Lan['Pick_Location']}</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
  }
}

DefaultMarkers.propTypes = {
  provider: ProviderPropType,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  bubble: {
    backgroundColor: 'rgba(255,255,255,0.7)',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 20,
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
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: 'transparent',
  },
});







