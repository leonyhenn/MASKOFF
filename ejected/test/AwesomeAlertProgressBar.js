/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';
import { StyleSheet, View, BackHandler, BackAndroid } from 'react-native';
import { ImagePicker } from 'expo'
import AwesomeAlert from 'react-native-awesome-alerts';
import config from './src/config';

import {
  ProgressAwesomeAlert,
  BasicAwesomeAlert,
  ErrorAwesomeAlert,
  ActionsAwesomeAlert
} from './src/components';

const HwBackHandler = BackHandler || BackAndroid;
const HW_BACK_EVENT = 'hardwareBackPress';

const futch = (url, opts={}, onProgress) => {
    return new Promise( (res, rej)=>{
        var xhr = new XMLHttpRequest();
        xhr.open(opts.method || 'get', url);
        xhr.setRequestHeader("access_token","eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiIwNDU0OTc1Yi0zOTU3LTQ5YWEtODVlYS02Y2U2ZjY1NGM5OGIiLCJleHAiOjE4NTQyOTMzMjIuOTUxODQ1fQ.fW0tOzUq9y8hChvFVTT93UzMvmPQNc116leEqSlW0Ko")
        for (var k in opts.headers||{})
            xhr.setRequestHeader(k, opts.headers[k]);
        xhr.onload = e => res(e.target);
        xhr.onerror = rej;
        if (xhr.upload && onProgress)
            xhr.upload.onprogress = onProgress; // event.loaded / event.total * 100 ; //event.lengthComputable
        xhr.send(opts.body);
        xhr.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
          }
        };
    });
}

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = { show: false, type: config.type.basic, progress:"0 %" };
    this.connect = this.connect.bind(this)
    this.showAlert=this.showAlert.bind(this)
    this.hideAlert=this.hideAlert.bind(this)
  }

  async connect(){
    
    let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:"Videos"
      });
    console.log("Module 1444",result)
    this.showAlert(config.type.progress)
    if(!result.cancelled){
      
      filename = result.uri.split("/")
      filename = filename[filename.length - 1]
    
      data = new FormData()
      data.append("file",{uri:result.uri,name: filename})
      futch("PLACEHOLDER_FOR_GITHUB/maskers", {
        method: 'post',
        body: data
      }, (progressEvent) => {
        const progress = ((progressEvent.loaded / progressEvent.total) * 100).toFixed(2);
        if(progress < 100){
          this.setState({progress:progress.toString() + "%"})
        }else{
          this.setState({progress:"100 %"})
          setTimeout(() => this.hideAlert(), 500);
        }
      }).then((res) => {
        if(res.status == 200){
          this.setState({progress:"Posted"})
          setTimeout(() => this.hideAlert(), 500);     
        }else{
          
          //TODO
          //call error window
        }
      }, (err) => console.log(err))
    }
  }

  showAlert(type){
    this.setState({
      show: true,
      type
    });
    
  };

  hideAlert(){
    this.setState({
      show: false
    });
  };

  componentDidMount() {
    HwBackHandler.addEventListener(HW_BACK_EVENT, this._handleHwBackEvent);
  }

  componentWillUnmount() {
    HwBackHandler.removeEventListener(HW_BACK_EVENT);
  }

  _handleHwBackEvent = () => {
    return true;
  };

  getProps = () => {
    const { type } = this.state;
    let alertProps = {};

    switch (type) {
      case config.type.progress:
        alertProps = {
          showProgress: true,
          title: this.state.progress,
          closeOnHardwareBackPress: false,
          progressSize: 'small',
          progressColor: '#707070',
          alertContainerStyle:{
            backgroundColor:'#3F3F3F'
          },
          contentContainerStyle:{
            backgroundColor:'black'
          },
          titleStyle:{
            color:"#707070"
          }
        };
        break;
    }
    return alertProps;
  };

  render() {
    const { show } = this.state;
    let props = this.getProps();

    return (
      <View style={styles.container}>
        <ProgressAwesomeAlert onPress={this.connect} />
        <AwesomeAlert show={show} {...props} />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff'
  }
});