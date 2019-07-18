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
import SlotMachine from 'react-native-slot-machine'
export default class Example extends React.Component {
    constructor(props) {
        super(props);
        this.state = {duration: 4000, slot1: 1234, slot2: 'hello', slot3: '2351'};
    }

    componentDidMount() {
        setTimeout(() => this.setState({duration: 1000, slot1: '4321', slot2: 'world', slot3: '1234'}), 5000);
        setTimeout(() => this.setState({duration: 4000, slot1: '1234', slot2: 'hello', slot3: '2351'}), 7000);
        setTimeout(() => this.refs.slot.spinTo('prize'), 12000);
    }
    render() {
        const symbols = ['🍏', '🍎', '🍐', '🍊', '🍋', '🍌']; // can't use emojies in SlotMachine because some of them are comprised of 2 chars
        return (
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <View style={{height: 200, justifyContent: 'space-between', alignItems: 'center'}}>
                    <SlotMachine text={this.state.slot1} duration={this.state.duration} />
                    <SlotMachine
                        text={this.state.slot2}
                        range="abcdefghijklmnopqrstuvwxyz"
                        width={45} duration={this.state.duration}
                        ref="slot"
                        height={28}
                        width={20}
                        styles={{
                          overlay:{
                            backgroundColor:"transparent"
                          },
                          slotInner:{
                            backgroundColor:"white",
                            padding:0
                          },
                          text:{
                            fontSize:24,
                            color:"black"
                          },
                          outerBorder:{
                            borderWidth:0
                          },
                          innerBorder:{
                            borderWidth:0
                          },
                          slotWrapper:{
                            marginLeft:0
                          }
                        }}
                    />
                    <SlotMachine text={this.state.slot3} range="012345" renderContent={c => <Text style={{fontSize: 25}}>{symbols[c]}</Text>} duration={this.state.duration} />
                </View>
            </View>
        );
    }
}