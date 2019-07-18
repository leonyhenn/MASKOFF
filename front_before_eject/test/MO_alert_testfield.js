/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import {
  Text,
  View,
  TouchableOpacity
} from 'react-native';
import { Font } from 'expo';

import { Lan,
         setLanDict } from '../utility/Languages.js';
import MO_Alerts from '../components/MO_Alerts.js'

export default class App extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      fontLoaded: false,
      show:false,
      type:'HttpReqs_PreviewPage'
    };
    this.connect=this.connect.bind(this)
    this.getData=this.getData.bind(this)
  }
  ComponentWillMount(){
    
  }
  async componentDidMount() {
    setLanDict("Chinese")
    await Font.loadAsync({
      'FugazOne': require('../assets/fonts/FugazOne-Regular.ttf'),
      'Tencent':require('../assets/fonts/TTTGB-Medium180130.ttf'),
    });
    this.setState({ fontLoaded: true });

  }
  async getData(){
    console.log("retry")
  }
  connect(){
    this.setState({show:true,type:"Notice",title:"Notice",message:"please input his name so that others can search him.\n\nIf you don't know his real name, nickname would also do."})
    setTimeout(() => this.setState({show:false}),50)
  }
  render() {
    if(!this.state.fontLoaded){
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ fontSize: 56 }}>
            Not Done
          </Text>
        </View>
      )
    }else{
      return(
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center',backgroundColor:"green" }}>
          <TouchableOpacity onPress={this.connect}>
            <Text style={{ fontSize: 56,fontFamily:"Tencent",color:"red" }}>
              Retry
            </Text>
          </TouchableOpacity>
          <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   title={this.state.title}
                   message={this.state.message}
                   retry={async () => {await this.getData()}}/>
        </View>
        )
    }
  }
}