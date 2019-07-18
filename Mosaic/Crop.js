import React, { Component } from 'react';
import { Platform, ImageStore } from 'react-native';

import AmazingCropper from 'react-native-amazing-cropper';

export default class AmazingCropperPage extends Component {
  onDone = (croppedImageUri) => {
    console.log('croppedImageUri = ', croppedImageUri);
    if (Platform.OS === 'ios') {
      ImageStore.getBase64ForTag(
        croppedImageUri,
        (base64Image) => {
          // send image to server or save it locally
          ImageStore.removeImageForTag(croppedImageUri);
        },
        (err) => {}
      );
    }
    else {
      // send image to server
    }
    // navigate to the next page of your application
    
  }

  onCancel = () => {
    // navigate back
    
  }

  render() {
    return (
      <AmazingCropper
        onDone={this.onDone}
        onCancel={this.onCancel}
        imageUri='https://www.lifeofpix.com/wp-content/uploads/2018/09/manhattan_-11-1600x2396.jpg'
        imageWidth={1600}
        imageHeight={2396}
        NOT_SELECTED_AREA_OPACITY={0.3}
        BORDER_WIDTH={20}
      />
    );
  }
}