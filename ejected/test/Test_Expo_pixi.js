/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import Expo from 'expo';
import * as ExpoPixi from '../components/MaskoffPixi/ExpoPixi.js';
import React, { Component } from 'react';
import { Image, Button, Platform, AppState, StyleSheet, Text, View } from 'react-native';
import AssetUtils from 'expo-asset-utils';
import {FileSystem} from "expo";
//Official Modules
import { height, 
         width } from '../utility/Util.js';

const isAndroid = Platform.OS === 'android';
function uuidv4() {
  //https://stackoverflow.com/a/2117523/4047926
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export default class App extends Component {
  constructor(props){
    super(props)
    this.state = {
      image: null,
      strokeColor: Math.random() * 0xffffff,
      strokeWidth: Math.random() * 30 + 10,
      lines: [
        {
          points: [{ x: 300, y: 300 }, { x: 600, y: 300 }, { x: 450, y: 600 }, { x: 300, y: 300 }],
          color: 0xff00ff,
          alpha: 1,
          width: 10,
        },
      ],
      appState: AppState.currentState,
      image_pos:{
        "height": 0,
        "width": 0,
        "x": 0,
        "y": 0,
      }
    };

    this.add=this.add.bind(this)
  }
  

  handleAppStateChangeAsync = nextAppState => {
    if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
      if (isAndroid && this.sketch) {
        this.setState({ appState: nextAppState, id: uuidv4(), lines: this.sketch.lines });
        return;
      }
    }
    this.setState({ appState: nextAppState });
  };

  async add(){
    try{
      const asset = await AssetUtils.resolveAsync("file:///data/user/0/host.exp.exponent/cache/ExperienceData/%2540leonyhenn%252Ffront-by-component/ImagePicker/ce4e215f-0078-4087-b028-7bfa2ab2f594.jpg");
  
      console.log("asset",asset);
    
      var img = new HTMLImageElement(asset)
    
      var tex = PIXI.Texture.from( img)
    
      var sprite = PIXI.Sprite.from(txt)
      this.sketch.stage.addChild(sprite);
      this.sketch.renderer._update()
    }catch(error){
      console.error(error)
    }
    
  }

  componentDidMount() {
    AppState.addEventListener('change', this.handleAppStateChangeAsync);
  }

  componentWillUnmount() {
    AppState.removeEventListener('change', this.handleAppStateChangeAsync);
  }

  onChangeAsync = async () => {
    const { uri } = await this.sketch.takeSnapshotAsync();

    this.setState({
      image: { uri },
      strokeWidth: Math.random() * 30 + 10,
      strokeColor: Math.random() * 0xffffff,
    });
  };

  onReady = () => {
    console.log('ready!');
  };

  render() {
    console.log(FileSystem.documentDirectory)
    return (
        <View style={styles.container}>
          <ExpoPixi.Sketch
            ref={ref => (this.sketch = ref)}
            style={[styles.sketch,{
              height: 300, 
              width:300,
            }]}
            strokeColor={this.state.strokeColor}
            strokeWidth={this.state.strokeWidth}
            strokeAlpha={1}
            onChange={this.onChangeAsync}
            onReady={this.onReady}
            initialLines={this.state.lines}
          />
        
        <Button
          color={'blue'}
          title="undo"
          style={styles.button}
          onPress={() => {
            this.sketch.undo();
          }}
        />
        <Button
          color={'blue'}
          title="add"
          style={styles.button}
          onPress={this.add}
        />
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems:'center',
    justifyContent:'center'


  },
  sketch: {
    flex: 1,
    borderWidth:1
  },
  sketchContainer: {
    height: height - 30,
    width:width,
  },
  image: {
    flex: 1,
  },
  imageContainer: {
    
    borderTopWidth: 4,
    borderTopColor: '#E44262',
  },
  label: {
    width: '100%',
    padding: 5,
    alignItems: 'center',
  },
  button: {
    // position: 'absolute',
    // bottom: 8,
    // left: 8,
    zIndex: 1,
    padding: 12,
    minWidth: 56,
    minHeight: 48,
  },
});
