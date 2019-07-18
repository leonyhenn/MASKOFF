/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */

import React from 'react';
import { StyleSheet, Text, View, SafeAreaView } from 'react-native';


import EmojiSelector,{ Categories } from 'react-native-emoji-selector'

const THEME = '#007AFF';

export default class App extends React.Component {
  state = {
    emoji: ' '
  }
  render() {
    console.log(this.state.emoji)
    return (
      <SafeAreaView style={styles.container}>
        <Text>Please select the emoji you would like to use</Text>
        <View style={styles.display}>
          <Text style={{fontSize: 64, backgroundColor: 'transparent'}}>{this.state.emoji}</Text>
        </View>
        <EmojiSelector 
          onEmojiSelected={emoji => this.setState({ emoji })}
          showSearchBar={true}
          showTabs={true}
          showHistory={true}
          showSectionTitles={true}
          category={Categories.all}
          columns={10}
        />
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  display: {
    width: 96,
    height: 96,
    margin: 24,
    borderWidth: 2,
    borderRadius: 12,
    borderColor: THEME,
    alignItems: 'center',
    justifyContent: 'center',
  }
});