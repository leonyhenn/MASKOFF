import React from 'react'
import { View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import styles from './DefaultFooter.component.style';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const DefaultFooter = (props) => (
  <View style={styles.buttonsContainer}>
    <TouchableOpacity onPress={props.onCancel} style={styles.touchable}>
      <MaterialCommunityIcons
            name="close"
            size={25}
            color={"white"} />
    </TouchableOpacity>
    <TouchableOpacity onPress={props.onRotate} style={styles.touchable}>
      <MaterialCommunityIcons
            name="format-rotate-90"
            size={25}
            color={"white"} />
    </TouchableOpacity>
    <TouchableOpacity onPress={props.onDone} style={styles.touchable}>
      <MaterialCommunityIcons
            name="check"
            size={25}
            color={"white"} />
    </TouchableOpacity>
  </View>
)

DefaultFooter.propTypes = {
  onDone: PropTypes.func,
  onRotate: PropTypes.func,
  onCancel: PropTypes.func,
  doneText: PropTypes.string,
  rotateText: PropTypes.string,
  cancelText: PropTypes.string
}

export default DefaultFooter;