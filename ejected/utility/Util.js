/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import { SecureStore } from 'expo';
import { Dimensions,
         Platform,
         StatusBar } from 'react-native'
import resolveAssetSource from 'resolveAssetSource';
import moment from 'moment';

//Expo
import { Permissions, 
         Notifications, 
         Audio,
         Constants,
         FileSystem } from 'expo';

import { Lan } from '../utility/Languages.js'

export const { height, width } = Dimensions.get('screen');
export const screen_height = Dimensions.get('screen').height;
export const screen_width = Dimensions.get('screen').width;


export const FOOTER_HEIGHT = 49;
export const STATUSBAR_HEIGHT = Platform.OS === 'ios' ? 20 : StatusBar.currentHeight;
export const HEADER_HEIGHT = 50;
export const TOP_TAB_HEIGHT = 30;
export const TOOLBAR_HEIGHT = 40;
export const CHAT_THUMBNAIL_HEIGHT = 70;
export const BREF_LENGTH = 50



export const MASKOFF_LOGO = require('../assets/images/MASKOFF_black_bg.png');
const MASKOFF_LOGO_original_height = resolveAssetSource(MASKOFF_LOGO).height;
const MASKOFF_LOGO_original_width = resolveAssetSource(MASKOFF_LOGO).width;
export const MASKOFF_LOGO_welcome_page_width = width/2;
export const MASKOFF_LOGO_welcome_page_height = (MASKOFF_LOGO_welcome_page_width/MASKOFF_LOGO_original_width) * MASKOFF_LOGO_original_height;
export const MASKOFF_LOGO_header_width = width/5;
export const MASKOFF_LOGO_header_height = (MASKOFF_LOGO_header_width/MASKOFF_LOGO_original_width) * MASKOFF_LOGO_original_height;

export const MASKOFF_LOGO_SLIM = require('../assets/images/MASKOFF_black_slim.png');
const MASKOFF_LOGO_SLIM_original_height = resolveAssetSource(MASKOFF_LOGO_SLIM).height;
const MASKOFF_LOGO_SLIM_original_width = resolveAssetSource(MASKOFF_LOGO_SLIM).width;
export const MASKOFF_LOGO_SLIM_header_height = HEADER_HEIGHT * (3 / 4);
export const MASKOFF_LOGO_SLIM_header_width = (MASKOFF_LOGO_SLIM_header_height/MASKOFF_LOGO_SLIM_original_height) * MASKOFF_LOGO_SLIM_original_width;

export const CHECK_MARK = require('../assets/images/check_mark.png');
const CHECK_MARK_original_height = resolveAssetSource(CHECK_MARK).height;
const CHECK_MARK_original_width = resolveAssetSource(CHECK_MARK).width;
export const CHECK_MARK_header_height = height / 40;
export const CHECK_MARK_header_width = CHECK_MARK_header_height;

export const IMAGE_PLACEHOLDER = require('../assets/images/image_placeholder.png')

export const CLASSIFIED = require('../assets/images/classified.png');

export const MESSAGE_VIBRATION_PATTERN = 150

export const MESSAGE_SOUND = new Audio.Sound();

export function isSameDay(currentMessage = {}, diffMessage = {}) {
  // if (!diffMessage.createdAt) {
  //   return false;
  // }

  // const currentCreatedAt = moment(currentMessage.createdAt);
  // const diffCreatedAt = moment(diffMessage.createdAt);

  // if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
  //   return false;
  // }

  // return currentCreatedAt.isSame(diffCreatedAt, 'day');
  return isInTenMin(currentMessage,diffMessage)
}

export function isInTenMin(currentMessage = {}, diffMessage = {}) {
  if (!diffMessage.createdAt) {
    return false;
  }

  const currentCreatedAt = moment(currentMessage.createdAt);
  const diffCreatedAt = moment(diffMessage.createdAt);
  const ten_min = moment(10, 'minutes')

  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }
  return diffCreatedAt.add(10,'minutes').isSameOrAfter(currentCreatedAt);
}

export function isInAWeek(currentMessage = {}) {

  const currentCreatedAt = moment();
  const diffCreatedAt = moment(currentMessage.createdAt);

  if (!currentCreatedAt.isValid() || !diffCreatedAt.isValid()) {
    return false;
  }
  return diffCreatedAt.add(7,'days').isSameOrAfter(currentCreatedAt);
}


export function isSameUser(currentMessage = {}, diffMessage = {}) {
  return !!(
    diffMessage.user &&
    currentMessage.user &&
    diffMessage.user._id === currentMessage.user._id
  );
}

export function warnDeprecated(fn) {
  return (...args) => {
    // eslint-disable-next-line
    console.warn(DEPRECATION_MESSAGE);
    return fn(...args);
  };
}


export async function connect_to_server(method,url_prefix,url_affix="",body=null){
	if (body){
		const response = await fetch(global.server+url_prefix+url_affix,{
    	    method:method,
    	    headers:{'Accept':'application/json',
    	            'Content-type':'application/json',
    	            'access-token':global.access_token
    	            },
            body:body
    	    });
		const json = await response.json();
		return json
    }else{
    	const response = await fetch(global.server+url_prefix+url_affix,{
    	    method:method,
    	    headers:{'Accept':'application/json',
    	            'Content-type':'application/json',
    	            'access-token':global.access_token
    	            },
    	    });
        // console.log("Utils 128",response)
		const json = await response.json();
		return json
    }
}

export const MAP_STYLE =[
    {
        "featureType": "all",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "administrative",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#5b6571"
            },
            {
                "lightness": "35"
            }
        ]
    },
    {
        "featureType": "administrative.neighborhood",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "landscape",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#f3f4f4"
            }
        ]
    },
    {
        "featureType": "landscape.man_made",
        "elementType": "geometry",
        "stylers": [
            {
                "weight": 0.9
            },
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "poi.park",
        "elementType": "geometry.fill",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#83cead"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#fee379"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "geometry",
        "stylers": [
            {
                "visibility": "on"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.highway.controlled_access",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "simplified"
            },
            {
                "color": "#ffffff"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "elementType": "labels.icon",
        "stylers": [
            {
                "visibility": "off"
            }
        ]
    },
    {
        "featureType": "water",
        "elementType": "all",
        "stylers": [
            {
                "visibility": "on"
            },
            {
                "color": "#7fc8ed"
            }
        ]
    }
]
export function image_resize_by_width(original_width,original_height){
  //return resized image height
  
  if (original_width <= Dimensions.get('window').width){
    return original_height
  }else{
    ratio = original_height / original_width
    return ratio * Dimensions.get('window').width
  }
}


export async function signatureFactory (clientId) {
// export var signatureFactory = async function(clientId) {
  return new Promise((resolve, reject) => {
    try{
      const response = fetch(global.server+"/chat"+"/login_sign"+"/"+clientId,{
        method:'GET',
        headers:{
          'Accept':'application/json',
          'Content-type':'application/json'
        }
      }).then(response => {return response.json()})
    }catch(error){
      console.error(error);
    }
  })
  
};
var conversationSignatureFactory = function(conversationId, clientId, targetIds, action) {
  return AV.Cloud.rpc('sign-conversation', {
    conversationId: conversationId,
    clientId: clientId,
    targetIds: targetIds,
    action: action,
  });
};
 
export async function getExpoNotificationToken(){
    try {
      const { status: existingStatus } = await Permissions.getAsync(
        Permissions.NOTIFICATIONS
      );
      let finalStatus = existingStatus;
    
      // only ask if permissions have not already been determined, because
      // iOS won't necessarily prompt the user a second time.
      if (existingStatus !== 'granted') {
        // Android remote notification permissions are granted during the app
        // install, so this will only ask on iOS
        const { status } = await Permissions.askAsync(Permissions.NOTIFICATIONS);
        finalStatus = status;
      }
    
      // Stop here if the user did not grant permissions
      if (finalStatus !== 'granted') {
        return "None";
      }
      let token = await Notifications.getExpoPushTokenAsync();
      return token
    
      // Your sound is playing!
    } catch (error) {
      console.log(error)
    }
}
export function getExpoConstantsInstallationId(){
    return Constants.installationId
}
export async function getPermission(permission){
  const { status: existingStatus } = await Permissions.getAsync(
    permission
  );
  let finalStatus = existingStatus;
  // only ask if permissions have not already been determined, because
  // iOS won't necessarily prompt the user a second time.
  if (existingStatus !== 'granted') {
    // Android remote notification permissions are granted during the app
    // install, so this will only ask on iOS
    const { status } = await Permissions.askAsync(permission);
    finalStatus = status;
  }else{
    return 1
  }

  // Stop here if the user did not grant permissions
  if (finalStatus !== 'granted') {
    return 0;
  }
  return 1
}
const MINUTE = 60
const HOUR = 60 * 60
const DAY = HOUR * 24
const WEEK = DAY * 7
const MONTH = DAY * 30
const HALF_YEAR = DAY * 182
const YEAR = DAY * 365
export function getDate(timestamp){
  var post_time =  Date.parse(timestamp)
  var now = new Date().getTime()
  var elapse = (now - post_time) / 1000
  if(elapse > YEAR){
    return Math.floor(elapse / YEAR).toString() + Lan["Years_ago"]
  }
  if(elapse > HALF_YEAR){
    return Lan["Half_Year_ago"]
  }
  if(elapse > MONTH){
    return Math.floor(elapse / MONTH).toString() + Lan["Months_ago"]
  }
  if(elapse > WEEK){
    return Math.floor(elapse / WEEK).toString() + Lan["Weeks_ago"]
  }
  if(elapse > DAY){
    return Math.floor(elapse / DAY).toString() + Lan["Days_ago"]
  }
  if(elapse > HOUR){
    return Math.floor(elapse / HOUR).toString() + Lan["Hours_ago"]
  }
  return Math.floor(elapse / MINUTE).toString() + Lan["Minutes_ago"]
}

export function getDateLiveUntil(timestamp){
  var delete_time =  Date.parse(timestamp)
  var now = new Date().getTime()
  var elapse = (delete_time - now ) / 1000
  
  if(elapse > YEAR){
    return Math.floor(elapse / YEAR).toString() + Lan["Years"]
  }
  if(elapse > HALF_YEAR){
    return Lan["Half_Year_ago"]
  }
  if(elapse > MONTH){
    return Math.floor(elapse / MONTH).toString() + Lan["Months"]
  }
  if(elapse > WEEK){
    return Math.floor(elapse / WEEK).toString() + Lan["Weeks"]
  }
  if(elapse > DAY){
    return Math.floor(elapse / DAY).toString() + Lan["Days"]
  }
  if(elapse > HOUR){
    return Math.floor(elapse / HOUR).toString() + Lan["Hours"]
  }
  return Math.floor(elapse / MINUTE).toString() + Lan["Minutes"]
}

export const IMAGE_LIMITED_HEIGHT = 2024
export const IMAGE_LIMITED_WIDTH = 2024
export const LAMBDA_LIMITED_SIZE = 8000000
export async function getPackSize(pack,type){
  size = 0
  if(type == "post"){
    if( "title" in pack){
      size +=  pack["title"].length
    }
    if("name" in pack){
      size += pack["name"].length
    }
    if("alias" in pack){
      for(var i=0;i<pack["alias"].length;i++){
        size += pack["alias"][i].length
      }
    }
    if("tags" in pack){
      for(var i=0;i<pack["tags"].length;i++){
        size += pack["tags"][i].length
      }
    }
    
    if("content" in pack){
      for(var i=0;i<pack["content"].length;i++){
        if(pack["content"][i]["info_type"] == "Text"){
          size += pack["content"][i]["info"].length
        }else if(pack["content"][i]["info_type"] == "Photo" || pack["content"][i]["info_type"] == "Video"){
          try{
  
            result = await FileSystem.getInfoAsync(pack["content"][i]["info"])
            if(result["exists"] == false){
              return false
            }
            size += await result["size"]
          }catch(error){
            return false
          }
        }else if(pack["content"][i]["info_type"] == "Location"){
          size += "latitude".length
          size += pack["content"][i]["info"]["latitude"].toString().length
          size += "longitude".length
          size += pack["content"][i]["info"]["longitude"].toString().length
        }else if(pack["content"][i]["info_type"] == "Vote"){
          for(var j=0;j<pack["content"][i]["info"].length;j++){
            size += pack["content"][i]["info"][j]["option"].length
          }
        }
      }
    }
  }else if(type == "chatImageMax2048"){
    result = await FileSystem.getInfoAsync(pack)
    if(result["exists"] == false){
      return false
    }
    size += await result["size"]

  }else if(type == "sendComment"){
    for(var i=0;i<pack.length;i++){
      if("filename" in pack[i]){
        size += pack[i]["filename"].length
      }  
    }
    
  }else if(type == "changeThumbnail"){
    result = await FileSystem.getInfoAsync(pack)
    if(result["exists"] == false){
      return false
    }
    size += await result["size"]
  }
  return size
}

export function randomColor(){
  var color_options = ["#ffcccc","#decfac","#9dfbbc","#f6b180","#99cccc","#cc99cc","#abcdef","#ffcc99","#ccccff","#66cccc"]
  var rand = color_options[Math.floor(Math.random() * color_options.length)];
  return rand
}

export function indexOfMax(arr) {
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}