/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
//React
import React from 'react';

//Official Modules
import { 
  View,
  StyleSheet, 
  ScrollView, 
  Text, 
  TouchableOpacity } from 'react-native';

//Custom Modules
import { MASKOFFStatusBar,
         ButtonHeader } from '../components/Modules.js'

//Terms and Conditions
import { t_n_c } from '../utility/Terms_And_Conditions.js'

//utility
import { height,
         width,
         HEADER_HEIGHT } from '../utility/Util.js'

//languages
import { Lan } from '../utility/Languages.js';

import { THEME_COLOR,
         COLOR_Terms_And_Conditions,
         STATUS_BAR_COLOR } from '../utility/colors.js'

export default class Terms_And_Conditions extends React.Component {
  constructor(props) {
    super(props);
  };

  render() {
    return (
      <View style={styles.container}>
        {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"light-content"})}
        {ButtonHeader({layout:"left-center",
                        center_content:<Text style={{backgroundColor:THEME_COLOR,
                                                     fontSize:HEADER_HEIGHT / 3,
                                                     color:COLOR_Terms_And_Conditions["Terms"],}}>{Lan['Terms']}</Text>,
                        left_button_onPress:() => this.props.navigation.goBack(),
                        left_button_text:Lan["Back"]})}
        <ScrollView style={styles.container}
                    contentContainerStyle={{
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
          <Text style={styles.text}>{t_n_c}</Text>
        </ScrollView>
      </View>
    );
  };
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  text: {
    margin:10,
    color: COLOR_Terms_And_Conditions["text"],
    fontSize: 12,
  }
});    