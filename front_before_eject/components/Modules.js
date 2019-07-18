/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React,{ Component } from 'react';
import { Text,
         Alert, 
         View,
         StyleSheet,
         Platform,
         StatusBar,
         TextInput,
         TouchableOpacity,
         TouchableHighlight,
         TouchableWithoutFeedback,
         Dimensions,
         Image,
         Easing,
         ViewPropTypes,
         Clipboard,
         Keyboard,
         ScrollView,
         Animated,
         Share,
         FlatList } from 'react-native';
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT,
         TOOLBAR_HEIGHT,
         HEADER_BAR_COLOR,
         CHAT_THUMBNAIL_HEIGHT,
         BREF_LENGTH,
         screen_height,
         screen_width,
         MASKOFF_LOGO,
         MASKOFF_LOGO_welcome_page_width,
         MASKOFF_LOGO_welcome_page_height,
         getPermission,
         getDate,
         MAP_STYLE,
         randomColor } from '../utility/Util.js';
import { submitVote } from '../utility/HttpRequests.js'
import { SwipeRow,
         Icon,
         Spinner } from 'native-base'
import { ScaledImage_spinner,
         ScaledImage_comment_spinner } from '../components/Svg_Spinners.js'
import { Constants,
         Video,
         ScreenOrientation,
         ImagePicker,
         Permissions,
         FileSystem,
         MediaLibrary } from 'expo';
import VideoPlayer from '@expo/videoplayer';
import CheckBox from 'react-native-check-box'
import { store } from '../store/store.js';
import { Foundation, MaterialIcons } from '@expo/vector-icons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Feather from 'react-native-vector-icons/Feather';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import PropTypes from 'prop-types';
import { Switch } from 'react-native-switch';
import CountryPicker from 'react-native-country-picker-modal';
import closeWhite from "../assets/images/closeWhite.png";
import { searchKeyword,
         removeInfoFromPost,
         addInfoToPost,
         recordVote,
         loadVote,
         removeVoteBar,
         removeConversation } from '../store/actions.js';
import { ChatActionSheet } from "./Chat_Modules"
import FitImage from 'react-native-fit-image';
import variable from "../node_modules/native-base/src/theme/variables/platform.js";
import SideMenu from 'react-native-side-menu';
import { Lan } from '../utility/Languages.js';
import Ripple from 'react-native-material-ripple';
import MapView from 'react-native-maps';
import ImageZoom from 'react-native-image-pan-zoom';
import { notifications } from '../components/Dropdown_Alert_helpers.js'
import { Marker } from 'react-native-maps';
import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers
import { 
  THEME_COLOR,
  BACKGROUND_COLOR,
  FILLING_COLOR,
  VIDEO_BACKGROUND_COLOR,
  COLOR_HEADER_ICON,
  COLOR_HEADER_INPUT,
  COLOR_HEADER_TEXT,
  COLOR_HEADER_RIPPLE,
  LINK_COLOR,
  TRANSPARENT,
  COLOR_ICON_SET,
  COLOR_Users,
  COLOR_SearchBarHeaderDecoy,
  COLOR_DisplayCard_masker,
  COLOR_DisplayCard_masker_Around,
  COLOR_DisplayCard_roast,
  COLOR_DisplayCard_roast_full,
  COLOR_DisplayCard_masker_full,
  COLOR_SearchRecommendMessageBar,
  COLOR_SearchRecommendContainer,
  COLOR_SearchReminderContainer,
  COLOR_ReminderWindow,
  COLOR_ContentDisplayPanel,
  COLOR_VoteDisplayPanel,
  COLOR_NameAliasTagDisplayPanel,
  COLOR_ChatThumbnailWindow,
  COLOR_Accordion_Header,
  COLOR_Accordion_Content,
  COLOR_Search_n_Recommend,
  COLOR_Comments_container,
  COLOR_Comments_block,
  COLOR_Comment,
  COLOR_RedDot } from '../utility/colors.js'
//=========================Status Bar 状态栏=================================
// Example
// export default class MASKOFFStatusBar extends Component{
//   render() {
//     return (
//       <MyStatusBar backgroundColor="some_color" barStyle="light-content" />
//     );
//   }
// }



export const MASKOFFStatusBar = ({backgroundColor, ...props}) => (
  <View style={[StatusBar_style.statusBar, { backgroundColor }]}>
    <StatusBar translucent backgroundColor={backgroundColor} {...props} />
  </View>
);

const StatusBar_style = StyleSheet.create({
  statusBar: {
    height: STATUSBAR_HEIGHT,
  }
});

//========================Search Bar Header header_搜索===============================
export const SearchBarHeader = (props) => {
  return (
    <View style={SearchBarHeader_style.header_view}>
      <View style={SearchBarHeader_style.search_bar_wrapper}>
        <View style={SearchBarHeader_style.left_icon_wrapper}>
          <Ionicons name="ios-search"
                size={HEADER_HEIGHT * 0.4}
                color={COLOR_HEADER_ICON}/>
        </View>
        <TextInput style={SearchBarHeader_style.input}
                   selectionColor="black"
                   placeholder={props.placeholder}
                   placeholderTextColor="#bbbbbb"
                   autoFocus={props.autoFocus}
                   keyboardType={"web-search"}
                   onSubmitEditing={props.onSubmitEditing}
                   onChangeText={async (text) => {await store.dispatch(searchKeyword({keyword:text}))}}
                   onFocus={props.onFocus}
                   keyboardAppearance="light"
                   underlineColorAndroid="transparent"
        />
      </View>
      <TouchableOpacity style={SearchBarHeader_style.button}
                        onPress={props.cancel}>
        <Text style={SearchBarHeader_style.button_text}>
          {Lan["Cancel"]}
        </Text>
      </TouchableOpacity>
    </View>
  );
}


SearchBarHeader.propTypes = {
  autoFocus: PropTypes.bool,
  onSubmitEditing: PropTypes.func,
  onFocus: PropTypes.func,
  cancel: PropTypes.func,
};

SearchBarHeader.defaultProps = {
  autoFocus: true,
  onSubmitEditing:() => void(0),
  onFocus:() => void(0),
  cancel:() => void(0),
};

const SearchBarHeader_style = StyleSheet.create({
  header_view:{
    height:HEADER_HEIGHT,
    width:width,
    backgroundColor:HEADER_BAR_COLOR,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
  },
  search_bar_wrapper:{
    height:HEADER_HEIGHT * 0.6,
    width:width * 0.7,
    backgroundColor:HEADER_BAR_COLOR,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginLeft:width * 0.1 / 3,
    marginRight:width * 0.1 / 3,
  },
  input:{
    height:HEADER_HEIGHT * 0.6,
    width:width * 0.6,
    backgroundColor:TRANSPARENT,
    borderWidth:0,
    fontSize:HEADER_HEIGHT * 0.33,
    color:HEADER_BAR_COLOR,
  },
  left_icon_wrapper:{
    height:HEADER_HEIGHT * 0.6,
    width:width * 0.1,
    backgroundColor:TRANSPARENT,
    borderTopLeftRadius:5,
    borderBottomLeftRadius:5,
    borderWidth:0,
    justifyContent:"center",
    alignItems:"center",
  },
  button:{
    backgroundColor:TRANSPARENT,
    height:HEADER_HEIGHT * 0.6,
    width:width * 0.2,
    marginRight:width * 0.1 / 3,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  button_text:{
    fontSize:HEADER_HEIGHT * 0.33,
    color:COLOR_HEADER_TEXT,
  }
})

//========================Search Bar Header Decoy header_搜索===============================
//UI--checked
export const SearchBarHeaderDecoy = (props) => {
  right_icon = props.right_icon
  right_icon_text = props.right_icon_text
  placeholder=props.placeholder
  navigate_search=props.navigate_search;
  return (
    <View>
      <View style={SearchBarHeaderDecoy_style.header_view}>
        <Ripple style={[SearchBarHeaderDecoy_style.section_wrapper,{borderRightWidth:1}]}
                onPress={navigate_search}
                rippleColor={COLOR_HEADER_RIPPLE}
                rippleOpacity={0.5} >
            <Ionicons name="ios-search"
                      size={20}
                      color={COLOR_HEADER_ICON}/>
            <Text style={[SearchBarHeaderDecoy_style.button_text,props.left_button_text_style]}>
              {props.placeholder}
            </Text>
        </Ripple>
        <Ripple style={[SearchBarHeaderDecoy_style.section_wrapper]}
                onPress={props.right_button_press}
                rippleColor={COLOR_HEADER_RIPPLE}
                rippleOpacity={0.5} >
          <Ionicons name={right_icon}
                    size={20}
                    color={COLOR_HEADER_ICON}/>
          <Text style={[SearchBarHeaderDecoy_style.button_text,props.right_button_text_style]}>
            {right_icon_text}
          </Text>
        </Ripple>
      </View>
    </View>
  );
}
SearchBarHeader.propTypes = {
  post: PropTypes.func,
};

SearchBarHeader.defaultProps = {
  post:() => void(0),
};

const SearchBarHeaderDecoy_style = StyleSheet.create({
  header_view:{
    height:HEADER_HEIGHT,
    width:width,
    backgroundColor:HEADER_BAR_COLOR,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",  
  },
  section_wrapper:{
    width:width *  0.5,
    backgroundColor:HEADER_BAR_COLOR,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    borderColor:COLOR_SearchBarHeaderDecoy["button_divider"]
  },
  button_text:{
    marginLeft:5,
    fontSize:18,
    color:COLOR_HEADER_TEXT,
  }
})

//============================Button Header 按钮header=================================
//example
{/*<ButtonHeader layout="left-center-right"
              center_content={<ProgressMeter progress={progress}
              right_button_disabled={this.state.next_disabled} />}
              left_button_onPress={() => this.cancel()}
              right_button_onPress={() => this.next()}/> */}
export const ProgressMeter =  (props) => {
  fontColor = COLOR_HEADER_TEXT
  if(props.maskname){
    return(
    <Text style={[ButtonHeader_style.maskname_text,{color:fontColor,}]}
          adjustsFontSizeToFit
          numberOfLines={1}>
      {props.maskname}
    </Text>
  )

  }
  return(
    <Text style={ButtonHeader_style.progress_meter_text}>
      {props.progress} / {props.total}
    </Text>
  )
}
export const ButtonHeader = (props) => {
  fontColor = COLOR_HEADER_TEXT
  if (props.fontColor){
    fontColor = props.fontColor
  }
  right_button_color = undefined
  if (props.right_button_color){
    right_button_color = props.right_button_color
  }


  center_content = props.center_content 
  if (props.layout == "left-center-right"){
    
    return(
      <View style={ButtonHeader_style.container}>
        <Ripple style={ButtonHeader_style.left_wrapper}
                onPress={props.left_button_onPress}
                rippleColor={COLOR_HEADER_RIPPLE}
                rippleOpacity={0.5}>
          <Ionicons name="ios-arrow-back"
                    size={HEADER_HEIGHT / 2}
                    color={fontColor}/>
          <Text style={[ButtonHeader_style.button_text,{marginLeft:(width / 4) * 0.05,color:fontColor}]}>
            {props.left_button_text}
          </Text>
        </Ripple>
        <View style={ButtonHeader_style.center_wrapper}>
          {props.center_content}
        </View>
        <Ripple style={ButtonHeader_style.right_wrapper}
                onPress={props.right_button_onPress}
                disabled={props.right_button_disabled}
                rippleColor="#FFFFFF"
                rippleOpacity={0.5}>
          <Text style={[ButtonHeader_style.button_text,{marginRight:(width / 4) * 0.05,color:right_button_color !== undefined?right_button_color:fontColor}]}>
            {props.right_button_text}
          </Text>
          <Ionicons name="ios-arrow-forward"
                    size={HEADER_HEIGHT / 2}
                    color={right_button_color !== undefined?right_button_color:fontColor}/>
        </Ripple>
      </View>
    )
  }else if(props.layout == "left-center"){
    return(
      <View style={ButtonHeader_style.container}>
        <TouchableOpacity style={ButtonHeader_style.left_wrapper}
                          onPress={props.left_button_onPress}>
          <Ionicons name="ios-arrow-back"
                    size={HEADER_HEIGHT / 2}
                    color={fontColor}/>
          <Text style={[ButtonHeader_style.button_text,{marginLeft:(width / 4) * 0.05,color:fontColor}]}>
            {props.left_button_text}
          </Text>
        </TouchableOpacity>
        <View style={ButtonHeader_style.center_wrapper}>
          {props.center_content}
        </View>
        <TouchableOpacity style={ButtonHeader_style.right_wrapper}
                          disabled={true} />
      </View>
    )
  }else if(props.layout == "chat"){
    return(
      <View style={ButtonHeader_style.container}>
        <TouchableOpacity style={ButtonHeader_style.left_wrapper}
                          onPress={props.left_button_onPress}>
          <Ionicons name="ios-arrow-back"
                    size={HEADER_HEIGHT / 2}
                    color={fontColor}/>
          <Text style={[ButtonHeader_style.button_text,{marginLeft:(width / 4) * 0.05,color:fontColor}]}>
            {props.left_button_text}
          </Text>
        </TouchableOpacity>
        <View style={ButtonHeader_style.center_wrapper}>
          {props.center_content}
        </View>
        <View style={[ButtonHeader_style.right_wrapper,{justifyContent:"center",marginRight:0}]}>
          {props.right_button}
        </View>
      </View>
    )

  }else if(props.layout == "searchMasker"){
    return(
      <View style={ButtonHeader_style.container}>
        <TouchableOpacity style={ButtonHeader_style.left_wrapper}
                          onPress={props.left_button_onPress}>
          <Ionicons name="ios-arrow-back"
                    size={HEADER_HEIGHT / 2}
                    color={fontColor}/>
          <Text style={[ButtonHeader_style.button_text,{marginLeft:(width / 4) * 0.05,color:fontColor}]}>
            {props.left_button_text}
          </Text>
        </TouchableOpacity>
        <View style={ButtonHeader_style.center_wrapper}>
          {props.center_content}
        </View>
        <View style={[ButtonHeader_style.right_wrapper,{justifyContent:"center",marginRight:0}]}>
            {props.right_button}
        </View>
      </View>
    )

  }
}

const ButtonHeader_style = StyleSheet.create({
  container:{
    height:HEADER_HEIGHT,
    width:width,
    backgroundColor:HEADER_BAR_COLOR,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  left_wrapper:{
    height:HEADER_HEIGHT,
    width:width / 4 - width * 0.025,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginLeft:width * 0.025,
  },
  button_text:{
    fontSize:HEADER_HEIGHT / 3,

  },
  center_wrapper:{
    height:HEADER_HEIGHT,
    width:width / 2,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  right_wrapper:{
    height:HEADER_HEIGHT,
    width:width / 4 - width * 0.025,
    flexDirection:"row",
    justifyContent:"flex-end",
    alignItems:"center",
    marginRight:width * 0.025,
  },
  progress_meter_text:{
    fontSize: HEADER_HEIGHT / 2,
    color:COLOR_HEADER_TEXT
  },
  maskname_text:{
    width:width / 2,
    fontSize: HEADER_HEIGHT / 3,
    color:COLOR_HEADER_TEXT,
    textAlign:"center",
    textAlignVertical:"center",
  },
})

//============================Display Card master显示卡(母版)===============================
export const DisplayCard_master = (props) => {
  return(
    <View style={DisplayCard_style.card_wrapper}>
      <View style={DisplayCard_style.author_bar}>
      </View>
      <View style={DisplayCard_style.title_bar}>
      </View>
      <View style={DisplayCard_style.content_bar}>
      </View>
      <View style={DisplayCard_style.status_bar}>
      </View>
    </View>
  )
}
const DisplayCard_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    height:height / 3,
    width:width,
    marginTop:5,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center"
  },
  author_bar:{
    backgroundColor:BACKGROUND_COLOR,
    height:(height / 3) * (3 / 20),
    width:width, 

  },
  title_bar:{
    backgroundColor:BACKGROUND_COLOR,
    height:(height / 3) * (4 / 20),
    width:width,
  },
  content_bar:{
    backgroundColor:BACKGROUND_COLOR,
    height:(height / 3) * (10 / 20),
    width:width,
  },
  status_bar:{
    backgroundColor:BACKGROUND_COLOR,
    height:(height / 3) * (3 / 20),
    width:width,
  }
})

//============================Display Card masker显示卡(masker模块)===============================
export class DisplayCard_masker extends React.PureComponent{
  // example
  // <DisplayCard_masker 
  //         info={decoy_masker_1}
  //         />    
  constructor(props){
    super(props)
    this.name = this.props.info.name
    this.alias = this.props.info.alias
    this.tags = this.props.info.tags
    this.contribution = this.props.info.contribution
    this.liked = this.props.info.liked
    this.comments_count = this.props.info.comments_count
    this.contributed = this.props.info.contributed
  }
  render(){
    if(this.tags.length < 4){
      icon_section = <View style={{alignSelf:"flex-end",
                                  marginBottom:4}}> 
      <Ionicons size={15} color={COLOR_ICON_SET["ios-flame-DisplayCard_masker"]} name="ios-flame"/>
      </View> 
    }else{
      icon_section = <View style={{alignSelf:"flex-end",
                                  marginBottom:4}}> 
      <Ionicons size={15} color={COLOR_ICON_SET["ios-cloud-DisplayCard_masker"]} name="ios-cloud"/>
      </View> 
    }
    return(
      <TouchableOpacity style={DisplayCard_masker_style.card_wrapper}
                        onPress={()=>this.props.onPress()}
                        activeOpacity={0.9}>
        <View style={DisplayCard_masker_style.title_bar}>
          <Text style={DisplayCard_masker_style.title}
                adjustsFontSizeToFit={true}
                numberOfLines={2}
                minimumFontScale={0.01}>
            {this.name}
          </Text>
          {icon_section}
          
        </View>

        <View style={DisplayCard_masker_style.alias_bar}>
          <Text style={DisplayCard_masker_style.alias}>
            {this.alias == null?"":this.alias.join(" ")}
          </Text>
        </View>
        <View style={DisplayCard_masker_style.tags_bar}>
          <Text style={DisplayCard_masker_style.tags}>
            {this.tags.join("# #")}
          </Text>
        </View>
        <View style={DisplayCard_masker_style.status_bar}>
          <Text style={DisplayCard_masker_style.status}>
            <Text style={DisplayCard_masker_style.number}> 
              {this.contributed}
            </Text>
             {"人"+Lan["Contributed_count"]}, 
            <Text style={DisplayCard_masker_style.number}> 
             {this.liked}
            </Text> {"人"+Lan["Likes"]},
            <Text style={DisplayCard_masker_style.number}> 
            {this.comments_count}
            </Text>
            {"人"+Lan["Comments"]}
          </Text>

        </View>
        <View style={DisplayCard_masker_style.date_bar}>
          <Text style={DisplayCard_masker_style.date}>
            {getDate(this.props.info.post_date)}
          </Text>
        </View>
        
      </TouchableOpacity>
    )
  }
}
const DisplayCard_masker_HEIGHT = 150
const DisplayCard_masker_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    
    borderRadius:3,

    //test
    borderBottomWidth:2,
    

    borderColor:COLOR_DisplayCard_masker["card_wrapper_border"]
  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    height:DisplayCard_masker_HEIGHT * (25 / 100),
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:DisplayCard_masker_HEIGHT * (25 / 100) * (2 / 3) ,
    textAlignVertical: "center",
    color:COLOR_DisplayCard_masker["title"],
    marginRight:5,
    //test
    // borderWidth:1,
    // borderColor:"red"
  },
  tags_bar:{
    flexDirection:"column",
    alignItems:"flex-start",
    justifyContent:"flex-end",
    backgroundColor:FILLING_COLOR,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    // //test
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  tags:{
    fontSize:13,
    color:COLOR_DisplayCard_masker["tags"],
    marginTop:DisplayCard_masker_HEIGHT * (25 / 100) / 4,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 4,
    marginLeft:5,
    //test
    // borderWidth:1
  },
  alias_bar:{
    flexDirection:"column",
    alignItems:"flex-start",
    justifyContent:"center",
    backgroundColor:FILLING_COLOR,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    borderTopLeftRadius:3,
    borderTopRightRadius:3,

    //test
    // borderTopWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  alias:{
    fontSize:11,
    marginTop:DisplayCard_masker_HEIGHT * (25 / 100) / 8,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 4,
    color:COLOR_DisplayCard_masker["alias"],
    marginLeft:5,

    //test
    // borderWidth:1
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:FILLING_COLOR,
    marginBottom:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    borderBottomLeftRadius:3,
    borderBottomRightRadius:3,

    //test
    // borderBottomWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  status:{
    fontSize:DisplayCard_masker_HEIGHT * (25 / 100) / 5,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker["status"],
    marginLeft:5,

    //test
    
  },
  date_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-end",
    backgroundColor:TRANSPARENT,
    marginBottom:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginRight:15,
    width:width  - 20,
    borderBottomLeftRadius:3,
    borderBottomRightRadius:3,

    //test
    // borderBottomWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  date:{
    fontSize:DisplayCard_masker_HEIGHT * (25 / 100) / 5,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker["date"],
    

    //test
    
  },
  number:{
    fontSize:DisplayCard_masker_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_masker["number"],
  }
})


export class DisplayCard_masker_Around extends React.PureComponent{
  // example
  // <DisplayCard_masker 
  //         info={decoy_masker_1}
  //         />    
  constructor(props){
    super(props)
    console.log(this.props.info)
    this.name = this.props.info.name
    this.alias = this.props.info.alias
    this.tags = this.props.info.tags
    this.contribution = this.props.info.contribution
    this.liked = this.props.info.liked
    this.comments_count = this.props.info.comments_count
    this.contributed = this.props.info.contributed
  }
  render(){
    // console.log("this.props.info",this.props.info)
    if(this.tags.length < 4){
      icon_section = <View style={{alignSelf:"flex-end",
                                  marginBottom:4}}> 
      <Ionicons size={15} color={COLOR_ICON_SET["ios-flame-DisplayCard_masker_Around"]} name="ios-flame"/>
      </View> 
    }else{
      icon_section = <View style={{alignSelf:"flex-end",
                                  marginBottom:4}}> 
      <Ionicons size={15} color={COLOR_ICON_SET["ios-cloud-DisplayCard_masker_Around"]} name="ios-cloud"/>
      </View> 
    }
    return(
      <TouchableOpacity style={DisplayCard_masker_Around_style.card_wrapper}
                        onPress={()=>this.props.onPress()}
                        activeOpacity={0.9}>
        <View style={DisplayCard_masker_Around_style.title_bar}>
          <Text style={DisplayCard_masker_Around_style.title}
                adjustsFontSizeToFit={true}
                numberOfLines={2}
                minimumFontScale={0.01}>
            {this.name}
          </Text>
          {icon_section}
          
        </View>

        <View style={DisplayCard_masker_Around_style.alias_bar}>
          <Text style={DisplayCard_masker_Around_style.alias}>
            {this.alias.join(" ")}
          </Text>
        </View>
        <View style={DisplayCard_masker_Around_style.tags_bar}>
          <Text style={DisplayCard_masker_Around_style.tags}>
            {this.tags.join("# #")}
          </Text>
        </View>
        <View style={DisplayCard_masker_Around_style.status_bar}>
          <Text style={DisplayCard_masker_Around_style.status}>
            <Text style={DisplayCard_masker_Around_style.number}> 
              {this.contributed}
            </Text>
             {"人"+Lan["Contributed_count"]}, 
            <Text style={DisplayCard_masker_Around_style.number}> 
             {this.liked}
            </Text> {"人"+Lan["Likes"]},
            <Text style={DisplayCard_masker_Around_style.number}> 
            {this.comments_count}
            </Text>
            {"人"+Lan["Comments"]}
          </Text>

        </View>
        <View style={DisplayCard_masker_Around_style.date_bar}>
          <Text style={DisplayCard_masker_Around_style.date}>
            {getDate(this.props.info.post_date)}
          </Text>
        </View>
        
      </TouchableOpacity>
    )
  }
}
const DisplayCard_masker_Around_HEIGHT = 150
const DisplayCard_masker_Around_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    
    borderRadius:3,

    //test
    borderBottomWidth:2,
    borderColor:"#eeeeee"
  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    height:DisplayCard_masker_Around_HEIGHT * (25 / 100),
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:DisplayCard_masker_Around_HEIGHT * (25 / 100) * (2 / 3) ,
    
    textAlignVertical: "center",
    color:COLOR_DisplayCard_masker_Around["title"],
    marginRight:5,
    //test
    // borderWidth:1,
    // borderColor:"red"
  },
  tags_bar:{
    flexDirection:"column",
    alignItems:"flex-start",
    justifyContent:"flex-end",
    backgroundColor:BACKGROUND_COLOR,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    
    // //test
    borderBottomWidth:1,
    borderColor:COLOR_DisplayCard_masker_Around["tags_bar_border"]
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  tags:{
    fontSize:13,
    color:COLOR_DisplayCard_masker_Around["tags"],
    marginTop:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 4,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 4,
    marginLeft:5,
    //test
    // borderWidth:1
  },
  alias_bar:{
    flexDirection:"column",
    alignItems:"flex-start",
    justifyContent:"center",
    backgroundColor:BACKGROUND_COLOR,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    borderTopLeftRadius:3,
    borderTopRightRadius:3,

    //test
    // borderTopWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  alias:{
    fontSize:11,
    marginTop:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 8,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 4,
    color:COLOR_DisplayCard_masker_Around["alias"],
    marginLeft:5,

    //test
    // borderWidth:1
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:BACKGROUND_COLOR,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,
    borderBottomLeftRadius:3,
    borderBottomRightRadius:3,

    //test
    // borderBottomWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  status:{
    fontSize:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 5,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker_Around["status"],
    marginLeft:5,

    //test
    
  },
  date_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-end",
    backgroundColor:TRANSPARENT,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (2.5 / 100),
    marginRight:15,
    width:width  - 20,
    borderBottomLeftRadius:3,
    borderBottomRightRadius:3,

    //test
    // borderBottomWidth:1,
    // borderLeftWidth:1,
    // borderRightWidth:1,
    // borderColor:"#dddddd"
  },
  date:{
    fontSize:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 5,
    marginBottom:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker_Around["date"],
    

    //test
    
  },
  number:{
    fontSize:DisplayCard_masker_Around_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_masker_Around["number"],
  }
})

//============================Display Card masker显示卡(roast)===============================
export class DisplayCard_roast extends React.PureComponent {
  constructor(props){
    super(props)
    this.title = this.props.roast.title
    this.tags = this.props.roast.tags
    this.onPress = this.props.onPress
    this.content = this.props.roast.content
    this.get_bref=this.get_bref.bind(this)
  }

  get_bref(){
    if(this.content[0]["type"] == "text/plain"){
      if(this.content[0]["filename"].length <= BREF_LENGTH){
        for(var i=0;i<this.content.length;i++){
          if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
            return (<View>
                      <View>
                        <Image source={{uri:global.bucket.concat(this.content[i]["filename"][0])}} 
                               style={DisplayCard_roast_style.display_image}
                               blurRadius={2} />
                        <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        </View>
                      </View>
                      <View style={{ padding: 5, flexDirection: 'column', justifyContent: 'center' }}>
                        <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'flex-start',alignSelf:"center" }}>
                          <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                        </View>
                      </View>
                    </View>)
          }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
            return (<View>
                      <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
                             muted={true}
                             shouldPlay={false}
                             resizeMode={Video.RESIZE_MODE_CONTAIN}
                             style={{width:width - 20,
                                     height:(width - 20) * 9 / 16,
                                     borderRadius:5,
                                     backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
                      <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name={"md-play"} size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
                      <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                      
                    </View>)
          }else if(this.content[i]["type"].includes("location")){
            decoy_options = [
              <Image source={require("../assets/images/MapView_decoy1.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy2.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy3.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy4.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy5.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>
            ]
            return(
              decoy_options[Math.floor(Math.random() * decoy_options.length)]
            )
          }else if(this.content[i]["type"].includes("vote")){
            return(
              <ArticleVoteDisplayPanel 
                votes={this.content[i]}
                full={false}/>
            )
          }
        }
        return <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
      }else{
        for(var i=0;i<this.content.length;i++){
          if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
            return (<View>
                      <View>
                        <Image source={{uri:global.bucket.concat(this.content[i]["filename"][0])}} 
                               style={DisplayCard_roast_style.display_image}
                               blurRadius={2} />
                        <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                          
                          
                        </View>
                      </View>
                      <View style={{ padding: 5, flexDirection: 'column', justifyContent: 'center'}}>
                        <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'flex-start',alignSelf:"center" }}>
                          <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                        </View>
                      </View>
                     </View>)
          }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
            return (<View>
                      <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
                             muted={true}
                             resizeMode={Video.RESIZE_MODE_CONTAIN} 
                             shouldPlay={false}
                             style={{width:width - 20,
                                     height:(width - 20) * 9 / 16,
                                     borderRadius:5,
                                     backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
                      <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name="md-play" size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
                      <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                    </View>)
          }else if(this.content[i]["type"].includes("location")){
            decoy_options = [
              <Image source={require("../assets/images/MapView_decoy1.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy2.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy3.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy4.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
              <Image source={require("../assets/images/MapView_decoy5.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>
            ]
            return(
              decoy_options[Math.floor(Math.random() * decoy_options.length)]
            )
          }else if(this.content[i]["type"].includes("vote")){
            return(
              <ArticleVoteDisplayPanel 
                votes={this.content[i]}
                full={false}/>
            )
          }
        }
        return (<View>
                  <Text style={DisplayCard_roast_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                  <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                  </View>
                </View>
          )
      }
    }else if(this.content[0]["type"].includes("image") || this.content[0]["type"].includes("Image")){
      return (<View>
              <View>
                <Image source={{uri:global.bucket.concat(this.content[0]["filename"][0])}} 
                       style={DisplayCard_roast_style.display_image}
                       blurRadius={2} />
                <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                  
                </View>
              </View>
              <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
              </View>
             </View>)
    }else if(this.content[0]["type"].includes("video") || this.content[0]["type"].includes("Video")){
      return <View>
              <Video source={{uri:global.bucket.concat(this.content[0]["filename"])}}
                      muted={true}
                      resizeMode={Video.RESIZE_MODE_CONTAIN}
                      shouldPlay={false}
                      style={{width:width - 20,
                              height:(width - 20) * 9 / 16,
                              borderRadius:5,
                              backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
              <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name="md-play" size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
            </View>
    }else if(this.content[0]["type"].includes("location")){
      decoy_options = [
        <Image source={require("../assets/images/MapView_decoy1.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
        <Image source={require("../assets/images/MapView_decoy2.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
        <Image source={require("../assets/images/MapView_decoy3.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
        <Image source={require("../assets/images/MapView_decoy4.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>,
        <Image source={require("../assets/images/MapView_decoy5.png")} style={{height:width * 1/4,width:width - 20}} resizeMode="cover"/>
      ]
      return(
        decoy_options[Math.floor(Math.random() * decoy_options.length)]
      )
    }else if(this.content[0]["type"].includes("vote")){
      return(
        <ArticleVoteDisplayPanel 
          votes={this.content[0]}
          full={false}/>
      )
    }
  }
  render(){
    return(
      <TouchableOpacity style={DisplayCard_roast_style.card_wrapper}
                        onPress={this.onPress}
                        activeOpacity={0.9}>
        <View style={DisplayCard_roast_style.user_info_bar}>
          <Image source={{uri:global.bucket+this.props.roast.roast_thumbnail}} style={DisplayCard_roast_style.thumbnail}/>
          <View style={DisplayCard_roast_style.nickname_time_container}>
            <Text style={DisplayCard_roast_style.nickname}>
              {this.props.roast.author_nickname}
            </Text>
            <Text style={DisplayCard_roast_style.time}>
              {getDate(this.props.roast.timestamp)}
            </Text>
          </View>
          
          <View style={DisplayCard_roast_style.nickname_time_container}>

          </View>

        </View>
        <View style={DisplayCard_roast_style.title_bar}>
          <Text style={DisplayCard_roast_style.title}
                adjustsFontSizeToFit={true}
                numberOfLines={2}
                minimumFontScale={0.01}>
            {this.title}
          </Text>
        </View>
  
        <View style={DisplayCard_roast_style.content_bar}>
          {this.get_bref()}
        </View>
  
        <View style={DisplayCard_roast_style.status_bar}>
          <Text style={DisplayCard_roast_style.status}>
            <Text style={DisplayCard_roast_style.number}> 
              {this.props.roast.liked}
            </Text> {"人"+Lan["Likes"]},
            <Text style={DisplayCard_roast_style.number}> 
              {this.props.roast.comments_count}
            </Text>
            {"人"+Lan["Comments"]},
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}
const DisplayCard_roast_HEIGHT = 200
const DisplayCard_roast_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    marginBottom:5,
    borderRadius:3,

    //test
    // borderColor:"black",
    // borderWidth:1

  },
  user_info_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  thumbnail:{
    height:40,
    width:40,
    
  },
  nickname_time_container:{
    flexDirection:"column",
    justifyContent:"space-evenly",
    alignItems:"flex-start",
    //test
    // borderWidth:1
  },
  nickname:{
    marginLeft:5,
    fontSize:14,
    color:COLOR_DisplayCard_roast["nickname"],
    fontWeight:"600"
    //test
    // borderWidth:1
  },
  time:{
    marginLeft:5,
    fontSize:12,
    color:COLOR_DisplayCard_roast["time"],


    //test
    // borderWidth:1
  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,
    marginBottom:10
    //test
    // borderColor:"black",
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:15,
    width:width - 20,
    textAlignVertical: "center",
    color:COLOR_DisplayCard_roast["title"],

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  content_bar:{
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:FILLING_COLOR,
    borderRadius:3,
    marginBottom:DisplayCard_roast_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  content:{
    fontSize:12,
    margin:DisplayCard_roast_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast["content"],
    lineHeight:20,
    letterSpacing:1
    //test
    // borderColor:"black",
    // borderWidth:1
    
  },
  number:{
    fontSize:DisplayCard_roast_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_roast["number"],
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginBottom:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  status:{
    fontSize:12,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast["status"],

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  display_image:{
    height:200,
    width:width - 20,
    resizeMode:"cover"
  }
})

//============================Display Card masker显示卡(roast)===============================
export class DisplayCard_masker_see_more extends React.PureComponent {
  constructor(props){
    super(props)
    this.tags = this.props.article.tags
    this.alias = this.props.article.alias
    this.onPress = this.props.onPress
    this.content = this.props.article.content
    this.get_bref=this.get_bref.bind(this)
  }

  get_bref(){
    if(this.content[0]["type"] == "text/plain"){
      if(this.content[0]["filename"].length <= BREF_LENGTH){
        for(var i=0;i<this.content.length;i++){
          if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
            return (<View>
                      <View>
                        <Image source={{uri:global.bucket.concat(this.content[i]["filename"][0])}} 
                               style={DisplayCard_masker_see_more_style.display_image}
                               blurRadius={2} />
                        <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                        </View>
                      </View>
                      <View style={{ padding: 5, flexDirection: 'column', justifyContent: 'center' }}>
                        <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'flex-start',alignSelf:"center" }}>
                          <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                        </View>
                      </View>
                    </View>)
          }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
            return (<View>
                      <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
                             muted={true}
                             shouldPlay={false}
                             resizeMode={Video.RESIZE_MODE_CONTAIN}
                             style={{width:width - 20,
                                     height:(width - 20) * 9 / 16,
                                     borderRadius:5,
                                     backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
                      <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name={"md-play"} size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
                      <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                      
                    </View>)
          }
        }
        return <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
      }else{
        for(var i=0;i<this.content.length;i++){
          if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
            return (<View>
                      <View>
                        <Image source={{uri:global.bucket.concat(this.content[i]["filename"][0])}} 
                               style={DisplayCard_masker_see_more_style.display_image}
                               blurRadius={2} />
                        <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                          
                          
                        </View>
                      </View>
                      <View style={{ padding: 5, flexDirection: 'column', justifyContent: 'center'}}>
                        <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                        <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'flex-start',alignSelf:"center" }}>
                          <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                        </View>
                      </View>
                     </View>)
          }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
            return (<View>
                      <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
                             muted={true}
                             resizeMode={Video.RESIZE_MODE_CONTAIN} 
                             shouldPlay={false}
                             style={{width:width - 20,
                                     height:(width - 20) * 9 / 16,
                                     borderRadius:5,
                                     backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
                      <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name="md-play" size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
                      <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                    </View>)
          }
        }
        return (<View>
                  <Text style={DisplayCard_masker_see_more_style.content}>{this.content[0]["filename"].concat("...")}</Text>
                  <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'center' }}>
                    <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
                  </View>
                </View>
          )
      }
    }else if(this.content[0]["type"].includes("image") || this.content[0]["type"].includes("Image")){
      return (<View>
              <View>
                <Image source={{uri:global.bucket.concat(this.content[0]["filename"][0])}} 
                       style={DisplayCard_masker_see_more_style.display_image}
                       blurRadius={2} />
                <View style={{ flex: 1, position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                  
                </View>
              </View>
              <View style={{ padding: 5, flexDirection: 'row', justifyContent: 'center' }}>
                <Text style={{ color: COLOR_DisplayCard_roast["click-to-see-more"],fontSize:12 }}>{Lan["click_to_see_more"]}</Text>
              </View>
             </View>)
    }else if(this.content[0]["type"].includes("video") || this.content[0]["type"].includes("Video")){
      return <View>
              <Video source={{uri:global.bucket.concat(this.content[0]["filename"])}}
                      muted={true}
                      resizeMode={Video.RESIZE_MODE_CONTAIN}
                      shouldPlay={false}
                    
                      style={{width:width - 20,
                              height:(width - 20) * 9 / 16,
                              borderRadius:5,
                              backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
              <View style={{width: width - 20,
                                    height:(width - 20) * 9 / 16,
                                    position:"absolute",
                                    top:0,
                                    left:0,
                                    backgroundColor:BACKGROUND_COLOR,
                                    opacity:0.5,
                                    justifyContent:"center",
                                    alignItems:'center'
                                  }}> 
                        
                          <Ionicons name="md-play" size={80} color={COLOR_ICON_SET["md-play-DisplayCard_roast"]} />
                      </View>
            </View>
    }
  }
  render(){
    return(
      <TouchableOpacity style={DisplayCard_masker_see_more_style.card_wrapper}
                        onPress={this.onPress}
                        activeOpacity={0.9}>
        <View style={DisplayCard_masker_see_more_style.user_info_bar}>
          <View style={DisplayCard_masker_see_more_style.nickname_time_container}>
            <Text style={DisplayCard_masker_see_more_style.nickname}>
              {this.props.article.author_nickname}
            </Text>
            <Text style={DisplayCard_masker_see_more_style.time}>
              {getDate(this.props.article.timestamp)}
            </Text>
          </View>
          
          <View style={DisplayCard_masker_see_more_style.nickname_time_container}>

          </View>

        </View>
        
  
        <View style={DisplayCard_masker_see_more_style.content_bar}>
          {this.get_bref()}
        </View>
  
        <View style={DisplayCard_masker_see_more_style.status_bar}>
          <Text style={DisplayCard_masker_see_more_style.status}>
            <Text style={DisplayCard_masker_see_more_style.number}> 
              {this.props.article.liked}
            </Text> {"人"+Lan["Likes"]},
            <Text style={DisplayCard_masker_see_more_style.number}> 
              {this.props.article.comments_count}
            </Text>
            {"人"+Lan["Comments"]},
          </Text>
        </View>
      </TouchableOpacity>
    )
  }
}
const DisplayCard_masker_see_more_HEIGHT = 200
const DisplayCard_masker_see_more_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    marginBottom:5,
    borderRadius:3,

    //test
    // borderColor:"black",
    // borderWidth:1

  },
  user_info_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  thumbnail:{
    height:40,
    width:40,
    
  },
  nickname_time_container:{
    flexDirection:"column",
    justifyContent:"space-evenly",
    alignItems:"flex-start",
    //test
    // borderWidth:1
  },
  nickname:{
    marginLeft:5,
    fontSize:14,
    color:COLOR_DisplayCard_roast["nickname"],
    fontWeight:"600"
    //test
    // borderWidth:1
  },
  time:{
    marginLeft:5,
    fontSize:12,
    color:COLOR_DisplayCard_roast["time"],


    //test
    // borderWidth:1
  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,
    marginBottom:10
    //test
    // borderColor:"black",
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:15,
    width:width - 20,
    textAlignVertical: "center",
    color:COLOR_DisplayCard_roast["title"],

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  content_bar:{
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:FILLING_COLOR,
    borderRadius:3,
    marginBottom:DisplayCard_roast_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  content:{
    fontSize:12,
    margin:DisplayCard_roast_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast["content"],
    lineHeight:20,
    letterSpacing:1
    //test
    // borderColor:"black",
    // borderWidth:1
    
  },
  number:{
    fontSize:DisplayCard_roast_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_roast["number"],
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginBottom:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  status:{
    fontSize:12,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast["status"],

    //test
    // borderWidth:1,
    // borderColor:"black",
  },
  display_image:{
    height:200,
    width:width - 20,
    resizeMode:"cover"
  }
})

export class DisplayCard_roast_full extends React.PureComponent{
  constructor(props){
    super(props)

    this.state = {
      liked:this.props.info.user_liked == "True"?true:false,
      followed:this.props.info.user_followed== "True"?true:false
    }
    this.title = this.props.info.title
    this.tags = this.props.info.tags
    this.content = this.props.info.content
    this.liked = this.props.info.liked
    this.followed = this.props.info.followed
    this.comments_count = this.props.info.comments_count 
    this.comment_onPress = this.props.comment_onPress
    this.get_full=this.get_full.bind(this)
    this.like=this.like.bind(this)
    this.follow=this.follow.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
  }

  async like(){
    
    if(!this.state.liked){
      this.liked = this.liked + 1
      await this.setState({liked:true})
      response = await this.props.like("ROASTS",this.props.info.rid)

      if(!response){
        await this.setState({liked:false})
      }else{
        json = await response.json()
        ////db中已有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])  
        }else{
          this.liked = this.liked - 1
        }
      }
    }else{
      this.liked = this.liked - 1
      await this.setState({liked:false})
      response = await this.props.dislike("ROASTS",this.props.info.rid)
      if(!response){
        await this.setState({liked:true})
      }else{
        json = await response.json()
        //db中已没有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])
        }else{
          this.liked = this.liked + 1
        }
      }
    }
  }

  async follow(){
    if(!this.state.followed){
      this.followed = this.followed + 1
      await this.setState({followed:true})
      response = await this.props.follow("ROASTS",this.props.info.rid)

      if(!response){
        await this.setState({followed:false})
      }else{
        json = await response.json()
        ////db中已有
        if(json["new_followed_count"] !== "-1"){
          this.followed = parseInt(json["new_followed_count"])  
        }else{
          this.followed = this.followed - 1
        }
      }
    }else{
      this.followed = this.followed - 1
      await this.setState({followed:false})
      response = await this.props.unfollow("ROASTS",this.props.info.rid)
      if(!response){
        await this.setState({followed:true})
      }else{
        json = await response.json()
        //db中已没有
        if(json["new_followed_count"] !== "-1"){
          this.followed = parseInt(json["new_followed_count"])
        }else{
          this.followed = this.followed + 1
        }
      }
    }
  }

  async handleMenu(value){
    switch(value.action){
      case "CopyText" :
        Clipboard.setString(this.content[value.index]["filename"]);
      break;
      case "ShareText":
        Share.share({message:this.content[value.index]["filename"],title:Lan["From_MASKOFF"]})
      break;
      case "DownloadImage":
        try{
          this.props.notification(notifications['warn'].type,"Downloading...")
          //check if directory exist, if not, make a new directory
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/images/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/images/",{intermediates: true})
          }

          //get filename of the file
          url = global.bucket.concat(this.content[value.index]["filename"])
          var filename = url.substring(url.lastIndexOf('/')+1);

          //download the file
          var filePath = FileSystem.documentDirectory + "MASKOFF/images/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
          var response = await MediaLibrary.getAlbumAsync('MASKOFF')
          var asset = await MediaLibrary.createAssetAsync(filePath);
          if(response === null){
            var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
          }else{
            var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
          }
          this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
          //check if the file is downloaded successfully, if not, cannot share
        }catch(error){
          this.props.notification(notifications['error'].type,"Download failed")
        }
      break;
      case "DownloadVideo":
        try{
          this.props.notification(notifications['warn'].type,"Downloading...")
          result = await getPermission(Permissions.CAMERA_ROLL)
          if(!result){
            return
          }
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/videos/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/videos/",{intermediates: true})
          }
          url = global.bucket.concat(this.content[value.index]["filename"])
          var filename = url.substring(url.lastIndexOf('/')+1);
          var filePath = FileSystem.documentDirectory + "MASKOFF/videos/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
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
      break;
    }
  }
  get_full(){
    full = []
    for(var i=0;i<this.content.length;i++){
      if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
        for (var j=0;j<this.content[i]["filename"].length;j++){
          full.push(
          <ScaledImage uri={global.bucket.concat(this.content[i]["filename"][j])} 
                       key={this.content[i]["filename"][j]}
                       index={i}
                       handleMenu={this.handleMenu}
                       navigation={this.props.navigation}/>
          )  
        }
      }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
        full.push(<Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={i}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress >
          <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
              muted={true}
              shouldPlay={false}
              resizeMode={Video.RESIZE_MODE_CONTAIN}
              useNativeControls
              style={{width:width - 20,
                      height:(width - 20) * 9 / 16,
                      borderRadius:5,
                      backgroundColor:VIDEO_BACKGROUND_COLOR}}
                      key={i}/>
        </MenuTrigger>
        <MenuOptions style={DisplayCard_roast_full_style.menuOptions}>
          <MenuOption value={{action:"DownloadVideo",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>)
      }else if(this.content[i]["type"].includes("text") || this.content[i]["type"].includes("Text")){
        full.push(<Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={i}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress >
          <Text style={DisplayCard_roast_full_style.content}>{this.content[i]["filename"]}</Text>
        </MenuTrigger>
        <MenuOptions style={DisplayCard_roast_full_style.menuOptions}>
          <MenuOption value={{action:"CopyText",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Copy"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareText",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>)
      }else if(this.content[i]["type"].includes("location")){
        full.push(
          <ArticleMapView 
            latitude={this.content[i]["latitude"]} 
            longitude={this.content[i]["longitude"]} 
            navigation={this.props.navigation} 
            usage={"article"}
            key={i}/>
        )
      }else if(this.content[i]["type"].includes("vote")){
        full.push(
          <ArticleVoteDisplayPanel 
            vote_callback={this.props.vote_callback}
            db_id={this.props.info.rid}
            db_type={"ROASTS"}
            vote_id={this.content[i]["vote_id"]}
            votes={this.content[i]}
            key={i}
            full={true}/>
        )
      }
    }
    return full
  }
  render(){
    // console.log(this.state)
    return(
      <View style={DisplayCard_roast_full_style.card_wrapper}>
        <View style={DisplayCard_roast_full_style.user_info_bar}>
          <Image source={{uri:global.bucket+this.props.info.roast_thumbnail}} style={DisplayCard_roast_full_style.thumbnail}/>
          <View style={DisplayCard_roast_full_style.nickname_time_container}>
            <Text style={DisplayCard_roast_full_style.nickname}>
              {this.props.info.author_nickname}
            </Text>
            <Text style={DisplayCard_roast_full_style.time}>
              {getDate(this.props.info.timestamp)}
            </Text>
          </View>
        </View>
        <View style={DisplayCard_roast_full_style.title_bar}>
          <Text style={DisplayCard_roast_full_style.title}
                adjustsFontSizeToFit={true}
                numberOfLines={2}
                minimumFontScale={0.01}>
            {this.title}
          </Text>
        </View>
  
        <View style={DisplayCard_roast_full_style.content_bar}>
          {this.get_full()}
        </View>
        <View style={DisplayCard_roast_full_style.status_bar}>
          <TouchableOpacity style={[DisplayCard_roast_full_style.button,{marginRight:10}]} onPress={this.comment_onPress}>
            <Ionicons name="ios-text" size={20} color={COLOR_ICON_SET["ios-text-DisplayCard_roast_full"]}/>
            <Text style={DisplayCard_roast_full_style.number}> 
              {this.comments_count}
            </Text> 
          </TouchableOpacity>
          
          <TouchableOpacity style={[DisplayCard_roast_full_style.button,{marginLeft:10}]} onPress={this.like}>
            <Ionicons name="ios-thumbs-up" size={20} color={this.state.liked? COLOR_ICON_SET["ios-thumbs-up-DisplayCard_roast_full"]:COLOR_ICON_SET["ios-thumbs-not-up-DisplayCard_roast_full"]}/>
            <Text style={DisplayCard_roast_full_style.number}> 
              {this.liked}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={[DisplayCard_roast_full_style.button,{marginLeft:10}]} onPress={this.follow}>
            <Ionicons name="ios-eye" size={20} color={this.state.followed? COLOR_ICON_SET["ios-thumbs-up-DisplayCard_roast_full"]:COLOR_ICON_SET["ios-thumbs-not-up-DisplayCard_roast_full"]}/>
            <Text style={DisplayCard_roast_full_style.number}> 
              {this.followed}
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>
    )
  }
}
const DisplayCard_roast_full_HEIGHT = 200
const DisplayCard_roast_full_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    marginBottom:5,
    borderRadius:5,

    // //test
    // borderColor:"#A0A0A0",
    // borderWidth:1

  },
  user_info_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  thumbnail:{
    height:40,
    width:40,
    
  },
  nickname_time_container:{
    flexDirection:"column",
    justifyContent:"space-evenly",
    alignItems:"flex-start",
    //test
    // borderWidth:1
  },
  nickname:{
    marginLeft:5,
    fontSize:14,
    color:COLOR_DisplayCard_roast_full["nickname"],
    fontWeight:"600"
    //test
    // borderWidth:1
  },
  time:{
    marginLeft:5,
    fontSize:12,
    color:COLOR_DisplayCard_roast_full["time"],


    //test
    // borderWidth:1
  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    height:DisplayCard_roast_full_HEIGHT * (25 / 100),
    marginLeft:5,
    marginRight:5,
    width:width - 20,
    marginBottom:10
    //test
    // borderColor:"white",
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:20,
    width:width - 20,
    textAlignVertical: "center",
    color:COLOR_DisplayCard_roast_full["title"],

    //test
    // borderWidth:1,
    // borderColor:"red"
  },
  tags:{
    fontSize:15,
    color:COLOR_DisplayCard_roast_full["tags"],
    marginTop:DisplayCard_roast_full_HEIGHT * (25 / 100) / 4,
    marginBottom:DisplayCard_roast_full_HEIGHT * (25 / 100) / 4,
    //test
    // borderColor:"white",
    // borderWidth:1
  },
  tags_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  content_bar:{
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginBottom:DisplayCard_roast_full_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  content:{
    fontSize:15,
    marginBottom:DisplayCard_roast_full_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast_full["content"],
    lineHeight:20,
    letterSpacing:1

    //test
    // borderColor:"white",
    // borderWidth:1
    
  },
  number:{
    fontSize:DisplayCard_roast_full_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_roast_full["number"],
    margin:5,
    // borderWidth:1
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:DisplayCard_roast_full_HEIGHT * (2.5 / 100),
    marginBottom:DisplayCard_roast_full_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderWidth:1,
    
  },

  status:{
    fontSize:12,
    marginBottom:DisplayCard_roast_full_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_roast_full["status"],

    //test
    // borderWidth:1,
    // borderColor:"white",
  },
  display_image:{
    height:width - 20,
    width:width - 20,
    resizeMode:"cover"
  },
  button:{
    margin:5,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center"
  },
  menuOptions: {
    paddingHorizontal:3,
    paddingVertical:3
  },
  menuTrigger: {
    marginTop:2,
    marginBottom:2
  },
  download_button:{
    backgroundColor:BACKGROUND_COLOR,
    borderRadius:3,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"center",
    flex:1,
  },

})

export class ArticleMapView extends React.PureComponent{
  constructor(props){
    super(props);
    this.latitude = this.props.latitude
    this.longitude = this.props.longitude
  }
  render(){
    return(
      <TouchableOpacity 
        onPress={()=>{this.props.navigation.navigate("ShowLocationPage",{latitude:this.latitude,longitude:this.longitude})}}
        disabled={this.props.usage == "article"?false:true}
      >
        <MapView
            provider="google"
            style={[ArticleMapView_style.mapView,{height:this.props.usage == "article"?width * (1 / 2): width * (1 / 4)}]}
            region={{
              latitude: this.latitude,
              longitude: this.longitude,
              latitudeDelta: 0.0812,
              longitudeDelta: 0.0812 * (width / height),
            }}
            customMapStyle={MAP_STYLE}
            scrollEnabled={false}
            zoomEnabled={false}>
            <Marker coordinate={{
                      latitude: this.latitude,
                      longitude: this.longitude,
                    }}/>
          </MapView>
        </TouchableOpacity>
    )
  }
}

const ArticleMapView_style = StyleSheet.create({
  mapView:{
    width: width - 20,
    
    borderRadius: 5,
    margin: 1,
  },
})

export class ScaledImage extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = { source: { uri:this.props.uri } };

    this.mounted = false
  }

  componentDidMount() {

    this.mounted=true 
    Image.getSize(this.props.uri,async (img_width, img_height) => {
      // console.log(this.props.uri,img_height,img_width)
      if(this.mounted){
        if(img_width <= (width - 10)){
          
            await this.setState({ img_width: img_width, img_height: img_height, img_or_width: img_width, img_or_height:img_height});
          
        }else{
          
            await this.setState({ img_width: width - 10, img_height: img_height * ((width - 10) / img_width), img_or_width: img_width, img_or_height:img_height});
          
        }
      }
    });
  }
  componentWillUnmount(){
    this.mounted=false
  }
  render() {
    // console.log(this.state.img_width,this.state.img_or_width)
    if(!this.mounted){
      return(
        <ScaledImage_spinner />
      )
    }else{
      return (
        <Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress 
                     customStyles={{ triggerTouchable: { onPress: () => this.props.navigation.navigate("ImageZoomPage",{info:{uri:this.props.uri,
                                                                                                 height:this.state.img_or_height,
                                                                                                 width:this.state.img_or_width}})}}} >
          <Image
            source={this.state.source}
            style={{ height: this.state.img_height, width: this.state.img_width }}/>
        </MenuTrigger>
        <MenuOptions style={DisplayCard_roast_full_style.menuOptions}>
          <MenuOption value={{action:"DownloadImage",index:this.props.index}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.props.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareImage",index:this.props.index}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.props.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
      );
    }
  }
}


export class DisplayCard_masker_full extends React.PureComponent {
  constructor(props){
    super(props)
    this.state = {
      liked:this.props.article.user_liked=="True"?true:false,
      followed:this.props.article.user_followed=="True"?true:false
    }

    this.name = this.props.article.name
    this.tags = this.props.article.tags
    this.content = this.props.article.content
    this.alias = this.props.article.alias
    this.get_full=this.get_full.bind(this)
    this.contributed = this.props.article.contributed
    this.liked = parseInt(this.props.article.liked)
    this.followed = parseInt(this.props.article.followed)
    this.comments_count = this.props.article.comments_count 
    this.like=this.like.bind(this)
    this.follow=this.follow.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
  }
  async like(){

    if(!this.state.liked){
      this.liked = this.liked + 1
      await this.setState({liked:true})
      response = await this.props.like("ARTICLES",this.props.article.aid)
      if(!response){
        await this.setState({liked:false})
      }else{
        json = await response.json()
        ////db中已有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])  
        }else{
          this.liked = this.liked - 1
        }
      }
    }else{
      this.liked = this.liked - 1
      await this.setState({liked:false})
      response = await this.props.dislike("ARTICLES",this.props.article.aid)
      if(!response){
        await this.setState({liked:true})
      }else{
        json = await response.json()
        //db中已没有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])
        }else{
          this.liked = this.liked + 1
        }
      }
    }
  }

  async follow(){
    if(!this.state.followed){
      this.followed = this.followed + 1
      await this.setState({followed:true})
      response = await this.props.follow("ARTICLES",this.props.article.aid)

      if(!response){
        await this.setState({followed:false})
      }else{
        json = await response.json()
        ////db中已有
        if(json["new_followed_count"] !== "-1"){
          this.followed = parseInt(json["new_followed_count"])  
        }else{
          this.followed = this.followed - 1
        }
      }
    }else{
      this.followed = this.followed - 1
      await this.setState({followed:false})
      response = await this.props.unfollow("ARTICLES",this.props.article.aid)
      if(!response){
        await this.setState({followed:true})
      }else{
        json = await response.json()
        //db中已没有
        if(json["new_followed_count"] !== "-1"){
          this.followed = parseInt(json["new_followed_count"])
        }else{
          this.followed = this.followed + 1
        }
      }
    }
  }

  async handleMenu(value){
    switch(value.action){
      case "CopyText" :
        Clipboard.setString(this.content[value.index]["filename"]);
      break;
      case "ShareText":
        Share.share({message:this.content[value.index]["filename"],title:Lan["From_MASKOFF"]})
      break;
      case "DownloadImage":
        try{
          this.props.notification(notifications['warn'].type,"Downloading...")
          //check if directory exist, if not, make a new directory
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/images/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/images/",{intermediates: true})
          }

          //get filename of the file
          url = global.bucket.concat(this.content[value.index]["filename"])
          var filename = url.substring(url.lastIndexOf('/')+1);

          //download the file
          var filePath = FileSystem.documentDirectory + "MASKOFF/images/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
          var response = await MediaLibrary.getAlbumAsync('MASKOFF')
          var asset = await MediaLibrary.createAssetAsync(filePath);
          if(response === null){
            var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
          }else{
            var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
          }
          this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
          //check if the file is downloaded successfully, if not, cannot share
        }catch(error){
          console.error(error)
          this.props.notification(notifications['error'].type,"Download failed")
        }
      break;
      case "DownloadVideo":
        try{
          this.props.notification(notifications['warn'].type,"Downloading...")
          result = await getPermission(Permissions.CAMERA_ROLL)
          if(!result){
            return
          }
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/videos/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/videos/",{intermediates: true})
          }
          url = global.bucket.concat(this.content[value.index]["filename"])
          var filename = url.substring(url.lastIndexOf('/')+1);
          var filePath = FileSystem.documentDirectory + "MASKOFF/videos/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
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
      break;
    }
  }
  get_full(){
    full = []
    for(var i=0;i<this.content.length;i++){
      if(this.content[i]["type"].includes("image") || this.content[i]["type"].includes("Image")){
        for (var j=0;j<this.content[i]["filename"].length;j++){
          full.push(
          <ScaledImage uri={global.bucket.concat(this.content[i]["filename"][j])} 
                       key={this.content[i]["filename"][j]}
                       index={i}
                       handleMenu={this.handleMenu}
                       navigation={this.props.navigation}/>
          )  
        }
      }else if(this.content[i]["type"].includes("video") || this.content[i]["type"].includes("Video")){
        full.push(<Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={i}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress >
          <Video source={{uri:global.bucket.concat(this.content[i]["filename"])}}
              muted={true}
              shouldPlay={false}
              resizeMode={Video.RESIZE_MODE_CONTAIN}
              useNativeControls
              style={{width:width - 20,
                      height:(width - 20) * 9 / 16,
                      borderRadius:5,
                      backgroundColor:VIDEO_BACKGROUND_COLOR}}
                      />
        </MenuTrigger>
        <MenuOptions style={DisplayCard_roast_full_style.menuOptions}>
          <MenuOption value={{action:"DownloadVideo",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>)
      }else if(this.content[i]["type"].includes("text") || this.content[i]["type"].includes("Text")){
        full.push(<Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={i}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress >
          <Text style={DisplayCard_roast_full_style.content}>{this.content[i]["filename"]}</Text>
        </MenuTrigger>
        <MenuOptions style={DisplayCard_roast_full_style.menuOptions}>
          <MenuOption value={{action:"CopyText",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Copy"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareText",index:i}}
                      customStyles={{optionWrapper:DisplayCard_roast_full_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>)
      }else if(this.content[i]["type"].includes("location")){
        full.push(
          <ArticleMapView 
            latitude={this.content[i]["latitude"]} 
            longitude={this.content[i]["longitude"]} 
            usage={"article"}
            navigation={this.props.navigation} 
            key={i}/>
        )
      }else if(this.content[i]["type"].includes("vote")){
        full.push(
          <ArticleVoteDisplayPanel 
            vote_callback={this.props.vote_callback}
            db_id={this.props.article.aid}
            db_type={"ARTICLES"}
            vote_id={this.content[i]["vote_id"]}
            votes={this.content[i]}
            key={i}
            full={true}/>
        )
      }
    }
    return full
  }
  render(){
    return(
      <View style={DisplayCard_masker_full_style.card_wrapper}>
        <View style={DisplayCard_masker_full_style.title_bar}>
          <Text style={DisplayCard_masker_full_style.title}
                adjustsFontSizeToFit={true}
                numberOfLines={2}
                minimumFontScale={0.01}>
            {this.name}
          </Text>
        </View>
        
        <View style={DisplayCard_masker_full_style.content_bar}>
          {this.get_full()}
        </View>
        <View style={DisplayCard_masker_full_style.alias_bar}>
          <Text style={DisplayCard_masker_full_style.alias}>
            {this.alias == null?"":this.alias.join(" ")}
          </Text>
        </View>
        <View style={DisplayCard_masker_full_style.tags_bar}>
          <Text style={DisplayCard_masker_full_style.tags}>
            {this.tags.join(" ")}
          </Text>
        </View>
        <View style={[DisplayCard_masker_full_style.status_bar,{justifyContent:"flex-start"}]}>
        <Text style={DisplayCard_masker_full_style.time}>
          {getDate(this.props.article.post_date)}
        </Text>
        <TouchableOpacity style={DisplayCard_masker_full_style.button} onPress={this.props.comment_onPress}>
          <Ionicons name="ios-text" size={20} color={COLOR_ICON_SET["ios-text-DisplayCard_masker_full"]}/>
        </TouchableOpacity>
        <Text style={DisplayCard_masker_full_style.number}> 
          {this.comments_count}  
        </Text> 
        <TouchableOpacity style={DisplayCard_masker_full_style.button} onPress={this.like}>
          <Ionicons name="ios-thumbs-up" size={20} color={this.state.liked? COLOR_ICON_SET["ios-thumbs-up-DisplayCard_masker_full"]:COLOR_ICON_SET["ios-thumbs-not-up-DisplayCard_masker_full"]}/>
        </TouchableOpacity>
        <Text style={DisplayCard_masker_full_style.number}> 
          {this.liked}
        </Text>
        <TouchableOpacity style={[DisplayCard_masker_full_style.button,{marginLeft:10}]} onPress={this.follow}>
          <Ionicons name="ios-eye" size={20} color={this.state.followed? COLOR_ICON_SET["ios-thumbs-up-DisplayCard_roast_full"]:COLOR_ICON_SET["ios-thumbs-not-up-DisplayCard_roast_full"]}/>
        </TouchableOpacity>
        <Text style={DisplayCard_masker_full_style.number}> 
          {this.followed}
        </Text>
      </View>
      </View>
    )
  }
}
const DisplayCard_masker_full_HEIGHT = 200
const DisplayCard_masker_full_style = StyleSheet.create({
  card_wrapper:{
    backgroundColor:BACKGROUND_COLOR,
    width:width,
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"center",
    borderRadius:5,

    // //test
    // borderColor:"#A0A0A0",
    // borderWidth:1

  },
  title_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    height:DisplayCard_roast_HEIGHT * (25 / 100),
    marginLeft:5,
    marginRight:5,
    width:width - 20,
    marginBottom:10

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  title:{
    fontWeight:"600",
    fontSize:20,
    width:width - 20,
    textAlignVertical: "center",
    color:COLOR_DisplayCard_masker_full["title"],

    //test
    // borderWidth:1,
    // borderColor:"red"
  },
  tags_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"white",
    // borderWidth:1
  },

  tags_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"space-between",
    backgroundColor:TRANSPARENT,
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  tags:{
    fontSize:15,
    marginTop:DisplayCard_roast_HEIGHT * (25 / 100) / 4,
    marginBottom:DisplayCard_roast_HEIGHT * (25 / 100) / 4,
    color:COLOR_DisplayCard_masker_full["tags"],

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  content_bar:{
    flexDirection:"column",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginBottom:DisplayCard_roast_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderColor:"white",
    // borderWidth:1
  },
  content:{
    fontSize:15,
    marginBottom:DisplayCard_roast_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker_full["content"],
    lineHeight:20,
    letterSpacing:1

    //test
    // borderColor:"white",
    // borderWidth:1
    
  },
  number:{
    fontSize:DisplayCard_roast_HEIGHT * (25 / 100) / 5,
    color:COLOR_DisplayCard_masker_full["number"],
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginBottom:DisplayCard_masker_HEIGHT * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderWidth:1,
    // borderColor:"white"
  },
  status:{
    fontSize:12,
    marginBottom:DisplayCard_masker_HEIGHT * (25 / 100) / 10,
    color:COLOR_DisplayCard_masker_full["status"],

    //test
    // borderWidth:1,
    // borderColor:"white",
  },
  image_active: {
    height:screen_height,
    width:width,
    resizeMode: 'contain',
  },
  button:{
    margin:5
  },
  time:{
    marginLeft:5,
    fontSize:12,
    color:COLOR_DisplayCard_masker_full["time"],
    //test
    // borderWidth:1
  },
})
//==========================Tool Bar工具栏==========================
export class ToolBar extends Component{
  constructor(props){
    super(props);
    this.state = {
      show_full_toolbar:false
    }
    this.info_index = this.props.info_index
    this.handleText = this.handleText.bind(this)
    this.handleScreenRecorder = this.handleScreenRecorder.bind(this)
    this.handlePicture = this.handlePicture.bind(this)
    this.handleVideo = this.handleVideo.bind(this)
    this.handleLocation = this.handleLocation.bind(this)
    this.handleVote = this.handleVote.bind(this)
    this.send_back_location=this.send_back_location.bind(this)
    this.clickFAB = this.clickFAB.bind(this)
  }
  async handleText(){
    await this.setState({show_full_toolbar:false})
    this.props.navigation.navigate("Post_TextContent",{info_index:this.info_index + 1})
  }
  handleScreenRecorder(){
    this.props.handleScreenRecorder()

  }
  async handlePicture(){
    var result = await getPermission(Permissions.CAMERA_ROLL)
    if(!result){
      return
    }
    var allowsEditing = true
    if (Platform.OS == 'ios'){
      allowsEditing = false
    }
    result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes:ImagePicker.MediaTypeOptions.Images,
        allowsEditing:allowsEditing,
        exif:false
      });
      if(!result.cancelled){
        photo = result
        photo["info"] = photo.uri
        photo["info_type"] = "Photo"
        photo["info_index"] = this.info_index + 1
        await store.dispatch(addInfoToPost(photo))
        await store.dispatch(addInfoToPost({
          info_index:this.info_index + 2,
          info_type:"ToolBar",
        }))
      }
    await this.setState({show_full_toolbar:false})
  }
  async handleVideo(){
    var result = await getPermission(Permissions.CAMERA_ROLL)
    if(!result){
      return
    }
    var allowsEditing = true
    if (Platform.OS == 'ios'){
      allowsEditing = false
    }
    result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes:ImagePicker.MediaTypeOptions.Videos,
      allowsEditing:allowsEditing,
      exif:false
    });
    if(!result.cancelled){
      video = result
      video["info"] = video.uri
      video["info_type"] = "Video"
      video["info_index"] = this.info_index + 1
      await store.dispatch(addInfoToPost(video))
      await store.dispatch(addInfoToPost({
        info_index:this.info_index + 2,
        info_type:"ToolBar",
      }))
    }
    await this.setState({show_full_toolbar:false})
  }
  async send_back_location(coordinate){
    
    location = {info_index:this.info_index + 1,
                info:coordinate,
                info_type:"Location"}
    await store.dispatch(addInfoToPost(location))
    await store.dispatch(addInfoToPost({
      info_index:this.info_index + 2,
      info_type:"ToolBar",
    }))


  }
  handleLocation(){
    this.props.navigation.navigate("PickLocationPage",{send_back_location:this.send_back_location})
  }
  handleVote(){
    var vote_count = this.props.post.content.filter(function (content) {
      return content.info_type === "Vote";
    });
    if(vote_count.length >=1){
      this.props.handleVoteTwice()
    }else{
      this.props.navigation.navigate("Post_vote",{info_index:this.info_index + 1})    
    }
    
  }
  async clickFAB(on){
    if (on){
      await this.setState({show_full_toolbar:false})
    }else{
      await this.setState({show_full_toolbar:true})
    }
  }
  render() {
    this.info_index = this.props.info_index
    if (this.state.show_full_toolbar){
      return(
        <View style={ToolBarstyle.ToolBar}>
          <TouchableOpacity 
            style={[ToolBarstyle.ToolBarButton,
                    {borderTopLeftRadius:5,
                    borderBottomLeftRadius:5}]}
            onPress={() => {this.handleText();}}>
            <Ionicons name="ios-create" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Text']}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.handlePicture()}}>
            <Ionicons name="ios-images" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Picture']}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.handleVideo()}}>
            <Ionicons name="ios-skip-forward" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Video']}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.clickFAB(true);}}>
            <Ionicons name="ios-close-circle" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Fold']}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.handleScreenRecorder();}}>
            <Ionicons name="ios-videocam" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={{
              fontSize:6,
              color:COLOR_ICON_SET["ios-icons-ToolBar"],
              marginTop:-6}}>{Lan['Screen']}</Text>
            <Text style={{
              fontSize:6,
              color:COLOR_ICON_SET["ios-icons-ToolBar"],}}>{Lan['Recorder']}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.handleLocation()}}>
            <Ionicons name="ios-pin" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Location']}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
          style={ToolBarstyle.ToolBarButton}
          onPress={() => {this.handleVote()}}>
            <Ionicons name="ios-podium" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
            <Text style={ToolBarstyle.ToolBarText}>{Lan['Vote']}</Text>
          </TouchableOpacity>
        </View>
      )
    }else{
      return(
        <View style={ToolBarstyle.ToolBarShink}>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
          <TouchableOpacity 
            style={[ToolBarstyle.ToolBarButton_more,{borderRadius:5}]}
            onPress={() => {this.clickFAB(false);}}>
              <Ionicons name="ios-add-circle" size={TOOLBAR_HEIGHT * 0.6} color={COLOR_ICON_SET["ios-icons-ToolBar"]}/>
              <Text style={ToolBarstyle.ToolBarText}>{Lan['Tools']}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
          <TouchableOpacity style={ToolBarstyle.DecoyButton}
                            disabled={true}/>
        </View>
      )
    }
  }
}
const ToolBarstyle = StyleSheet.create({
  ToolBarText:{
    fontSize:8,
    color:COLOR_ICON_SET["ios-icons-ToolBar"],
  },
  ToolBarButton_more:{
    height:TOOLBAR_HEIGHT,
    width:width/7,



    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",

  },
  ToolBarButton:{
    height:TOOLBAR_HEIGHT,
    width:width/7,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  ToolBar:{
    height:TOOLBAR_HEIGHT,
    width:width,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:5,
    marginTop:5,
  },
  ToolBarShink:{
    height:TOOLBAR_HEIGHT,
    width:width,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:5,
    marginTop:5,
  },
  DecoyButton:{
    height:TOOLBAR_HEIGHT,
    width:width/7,
    backgroundColor:TRANSPARENT,
    borderWidth:0
    },
})
//==========================Vote Bar用来增加Vote条目==========================
export class VoteDisplayBar extends Component{
  constructor(props){
    super(props);
    this.state={text:''}
    this.removeVoteBar=this.removeVoteBar.bind(this)
    this.option_background_color = this.props.vote.backgroundColor
  }
  async removeVoteBar(){
    await store.dispatch(removeVoteBar({vote_index:this.props.vote_index}))
  }
  render() {
    return(
      <View style={VoteDisplayBar_style.container}>
        <Text style={[VoteDisplayBar_style.text,{backgroundColor:this.option_background_color}]}> {this.props.vote.option} </Text>
        <View style={VoteDisplayBar_style.button_container}>
          <TouchableOpacity onPress={() => this.removeVoteBar()}
                            style={VoteDisplayBar_style.Button}>
              <Ionicons name={"ios-close"} size={TOOLBAR_HEIGHT * 0.8} color={COLOR_ICON_SET["ios-close-VoteBar"]}/>
              <Text style={VoteDisplayBar_style.ToolBarText}>{Lan['Delete']}</Text>
          </TouchableOpacity>
        </View>
      </View>
    )
  }
}
const VoteDisplayBar_style = StyleSheet.create({
  container:{
    width:width * 0.85, 
    marginTop:10,
    flexDirection:"row", 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor:TRANSPARENT
  },
  button_container:{
    width:width * 0.85 * 0.2, 
    marginTop:5,
    marginBottom:5,
    flexDirection:"row", 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor:TRANSPARENT 
  },
  text:{
    alignSelf:"center",
    width:width * 0.85 * 0.8,
    padding:3,
    color:COLOR_VoteDisplayPanel["VoteText"]
  },
  Button:{
    marginLeft:5,
    borderRadius:3,
    backgroundColor:TRANSPARENT,
    height:TOOLBAR_HEIGHT,
    width:TOOLBAR_HEIGHT,
    justifyContent:'center',
    alignItems:'center'
  },
  ToolBarText:{
    marginTop:-5,
    fontSize:8,
    color:COLOR_ICON_SET["ios-close-VoteBar"],
  }
})

//====================================VoteTextInputBar====================================
export class VoteTextInputBar extends Component{
  constructor(props){
    super(props);
    this.state={text:''}
    this.addNewVoteBar=this.addNewVoteBar.bind(this)  
    
    
  }
  async addNewVoteBar(){
    if(!this.state.text == ''){
      await store.dispatch(recordVote({vote_index:this.props.vote_index,vote:this.state.text,backgroundColor:randomColor()}))
      this._textInput.clear()
      await this.setState({text:''})
    }
  }
  render() {
      return(
        <View style={VoteTextInputBar_style.container}>
          <TextInput
            multiline={true}
            underlineColorAndroid="transparent"
            ref={component => this._textInput = component}
            placeholder={Lan['Input_here']}
            style={VoteTextInputBar_style.TextInput}
            onChangeText={async (text) =>{await this.setState({text})}}/>
          <View style={VoteTextInputBar_style.button_container}>
            <TouchableOpacity onPress={() => this.addNewVoteBar(this.state.text)}
                              style={VoteTextInputBar_style.Button}>
                <Ionicons name={"ios-add"} size={TOOLBAR_HEIGHT * 0.8} color={COLOR_ICON_SET["ios-add-VoteBar"]}/>
                <Text style={VoteTextInputBar_style.ToolBarText}>{Lan['Add']}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )
  }
}
const VoteTextInputBar_style = StyleSheet.create({
  container:{
    width:width * 0.85,
    marginTop:50,
    flexDirection:"row", 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor:TRANSPARENT 
  },
  button_container:{
    width:width * 0.85 * 0.2,
    marginTop:5,
    marginBottom:5,
    flexDirection:"row", 
    justifyContent: 'flex-start', 
    alignItems: 'center',
    backgroundColor:TRANSPARENT 
  },
  TextInput:{
    alignSelf:"center",
    width:width * 0.85 * 0.8,
    borderBottomWidth: 1,
    borderColor: COLOR_VoteDisplayPanel["VoteTextInputBar_TextInput"]
  },
  Button:{
    marginLeft:5,
    
    
    
    borderRadius:3,
    backgroundColor:TRANSPARENT,
    height:TOOLBAR_HEIGHT,
    width:TOOLBAR_HEIGHT,
    justifyContent:'center',
    alignItems:'center'
  },
  ToolBarText:{
    marginTop:-5,
    fontSize:8,
    color:COLOR_ICON_SET["ios-add-VoteBar"],
  }

})
//==========================Search Recommend Container==========================
export const SearchRecommendContainer = (props) => {
  file_type = []
  recommended_bars = []
  if (props.recommended){
    for(var i=0;i<props.recommended.length;i++){
      recommended_bars.push(<SearchRecommendMessageBar message={props.recommended[i]}
                                                       key={i}
                                                       onPress={props.onPress}/>)
    }
  }
  return (
    <View style={SearchRecommendContainer_style.container}>
      <View style={SearchRecommendContainer_style.trending_tag}>
        <Text style={SearchRecommendContainer_style.trending_text}>
          Trending
        </Text>
      </View>
      <View style={SearchRecommendContainer_style.wrapper}>  
        {recommended_bars}
      </View>
    </View>
  );
}
const SearchRecommendContainer_style = StyleSheet.create({
  container:{
    height: height - (HEADER_HEIGHT + STATUSBAR_HEIGHT),
    width:width,
    backgroundColor:COLOR_Search_n_Recommend["results_wrapper"],
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    
  },
  wrapper:{
    height: height - (HEADER_HEIGHT + STATUSBAR_HEIGHT),
    width:width - 20,
    backgroundColor:COLOR_Search_n_Recommend["results_wrapper"],
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    flexWrap: 'wrap',
  },
  trending_tag:{
    height:height / 20,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    backgroundColor:TRANSPARENT,
    marginTop:10,
    marginBottom:10,
    marginLeft:10,
  },
  trending_text:{
    fontSize:20,
    fontWeight:"600",
  }
})

//==========================Search Recommend message bar============================
export const SearchRecommendMessageBar = (props) => {
  if (props.message.type == "hot"){
    SearchRecommendMessageBar_Icon = <Ionicons name="ios-flame"
                     size={height / 40}
                     color={COLOR_ICON_SET["ios-flame-SearchRecommendMessageBar"]} />
  }else if(props.message.type == "search"){
    SearchRecommendMessageBar_Icon  = <Ionicons name="ios-search"
                     size={height / 40}
                     color={COLOR_ICON_SET["ios-search-SearchRecommendMessageBar"]}/>
  }
  return(
    <TouchableOpacity style={SearchRecommendMessageBar_style.container}
                      onPress={()=>props.onPress(props.message.content)}>
      {SearchRecommendMessageBar_Icon}
      <Text style={SearchRecommendMessageBar_style.message}>
        {props.message.content}
      </Text>
    </TouchableOpacity>
  )
}
const SearchRecommendMessageBar_style = StyleSheet.create({
  container:{
    height:height / 20,
    backgroundColor:COLOR_SearchRecommendMessageBar["container"],
    borderRadius:5,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    alignSelf: 'flex-start',
    marginLeft:5,
    marginRight:5,
    marginTop:5,
    marginBottom:5,
    borderLeftWidth:5,
    borderColor:COLOR_SearchRecommendMessageBar["container_border"],
  },
  message:{
    fontSize:height / 40 ,
    color:COLOR_SearchRecommendMessageBar["message"],
    marginRight:10,    
    marginLeft:5,
  }
})

//==========================Search Result Container==============================
export const SearchReminderContainer = (props) => {
  return (
    
    <View style={SearchReminderContainer_style.container}>
      <TouchableOpacity style={SearchReminderContainer_style.search_reminder_button}
                        onPress={props.onPress}>
      <Text style={SearchReminderContainer_style.search_reminder_text}>
        Search 
        <Text style={SearchReminderContainer_style.search_reminder_text}>
          "{props.input}"
        </Text>
      </Text>
      </TouchableOpacity>
    </View>
  );
}

SearchReminderContainer.propTypes = {
  onPress: PropTypes.func,
};

SearchReminderContainer.defaultProps = {
  onPress:() => void(0),
};
const SearchReminderContainer_style = StyleSheet.create({
  container:{
    height: height - (height / 15 + 20),
    width:width,
    backgroundColor:COLOR_Search_n_Recommend["results_wrapper_input"],
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    
  },
  search_reminder:{
    height:height / 20,
    width:width,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:COLOR_Search_n_Recommend["results_wrapper_input"],
    marginTop:10,
    marginBottom:10,
  },
  search_reminder_text:{
    fontSize:13,
    color:COLOR_SearchReminderContainer["search_reminder_text"]
  },
  search_reminder_text_variable:{
    textDecorationLine:"underline",
    fontSize:12,
    marginLeft:5,
  },
  search_reminder_button:{
    height:height / 20,
    width:width - 50,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:TRANSPARENT,
    marginTop:10,
    marginBottom:10,
    marginLeft:25,
    marginRight:25,
    borderWidth:1,
    borderRadius:3,
    borderColor:COLOR_SearchReminderContainer["search_reminder_button_border"],
  }
})














































export class ScaledImage_ContentDisplayPanel extends Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.source = { uri:this.props.info }
    this._mounted = false
}

  componentDidMount() {
    this._mounted = true 
    Image.getSize(this.props.info,async (img_width, img_height) => {
      if(this._mounted){
        if(img_width <= (width - 30)){
          await this.setState({ img_width: img_width, img_height: img_height, img_or_width: img_width, img_or_height:img_height });
        }else{
          await this.setState({ img_width: width - 30, img_height: img_height * ((width - 30) / img_width), img_or_width: img_width, img_or_height:img_height });
        }
      }
    });
  }
  
  componentWillUnmount(){
    this._mounted = false
  }

  render() {
    if(!this._mounted){
      return(
        <ScaledImage_spinner />
      )
    }else{
      return (
        <TouchableOpacity style={[ContentDisplayPanel_style.display,{flexDirection:'column',
                                                         alignItems: 'center',
                                                         justifyContent:'center',
                                                         height:this.state.img_height,
                                                         width:this.state.img_width}]}
                          onPress={() => this.props.navigation.navigate("ImageZoomPage",{info:{uri:this.props.info,
                                                                                         height:this.state.img_or_height,
                                                                                         width:this.state.img_or_width}})}>
          <Image
            source={{uri:this.props.info}}
            style={[{ height: this.state.img_height, width: this.state.img_width },this.props.style]}/>
        </TouchableOpacity>
      );
    }
  }
}

export class ScaledImage_Comment extends Component {
  constructor(props) {
    super(props);
    this.state = { source: { uri:this.props.info } };
    this._mounted = false
}

  componentWillMount() {
    this._mounted = true
    Image.getSize(this.props.info,async (img_width, img_height) => {
      if(this._mounted){
        if(img_width <= (width - 30)){
          await this.setState({ img_width: img_width, img_height: img_height, img_or_width: img_width, img_or_height:img_height });
        }else{
          await this.setState({ img_width: width - 30, img_height: img_height * ((width - 30) / img_width), img_or_width: img_width, img_or_height:img_height });
        }
      }
    });
  }
  componentWillUnmount(){
    this._mounted = false
  }
  render() {
    if(!this._mounted){
      return(
        <ScaledImage_comment_spinner />
      )
    }else{
      return (
        <Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={this.props.index}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress 
                     customStyles={{ triggerTouchable: { onPress: () => this.props.navigation.navigate("ImageZoomPage",{info:{uri:this.props.info,
                                                                                                 height:this.state.img_or_height,
                                                                                                 width:this.state.img_or_width}})}}} >
          <Image
            source={this.state.source}
            style={[{ height: this.state.img_height / 4, width: this.state.img_width / 4 },this.props.style]}
            resizeMode="contain"/>
        

        </MenuTrigger>
        <MenuOptions style={Comment_style.menuOptions}>
          <MenuOption value={{action:"DownloadImage",index:this.props.index}}
                      customStyles={{optionWrapper:Comment_style.download_button}}
                      onSelect={(value) => this.props.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Download"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareImage",index:this.props.index}}
                      customStyles={{optionWrapper:Comment_style.download_button}}
                      onSelect={(value) => this.props.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
      );
    }
  }
}




export class ContentDisplayPanel extends Component{
  constructor(props){
    super(props)
    this.remove=this.remove.bind(this)
    this.updateText=this.updateText.bind(this)
    this.updateVote=this.updateVote.bind(this)
  }
  async remove(){
    await store.dispatch(removeInfoFromPost({info_index:this.props.info_index}))
  }
  updateText(){
    this.props.navigation.navigate("Post_TextContent",{info_index:this.props.info_index,
                                              update_purpose:true,
                                                        info:this.props.info})
  }
  async updateVote(){
    for (var i=0;i<this.props.info.length;i++){
      await store.dispatch(loadVote({vote_index:i,vote:this.props.info[i]}))
    }
    this.props.navigation.navigate("Post_vote",{info_index:this.props.info_index,
                                              update_purpose:true})
  }
  render(){
    if (this.props.info_type == "Text"){
      this.CDP_height = null
      this.CDP_width = width - 30
      if(this.props.preview){
        content = 
          <View style={[ContentDisplayPanel_style.display,{alignSelf: 'center',backgroundColor:TRANSPARENT}]}>
            <Text style={ContentDisplayPanel_style.display_text}>{this.props.info}</Text>
          </View>
      }else{
        content = 
          <TouchableOpacity style={[ContentDisplayPanel_style.display,{alignSelf: 'center',backgroundColor:TRANSPARENT}]}
                            onPress={() => {this.updateText()}}>
            <Text style={ContentDisplayPanel_style.display_text}>{this.props.info}</Text>
          </TouchableOpacity>
      }
    }else if(this.props.info_type == "Photo"){
      content = 
        <ScaledImage_ContentDisplayPanel info={this.props.info}
                                         style={ContentDisplayPanel_style.display_image}
                                         navigation={this.props.navigation}/>
      
    }else if (this.props.info_type == "Video"){
      this.CDP_width = width - 30
      this.CDP_height = (this.CDP_width * (9 / 16))
      content = 
      <View style={[ContentDisplayPanel_style.display,{flexDirection:'column',
                                                       alignItems: 'center',
                                                       justifyContent:'center',
                                                       height:this.CDP_height,
                                                       width:this.CDP_width}]}>
          <Video source={{uri:this.props.info}}
                         resizeMode={Video.RESIZE_MODE_CONTAIN}
                         muted={true}
                         shouldPlay={false}
                         useNativeControls
                         style={{height:this.CDP_height,
                                 width:this.CDP_width,
                                 borderRadius:5,
                                 backgroundColor:VIDEO_BACKGROUND_COLOR}}/>
      </View>
    }else if(this.props.info_type == "Vote"){

      if(this.props.preview){
        content = <View style={[ContentDisplayPanel_style.display,{alignSelf: 'center',backgroundColor:TRANSPARENT}]}>
          <VoteDisplayPanel votes={this.props.info} 
                            preview={true}/>
        </View>
      }else{
        content =<View style={[ContentDisplayPanel_style.display,{alignSelf: 'center',backgroundColor:TRANSPARENT}]}>
         <VoteDisplayPanel votes={this.props.info} 
                           preview={false} 
                           update_function={this.updateVote} 
                           navigation={this.props.navigation}
                           updateVoteRejection={this.props.updateVoteRejection}/>
        </View>
      }
    }else if(this.props.info_type == "Location"){
      content = <View style={[ContentDisplayPanel_style.display,{alignSelf: 'center',backgroundColor:TRANSPARENT}]}>
      <MapView
          provider="google"
          customMapStyle={MAP_STYLE}
          style={ContentDisplayPanel_style.mapView}
          region={{
            latitude: this.props.info.latitude,
            longitude: this.props.info.longitude,
            latitudeDelta:  0.0322,
            longitudeDelta:  0.0322 * width / height,
          }}
          scrollEnabled={false}
          zoomEnabled={false}>
          <Marker coordinate={{
                    latitude: this.props.info.latitude,
                    longitude: this.props.info.longitude,
                  }}/>
          </MapView>
        </View>
    }
    if (this.props.preview){
      return(
        <View style={[ContentDisplayPanel_style.container,{height:null,
                                                           width:width,
                                                           alignItems:"center"}]}>
          {content}
        </View>
      )
    }else{
      return(
        <View style={[ContentDisplayPanel_style.container,{height:null,
                                                           width:width}]}>
          {content}
          <View style={[ContentDisplayPanel_style.remove_button_panel,{height:20,width:width}]}>
            <TouchableOpacity style={ContentDisplayPanel_style.remove_button}
                              onPress={() => this.remove()}>
              <Ionicons name="ios-close" 
                        size={20} 
                        color={COLOR_ICON_SET["ios-close-ContentDisplayPanel"]}/>
            </TouchableOpacity>
          </View>
        </View>
      )
    }
  }
}

const ContentDisplayPanel_style = StyleSheet.create({
  container:{
    backgroundColor:TRANSPARENT,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:5,
    marginTop:5,
  },
  display:{
    backgroundColor:TRANSPARENT,
    borderRadius:5,
    marginBottom:15
  },
  display_text:{
    fontSize:15,
    color:COLOR_ContentDisplayPanel["display_text"],
    lineHeight: 30,
    width:width - 30,
    borderRadius:5,
    margin:5
  },
  display_image:{
    borderRadius:5
  },
  remove_button_panel:{
    marginTop:5,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"flex-start"
  },
  remove_button:{
    height:20,
    width:20,
    borderRadius:5,
    backgroundColor:COLOR_ContentDisplayPanel["remove_button"],
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center"
  },
  mapView: {
    width: width - 30,
    height: 400,
    borderRadius: 3,
    margin: 1,
  },
})

export class VoteDisplayPanel_Bar extends Component{
  constructor(props){
    super(props)
    this.backgroundColor = randomColor()
    this.state = {
      isChecked:false,
      isSubmited:this.props.isSubmited
    }
    
    this.moveValue = new Animated.Value(0)

    this.onLayout=this.onLayout.bind(this)
    this.animated=this.animated.bind(this)
    this.barOnPress=this.barOnPress.bind(this)
    this.getTextColor=this.getTextColor.bind(this)
    this.getBlockColor=this.getBlockColor.bind(this)
    this.getBlockBorderColor=this.getBlockBorderColor.bind(this)
  }
  animated(){
    this.moveValue.setValue(0)
    Animated.timing(
      this.moveValue,
      {
        toValue: 1,
        duration: 2000,
        easing: Easing.out(Easing.quad),
      }
    ).start()
  }

  async componentDidUpdate(prevProps){
    if (this.props.isSubmited !== prevProps.isSubmited) {
      await this.setState({isSubmited:this.props.isSubmited});
      this.animated()
    }
  }

  onLayout(e){
    this.setState({
      viewHeight:e.nativeEvent.layout.height,
      viewWidth_color:e.nativeEvent.layout.width * (this.props.counts[this.props.index] / this.props.counts.reduce((a,b) => a+b, 0)),
      viewWidth_empty:e.nativeEvent.layout.width * (1 - this.props.counts[this.props.index] / this.props.counts.reduce((a,b) => a+b, 0)),
    })
  }

  getTextColor(){
    switch(true){
      case !this.state.isChecked && !this.state.isSubmited:
        return "#999999"
      break;
      case !this.state.isChecked && this.state.isSubmited:
        return "#7b7b7b"
      break;
      case this.state.isChecked && !this.state.isSubmited:
        return "#7b7b7b"
      break;
      case this.state.isChecked && this.state.isSubmited:
        return "#7b7b7b"
      break;
    }
  }

  getBlockColor(){
    switch(true){
      case !this.state.isChecked && !this.state.isSubmited:
        return "white"
      break;
      case !this.state.isChecked && this.state.isSubmited:
        return TRANSPARENT
      break;
      case this.state.isChecked && !this.state.isSubmited:
        return this.backgroundColor
      break;
      case this.state.isChecked && this.state.isSubmited:
        return TRANSPARENT
      break;
    }
  }

  getBlockBorderColor(){
    switch(true){
      case !this.state.isChecked && !this.state.isSubmited:
        return "#bbbbbb"
      break;
      case !this.state.isChecked && this.state.isSubmited:
        return TRANSPARENT
      break;
      case this.state.isChecked && !this.state.isSubmited:
        return this.backgroundColor
      break;
      case this.state.isChecked && this.state.isSubmited:
        return TRANSPARENT
      break;
    }
  }

  async barOnPress(){
    this.state.isChecked?this.props.voteBarOnPress(this.props.index,"Uncheck"):this.props.voteBarOnPress(this.props.index,"Check")
    await this.setState({isChecked:!this.state.isChecked})
  }
  render(){
    const color_width = this.moveValue.interpolate({
      inputRange: [0, 1],
      outputRange: [0, this.state.viewWidth_color]
    })
    
    return(
      <View style={{backgroundColor:COLOR_VoteDisplayPanel["VoteDisplayPanel_Bar_container_background"],marginTop:2,marginBottom:2}}>
        <Animated.View style={{position:"absolute",
                      height:this.state.viewHeight?this.state.viewHeight:0,
                      width:this.state.isSubmited?color_width:0,
                      backgroundColor:this.state.isSubmited?this.backgroundColor:TRANSPARENT,
                      top:0,
                      left:0
                    }}/>
        <TouchableOpacity 
          style={[VoteDisplayPanel_Bar_style.container,{backgroundColor:TRANSPARENT,width:VoteDisplayPanel_Bar_width}]}
          onLayout={this.onLayout}
          onPress={this.barOnPress}
          disabled={this.props.disabled}>
            <View
                style={[VoteDisplayPanel_Bar_style.checkbox,{borderColor:this.getBlockBorderColor()}]}
                backgroundColor={this.getBlockColor()}
            />
          <View style={VoteDisplayPanel_Bar_style.option}>
            <Text style={[VoteDisplayPanel_Bar_style.text,{color:this.getTextColor()}]}>{this.props.vote}</Text>
          </View>
        </TouchableOpacity>
        
      </View>
    )
  }
}

const VoteDisplayPanel_Bar_width = width * 0.9
const VoteDisplayPanel_Bar_style = StyleSheet.create({
  container:{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
    width:VoteDisplayPanel_Bar_width,
    borderBottomWidth:1,
    borderColor:COLOR_VoteDisplayPanel["VoteDisplayPanel_Bar_container_border"],

  },
  option:{
    flexDirection:'row',
    justifyContent:'flex-start',
    alignItems:'center',
  },
  checkbox:{
    alignSelf:"center",
    height:12,
    width:12,
    borderColor:"white",
    borderWidth:1,
    marginLeft:10,
    marginRight:10
  },
  text:{
    alignSelf:"center",
    padding:3,
    width:VoteDisplayPanel_Bar_width - 14 - 6,
  }
})
export class VoteDisplayPanel extends Component{
  constructor(props){
    super(props)
    this.remove=this.remove.bind(this)
    
    if(!this.props.preview){
      this.purpose=this.props.navigation.getParam("purpose")  
    }
    
  }
  async remove(){
    await store.dispatch(removeInfoFromPost({info_index:this.props.info_index}))
  }
  render(){
    votes = []
    for (var i=0;i<this.props.votes.length;i++){
      votes.push(<VoteDisplayPanel_Bar vote={this.props.votes[i].option} backgroundColor={this.props.votes[i].backgroundColor} key={i} />)
    }
    content = <View style={{ flexDirection:"column", justifyContent: 'flex-start', alignItems: 'center',backgroundColor:BACKGROUND_COLOR }}>
          {votes}
        </View>
    if(this.props.preview){
      return(
        <View style={[VoteDisplayPanel_style.container,{height:null,
                                                         width:width}]}>
          {content}
        </View>
      )
    }else{
      return(
        <TouchableOpacity style={[VoteDisplayPanel_style.container,{height:null,
                                                         width:width}]}
                          onPress={["postMasker","postRoast"].includes(this.purpose)?this.props.update_function:this.props.updateVoteRejection}
                          >
          {content}
        </TouchableOpacity>
      )
    }
  }
}

const VoteDisplayPanel_style = StyleSheet.create({
  container:{
    backgroundColor:TRANSPARENT,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    marginBottom:5,
    marginTop:5,
  },
  display:{
    backgroundColor:TRANSPARENT,
    borderRadius:5,
  },
  display_text:{
    fontSize:17,
    color:COLOR_VoteDisplayPanel["display_text"],
    width:width - 30,
    borderRadius:5,
    margin:5
  },
  display_image:{
    borderRadius:5
  },
  remove_button_panel:{
    marginTop:5,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"flex-start"
  },
  remove_button:{
    height:20,
    width:20,
    borderRadius:5,
    backgroundColor:COLOR_VoteDisplayPanel["remove_button"],
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center"
  }
})

export class ArticleVoteDisplayPanel extends Component{
  constructor(props){
    super(props)
    this.state = {
      isSubmited:false,
      counts:this.props.votes.counts
    }
    this.submit=this.submit.bind(this)
    this.voteBarOnPress=this.voteBarOnPress.bind(this)
    this.checkedOptions = []
  }
  async submit(){
    if(!this.state.isSubmited){
      if(this.checkedOptions.length == 0){
        this.props.vote_callback("empty_vote")
        return
      }
      response = await submitVote(this.checkedOptions,this.props.db_id,this.props.db_type,this.props.vote_id)
      
      if(response == false){
        //说明前面出现了error, 需要重连
        this.props.vote_callback("network")
      }else if(response.ok){
        json = await response.json()
        await this.setState({isSubmited:true,counts:json["counts"]})
        this.props.vote_callback("success")
      }else if(response.status == 409){
        this.props.vote_callback("conflict")
        await this.setState({isSubmited:true,counts:this.props.votes.counts})
      }else if(response.status == 404){
        this.props.vote_callback("empty_vote")
        await this.setState({isSubmited:true,counts:this.props.votes.counts})
      }else{
        //如果response不ok, 让用户重连试试
        this.props.vote_callback("network")
        return
      }
    }
  }
  voteBarOnPress(index,action){
    action == "Check"?this.checkedOptions.push(index):this.checkedOptions.splice( this.checkedOptions.indexOf(index), 1 )
  }
  render(){
    
    votes = []
    for (var i=0;i<this.props.votes.options.length;i++){
      votes.push(<VoteDisplayPanel_Bar 
                  vote={this.props.votes.options[i]} 
                  key={i} 
                  disabled={this.props.full?false:true} 
                  isSubmited={this.state.isSubmited}  
                  index={i} 
                  counts={this.state.counts}
                  voteBarOnPress={this.voteBarOnPress}/>)
    }
    content = <View style={{ flexDirection:"column", justifyContent: 'flex-start', alignItems: 'center',backgroundColor:BACKGROUND_COLOR }}>
          {votes}
        </View>

    return(
      <View style={[ArticleVoteDisplayPanel_style.container]}>
        {content}
        <TouchableOpacity disabled={this.props.full?false:true}
          onPress={this.submit}>
          <Text style={{color:THEME_COLOR}}>
            {Lan["Submit"]}
          </Text>
        </TouchableOpacity>
      </View>
    )

  }
}

const ArticleVoteDisplayPanel_style = StyleSheet.create({
  container:{
    backgroundColor:TRANSPARENT,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    marginBottom:5,
    marginTop:5,
  }
})
//===========================Name Alias Tag display panel=========================
export const NameAliasTagDisplayPanel = (props) => {
  purpose = props.purpose
  tags = []
  for (var i=0;i<props.tags.length;i++){
    if(props.tags !== ""){
      tags.push(<Text style={[NameAliasTagDisplayPanel_style.tags_text,{color:LINK_COLOR}]} key={i}>{"#"+props.tags[i]+"#"}</Text>)
      tags.push(<Text style={[NameAliasTagDisplayPanel_style.tags_text,{backgroundColor:TRANSPARENT,padding:0,margin:0}]} key={props.tags.length + i}>{" "}</Text>)
    }
  }
  if(purpose == "postMasker" || purpose == "postArticle" ||purpose == "updateArticle"){
    
    alias = null
    alias_panel = null
    if (props.alias.length != 0){
      alias_info = props.alias
      alias = []
      for (var i=0;i<alias_info.length;i++){
        if(alias_info[i] !== ""){
          alias.push(<Text style={NameAliasTagDisplayPanel_style.alias_text} key={i}>{alias_info[i]}</Text>)
          alias.push(<Text style={[NameAliasTagDisplayPanel_style.alias_text,{backgroundColor:TRANSPARENT,padding:0,margin:0}]} key={alias_info.length+i}>{" "}</Text>)
        }
      }
      alias_panel = 
      <Text style={NameAliasTagDisplayPanel_style.alias_wrapper}>
        {alias}
      </Text>
    }
    return(
      <View style={NameAliasTagDisplayPanel_style.container}>
        <View style={NameAliasTagDisplayPanel_style.name_wrapper}>
          <Text style={NameAliasTagDisplayPanel_style.name_label}>
            {props.name}
          </Text>
        </View>
        
        {alias_panel}

        {props.content}
        
        <Text style={NameAliasTagDisplayPanel_style.tags_wrapper}>
          {tags}
        </Text>
      </View>
    )
  }else if(purpose == "postRoast" || purpose == "updateRoast"){
    return(
      <View style={NameAliasTagDisplayPanel_style.container}>
        <View style={NameAliasTagDisplayPanel_style.name_wrapper}>
          <Text style={NameAliasTagDisplayPanel_style.name_label}>
            {props.title}
          </Text>
        </View>
        {props.content}
        <Text style={NameAliasTagDisplayPanel_style.tags_wrapper}>
          {tags}
        </Text>
      </View>
    )
  }
}

const NameAliasTagDisplayPanel_style = StyleSheet.create({
  container:{
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center",
    width:width
  },
  name_wrapper:{ 
    width:width - 30,
    alignSelf:"flex-start",
    margin:15,
    marginBottom:5,
    backgroundColor:TRANSPARENT,
  },
  name_label:{
    color:COLOR_NameAliasTagDisplayPanel["name_label"],
    fontWeight:"600",
    fontSize:20
  },
  name:{
    color:COLOR_NameAliasTagDisplayPanel["name"]
  },
  alias_wrapper:{
    marginLeft:15,
    marginRight:15,
    marginBottom:20,
    alignSelf:"flex-start",
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    
    backgroundColor:TRANSPARENT,
  },
  alias_label:{
    padding:2,
    fontSize:16,
    color:COLOR_NameAliasTagDisplayPanel["alias_label"],
    alignSelf:"center",
    margin:2
  },
  alias_container:{
    marginTop:5,
    alignSelf:"center",
    backgroundColor:TRANSPARENT,
    borderRadius:3,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    height:30
  },








  alias_text:{
    margin:2,
    padding:1,
    fontSize:13,
    alignSelf:"center",
    color:COLOR_NameAliasTagDisplayPanel["alias_text"],
  },
  tags_wrapper:{
    marginLeft:15,
    marginRight:15,
    alignSelf:"flex-start",
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginBottom:20,
  },
  tags_label:{
    padding:2,
    fontSize:16,
    color:COLOR_NameAliasTagDisplayPanel["tags_label"],
    alignSelf:"center",
    margin:2
  },
  tags_container:{
    
    alignSelf:"center",
    backgroundColor:TRANSPARENT,
    borderRadius:3,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    height:30
  },
  tags:{
    
    alignSelf:"center",
    
    borderRadius:2,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  tags_text:{
    padding:1,
    fontSize:16,
    
    margin:2,
    color:COLOR_NameAliasTagDisplayPanel["tags_text"],
    
  },
  divide_line:{
    width:width - 30,
    height:1,
    backgroundColor:COLOR_NameAliasTagDisplayPanel["divide_line"]
  }
})

//===========================Chat Thumbnail Window行列显示的chat info=========================
export class ChatThumbnailWindow extends React.PureComponent {
  constructor(props){
    super(props)
    this.handleMenu=this.handleMenu.bind(this) 
    this.openMenu=this.openMenu.bind(this)
  }
  
  async handleMenu(value){
    switch (value){
      case "Delete_Chat":
        await store.dispatch(removeConversation(this.props.conversation.id))
        break
    }
  }
  
  openMenu(){
    this.menu.open();
  };
  render(){
    
    if(this.props.type == "Chat"){
      menu=<Menu onSelect={(value) => this.handleMenu(value)}
        rendererProps={{ preferredPlacement: 'bottom' }}
        ref={c => (this.menu = c)}>
        <MenuTrigger style={ChatThumbnailWindow_style.contact_menuTrigger} >
        </MenuTrigger>
        <MenuOptions style={ChatThumbnailWindow_style.contact_menuOptions}>
          <MenuOption value={"Delete_Chat"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:COLOR_ChatThumbnailWindow["borderColor_window"]}}}>
            <Text style={{color: COLOR_ChatThumbnailWindow["Delete_Chat"]}}>{Lan['Delete_Chat']}</Text>
          </MenuOption>
          <MenuOption value={"Block"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:COLOR_ChatThumbnailWindow["borderColor_window"]}}}>
            <Text style={{color: COLOR_ChatThumbnailWindow["Block"]}}>{Lan['Block']}</Text>
          </MenuOption>
          <MenuOption value={"Report"}>
            <Text style={{color: COLOR_ChatThumbnailWindow["Report"]}}>{Lan['Report']}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>
      reddot = <RedDot number={this.props.conversation.unread} 
                          left={ChatThumbnailWindow_style.thumbnail.width} 
                          right={4}
                          top={4}
                          bottom={ChatThumbnailWindow_style.thumbnail.height} />
      last_chat_mes = this.props.last_chat_mes
    }else if(this.props.type == "Black_list"){
      menu=<Menu onSelect={(value) => this.handleMenu(this.props.maskname)}
              rendererProps={{ preferredPlacement: 'auto' }}
              ref={c => (this.menu = c)}>
              <MenuTrigger style={ChatThumbnailWindow_style.contact_menuTrigger} >
              </MenuTrigger>
              <MenuOptions style={ChatThumbnailWindow_style.contact_menuOptions}>
                <MenuOption value={"UnBlackList"} >
                  <Text style={{color: COLOR_ChatThumbnailWindow["UnBlackList"]}}>{Lan['UnBlackList']}</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
      reddot = null
      last_chat_mes = null 
    }

    return(
          <TouchableHighlight style={ChatThumbnailWindow_style.container}
            onPress={this.props.type == "Black_list"?this.openMenu:this.props.onPress}
            onLongPress={this.props.type == "Black_list"?null:this.openMenu}>
            <View style={ChatThumbnailWindow_style.container}>
              {menu}
              <View style={ChatThumbnailWindow_style.thumbnail_container}>
                <Image source={require("../ayami_nakajo/8.jpg")} 
                       style={ChatThumbnailWindow_style.thumbnail} />
                {reddot}
              </View>
              <View style={ChatThumbnailWindow_style.info_container}>
                <View style={ChatThumbnailWindow_style.info_container_upper}>
                  <Text style={[ChatThumbnailWindow_style.maskname,{color:this.props.type == "Black_list"?COLOR_ChatThumbnailWindow["Blacklisted"]:COLOR_ChatThumbnailWindow["NotBlacklisted"]}]}>
                    {this.props.maskname}
                  </Text>
                  <Text style={ChatThumbnailWindow_style.time_stamp}>
                    {this.props.last_chat_date}
                  </Text>
                </View>
                <View style={ChatThumbnailWindow_style.info_container_lower}>
                  {last_chat_mes}
                </View>
              </View>
            </View>
          </TouchableHighlight>
    )
  }
}


const ChatThumbnailWindow_style = StyleSheet.create({
  container:{
    width:width,
    height:CHAT_THUMBNAIL_HEIGHT,
    backgroundColor:FILLING_COLOR,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    borderBottomWidth:1,
    borderColor:COLOR_ChatThumbnailWindow["container_borderColor"]
  },
  thumbnail_container:{
    width:CHAT_THUMBNAIL_HEIGHT,
    height:CHAT_THUMBNAIL_HEIGHT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center"
  },
  thumbnail:{
    width:CHAT_THUMBNAIL_HEIGHT - 15,
    height:CHAT_THUMBNAIL_HEIGHT - 15,
    resizeMode:"contain",
    borderRadius:1,
  },
  info_container:{
    width: width - CHAT_THUMBNAIL_HEIGHT,
    height:CHAT_THUMBNAIL_HEIGHT,
    backgroundColor:TRANSPARENT,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
  },
  info_container_upper:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.95,
    height:CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.8,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"flex-end",
    marginTop:CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.2,
    marginLeft:(width - CHAT_THUMBNAIL_HEIGHT) * 0.025,
    marginRight:(width - CHAT_THUMBNAIL_HEIGHT) * 0.025,
  },
  maskname:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.95 * 0.7,
    backgroundColor:TRANSPARENT,
    color:COLOR_ChatThumbnailWindow["maskname"],
    fontSize: 14,
    textAlign:"left",
    textAlignVertical:"top",
    alignSelf:"center",
  },
  time_stamp:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.95 * 0.3,
    backgroundColor:TRANSPARENT,
    fontSize: 10,
    alignSelf:"flex-start",
    textAlign:"right",
    textAlignVertical:"top",
    color:COLOR_ChatThumbnailWindow["maskname"],
  },
  info_container_lower:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.95,
    height:CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.8,
    marginBottom:CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.2,
    backgroundColor:TRANSPARENT,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    marginLeft:(width - CHAT_THUMBNAIL_HEIGHT) * 0.025,
    marginRight:(width - CHAT_THUMBNAIL_HEIGHT) * 0.025,
  },
  message:{
    width: (width - CHAT_THUMBNAIL_HEIGHT) * 0.8,
    backgroundColor:TRANSPARENT,
    fontSize: CHAT_THUMBNAIL_HEIGHT * (1 / 2) * 0.8 * 0.5,
    color:COLOR_ChatThumbnailWindow["message"],
    textAlign:"left",
    textAlignVertical:"center",
    alignSelf:"center",
  },











  contact_menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  contact_menuTrigger: {
    padding: 5,
  }
})


class DefaultHeader extends React.Component {
  render() {
    const variables = this.context.theme
      ? this.context.theme["@@shoutem.theme/themeStyle"].variables
      : variable;
    return (
      <View
        style={[
          Accordion_Header_style.defaultHeader,
          this.props.headerStyle
            ? this.props.headerStyle
            : { backgroundColor: variables.headerStyle }
        ]}
      >
        <Text> {this.props.title}</Text>
        <Icon
          style={[
            { fontSize: 18 },
            this.props.expanded
              ? this.props.expandedIcon && this.props.expandedIconStyle
                ? this.props.expandedIconStyle
                : { color: variables.expandedIconStyle }
              : this.props.icon && this.props.iconStyle
                ? this.props.iconStyle
                : { color: variables.iconStyle }
          ]}
          name={
            this.props.expanded
              ? this.props.expandedIcon
                ? this.props.expandedIcon
                : "ios-arrow-up"
              : this.props.icon
                ? this.props.icon
                : "ios-arrow-down"
          }
        />
      </View>
    );
  }
}

class DefaultContent extends React.Component {
  render() {
    const variables = this.context.theme
      ? this.context.theme["@@shoutem.theme/themeStyle"].variables
      : variable;
    return (
      <Text
        style={[
          { padding: 10 },
          this.props.contentStyle
            ? this.props.contentStyle
            : { backgroundColor: variables.contentStyle }
        ]}
      >
        {this.props.content}
      </Text>
    );
  }
}

class AccordionSubItem extends React.Component {
  state = {
    fadeAnim: new Animated.Value(0.3)
  };
  componentDidMount() {
    Animated.timing(this.state.fadeAnim, {
      toValue: 1,
      duration: 500
    }).start();
  }
  render() {
    let { fadeAnim } = this.state;
    return (
      <Animated.View style={{ ...this.props.style, opacity: fadeAnim }}>
        {this.props.children}
      </Animated.View>
    );
  }
}

class AccordionItem extends React.Component {
  constructor(props){
    super(props);
    this.state={pressed:false}
  }
  render() {
    return (
      <View>
        <TouchableWithoutFeedback
          onPress={async () => {
            this.props.setSelected(this.props.index)
            if(this.state.pressed){
              await this.setState({pressed:false})
            }else{
              await this.setState({pressed:true})
            }
          }}
        >
          <View>
            {this.props.renderHeader ? (
              this.props.renderHeader(this.props.item, this.props.expanded)
            ) : (
                <DefaultHeader
                  title={this.props.item.title}
                  expanded={this.props.expanded}
                  headerStyle={[this.props.headerStyle,{borderColor:this.state.pressed?COLOR_Accordion_Content["AccordionItem_pressed"]:COLOR_Accordion_Content["AccordionItem_not_pressed"]}]}
                  icon={this.props.icon}
                  iconStyle={this.props.iconStyle}
                  expandedIcon={this.props.expandedIcon}
                  expandedIconStyle={this.props.expandedIconStyle}
                />
              )}
          </View>
        </TouchableWithoutFeedback>
        {this.props.expanded ? (
          <AccordionSubItem>
            {this.props.renderContent ? (
              this.props.renderContent(this.props.item)
            ) : (
                <DefaultContent
                  content={this.props.item.content}
                  contentStyle={this.props.contentStyle}
                />
              )}
          </AccordionSubItem>
        ) : null}
      </View>
    );
  }
}

export class Accordion extends React.Component {
  state = { selected: undefined };
  async setSelected(index) {
    if (this.state.selected === index) {
      await this.setState({ selected: undefined });
    } else {
      await this.setState({ selected: index });
    }
  }

  async componentDidMount() {
    await this.setState({ selected: this.props.expanded });
  }

  render() {
    const variables = this.context.theme
      ? this.context.theme["@@shoutem.theme/themeStyle"].variables
      : variable;
    return (
      <FlatList
        data={this.props.dataArray}
        extraData={this.state}
        style={[
          {
            borderColor: COLOR_Accordion_Content["flatlist_border"],
            borderWidth: variables.borderWidth
          },
          this.props.style
        ]}
        keyExtractor={(item, index) => String(index)}
        renderItem={({ item, index }) => (
          <AccordionItem
            key={String(index)}
            item={item}
            expanded={this.state.selected === index}
            index={index}
            setSelected={this.setSelected.bind(this)}
            headerStyle={this.props.headerStyle}
            contentStyle={this.props.contentStyle}
            renderHeader={this.props.renderHeader}
            renderContent={this.props.renderContent}
            icon={this.props.icon}
            iconStyle={this.props.iconStyle}
            expandedIcon={this.props.expandedIcon}
            expandedIconStyle={this.props.expandedIconStyle}
          />
        )}
        {...this.props}
      />
    );
  }
}


export const Accordion_Header = (props) =>{
  return(
    <View style={Accordion_Header_style.container}> 
      <Text style={Accordion_Header_style.text}> {props.title} </Text>
    </View>
    )
}

export const Accordion_Content = (props) =>{
  return(
    <View style={Accordion_Content_style.container}> 
      <DisplayCard_masker_full article={props.content}/>
    </View>
    )
}

const Accordion_Header_style = StyleSheet.create({
  defaultHeader: {
    flexDirection: "row",
    padding: 10,
    justifyContent: "space-between",
    alignItems: "center"
  },
  container:{
    width:width,
    height:50,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    borderBottomWidth:1,
    borderColor:COLOR_Accordion_Content["header_border"]
  },
  text:{
    color:COLOR_Accordion_Header["text"],
    marginLeft:width / 20
  }
})

const Accordion_Content_style = StyleSheet.create({
  container:{
    width:width,
    backgroundColor:BACKGROUND_COLOR,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
  },
  text:{
    color:COLOR_Accordion_Content["text"],
    marginLeft:width / 20
  }
})


export class Comments_container extends Component {
  constructor(props){
    super(props)
  }
  shouldComponentUpdate(nextProps, nextState) {
    if ((this.props.comments !== nextProps.comments) || (this.props.extraData !== nextProps.extraData)) {
      return true;
    }
    return false;
  }
  render(){
    header = <View>
      {this.props.header_card}
      <View style={Comments_container_style.seperate_bar}/>
        <View style={Comments_container_style.header}>
          <Text style={Comments_container_style.header_text}>
            {Lan["Comments_section"]}
          </Text>
        </View>
      </View>      
      return(
        <View style={Comments_container_style.container}>
          <FlatList
            data={this.props.comments}
            keyExtractor={item => item.key}
            renderItem={({item}) => <Comment_Block 
              comment={item} 
              seeMore={() => this.props.navigation.navigate("View_Comment",{comment:item,purpose:this.props.purpose})} 
              navigation={this.props.navigation}
              like={this.props.like}
              dislike={this.props.dislike}
              make_comment={this.props.make_comment}
              notification={this.props.notification} />}
            ListHeaderComponent={header}
            ListFooterComponent={this.props.ListFooterComponent}
            onEndReached={this.props.onEndReached}
            onEndReachedThreshold={this.props.onEndReachedThreshold}
            onMomentumScrollBegin={this.props.onMomentumScrollBegin}
            extraData={this.props.extraData}
            onScroll={this.props.onScroll}

          />
        </View>
      )
    // }
  }
}
const Comments_container_style = StyleSheet.create({
  container:{
    flex:1,
    backgroundColor:BACKGROUND_COLOR,
    borderRadius:5,
  },
  seperate_bar:{
    width:width,
    height:5,
    backgroundColor:COLOR_Comments_container["seperate_bar"]
  },
  header:{
    borderRadius:5,
    width:width,
    height:40,
    borderBottomWidth:1,
    borderColor:COLOR_Comments_container["header_border"],
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    backgroundColor:BACKGROUND_COLOR
  },
  header_text:{
    fontWeight:"600",
    fontSize:17,
    color:COLOR_Comments_container["header_text"],
    marginLeft:10,
  },
  empty_container:{
    backgroundColor:BACKGROUND_COLOR,
    borderRadius:5,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    height: height * 1/4,
  },
  empty_indicator:{
    fontSize:15,
    color:COLOR_Comments_container["empty_indicator"],
  }
})

export class Comment_Block extends Component {
  constructor(props){
    super(props)
    this.state={liked:this.props.comment.user_liked}

    this.liked=parseInt(this.props.comment.liked)
    this.like=this.like.bind(this)
    this.comment_onPress=this.comment_onPress.bind(this)
  }

  async like(){
    if(!this.state.liked){
      this.liked = this.liked + 1
      await this.setState({liked:true})
      response = await this.props.like("COMMENTS",this.props.comment.cid)
      if(!response){
        await this.setState({liked:false})
      }else{
        json = await response.json()
        ////db中已有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])  
        }else{
          this.liked = this.liked - 1
          await this.setState({})
        }
      }
    }else{
      this.liked = this.liked - 1
      await this.setState({liked:false})
      response = await this.props.dislike("COMMENTS",this.props.comment.cid)
      if(!response){
        await this.setState({liked:true})
      }else{
        json = await response.json()
        //db中已没有
        if(json["new_liked_count"] !== "-1"){
          this.liked = parseInt(json["new_liked_count"])
        }else{
          this.liked = this.liked + 1
          await this.setState({})
        }
        
      }
    }
  }

  comment_onPress(){
    //this.props.navigation.navigate("Comment_WriteComment",{comment:this.props.comment})

  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.comment !== nextProps.comment) {
      return true;
    }
    if (this.state.liked !== nextState.liked) {
      return true;
    }
    return false;
  }

  render(){
    if (this.props.comment.child_count > 0){
      see_more = <TouchableOpacity style={Comment_Block_style.button}
                                   onPress={this.props.seeMore}
                                   >
          <Text style={[Comment_Block_style.button_text,{color:LINK_COLOR}]}>{Lan["See_more"]}</Text>
        </TouchableOpacity>
    }else{
      see_more = null
    }

    return(
      <View style={Comment_Block_style.container}>
        <Comment comment={this.props.comment} 
                 parent_comment={true} 
                 navigation={this.props.navigation}
                 notification={this.props.notification}/>
        <View style={Comment_Block_style.sub_comments}>
          <FlatList
            data={this.props.comment.sub_comments?this.props.comment.sub_comments.slice(0,3):[]}
            keyExtractor={item => item.cid}
            renderItem={({item}) => <Comment comment={item} 
                                             parent_comment={false} 
                                             reply_author={() => this.props.navigation.navigate("Comment_WriteComment",{comment:item})} 
                                             navigation={this.props.navigation}
                                             notification={this.props.notification}/>}
          />
          {see_more}
        </View>
        <View style={[Comment_Block_style.status_bar,{justifyContent:"flex-start"}]}>
          <TouchableOpacity style={Comment_Block_style.button} onPress={() => this.props.make_comment(this.props.comment)}>
            <Ionicons name="ios-text" size={20} color={COLOR_ICON_SET["ios-text-Comment_Block"]}/>
          </TouchableOpacity>
          <Text style={Comment_Block_style.number}> 
          {this.props.comment.child_count}
          </Text> 
          <TouchableOpacity style={Comment_Block_style.button} onPress={this.like}>
            <Ionicons name="ios-thumbs-up" size={20} color={this.state.liked? COLOR_ICON_SET["ios-thumbs-up-Comment_Block"]:COLOR_ICON_SET["ios-thumbs-not-up-Comment_Block"]}/>
          </TouchableOpacity>
          <Text style={Comment_Block_style.number}> 
          {this.liked}
          </Text>
        </View>
      </View>
    )
  }
}

const Comment_Block_style = StyleSheet.create({
  container:{
    marginLeft:10,
    marginRight:10,
    marginTop:4,
    marginBottom:1,
    borderRadius:5,
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    backgroundColor:BACKGROUND_COLOR,
    borderBottomWidth:1,
    borderColor:COLOR_Comments_block["container_border"]
  },
  sub_comments:{
    marginLeft:2,
    marginBottom:5,
    width:width - 40,
    borderRadius:5,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"flex-start",
    backgroundColor:FILLING_COLOR
  },
  button_text:{
    marginLeft:10,
    marginBottom:5,
    fontSize:13,
    color:COLOR_Comments_block["button_text"]
  },
  number:{
    fontSize:13,
    color:COLOR_Comments_block["number"]
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    width:(width  - 20),

    //test
    // borderWidth:1,
    // borderColor:"white"
  },
  button:{
    marginLeft:5,
    marginRight:5,
    marginBottom:5
  }
})

export class Comment extends React.Component {
  constructor(props){
    super(props)
    this.handleMenu=this.handleMenu.bind(this)
  }

  shouldComponentUpdate(nextProps, nextState) {
    if (this.props.comment !== nextProps.comment) {
      return true;
    }
    return false;
  }

  async handleMenu(value){
    switch(value.action){
      case "CopyText" :
        Clipboard.setString(this.props.comment.content[value.index]["filename"]);
      break;
      case "ShareText":
        Share.share({message:this.props.comment.content[value.index]["filename"],title:Lan["From_MASKOFF"]})
      break;
      case "DownloadImage":
        try{
          this.props.notification(notifications['warn'].type,"Downloading...")
          //check if directory exist, if not, make a new directory
          var response = await FileSystem.getInfoAsync(FileSystem.documentDirectory + "MASKOFF/images/")
          if(!response.exists){
            var response = await FileSystem.makeDirectoryAsync(FileSystem.documentDirectory + "MASKOFF/images/",{intermediates: true})
          }

          //get filename of the file
          url = global.bucket.concat(this.props.comment.content[value.index]["filename"][value.image_index])
          var filename = url.substring(url.lastIndexOf('/')+1);

          //download the file
          var filePath = FileSystem.documentDirectory + "MASKOFF/images/" + filename
          var response = await FileSystem.downloadAsync(url, filePath)
          var response = await MediaLibrary.getAlbumAsync('MASKOFF')
          var asset = await MediaLibrary.createAssetAsync(filePath);
          if(response === null){
            var response = await MediaLibrary.createAlbumAsync('MASKOFF',asset,false)
          }else{
            var response = await MediaLibrary.addAssetsToAlbumAsync(asset, response.id, false)
          }
          this.props.notification(notifications['success'].type,"Download successfully, file is stored at "+Lan["documentDirectory/"]+"MASKOFF/images/" + filename)
          //check if the file is downloaded successfully, if not, cannot share
        }catch(error){
          this.props.notification(notifications['error'].type,"Download failed")
        }
      break;
    }
  }

  render(){
    if(this.props.comment.at != null){
      at = <Text style={Comment_style.text_at}>{"@ "+this.props.comment.at + " : "} </Text>
    }else{
      at = <Text style={Comment_style.text_at}>{" : "} </Text>
    }
    
    if(this.props.parent_comment){
      content_component = []
      for (var i=0;i<this.props.comment.content.length;i++){
        if(this.props.comment.content[i].type.includes('text') || this.props.comment.content[i].type.includes('Text')){
          content_component.push(<Menu 
            renderer={Popover}
            rendererProps={{ preferredPlacement: 'bottom' }}
            key={i}>
        <MenuTrigger style={DisplayCard_roast_full_style.menuTrigger}
                     triggerOnLongPress >
          <Text style={Comment_style.text_content}>{this.props.comment.content[i].filename}</Text>
        </MenuTrigger>
        <MenuOptions style={Comment_style.menuOptions}>
          <MenuOption value={{action:"CopyText",index:i}}
                      customStyles={{optionWrapper:Comment_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Copy"]}</Text>
          </MenuOption>
          <MenuOption value={{action:"ShareText",index:i}}
                      customStyles={{optionWrapper:Comment_style.download_button}}
                      onSelect={(value) => this.handleMenu(value)}>
            <Text style={{marginLeft:5}}>{Lan["Share"]}</Text>
          </MenuOption>
        </MenuOptions>
      </Menu>)
        }else if(this.props.comment.content[i].type.includes('image') || this.props.comment.content[i].type.includes('Image')){
          
          for (var j=0;j<this.props.comment.content[i]["filename"].length;j++){
            content_component.push(
          <ScaledImage_Comment info={global.bucket.concat(this.props.comment.content[i]["filename"][j])} 
                               style={Comment_style.display_image}
                               navigation={this.props.navigation}
                               key={i}
                               index={i}
                               handleMenu={this.handleMenu} />
            )  
          }
          
        }
      } 
      return (
        <View>
          <View style={[Comment_style.container,{flexDirection:"column"}]} > 
            <View style={Comment_style.user_info_bar}>
              <Image source={{uri:global.bucket+this.props.comment.user_info.roast_thumbnail}} style={Comment_style.thumbnail}/>
              <View style={Comment_style.nickname_time_container}>
                <Text style={Comment_style.nickname}>{this.props.comment.nickname}</Text>
                <Text style={Comment_style.time}>{getDate(this.props.comment.date)}</Text>
              </View>
            </View>
            {content_component}
          </View>
        </View>
      )
    }else{
      content_component = []
      for (var i=0;i<this.props.comment.content.length;i++){
        nickname = null
        if(i == 0){
          nickname =<View style={{
                            flexDirection:"row",
                            justifyContent:"flex-start",
                            alignItems:"flex-start",}}> 
            <Text style={Comment_style.text_author}>{this.props.comment.nickname}</Text>
            {at}
          </View>
        }
        if(this.props.comment.content[i].type.includes('text') || this.props.comment.content[i].type.includes('Text')){
          content_component.push(<View style={[Comment_style.container,{marginLeft:10}]} 
                                       key={i}> 
              {nickname}
              
              <Text style={Comment_style.text_content}>{this.props.comment.content[i].filename}</Text>  
            </View>)
        }else if(this.props.comment.content[i].type.includes('image') || this.props.comment.content[i].type.includes('Image')){
          image = []
          for (var j=0;j<this.props.comment.content[i]["filename"].length;j++){
            image.push(<ScaledImage_Comment info={global.bucket.concat(this.props.comment.content[i]["filename"][j])} 
                                            key={this.props.comment.content[i]["filename"][j]}
                                            style={Comment_style.display_image}
                                            navigation={this.props.navigation}
                                            handleMenu={this.handleMenu} />)  
          }
          
          content_component.push(<View style={[Comment_style.container,{flexDirection:"column",marginLeft:10}]}
                                       key={i} > 
                {nickname}
                {image}
              </View>)
          
        }
      }
      return(
        <View>
          {content_component}
        </View>
      )
    }
  }

}

const Comment_style = StyleSheet.create({
  container:{
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"flex-start",
    marginTop:5,
  },
  user_info_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    margin:10,
    marginLeft:5,
    marginRight:5,
    width:width - 20,

    //test
    // borderColor:"black",
    // borderWidth:1
  },
  thumbnail:{
    height:40,
    width:40,
    
  },
  nickname_time_container:{
    flexDirection:"column",
    justifyContent:"space-evenly",
    alignItems:"flex-start",
    //test
    // borderWidth:1
  },
  nickname:{
    marginLeft:5,
    fontSize:14,
    color:COLOR_Comment["nickname"],
    fontWeight:"600"
    //test
    // borderWidth:1
  },
  time:{
    marginLeft:5,
    fontSize:12,
    color:COLOR_Comment["time"],


    //test
    // borderWidth:1
  },
  text_content:{
    fontSize:13,
    color:COLOR_Comment["text_content"],
  },
  text_at:{
    fontSize:13,
    color:COLOR_Comment["text_at"],
  },
  text_author:{
    fontSize:13,
    color:COLOR_Comment["text_author"],
  },
  display_image:{
    borderRadius:5,
    marginTop:2,
  },
  menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  menuTrigger: {
    padding: 5,
  },
  download_button:{
    backgroundColor:COLOR_Comment["download_button"],
    margin:5,
    borderRadius:3,
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    flex:1,
  },
})

export class User_Post_Count_Bar extends React.Component{
  constructor(props){
    super(props);
  }
  render(){
    return(
      <TouchableOpacity style={User_Post_Count_Bar_style.container} onPress={this.props.onPress}>
        <View style={User_Post_Count_Bar_style.bar1}>
          <Ionicons name={this.props.iconName} size={24} color={COLOR_ICON_SET["User_Post_Count_Bar-icon"]} />
          <Text style={User_Post_Count_Bar_style.field_name}>{this.props.name}</Text>
        </View>
        <View style={User_Post_Count_Bar_style.bar2}>
          <Text style={User_Post_Count_Bar_style.field}>{this.props.field1}</Text>
          <Text style={User_Post_Count_Bar_style.field_name}>{this.props.field1_name}</Text>
        </View>
        <View style={User_Post_Count_Bar_style.bar3}>
          <Text style={User_Post_Count_Bar_style.field}>{this.props.field2}</Text>
          <Text style={User_Post_Count_Bar_style.field_name}>{this.props.field2_name}</Text>
        </View>
        <View style={User_Post_Count_Bar_style.bar4}>
          <Text style={User_Post_Count_Bar_style.field}>{this.props.field3}</Text>
          <Text style={User_Post_Count_Bar_style.field_name}>{this.props.field3_name}</Text>
        </View>
      </TouchableOpacity>
    )
  }
}
const User_Post_Count_Bar_style = StyleSheet.create({
  container:{
    height: 45,
    marginTop:10,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center"
  },
  bar1:{
    width:(width - 30) *0.25,
    height: 45,
    flexDirection:"column",
    justifyContent:"flex-end",
    alignItems:"center",
  },
  bar2:{
    width:(width - 30) *0.25,
    height: 45,
    flexDirection:"column",
    justifyContent:"flex-end",
    alignItems:"center"
  },
  bar3:{
    width:(width - 30) *0.25,
    height: 45,
    flexDirection:"column",
    justifyContent:"flex-end",
    alignItems:"center"
  },
  bar4:{
    width:(width - 30) *0.25,
    height: 45,
    flexDirection:"column",
    justifyContent:"flex-end",
    alignItems:"center"
  },
  field_name:{
    fontSize:12,
    color:COLOR_Users["field_name"]
  },
  field:{
    height:26,
    fontSize:24
  }
})

export class User_Function_Bar extends React.Component{
  constructor(props){
    super(props);
    this.state = {switch_value:global.local_settings[this.props.switch_type]}
  }

  render(){
    if(this.props.switch){
      return(
        <View style={User_Function_Bar_style.container}>
          <View style={User_Function_Bar_style.text_description_container}>
            <Text style={User_Function_Bar_style.text_description}>{this.props.description}</Text>
          </View>
          <View style={User_Function_Bar_style.switch_container}>
            <Switch
              value={this.state.switch_value}
              onValueChange={async(value) => 
                    {
                      await this.setState({switch_value:value})
                      await this.props.on_value_change(this.props.switch_type,value)
                    }
                  }
              circleSize={25}
              barHeight={Platform.OS === "ios"?25:15}

              circleBorderWidth={0}
              backgroundActive={'#2da157'}
              backgroundInactive={'#cccccc'}
              circleActiveColor={'#1e6b3a'}
              circleInActiveColor={'#999999'}
              changeValueImmediately
              innerCircleStyle={{ alignItems: "center", justifyContent: "center" }} // style for inner animated circle for what you (may) be rendering inside the circle
              outerCircleStyle={{}} 
              renderActiveText={false}
              renderInActiveText={false}
              switchLeftPx={2} 
              switchRightPx={2} 
              switchWidthMultiplier={2} 
            />
          </View>
        </View>
      )
    }else{
      return(
      <TouchableOpacity style={User_Function_Bar_style.container} onPress={this.props.onPress} >
        <View style={[User_Function_Bar_style.text_description_container,{width:width - 30}]}>
          <Text style={User_Function_Bar_style.text_description}>{this.props.description}</Text>
        </View>
      </TouchableOpacity>
      )
    }
  }
}
const User_Function_Bar_style = StyleSheet.create({
  container:{
    height: 45,
    marginTop:10,
    marginBottom:10,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center"
  },
  text_description_container:{
    width:(width - 30) * 0.8
  },
  text_description:{

  },
  switch_container:{
    width:(width - 30) * 0.2,
    flexDirection:"row",
    justifyContent:"flex-end",
    alignItems:"center"
  }
})

export const RedDot = (props) => {
  switch (true){
    case (props.number >= 1000):
      RedDotWidth = 32
      RedDotBorderRadius = 32 / 2
      RedDotHeight = 18
      break;
    case (props.number < 1000 && props.number >= 100 ):
      RedDotWidth = 35
      RedDotBorderRadius = 35 / 2
      RedDotHeight =  18
      break;
    case (props.number < 100 && props.number >= 10 ):
      RedDotWidth = 28
      RedDotBorderRadius = 28 / 2
      RedDotHeight =  18
      break;
    case (props.number < 10 && props.number >= 0 ):
      RedDotHeight = 18
      RedDotBorderRadius = 18 / 2
      RedDotWidth =  18
      break;
  }
  if(props.number > 0){
    return (
      <View style={[RedDot_style.container,{left:props.left,right:props.right,top:props.top,bottom:props.bottom,width:RedDotWidth,
      height:RedDotHeight,borderRadius:RedDotBorderRadius}]}> 
        <Text style={RedDot_style.number}>{props.number >= 1000?"....":"" + props.number}</Text>
      </View>
    )
  }else{
    return(null)
  }
}

const RedDot_style = StyleSheet.create({
  container:{
    position:"absolute",
    backgroundColor:COLOR_RedDot["container"],
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center"
  },
  number:{
    fontSize:12,
    color:COLOR_RedDot["number"],
    backgroundColor:COLOR_RedDot["number_background"],
    fontWeight:"600"
  }
})

