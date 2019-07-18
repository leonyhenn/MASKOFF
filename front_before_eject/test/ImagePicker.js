/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import { ImagePicker as ExpoImagePicker, Permissions } from 'expo';

export default class ImagePicker {
  static async pickImageFromLibrary() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    if (status === 'granted') {
      const result = await ExpoImagePicker.launchImageLibraryAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });
      if (result.cancelled) {
        return Promise.resolve();
      }
      return result;
    } else {
      throw new Error('No permissions for camera roll');
    }
  }

  static async pickImageFromCamera() {
    const { status } = await Permissions.askAsync(Permissions.CAMERA);
    if (status === 'granted') {
      const result = await ExpoImagePicker.launchCameraAsync({
        mediaTypes: ExpoImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
      });
      if (result.cancelled) {
        return Promise.resolve();
      }
      return result;
    } else {
      throw new Error('No permissions for camera');
    }
  }
}
