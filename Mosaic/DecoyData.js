import React, { Component } from 'react';
import {
  Platform
} from 'react-native'

export var DECOY_IMAGE_PREFIX;
export var DECOY_IMAGE_SOURCE;

Platform.OS == 'ios'?DECOY_IMAGE_PREFIX="file://"
                    :DECOY_IMAGE_PREFIX="file:"

Platform.OS == 'ios'?DECOY_IMAGE_SOURCE="/var/mobile/Containers/Data/Application/D5A56EB2-1CF9-4127-AB91-D316A35269D3/Documents/MASKOFF_TEMP/new_image.jpg"
                    :DECOY_IMAGE_SOURCE="/data/user/0/maskoff.mosaic/files/MASKOFF_TEMP/new_image.jpg"