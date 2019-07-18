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

//Community Modules
import MapView, { Marker, ProviderPropType, PROVIDER_GOOGLE } from 'react-native-maps';

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
const LATITUDE_DELTA = 0.0322;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

import {  STATUS_BAR_COLOR,
          BACKGROUND_COLOR,
          THEME_COLOR,
          TRANSPARENT,
          COLOR_PickLocationPage } from '../utility/colors.js'

export default class PickLocationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      region: {
        latitude: undefined,
        longitude: undefined,
        latitudeDelta: undefined,
        longitudeDelta: undefined,
      },
      marker: {
        coordinate:{
          "latitude": undefined,
          "longitude": undefined,
          }
        },
      unmounting:false,
      loading:true,
      show:false
    };

    //Function binding
    this.back=this.back.bind(this)
    this.confirm_pressed=this.confirm_pressed.bind(this)
    this.send_location=this.send_location.bind(this)
    this._getLocationAsync=this._getLocationAsync.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
  }

  _handleBackPress(){
    this.props.navigation.goBack()
    return true
  }
  
  componentWillMount() {
    this._getLocationAsync();
  }

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
    params.send_back_location(this.state.marker.coordinate)
    this.props.navigation.goBack()
  }

  _getLocationAsync = async () => {
    var result = await getPermission(Permissions.LOCATION)
    if(!result){
      this.props.navigation.goBack()
    }
    let location = await Location.getCurrentPositionAsync({});
    if(!this.state.unmounting){
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
    }
  };

  async onMapPress(e) {
    await this.setState({
      marker: 
        {
          coordinate: e.nativeEvent.coordinate,
        },
    });
  }

  render() {
    if(this.state.loading){
      return(
        <View style={{flex:1,
                      flexDirection:"column",
                      justifyContent:"flex-start"}} >
            {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"light-content"})}
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

              <MapView
                provider={this.props.provider}
                style={styles.map}
                initialRegion={this.state.region}
                onPress={(e) => this.onMapPress(e)}
                customMapStyle={MAP_STYLE}
                provider={PROVIDER_GOOGLE}
              >
                <Marker
                  coordinate={this.state.marker.coordinate}
                />
              </MapView>

            <View style={{position:'absolute',top:0,left:0,height:STATUSBAR_HEIGHT,width:width}}>
              {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"light-content"})}
            </View>

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
            
            <MO_Alerts show={this.state.show} 
                     type={"Location_Confirm"} 
                     confirm={this.send_location}
                     navigation={this.props.navigation}
                     location={
                      this.state.marker.coordinate
            }/>
            
          </View>
      );
    }
  }
}

PickLocationPage.propTypes = {
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
    // backgroundColor:"#1e6b3a"
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
    color:"#f9f9f9"
  },
  buttonContainer: {
    flexDirection: 'row',
    marginVertical: 20,
    backgroundColor: TRANSPARENT,
  },
});







