/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  intermediate performance tested
  for MASKOFF.

  TODO:
  1. Permission check
  2. onLoadEarlier Spinner style(Ted)
  3. not sure how to handle report

  x将所有setState / dispatch改为async/await, 取消所有除了show:false之外的取消设定 
  x重新测试
  2019.Jan.17
*/

//React
import React,{ Component } from 'react';

//Official components
import { Text, 
         View,
         StyleSheet,
         Platform,
         TextInput,
         TouchableOpacity,
         TouchableWithoutFeedback,
         Clipboard,
         Image,
         Share,
         ViewPropTypes,
         Keyboard,
         Linking,
         ActivityIndicator } from 'react-native';
import PropTypes from 'prop-types';
import MapView from 'react-native-maps';
import { Marker } from 'react-native-maps';
import uuid from "uuid"

//Expo
import { Constants,
         Video,
         FileSystem,
         MediaLibrary,
         Permissions,
         ImagePicker,
         DocumentPicker } from 'expo';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';

//Custom Modules
import { notifications } from '../components/Dropdown_Alert_helpers.js'

//EmojiInput
import EmojiInput from '../components/EmojiInputindex.js';

//Community Modules
import Lightbox from '../components/Lightbox.js';
import ParsedText from 'react-native-parsed-text';
import Communications from 'react-native-communications';
import moment from 'moment';

//Utilities
import { height, 
         width,
         CLASSIFIED,
         HEADER_HEIGHT,
         getPermission } from '../utility/Util.js';
import { isSameDay, 
         isInAWeek,
         isSameUser,
         isInTenMin, 
         warnDeprecated, 
         MapStyle } from '../utility/Util.js';

//HttpRequests
import { chatImageMax2048 } from '../utility/HttpRequests.js'

//Languages
import { Lan } from '../utility/Languages.js';

//Web URL parsing constants
const TIME_FORMAT = 'LT';
const WWW_URL_PATTERN = /^www\./i;

//Toolbar height setting
const ChatToolBar_Height = 44

//Menu
import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers

import { THEME_COLOR,
         TRANSPARENT,
         COLOR_ICON_SET,
         BACKGROUND_COLOR,
         VIDEO_BACKGROUND_COLOR,
         COLOR_CustomComposer,
         COLOR_CustomAccesories,
         COLOR_CustomView,
         COLOR_InputToolbar,
         COLOR_CustomMessageText,
         COLOR_CustomTime,
         COLOR_CustomBubble,
         COLOR_CustomLoadEarlier,
         COLOR_CustomDay } from '../utility/colors.js'
//==========================Gifted Chat Composer=========================
export class CustomComposer extends React.Component {
  constructor(props){
    super(props)
    this.last_click = 0 
    this.clearText=this.clearText.bind(this)
  }
  
  onContentSizeChange(e) {
    const { contentSize } = e.nativeEvent;
    if (!contentSize) return;
    if (
      !this.contentSize ||
      this.contentSize.width !== contentSize.width ||
      this.contentSize.height !== contentSize.height
    ) {
      this.contentSize = contentSize;
      this.props.onInputSizeChanged({height:Platform.OS == 'ios'?this.contentSize.height:this.contentSize.height + 12,width:this.contentSize.width});
    }
  }
  
  clearText(){
    this.props.onChangeText('')
    if (Platform.OS === 'ios') {
      this._textInput.setNativeProps({ text: ' ' });
    }
    setTimeout(() => {
      this._textInput.setNativeProps({ text: '' });
    },5);
  }

  render() {
    return (
      <View style={CustomComposer_style.container}>
        <TouchableWithoutFeedback onPress={()=>{this._textInput.focus()}}>
          <TextInput
            multiline={true}
            onChange={(e) => this.onContentSizeChange(e)}
            onContentSizeChange={(e) => this.onContentSizeChange(e)}
            onChangeText={(text) => this.props.onChangeText(text)}
            onFocus={()=>{
              this.props.setEmojiModalVisible(false,"textinput")
            }}
            onBlur={()=>{Platform.OS == 'ios' ?this.props.setEmojiModalVisible(false,"textinputBlur"):null}}
            style={[CustomComposer_style.textInput, this.props.textInputStyle, { height: Platform.OS == 'ios'?this.props.composerHeight:this.props.composerHeight-12  }]}
            autoFocus={false}
            accessibilityLabel={this.props.text || this.props.placeholder}
            enablesReturnKeyAutomatically
            onSelectionChange={(event) => this.props.onChangeText(this.props.input,event.nativeEvent.selection.start)}
            value={this.props.input}
            blurOnSubmit={false}
            underlineColorAndroid={TRANSPARENT}
            keyboardAppearance="light"
            selectionColor={THEME_COLOR}
            placeholder={Lan['Message']}
            placeholderTextColor={COLOR_CustomComposer["placeholderTextColor"]}
            ref={component => this._textInput = component}
            />
        </TouchableWithoutFeedback>
        <View style={CustomComposer_style.send}>
        <TouchableWithoutFeedback disabled={this.props.input.trim() ==""?true:false}
                          onPress={() => {
                            //Igore any rushing-clicking
                            now = new Date().getTime()
                            if((now - this.last_click)> 500){
                              this.last_click = now
                              if(this.props.input.trim() !== ""){
                                this.clearText()
                                this.props.onSend({ text: this.props.input.trim()});
                              }
                            }
                          }}>
          <Ionicons name="ios-send" color={THEME_COLOR} size={28}/>
        </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}
const CustomComposer_style = StyleSheet.create({
  container:{
    flex:1,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"flex-end",
    marginRight:10
  },
  textInput: {
    marginLeft: 10,
    marginRight:10,
    fontSize: 16,
    lineHeight: 20,
    marginTop: Platform.select({
      ios: 6,
      android: 6,
    }),
    marginBottom: Platform.select({
      ios: 6,
      android: 6,
    }),
    backgroundColor:BACKGROUND_COLOR,
    color:COLOR_CustomComposer["text_input_color"],
    width:Platform.select({
      ios: width  - 55,
      android: width - 55,
    }), 
    alignSelf:"center",
  },
  send:{
    marginBottom:(44-28)/2,
    marginTop:(44-28)/2,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  }
});

CustomComposer.defaultProps = {
  composerHeight: 44,
  text: '',
  placeholderTextColor: "#C4C4C4",
  placeholder: "Type a message......",
  textInputProps: null,
  multiline: true,
  textInputStyle: {},
  textInputAutoFocus: false,
  keyboardAppearance: 'default',
  onTextChanged: () => {},
  onInputSizeChanged: () => {},
};

CustomComposer.propTypes = {
  composerHeight: PropTypes.number,
  text: PropTypes.string,
  placeholder: PropTypes.string,
  placeholderTextColor: PropTypes.string,
  textInputProps: PropTypes.object,
  onTextChanged: PropTypes.func,
  onInputSizeChanged: PropTypes.func,
  multiline: PropTypes.bool,
  textInputStyle: TextInput.propTypes.style,
  textInputAutoFocus: PropTypes.bool,
  keyboardAppearance: PropTypes.string,
};

//==============================gifted chat input accesorries================================
export class CustomAccesories extends React.Component{
  constructor(props){
    super(props);
    this.state={emoji_enabled:false}
    this.send_back_location=this.send_back_location.bind(this)
    this.keyboardDidShow = this.keyboardDidShow.bind(this);
    this.keyboardDidHide = this.keyboardDidHide.bind(this);
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }
  
  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }
  
  async keyboardDidShow(e) {
    await this.setState({emoji_enabled:true})
  }

  async keyboardDidHide(e) {
    if(!this.props.modalVisible){
      await this.setState({emoji_enabled:false}) 
    }
  }
  
  send_back_location(coordinate){
    this.props.onSend([{
      location: {
        latitude: coordinate.latitude,
        longitude: coordinate.longitude,
      },
    }]);
  }
  
  render(){
    emoji_button = 
          <TouchableOpacity style={CustomAccesories_styles.tool}
                            onPress={() => {
                              this.props.modalVisible?null:this.props.setEmojiModalVisible(true,"toolbar")}
                            }
                            disabled={this.state.emoji_enabled?false:true}
  
                            >
            <Ionicons name="ios-happy" size={25} color={this.state.emoji_enabled ?COLOR_CustomAccesories["emoji_enabled"]:COLOR_CustomAccesories["emoji_not_enabled"]}/>
          </TouchableOpacity>
        
    return (
      <View style={CustomAccesories_styles.tools}>
        {emoji_button}
        <TouchableOpacity style={CustomAccesories_styles.tool}
                          onPress={async ()=>{
                            Keyboard.dismiss()
                            setTimeout(async()=>{
                              response = await getPermission(Permissions.CAMERA_ROLL)
                              if(!response){
                                return
                              }
                              var allowsEditing = true
                              if (Platform.OS == 'ios'){
                                allowsEditing = false
                              }
                              let result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes:ImagePicker.MediaTypeOptions.Images,
                                allowsEditing:allowsEditing,
                                exif:false
                              });
                              if(!result.cancelled){
                                file_id = uuid.v4()
                                
                                temp = result.uri.split(".")  
                                extention = temp[temp.length - 1]
                                new_file_name = file_id + "." + extention
                                file = result.uri
                                
                                this.props.onSend({image:file,filename:new_file_name})
                              }
                            },500)
                          }}>
                          
          <Ionicons name="ios-images" size={25} color={COLOR_ICON_SET["CustomAccesories"]}/>
        </TouchableOpacity>
        <TouchableOpacity style={CustomAccesories_styles.tool}
                          onPress={async() => {
                            await Keyboard.dismiss()  
                            setTimeout(async()=>{      
                              response = await getPermission(Permissions.CAMERA_ROLL)
                              if(!response){
                                return
                              }                  
                              var allowsEditing = true
                              if (Platform.OS == 'ios'){
                                allowsEditing = false
                              }
                              let result = await ImagePicker.launchImageLibraryAsync({
                                mediaTypes:ImagePicker.MediaTypeOptions.Videos,
                                allowsEditing:allowsEditing,
                                exif:false
                              });
                              if(!result.cancelled){
                                file_id = uuid.v4()
                                temp = result.uri.split(".")  
                                extention = temp[temp.length - 1]
                                new_file_name = file_id + "." + extention
                                file = result.uri
                                this.props.onSend([{video:file,filename:new_file_name}])
                              }
                            },500)
                          }
                        }>
          <Ionicons name="ios-skip-forward" size={25} color={COLOR_ICON_SET["CustomAccesories"]}/>
        </TouchableOpacity>
        <TouchableOpacity style={CustomAccesories_styles.tool}
                          onPress={async () => {
                              await Keyboard.dismiss()
                              setTimeout(async()=>{                        
                              let result = await DocumentPicker.getDocumentAsync({"type":"*/*"});
                                if(result["type"] !== "cancel"){
                                  file_id = uuid.v4()
                                  file = result.uri
                                  this.props.onSend([{file:file,filename:file_id}])
                                }
                              },500)
                          }}>
          <Ionicons name="ios-folder" size={25} color={COLOR_ICON_SET["CustomAccesories"]}/>
        </TouchableOpacity>
  
        <TouchableOpacity style={CustomAccesories_styles.tool}
                          onPress={async () => {
                            result = await getPermission(Permissions.LOCATION)
                            if(!result){
                              return
                            } 
                            this.props.navigation.navigate("PickLocationPage",{send_back_location:this.send_back_location})
                          }
                          }

                          >
          <Ionicons name="ios-pin" size={25} color={COLOR_ICON_SET["CustomAccesories"]}/>
        </TouchableOpacity>
      </View>
    );
  }
}

const CustomAccesories_styles = StyleSheet.create({
  tools:{
    height:44,
    width:width,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginTop:2,
    marginBottom:2,
  },
  tool:{
    height:44,
    width:width * (1 / 5),
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
});

//==============================gifted chat input toolbar================================
export class InputToolbar extends React.Component {

  constructor(props) {
    super(props);
    this.keyboardDidShow = this.keyboardDidShow.bind(this);
    this.keyboardDidHide = this.keyboardDidHide.bind(this);
    this.state = {
      position: 'absolute',
    };
  }

  componentWillMount() {
    this.keyboardWillShowListener = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
    this.keyboardWillHideListener = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
  }

  componentWillUnmount() {
    this.keyboardWillShowListener.remove();
    this.keyboardWillHideListener.remove();
  }

  async keyboardDidShow() {
    await this.setState({
      position: 'relative',
    });
  }

  async keyboardDidHide() {
    await this.setState({
      position: 'absolute',
    });
  }
  
  renderComposer() {
    return this.props.renderComposer(this.props);
  }

  renderAccessory() {
    return (
      <View style={[InputToolbar_style.accessory, this.props.accessoryStyle]}>
        {this.props.renderAccessory(this.props)}
      </View>
    );
  }

  render() {
      emoji = <View style={{width:width,
                            height:global.keyboardHeight == undefined?100:global.keyboardHeight,
                            flexDirection:"column",
                            justifyContent:"center",
                            alignItems:"center"}}>        
      <EmojiInput
          onEmojiSelected={emoji => this.props.EmojiCallback(emoji.char)}
          enableFrequentlyUsedEmoji={false}
          ref={emojiInput => this._emojiInput = emojiInput}
          numColumns={10}
          emojiFontSize={25}
          enableSearch={false}
          categoryFontSize={25}
          categoryLabelTextStyle={{
            fontSize:15,
            fontWeight:"400",
          }}
          keyboardBackgroundColor={BACKGROUND_COLOR}
          categoryLabelHeight={0}
          showCategoryTab
          categoryHighlightColor={THEME_COLOR}
          categoryUnhighlightedColor={"#cccccc"}
          showCategoryTab={false}
      />
      </View>

    return (
      <View
        style={[InputToolbar_style.container, { position: this.state.position }]}>
        <View style={InputToolbar_style.primary}>
          {this.renderComposer()}
        </View>
        <View style={[InputToolbar_style.accessory,{height:this.props.accessoryHeight}]}>
          {this.renderAccessory()}
          {emoji}
        </View>
      </View>
    );
  }
}

const InputToolbar_style = StyleSheet.create({
  container: {
    backgroundColor: BACKGROUND_COLOR,
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'column',
    justifyContent:'flex-start',
    alignItems: 'flex-start',
  },
  primary: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderBottomWidth:1,
    borderColor:COLOR_InputToolbar["borderColor"],
  },
  accessory: {
    height: 43,
    borderBottomWidth:1,
    borderColor:COLOR_InputToolbar["borderColor"],
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
});

//=================================custom view inside bubble(sender)======================================
export class CustomView extends React.PureComponent{
  constructor(props){
    super(props)
    this.download=this.download.bind(this)
    this.share=this.share.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
  }
  async download(){
    if(this.props.currentMessage.user._id != global.IMClientName){
      this.props.notification(notifications['warn'].type,"Downloading...")
      if(this.props.currentMessage.video){
        try{
          result = await getPermission(Permissions.CAMERA_ROLL)
          if(!result){
            return
          }
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/videos/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/videos/",{intermediates: true})
          }
          url = this.props.currentMessage.video
          var filename = url.substring(url.lastIndexOf('/')+1);
          var filePath = FileSystem.documentDirectory + "MASKOFF/videos/" + filename
          var response = await FileSystem.downloadAsync(this.props.currentMessage.video, filePath)
          var response = await MediaLibrary.getAlbumAsync('MASKOFF')
          var asset = await MediaLibrary.createAssetAsync(filePath);
          if(response === null){
            var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
          }else{
            var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
          }
          this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/videos/" + filename)
        }catch(error){
          this.props.notification(notifications['error'].type,"Download failed")
        }
      }else if(this.props.currentMessage.file){
        try{
          //check if directory exist, if not, make a new directory
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/files/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/files/",{intermediates: true})
          }

          //get filename of the file
          url = this.props.currentMessage.file
          var filename = url.substring(url.lastIndexOf('/')+1);

          //download the file
          var filePath = FileSystem.documentDirectory + "MASKOFF/files/" + filename
          var response = await FileSystem.downloadAsync(this.props.currentMessage.file, filePath)
          this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/files/" + filename)
          //check if the file is downloaded successfully, if not, cannot share
          this.props.navigation.navigate("WebViewPage",{uri:this.props.currentMessage.file})
        }catch(error){
          this.props.notification(notifications['error'].type,"Download failed")
        }
      }
    }
  }
  async share(){
    if(this.props.currentMessage.user._id != global.IMClientName){
      if(this.props.currentMessage.video){

      }else if(this.props.currentMessage.file){

      }
    }else{
      if(this.props.currentMessage.video){

      }else if(this.props.currentMessage.file){
        
      }
    }

  }
  handleMenu(value){
    switch(value){
      case "Share":
          this.share()
      break;
      case "Download":
          this.download()
      break;
    }
  }
  render(){
    if(this.props.currentMessage.user._id != global.IMClientName){
      menu = <Menu onSelect={(value) => this.handleMenu(value)}
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}>
        <MenuTrigger style={MessageImage_style.menuTrigger} >
          <Ionicons name="ios-more"
                    color={COLOR_ICON_SET["ios-more-CustomView"]}
                    size={30}/>
        </MenuTrigger>
        <MenuOptions style={MessageImage_style.menuOptions}>
          <MenuOption value={"Share"} customStyles={{optionWrapper:CustomView_styles.download_button}}>
            <Feather name="corner-up-right"
                  size={18}
                  color={COLOR_ICON_SET["corner-up-right-CustomView"]}/>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
          <MenuOption value={"Download"} customStyles={{optionWrapper:CustomView_styles.share_button}}>
            <Feather name="download"
                  size={18}
                  color={COLOR_ICON_SET["download-CustomView"]}/>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    }else{
      menu = null
    }
    insideBubble = []
    if (this.props.currentMessage.location) {
      insideBubble.push(
          <TouchableOpacity 
            key={0}
            style={[CustomView_styles.container, this.props.containerStyle]} 
            onPress={() => {
              // const url = Platform.select({
              //   ios: `http://maps.google.com/?q=${props.currentMessage.location.latitude},${props.currentMessage.location.longitude}`,
              //   android: `http://maps.google.com/?q=${props.currentMessage.location.latitude},${props.currentMessage.location.longitude}`
              // });
              // Linking.canOpenURL(url).then(supported => {
              //   if (supported) {
              //     return Linking.openURL(url);
              //   }
              // }).catch(err => {
              //   console.error('An error occurred', err);
              // });
              this.props.navigation.navigate("ViewLocationPage",{message:this.props.currentMessage})
            }}>
            <MapView
              provider="google"
              style={[CustomView_styles.mapView, this.props.mapViewStyle]}
              region={{
                latitude: this.props.currentMessage.location.latitude,
                longitude: this.props.currentMessage.location.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }}
              scrollEnabled={false}
              zoomEnabled={false}>
              <Marker coordinate={{
                        latitude: this.props.currentMessage.location.latitude,
                        longitude: this.props.currentMessage.location.longitude,
                      }}/>
            </MapView>
          </TouchableOpacity>
      )
    }else if(this.props.currentMessage.video){
      insideBubble.push(
        <View style={[CustomView_styles.container,{justifyContent:'center',
                                                               alignItems:'center',
                                                               flexDirection:'row',
                                                               marginRight:0}]} 
                          key={0}>
          <Video source={{uri:this.props.currentMessage.video}}
                           resizeMode={Video.RESIZE_MODE_CONTAIN}
                           muted={true}
                           shouldPlay={false}
                           useNativeControls
                           style={{height:(width / 2) * (9 / 16),
                                   width:width / 2,
                                   borderRadius:5,
                                   backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
          <View style={{flexDirection:'column',
                        justifyContent:'flex-end',
                        alignSelf:'flex-end',
                        alignItems:'center',
                        backgroundColor:TRANSPARENT,
                        margin:10,
                        marginBottom:0,
                        height:(width / 2) * (9 / 16)}}>
          
            {menu}
          </View>
        </View>
      )
    }else if(this.props.currentMessage.file){
      insideBubble.push(
        <View 
          key={0}
          style={[CustomView_styles.container,{justifyContent:'center',
                                               alignItems:'center',
                                               flexDirection:'row',
                                               marginRight:0,}]}>
          <TouchableOpacity style={CustomView_styles.file_img}
                            onPress={()=>this.props.navigation.navigate("WebViewPage",{uri:this.props.currentMessage.file})}>
            <Text style={CustomView_styles.file_text}>{this.props.currentMessage.file.split('.').pop().toUpperCase()}</Text>
          </TouchableOpacity>
          <View style={{flexDirection:'column',
                        justifyContent:'flex-end',
                        alignSelf:'flex-end',
                        alignItems:'center',
                        backgroundColor:TRANSPARENT,
                        margin:10,
                        marginBottom:0,
                        height: CustomView_styles.file_img.height}}>
          
          {menu}
          </View>
        </View>
      )
    } 
    return (
      <View>
        {insideBubble}
      </View>
    );
  }
}

const CustomView_styles = StyleSheet.create({
  container: {
    margin:10,
    marginBottom:0,
    backgroundColor:TRANSPARENT,
    borderRadius: 5,
  },
  download_button:{
    backgroundColor:BACKGROUND_COLOR,
    margin:5,
    borderRadius:3,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    flex:1,
  },
  share_button:{
    backgroundColor:BACKGROUND_COLOR,
    margin:5,
    borderRadius:3,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    flex:1,
  },
  mapView: {
    width: width * (1 / 2),
    height: width * (1 / 2),
    borderRadius: 5,
    margin: 1,
  },
  file_img:{
    width: 80,
    height: 80,
    marginRight:width * (1 / 2)  - 80,
    borderRadius:3,
    backgroundColor:THEME_COLOR,
    alignItems:"center",
    justifyContent:"center"
  },
  file_text:{
    color:COLOR_CustomView["file_text"],
    fontWeight:"700",
    fontSize:25
  },
  menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  menuTrigger: {
    padding: 5,
  }
});

CustomView.defaultProps = {
  currentMessage: {},
  containerStyle: {},
  mapViewStyle: {},
};

CustomView.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  mapViewStyle: ViewPropTypes.style,
};

class ScaledImage_Chat extends Component {
  constructor(props) {
    super(props);
    this.state = { source: { uri:this.props.info } };
    this._mounted = false
}

  componentWillMount() {
    this._mounted = true
    Image.getSize(this.props.info,async (img_width, img_height) => {
      if(this._mounted){
        if(img_width <= (width /2)){
          await this.setState({ img_width: img_width, img_height: img_height, img_or_width: img_width, img_or_height:img_height });
        }else{
          await this.setState({ img_width: width /2, img_height: img_height * ((width /2) / img_width), img_or_width: img_width, img_or_height:img_height });
        }
      }
    });
  }
  componentWillUnmount(){
    this._mounted = false
  }
  render() {
    return (
      <TouchableOpacity onPress={() => this.props.navigation.navigate("ImageZoomPage",{info:{uri:this.props.info,
                                                                                               height:this.state.img_or_height,
                                                                                               width:this.state.img_or_width}})}>
        <Image
          source={this.state.source}
          style={[{ height: this.state.img_height, width: this.state.img_width },this.props.style]}
          resizeMode="contain"/>
      </TouchableOpacity>
    );
  }
}

export class CustomMessageImage extends React.PureComponent{ 
  constructor(props){
    super(props)
    this.state={
      image:this.props.currentMessage.image
    }
    this.download=this.download.bind(this)
    this.share=this.share.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
    this.downloaded = false

  }

  share(){
    Image.getSize(this.props.currentMessage.image ,async (img_width, img_height) => {
      // console.log(this.props.currentMessage.image ,img_height,img_width)
    });

  }

  async download(){
    
    if(this.props.currentMessage.user._id != global.IMClientName){
      // //DELETE------
      // global.sqlitedb.transaction(tx => {
      //   tx.executeSql('SELECT * FROM messages WHERE id = ?',[this.props.currentMessage._id],async (_, { rows }) =>{
      //     // console.log("rows",rows)
      //     // tx.executeSql('UPDATE messages SET filelocaluri = ? where id = ?',["null",this.props.currentMessage._id],null,(transaction,error) => {this.props.notification(notifications['error'].type,"Download failed")})
      //   },(transaction,error) => {this.props.notification(notifications['error'].type,"Download failed")})
      // })
      // //DELETE------

      global.sqlitedb.transaction(tx => {
        tx.executeSql('SELECT * FROM messages WHERE id = ? ', [this.props.currentMessage._id], async (_tx, { rows }) =>{
          if(rows._array.length !== 1){
            this.props.notification(notifications['error'].type,"Download failed")
            return    
          }
          var cur_mes = rows._array[0]
          if(cur_mes["filelocaluri"] !== "null"){
            this.downloaded = true 
          }else{
            this.downloaded = false
          }
        },
          (transaction,error) => {this.props.notification(notifications['error'].type,"Download failed")}
        );
      },
      (error) => {this.props.notification(notifications['error'].type,"Download failed")},
      async ()=>{
        try{
          result = await getPermission(Permissions.CAMERA_ROLL)
          if(!result){
            return
          }
          this.props.notification(notifications['warn'].type,"Downloading...")
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/images/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/images/",{intermediates: true})
          }
          // console.log(this.props.currentMessage)
          if('download_url' in this.props.currentMessage){
            url = this.props.currentMessage.download_url  
          }else{
            url = this.props.currentMessage.image  
          }
          // console.log(url)
          var filename = url.substring(url.lastIndexOf('/')+1);
          var filePath = FileSystem.documentDirectory + "MASKOFF/images/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
          var response = await MediaLibrary.getAlbumAsync('MASKOFF')
          var asset = await MediaLibrary.createAssetAsync(filePath);
          if(response === null){
            var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
          }else{
            var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
          }
          if(this.downloaded){
            global.sqlitedb.transaction(tx => {
              tx.executeSql('UPDATE messages SET filelocaluri = ? where id = ?',[filePath,this.props.currentMessage._id],null,null)
            })
            this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
          }else{
            if(!Array.isArray(this.props.currentMessage.image)){
              response = await chatImageMax2048(filePath)
              if(response == false){
                //说明前面出现了error, 需要重连
                this.props.notification(notifications['error'].type,"Download failed")
              }else if(response.ok){
                json = await response.json()
                filename_list = json["filename"]
                global.sqlitedb.transaction(tx => {
                  tx.executeSql('SELECT * FROM messages WHERE id = ? ', [this.props.currentMessage._id], async (tx_, { rows }) =>{
                    message = JSON.parse(rows._array[0]["message"])
                    message["file"]["2048url"] = filename_list
                    tx.executeSql('UPDATE messages SET message = ?, filelocaluri = ? where id = ?',[JSON.stringify(message),filePath,this.props.currentMessage._id],null,(transaction,error) => {this.props.notification(notifications['error'].type,"Download failed")})
                  },(transaction,error) => {this.props.notification(notifications['error'].type,"Download failed")})
                })
                this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
                this.setState({image:filename_list})
              }else if(response.status == 401){
                this.props.notification(notifications['error'].type,"Download failed")
              }else{
                this.props.notification(notifications['error'].type,"Download failed")
              }
              
            }else{
              this.props.notification(notifications['error'].type,"Download failed")
            }
          }
        }catch(error){
          console.error(error)
          this.props.notification(notifications['error'].type,"Download failed")
        }
      })
    }
  }
  handleMenu(value){
    switch(value){
      case "Share":
          this.share()
      break;
      case "Download":
          this.download()
      break;
    }
  }
  render(){
    if(this.props.currentMessage.user._id != global.IMClientName){
      menu = <Menu onSelect={(value) => this.handleMenu(value)}
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}>
        <MenuTrigger style={MessageImage_style.menuTrigger} >
          <Ionicons name="ios-more"
                    color={COLOR_ICON_SET["ios-more-CustomView"]}
                    size={30}/>
        </MenuTrigger>
        <MenuOptions style={MessageImage_style.menuOptions}>
          <MenuOption value={"Share"} customStyles={{optionWrapper:CustomView_styles.download_button}}>
            <Feather name="corner-up-right"
                  size={18}
                  color={COLOR_ICON_SET["corner-up-right-CustomView"]}/>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
          <MenuOption value={"Download"} customStyles={{optionWrapper:CustomView_styles.share_button}}>
            <Feather name="download"
                  size={18}
                  color={COLOR_ICON_SET["download-CustomView"]}/>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    }else{
      menu = null
    }
    images = []
    if(!Array.isArray(this.state.image)){
      images.push(<Lightbox
          activeProps={{
            style: MessageImage_style.imageActive,
            
          }}
          underlayColor="black"
          {...this.props.lightboxProps}
          key={0}
        >
          <Image
              {...this.props.imageProps}
              style={[MessageImage_style.image, this.props.imageStyle]}
              source={{ uri: this.state.image }}
            />
        </Lightbox>)
    }else{
      for (var j=0;j<this.state.image.length;j++){
        images.push(
          <ScaledImage_Chat info={global.bucket.concat(this.state.image[j])} 
                               key={j}
                               navigation={this.props.navigation} />
        )
      }
    }
    return (
      <View style={[MessageImage_style.container, this.props.containerStyle]}>
        
        <View style={{flexDirection:"column",
                      justifyContent:"flex-start",
                      alignItems:"center"}}>
          {images}
          
        </View>
        <View style={{flexDirection:'column',
                        justifyContent:'flex-end',
                        alignSelf:'flex-end',
                        alignItems:'center',
                        height: MessageImage_style.image.height,
                        backgroundColor:TRANSPARENT,
                        margin:10,
                        marginBottom:0}}>
          {menu}
        </View>
      </View>
    );
  }
}

const MessageImage_style = StyleSheet.create({
  container: {
    borderRadius:5,
    backgroundColor:TRANSPARENT,
    margin: 10,
    marginRight:0,
    marginBottom:0,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center"

  },
  image: {
    width: width / 2,
    height: 100,
    borderRadius: 5,
    borderWidth:1,
    borderColor:COLOR_CustomView["borderColor"],
    resizeMode: 'cover',
  },
  imageActive: {
    flex:1,
    resizeMode: 'contain',
  },
  menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  menuTrigger: {
    margin:5,
  },
});

CustomMessageImage.defaultProps = {
  currentMessage: {
    image: null,
  },
  containerStyle: {},
  imageStyle: {},
  imageProps: {},
  lightboxProps: {},
};

CustomMessageImage.propTypes = {
  currentMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  imageStyle: Image.propTypes.style,
  imageProps: PropTypes.object,
  lightboxProps: PropTypes.object,
};

export class CustomMessageText extends React.Component {

  constructor(props) {
    super(props);
    this.onUrlPress = this.onUrlPress.bind(this);
    this.onPhonePress = this.onPhonePress.bind(this);
    this.onEmailPress = this.onEmailPress.bind(this);
    this.handleMenu=this.handleMenu.bind(this)
  }

  onUrlPress(url) {
    // When someone sends a message that includes a website address beginning with "www." (omitting the scheme),
    // react-native-parsed-text recognizes it as a valid url, but Linking fails to open due to the missing scheme.
    if (WWW_URL_PATTERN.test(url)) {
      this.onUrlPress(`http://${url}`);
    } else {
      Linking.canOpenURL(url).then((supported) => {
        if (!supported) {
          // eslint-disable-next-line
          console.error('No handler for URL:', url);
        } else {
          Linking.openURL(url);
        }
      });
    }
  }

  onPhonePress(phone) {
    const options = ['Call', 'Text', 'Cancel'];
    const cancelButtonIndex = options.length - 1;
    this.context.actionSheet().showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            Communications.phonecall(phone, true);
            break;
          case 1:
            Communications.text(phone);
            break;
          default:
            break;
        }
      },
    );
  }

  onEmailPress(email) {
    Communications.email([email], null, null, null, null);
  }

  async handleMenu(value){
    switch(value.action){
      case "CopyText" :
        Clipboard.setString(this.props.currentMessage.text);
      break;
      case "ShareText":
        Share.share({message:this.props.currentMessage.text,title:Lan["From_MASKOFF"]})
      break;
    }
  }

  render() {
    const linkStyle = StyleSheet.flatten([
      CustomMessageText_styles[this.props.position].link,
      this.props.linkStyle[this.props.position],
    ]);
    return (
      <Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}>
      <MenuTrigger
        style={[
          CustomMessageText_styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
          CustomMessageText_styles["left"].menuTrigger
        ]}
        triggerOnLongPress
      >
        <ParsedText
          style={[
            CustomMessageText_styles[this.props.position].text,
            this.props.textStyle[this.props.position],
            this.props.customTextStyle,
          ]}
          parse={[
            ...this.props.parsePatterns(linkStyle),
            { type: 'url', style: linkStyle, onPress: this.onUrlPress },
            { type: 'phone', style: linkStyle, onPress: this.onPhonePress },
            { type: 'email', style: linkStyle, onPress: this.onEmailPress },
          ]}
          childrenProps={{ ...this.props.textProps }}
        >
          {this.props.currentMessage.text}
        </ParsedText>
      </MenuTrigger>
      <MenuOptions style={CustomMessageText_styles["left"].menuOptions}>
          <MenuOption value={{action:"CopyText"}}
                      customStyles={{optionWrapper:CustomMessageText_styles["left"].download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Copy"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareText"}}
                      customStyles={{optionWrapper:CustomMessageText_styles["left"].download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
    )
  }
}

const CustomMessageText_textStyle = {
  fontSize: 16,
  lineHeight: 20,
  marginTop: 10,
  marginBottom: 0,
  marginLeft: 10,
  marginRight: 10,
};

const CustomMessageText_styles = {
  left: StyleSheet.create({
    container: {},
    text: {
      color: COLOR_CustomMessageText["left_text"],
      ...CustomMessageText_textStyle,
    },
    link: {
      color: COLOR_CustomMessageText["left_link"],
      textDecorationLine: 'underline',
    },
    menuOptions: {
      paddingHorizontal:10,
      paddingVertical:3
    },
    menuTrigger: {
      borderTopLeftRadius:5,
      borderTopRightRadius:5
    },
    download_button:{
      backgroundColor:BACKGROUND_COLOR,
      margin:5,
      borderRadius:3,
      flexDirection:"row",
      alignItems:"center",
      justifyContent:"flex-start",
      flex:1,
    },
  }),
  right: StyleSheet.create({
    container: {},
    text: {
      color: COLOR_CustomMessageText["right_text"],
      ...CustomMessageText_textStyle,
    },
    link: {
      color: COLOR_CustomMessageText["right_link"],
      textDecorationLine: 'underline',
    },
  }),
};

CustomMessageText.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomMessageText.defaultProps = {
  position: 'left',
  currentMessage: {
    text: '',
  },
  containerStyle: {},
  textStyle: {},
  linkStyle: {},
  customTextStyle: {},
  textProps: {},
  parsePatterns: () => [],
};

CustomMessageText.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  textStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  linkStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  parsePatterns: PropTypes.func,
  textProps: PropTypes.object,
  customTextStyle: Text.propTypes.style,
};

export function CustomTime({ position, containerStyle, currentMessage, timeFormat }, context) {
  // return (
  //   <View style={[styles[position].container, containerStyle[position]]}>
  //     <Text style={[styles[position].text, textStyle[position]]}>
  //       {moment(currentMessage.createdAt)
  //         .locale(context.getLocale())
  //         .format(timeFormat)}
  //     </Text>
  //   </View>
  // );
  return (<View style={[styles[position].container, containerStyle[position]]}>
            <View style={[styles[position].container, containerStyle[position]]}/>
          </View>)
}

const containerStyle = {
  marginLeft: 10,
  marginRight: 10,
  marginBottom: 5,
};

const textStyle = {
  fontSize: 10,
  backgroundColor: TRANSPARENT,
    textAlign: 'right',
};

const styles = {
  left: StyleSheet.create({
    container: {
      ...containerStyle,
    },
    text: {
      color: COLOR_CustomTime["left_text"],
      ...textStyle,
    },
  }),
  right: StyleSheet.create({
    container: {
      ...containerStyle,
    },
    text: {
      color: COLOR_CustomTime["right_text"],
      ...textStyle,
    },
  }),
};

CustomTime.contextTypes = {
  getLocale: PropTypes.func,
};

CustomTime.defaultProps = {
  position: 'left',
  currentMessage: {
    createdAt: null,
  },
  containerStyle: {},
  textStyle: {},
  timeFormat: TIME_FORMAT,
};

CustomTime.propTypes = {
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  textStyle: PropTypes.shape({
    left: Text.propTypes.style,
    right: Text.propTypes.style,
  }),
  timeFormat: PropTypes.string,
};

export class CustomBubble extends React.Component {

  constructor(props) {
    super(props);

  }



  handleBubbleToNext() {
    if (
      isSameUser(this.props.currentMessage, this.props.nextMessage) &&
      isSameDay(this.props.currentMessage, this.props.nextMessage)
    ) {
      return StyleSheet.flatten([
        CustomBubble_styles[this.props.position].containerToNext,
        this.props.containerToNextStyle[this.props.position],
      ]);
    }
    return null;
  }

  handleBubbleToPrevious() {
    if (
      isSameUser(this.props.currentMessage, this.props.previousMessage) &&
      isSameDay(this.props.currentMessage, this.props.previousMessage)
    ) {
      return StyleSheet.flatten([
        CustomBubble_styles[this.props.position].containerToPrevious,
        this.props.containerToPreviousStyle[this.props.position],
      ]);
    }
    return null;
  }

  renderMessageText() {
    if (this.props.currentMessage.text) {
      const { containerStyle, wrapperStyle, ...messageTextProps } = this.props;
      if (this.props.renderMessageText) {
        return this.props.renderMessageText(messageTextProps);
      }
      return <MessageText {...messageTextProps} />;
    }
    return null;
  }

  renderMessageImage() {
    if (this.props.currentMessage.image) {
      const { containerStyle, wrapperStyle, ...messageImageProps } = this.props;
      if (this.props.renderMessageImage) {
        return this.props.renderMessageImage(messageImageProps);
      }
      return <MessageImage {...messageImageProps} />;
    }
    return null;
  }

  renderTicks() {
    const { currentMessage } = this.props;
    // console.log(this.props.currentMessage)
    if (this.props.renderTicks) {
      return this.props.renderTicks(currentMessage);
    }
    if (currentMessage.user._id !== this.props.user._id) {
      return null;
    }
    if (currentMessage.status == "sending" || currentMessage.status == "failed") {
      return (
        <View style={CustomBubble_styles.tickView}>
          {(currentMessage.status == "sending" || currentMessage.status == "pending") && <ActivityIndicator size={'small'} color={COLOR_CustomBubble["ActivityIndicator"]}/>}
          {currentMessage.status == "failed" && <TouchableOpacity style={{justifyContent:"center",alignItems:"center"}}
                                                                  onPress={() => this.props.resend(this.props.currentMessage)}
                                                                  >
                                                  <Ionicons name={'ios-alert'} 
                                                            size={22} 
                                                            color={COLOR_CustomBubble["send_failed"]}/>
                                                </TouchableOpacity>}
        </View>
      );
    }
    return null;
  }

  renderTime() {
    if (this.props.currentMessage.createdAt) {
      const { containerStyle, wrapperStyle, ...timeProps } = this.props;
      if (this.props.renderTime) {
        return this.props.renderTime(timeProps);
      }
      return <CustomTime {...timeProps} />;
    }
    return null;
  }

  renderCustomView() {
    if (this.props.renderCustomView) {
      return this.props.renderCustomView(this.props);
    }
    return null;
  }

  render() {
    if(this.props.currentMessage.user._id == global.IMClientName){
      
    }
    return (
      <View
        style={[
          CustomBubble_styles[this.props.position].container,
          this.props.containerStyle[this.props.position],
        ]}
      >
        {this.renderTicks()}
        <View
          style={[
            CustomBubble_styles[this.props.position].wrapper,
            this.props.wrapperStyle[this.props.position],
            this.handleBubbleToNext(),
            this.handleBubbleToPrevious(),
          ]}
        >

          <TouchableWithoutFeedback
            accessibilityTraits="text"
            {...this.props.touchableProps}
          >
            <View>
              {this.renderCustomView()}
              {this.renderMessageImage()}
              {this.renderMessageText()}
              <View style={[CustomBubble_styles.bottom, this.props.bottomContainerStyle[this.props.position]]}>
                {this.renderTime()}
                
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </View>
    );
  }
}

const CustomBubble_styles = {
  left: StyleSheet.create({
    container: {
      flex: 1,
      alignItems: 'flex-start',
      marginTop:10,
    },
    wrapper: {
      borderRadius: 10,
      backgroundColor: BACKGROUND_COLOR,
      marginRight: 60,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
  }),
  right: StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'flex-end',
      flexDirection:"row",
      alignItems:"center",
      marginTop:10,
      marginLeft: 60,
    },
    wrapper: {
      borderRadius: 10,
      backgroundColor: THEME_COLOR,
      minHeight: 20,
      justifyContent: 'flex-end',
    },
  }),
  bottom: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  tick: {
    fontSize: 10,
    backgroundColor: TRANSPARENT,
    color: COLOR_CustomBubble["tick"],
  },
  tickView: {
    flexDirection: 'row',
    marginRight: 10,
  },
};

CustomBubble.contextTypes = {
  actionSheet: PropTypes.func,
};

CustomBubble.defaultProps = {
  touchableProps: {},
  onLongPress: null,
  renderMessageImage: null,
  renderMessageText: null,
  renderCustomView: null,
  renderTicks: null,
  renderTime: null,
  position: 'left',
  currentMessage: {
    text: null,
    createdAt: null,
    image: null,
  },
  nextMessage: {},
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  bottomContainerStyle: {},
  tickStyle: {},
  containerToNextStyle: {},
  containerToPreviousStyle: {},
  // TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
};

CustomBubble.propTypes = {
  user: PropTypes.object.isRequired,
  touchableProps: PropTypes.object,
  onLongPress: PropTypes.func,
  renderMessageImage: PropTypes.func,
  renderMessageText: PropTypes.func,
  renderCustomView: PropTypes.func,
  renderTime: PropTypes.func,
  renderTicks: PropTypes.func,
  position: PropTypes.oneOf(['left', 'right']),
  currentMessage: PropTypes.object,
  nextMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  wrapperStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  bottomContainerStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  tickStyle: Text.propTypes.style,
  containerToNextStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  containerToPreviousStyle: PropTypes.shape({
    left: ViewPropTypes.style,
    right: ViewPropTypes.style,
  }),
  // TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
};

export class CustomLoadEarlier extends React.Component {

  renderLoading() {
    if (this.props.isLoadingEarlier === false) {
      return (
        <Text style={[CustomLoadEarlier_styles.text, this.props.textStyle]}>
          {this.props.label}
        </Text>
      );
    }
    return (
      <View>
        <Text style={[CustomLoadEarlier_styles.text, this.props.textStyle, { opacity: 0 }]}>
          {this.props.label}
        </Text>
        <ActivityIndicator
          color={COLOR_CustomLoadEarlier["ActivityIndicator"]}
          size="small"
          style={[CustomLoadEarlier_styles.activityIndicator, this.props.activityIndicatorStyle]}
        />
      </View>
    );
  }
  render() {
    return (
      <TouchableOpacity
        style={[CustomLoadEarlier_styles.container, this.props.containerStyle]}
        onPress={() => {
          if (this.props.onLoadEarlier) {
            this.props.onLoadEarlier();
          }
        }}
        disabled={this.props.isLoadingEarlier === true}
        accessibilityTraits="button"
      >
        <View style={[CustomLoadEarlier_styles.wrapper, this.props.wrapperStyle]}>
          {this.renderLoading()}
        </View>
      </TouchableOpacity>
    );
  }
}

const CustomLoadEarlier_styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLOR_CustomLoadEarlier["wrapper"],
    borderRadius: 15,
    height: 30,
    paddingLeft: 10,
    paddingRight: 10,
  },
  text: {
    backgroundColor: TRANSPARENT,
    color: COLOR_CustomLoadEarlier["text"],
    fontSize: 12,
  },
  activityIndicator: {
    marginTop: Platform.select({
      ios: -14,
      android: -16,
    }),
  },
});

CustomLoadEarlier.defaultProps = {
  onLoadEarlier: () => { },
  isLoadingEarlier: false,
  label: 'Load earlier messages',
  containerStyle: {},
  wrapperStyle: {},
  textStyle: {},
  activityIndicatorStyle: {},
};

CustomLoadEarlier.propTypes = {
  onLoadEarlier: PropTypes.func,
  isLoadingEarlier: PropTypes.bool,
  label: PropTypes.string,
  containerStyle: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  activityIndicatorStyle: ViewPropTypes.style,
};


export function CustomDay(
  { dateFormat, currentMessage, previousMessage, containerStyle, wrapperStyle, textStyle },
  context,
) {
  if (!isInTenMin(currentMessage, previousMessage)) {
    return (
      <View style={[CustomDay_styles.container, containerStyle]}>
        <View style={wrapperStyle}>
          <Text style={[CustomDay_styles.text, textStyle]}>
            {isInAWeek(currentMessage)?moment(currentMessage.createdAt)
              .locale(context.getLocale())
              .calendar():moment(currentMessage.createdAt)
              .locale(context.getLocale())
              .format('MMM Do YY, h:mm:ss a')
              }
          </Text>
        </View>
      </View>
    );
  }
  return null;
}

const CustomDay_styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 5,
    marginBottom: 10,
  },
  text: {
    backgroundColor: TRANSPARENT,
    color: COLOR_CustomDay["text"],
    fontSize: 12,
    fontWeight: '600',
  },
});

CustomDay.contextTypes = {
  getLocale: PropTypes.func,
};

CustomDay.defaultProps = {
  currentMessage: {
    // TODO: test if crash when createdAt === null
    createdAt: null,
  },
  previousMessage: {},
  containerStyle: {},
  wrapperStyle: {},
  textStyle: {},
  // TODO: remove in next major release
  isSameDay: warnDeprecated(isSameDay),
  isSameUser: warnDeprecated(isSameUser),
  dateFormat: 'll',
};

CustomDay.propTypes = {
  currentMessage: PropTypes.object,
  previousMessage: PropTypes.object,
  containerStyle: ViewPropTypes.style,
  wrapperStyle: ViewPropTypes.style,
  textStyle: Text.propTypes.style,
  // TODO: remove in next major release
  isSameDay: PropTypes.func,
  isSameUser: PropTypes.func,
  dateFormat: PropTypes.string,
};