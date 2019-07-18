/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF, for everyone.

  TODO:
  x0. 检查purpose
  x0. MO_Alerts
  x1. 检查console.error
  x2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.13
  

  x把界面改成了timeline
  2019.April.27

  x0. BackHandler
*/
//official modules
import React, { Component } from 'react';
import { View,
         Text,
         Platform,
         Keyboard,
         StyleSheet,
         Dimensions,
         BackHandler,
         TouchableOpacity } from 'react-native';

import { ImagePicker,
         Permissions } from 'expo'

import uuid from 'uuid'

//native-base
import { Spinner } from 'native-base'

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ButtonHeader,
         Accordion,
         Accordion_Header,
         Accordion_Content,
         Comments_container } from '../components/Modules.js';
import { CustomComposer } from '../components/Comments_Modules.js'
import MO_Alerts from '../components/MO_Alerts.js'

//popover menu
import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers

//utilities
import { width,
         height, 
         getDate,
         HEADER_HEIGHT,
         getPermission,
         STATUSBAR_HEIGHT, } from '../utility/Util.js';

//HttpRequests
import { getComments,
         getMaskerByMid,
         Like,
         Dislike,
         sendComment,
         chatImageMax2048 } from '../utility/HttpRequests.js'

//Languages
import { Lan } from '../utility/Languages.js';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import {  WaveIndicator } from 'react-native-indicators';

//Sipnner
import { DisplayCard_masker_full_spinner,
         DisplayCard_roast_full_spinner,
         Comment_image_spinner,
         Comment_text_spinner } from '../components/Svg_Spinners.js'

//Dropdown Alert
import DropdownAlert from 'react-native-dropdownalert';
import { notifications } from '../components/Dropdown_Alert_helpers.js'

import { FILLING_COLOR,
         THEME_COLOR,
         TRANSPARENT,
         COLOR_ICON_SET,
         STATUS_BAR_COLOR,
         COLOR_HEADER_ICON,
         STANDARD_BORDER_COLOR,
         COLOR_Masker_Display_page } from '../utility/colors.js'

//Timeline
import Timeline from 'react-native-timeline-listview'

const COMMMENT_IMAGE_HEIGHT = 100 + 20

export default class Masker_Display_page extends Component{
  constructor(props){
    super(props)
    this.state={
      liked:false,
      show:false,
      type:undefined,
      message:undefined,
      title:undefined,
      caller:undefined,
      loading:true,
      isOpen: false,
      selectedItem: 'About',
      composer_show:false,
      MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
      inputSize:{height:44,width:0},
      EmojiModalVisible:false,
      comment_image:null,
      notificationBarType:undefined,
      make_comment:{
        original_comment:undefined,
        place_holder:undefined
      }
    }
    
    this.mid=this.props.navigation.getParam("mid")
    
    this.comments = []
    this.comments_index=0

    this.like=this.like.bind(this)
    this.back=this.back.bind(this)
    this.retry=this.retry.bind(this)
    this.toggle = this.toggle.bind(this);
    this.onScroll=this.onScroll.bind(this)
    this.clearText=this.clearText.bind(this)
    this.getMasker=this.getMasker.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
    this.renderMenu=this.renderMenu.bind(this)
    this.i_know_more=this.i_know_more.bind(this)
    this.make_comment=this.make_comment.bind(this)
    this.send_comment=this.send_comment.bind(this)
    this.onChangeText=this.onChangeText.bind(this)
    this.comment_like=this.comment_like.bind(this)
    this.onEndReached=this.onEndReached.bind(this)
    this.renderHeader=this.renderHeader.bind(this)
    this.imageOnPress=this.imageOnPress.bind(this)
    this.remove_image=this.remove_image.bind(this)
    this.renderSpinner=this.renderSpinner.bind(this)
    this.EmojiCallback=this.EmojiCallback.bind(this)
    this.comment_dislike=this.comment_dislike.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this) 
    this._keyboardDidHide=this._keyboardDidHide.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this.clickIntoArticle=this.clickIntoArticle.bind(this)
    this.onInputSizeChanged=this.onInputSizeChanged.bind(this)
    this.change_comment_image=this.change_comment_image.bind(this)
    this.setEmojiModalVisible=this.setEmojiModalVisible.bind(this)
    this.fetchFurtherComments=this.fetchFurtherComments.bind(this)
    this.firstGetMaskerComment=this.firstGetMaskerComment.bind(this)
    this.renderNotificationBarImage=this.renderNotificationBarImage.bind(this)

    this.liked = 0
    this.unmounted = false
    this.firstCommentsFetchDone = false
    this.onEndReachedCalledDuringMomentum = true;

    global.keyboardHeight = null
    
  }
  
  async toggle() {
    await this.setState({
      isOpen: !this.state.isOpen,
    });
  }

  async updateMenuState(isOpen) {
    await this.setState({ isOpen });
  }

  onMenuItemSelected = async (item) => {
    await this.setState({
      isOpen: false,
      selectedItem: item,
    });
  }
  
  async componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    await this.getMasker()
  }

  async getMasker(){
    if(!this.unmount){
      await this.setState({show:false,caller:undefined})
    }
    let response = await getMaskerByMid(this.mid)

    if(response == false){
      //说明前面出现了error, 需要重连
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',caller:"getMasker"})},100)
      }
    }else if(response.ok){
      let json = await response.json()
      this.masker = await json["masker"]
      this.liked = parseInt(this.masker.liked)
      this.articles = await this.masker["articles"]
      for(var i=0;i<this.articles.length;i++){
        cur = this.articles[i]
        this.articles[i] = {
          title:cur.author_nickname,
          description:Lan["Tag"] + ": " + cur.tags.join(" ") + "\n" + "\n" + Lan["As"] + ": " + cur.alias.join(" ") ,
          time:getDate(cur.post_date),
          info:cur
        }
      }
      if (!this.unmounted){    
        await this.setState({loading:false,liked:this.masker.user_liked})
      }
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',caller:"getMasker"})},100)
      }
      return
    }
  }

  async componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
    await this.firstGetMaskerComment()
  }

  async firstGetMaskerComment(){
    if(!this.unmount){
      await this.setState({show:false,caller:undefined})
    }
    response = await getComments(global.server+"/comments"+"/"+this.mid+"/MASKERS"+"/"+this.comments_index.toString())

    if(response == false){
      //说明前面出现了error, 需要重连
    }else if(response.ok){
      var json = await response.json()
      this.comments = await json["comments"]
      for (var i=0;i<this.comments.length;i++){
        this.comments[i]["key"] = i.toString()
      }
      this.comments_index = await json["index"]
      this.firstCommentsFetchDone = true
      if (!this.unmounted){
        await this.setState({})
      }
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return
    }
  }

  _handleBackPress(){
    this.back()
    return true
  }

  componentWillUnmount(){
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
    this.unmounted = true
  }

  _keyboardDidShow(e) {
    //get keyboard height
    // console.log("_keyboardDidShow")
    global.keyboardHeight = e.endCoordinates.height + Dimensions.get('screen').height - Dimensions.get('window').height
    // console.log("global.keyboardHeight",global.keyboardHeight)
  }

  _keyboardDidHide(e){
    // console.log("_keyboardDidHide")

  }
  
  back(){
    this.props.navigation.goBack()
  }
  
  async i_know_more(){
    authors = []
    for(var i=0;i<this.articles.length;i++){
      authors.push(this.articles[i].author_uid)
    }
    if(!authors.includes(global.uid)){
      this.props.navigation.navigate("Post_alias_post_article",{purpose:"postArticle",name:this.masker["name"],mid:this.masker["mid"]})  
    }else{
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['You_Are_The_Author'],title:Lan['Wait']})},100)
      }
    }
    await this.setState({isOpen:false}) 
  }

  onEndReached = async ({ distanceFromEnd }) => {
    if(!this.unmounted){
      await this.setState({fetchComments:false})
      if(!this.onEndReachedCalledDuringMomentum){
        await this.setState({fetchComments:true})
        await this.fetchFurtherComments()
        this.onEndReachedCalledDuringMomentum = true;
      }
    }  
  }

  async fetchFurtherComments(){
    if(!this.unmount){
      await this.setState({show:false})
    }
    response = await getComments(global.server+"/comments"+"/"+this.mid+"/MASKERS"+"/"+this.comments_index.toString())
    if(response == false){
      //说明前面出现了error, 需要重连
    }else if(response.ok){
      var json = await response.json()
      if (json["index"] > this.comments_index){
        this.comments = await this.comments.concat(json["comments"])
        this.comments_index = await json["index"]
        for (var i=0;i<this.comments.length;i++){
          this.comments[i]["key"] = i.toString()
        }
        if (!this.unmounted){
          await this.setState({fetchComments:false})
        }
      }
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return
    }
  }
  
  async like(){
    if(this.masker !== undefined){
      if(!this.state.liked){
        this.liked = this.liked + 1
        await this.setState({liked:true})
        response = await Like("MASKERS",this.masker.mid)
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
        response = await Dislike("MASKERS",this.masker.mid)
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
  }

  async comment_like(object_type,object_id){
    response = await Like(object_type,object_id)
    if(response == false){
      //说明前面出现了error, 需要重连
      return false
    }else if(response.ok){
      return response
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return false
    }
  }

  async comment_dislike(object_type,object_id){
    response = await Dislike(object_type,object_id)
    if(response == false){
      //说明前面出现了error, 需要重连
      return false
    }else if(response.ok){
      return response
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return false
    }
  }

  
  renderSpinner(){
    switch(true){
      //1 1 1
      case (this.state.fetchComments && this.comments.length==0 && this.firstCommentsFetchDone == true):
        return (<View style={Masker_Display_page_style.empty_container}>
                  <Text style={Masker_Display_page_style.empty_indicator}> {Lan["Empty_Comments"]} </Text>
                </View>)
      break;
      //1 1 0
      case (this.state.fetchComments && this.comments.length==0 && !(this.firstCommentsFetchDone == true)):
        return (<TouchableOpacity
                  onPress={this.fetchFurtherComments}
                >
                 <Comment_image_spinner start={"1000"} end={"1265"} key={1}/>
                </TouchableOpacity>)
      break;
      //1 0 1
      case (this.state.fetchComments && !(this.comments.length==0) && this.firstCommentsFetchDone == true):
        return (<TouchableOpacity
                  onPress={this.fetchFurtherComments}
                >
                 <Comment_image_spinner start={"1000"} end={"1265"} key={1}/>
                </TouchableOpacity>)
      break;
      //1 0 0
      case (this.state.fetchComments && !(this.comments.length==0) && !(this.firstCommentsFetchDone == true)):
        return (null)
      break;
      //0 1 1
      case (!(this.state.fetchComments) && this.comments.length==0 && this.firstCommentsFetchDone == true):
        return (<View style={Masker_Display_page_style.empty_container}>
                  <Text style={Masker_Display_page_style.empty_indicator}> {Lan["Empty_Comments"]} </Text>
                </View>)
      break;
      //0 1 0
      case (!(this.state.fetchComments) && this.comments.length==0 && !(this.firstCommentsFetchDone == true)):
        return (<TouchableOpacity
                  onPress={this.fetchFurtherComments}
                >
                 <Comment_image_spinner start={"1000"} end={"1265"} key={1}/>
                </TouchableOpacity>)
      break;
      //0 0 1
      case (!(this.state.fetchComments) && !(this.comments.length==0) && this.firstCommentsFetchDone == true):
        return (null)
      break;
      //0 0 0
      case (!(this.state.fetchComments) && !(this.comments.length==0) && !(this.firstCommentsFetchDone == true)):
        return (null)
      break;

    }
  }
  handleMenu(value){
    switch(value){
      case "I_know_more":
        this.i_know_more()
        break;
      case "Test":
        if(this.state.composer_show){
          this._textInput.blur()
          this.setState({composer_show:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
        }else{
          setTimeout(async()=>{
            if(global.keyboardHeight == null){
              this.setState({composer_show:true})
              if(this.state.comment_image){
                setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT}),500)
              }else{
                setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height}),500)
              }
              
            }else{
              if(this.state.comment_image){
                this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT})  
              }else{
                this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height})  
              }
              
            }
            
            this._textInput.focus()
          },500)
        }
        break;
    }
  }
  
  renderHeader(){
    return(
      <View style={{marginLeft:20,marginRight:20}}>
        <Timeline 
          style={Masker_Display_page_style.list}
          data={this.articles}
          circleSize={20}
          circleColor={THEME_COLOR}
          innerCircle={'dot'}
          lineColor={THEME_COLOR}
          timeContainerStyle={{minWidth:52,}}
          timeStyle={{textAlign: 'center', backgroundColor:'#ff9797', color:'white', padding:5, borderRadius:13}}
          descriptionStyle={{color:'gray'}}
          options={{
            style:{paddingTop:5}
          }}
          onEventPress={this.clickIntoArticle}                    
          separator={false}
          detailContainerStyle={{marginBottom: 20, paddingLeft: 5, paddingRight: 5, backgroundColor: "#BBDAFF", borderRadius: 10}}
          columnFormat='two-column'
        />
        <View style={Masker_Display_page_style.status_bar}>
          <TouchableOpacity style={[Masker_Display_page_style.button,{marginRight:10}]} onPress={this.make_comment}>
            <Ionicons name="ios-text" size={20} color={COLOR_ICON_SET["ios-text-DisplayCard_roast_full"]}/>
            <Text style={Masker_Display_page_style.number}> 
              {this.masker.comments_count}
            </Text> 
          </TouchableOpacity>
          
          <TouchableOpacity style={[Masker_Display_page_style.button,{marginLeft:10}]} onPress={this.like}>
            <Ionicons name="ios-thumbs-up" size={20} color={this.state.liked? COLOR_ICON_SET["ios-thumbs-up-DisplayCard_roast_full"]:COLOR_ICON_SET["ios-thumbs-not-up-DisplayCard_roast_full"]}/>
            <Text style={Masker_Display_page_style.number}> 
              {this.masker.liked}
            </Text>
          </TouchableOpacity>
          
        </View>
      </View>
    )
  }

  clickIntoArticle(data){
    this.props.navigation.push("Article_Roast_Display",{info:data.info,purpose:"searchMasker"})

  }

  renderMenu(){
    if(!this.state.loading){
      return (
        <Menu onSelect={(value) => this.handleMenu(value)}
              renderer={Popover} 
              rendererProps={{ preferredPlacement: 'bottom' }}>
          <MenuTrigger style={Masker_Display_page_style.masker_menuTrigger} >
            <Ionicons name="ios-menu"
                        size={20}
                        color={COLOR_HEADER_ICON}/>
          </MenuTrigger>
          <MenuOptions style={Masker_Display_page_style.masker_menuOptions}>
            <MenuOption value={"Talk_to_group"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
              <Text style={{color: THEME_COLOR}}>{Lan['Talk_to_group']}</Text>
            </MenuOption>
            <MenuOption value={"I_know_more"}>
              <Text style={{color: THEME_COLOR}}>{Lan['I_know_more']}</Text>
            </MenuOption>
            <MenuOption value={"Test"}>
              <Text style={{color: THEME_COLOR}}>测试</Text>
            </MenuOption>
          </MenuOptions>
        </Menu>
      )
    }else{
      return (null)
    }
  }
  async retry(caller){
    switch(caller){
      case "getMasker":
        await this.getMasker()
      break;
    }
  }

  onInputSizeChanged(newSize){
    if(!this.unmount){
      if(newSize.height < 44){
        if(this.state.composer_show){
          if(this.state.comment_image){
            this.setState({inputSize :{height:44,width:newSize.width} ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - 44 - COMMMENT_IMAGE_HEIGHT})
          }else{
            this.setState({inputSize :{height:44,width:newSize.width} ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - 44 })  
          }
          
        }else{
          
        }
        
      }else{
        if(this.state.composer_show){
          if(this.state.comment_image){
            this.setState({inputSize :newSize ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - newSize.height - COMMMENT_IMAGE_HEIGHT})  
          }else{
            this.setState({inputSize :newSize ,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - newSize.height })  
          }
        }else{
          
        }
        
      }
    }
  }

  async setEmojiModalVisible(value,caller){
    if(!this.unmount){
      if(value == false && caller == "textinputBlur"){
        if(this.state.EmojiModalVisible){
          
        }else{
          await this.setState({EmojiModalVisible:false,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT})
        }
        
      }
      else if(value == true && caller == "toolbar"){
        if(this.state.EmojiModalVisible){
          await this.setState({EmojiModalVisible:false}) 
          this._textInput.focus()  
        }else{
          await this.setState({EmojiModalVisible:true}) 
          this._textInput.blur()  
        }
      }else if(value == false && caller == "textinput"){
          await this.setState({EmojiModalVisible:false})  
      }
    }
  }

  onScroll(){
    this._textInput.blur()
    this.setState({composer_show:false,EmojiModalVisible:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
  }

  async EmojiCallback(emoji){
    if(!this.unmount){
      //set emoji selected to input value, and move cursor 1 pos back
      await this.setState({input:[this.state.input.slice(0, this.state.selection), emoji, this.state.input.slice(this.state.selection)].join(''),selection:this.state.selection + emoji.length})  
    }
    
  }

  clearText(){
    this.onChangeText('')
    if (Platform.OS === 'ios') {
      this._textInput.setNativeProps({ text: ' ' });
    }
    setTimeout(() => {
      this._textInput.setNativeProps({ text: '' });
    },5);
  }

  async onChangeText(text,selection=null){
    //get newest cursor and input value
    if(!this.unmount){
      if(selection == null){
        await this.setState({input:text})
      }else{
        await this.setState({selection:selection})
      }
    }
  }
  async imageOnPress(){
      var old_MainViewHeight = this.state.MainViewHeight
      
      this.onScroll()
      setTimeout(async()=>{
        response = await getPermission(Permissions.CAMERA_ROLL)
        if(!response){
          return
        }

        let result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes:ImagePicker.MediaTypeOptions.Images,
          exif:false
        });
        if(!result.cancelled){
          file_id = uuid.v4()
          
          temp = result.uri.split(".")  
          extention = temp[temp.length - 1]
          new_file_name = file_id + "." + extention
          file = result.uri
          
          // this.props.onSend({image:file,filename:new_file_name})
          this._textInput.focus()
          await this.setState({composer_show:true,comment_image:file,MainViewHeight:old_MainViewHeight - COMMMENT_IMAGE_HEIGHT})
          
        }
      },500)
  }

  async remove_image(){
    await this.setState({MainViewHeight:this.state.MainViewHeight + COMMMENT_IMAGE_HEIGHT,comment_image:null})  
    
  }

  async notification(type,message){
    this.dropdown.alertWithType(type,
                                null,
                                message);
    await this.setState({notificationBarType:type})
  }

  renderNotificationBarImage(){
    switch(this.state.notificationBarType){
      case notifications['warn'].type:

        return <View style={Masker_Display_page_style.notificationBarImage}><WaveIndicator color={COLOR_Masker_Display_page["NotificationBar"]["icon"]} waveMode='outline' size={25}/></View>
      break;
      case notifications['success'].type:
        return <View style={Masker_Display_page_style.notificationBarImage}><Ionicons name="ios-checkmark" size={30} color={COLOR_Masker_Display_page["NotificationBar"]["icon"]}/></View>
      break;
      case notifications['error'].type:
        return <View style={Masker_Display_page_style.notificationBarImage}><Ionicons name="ios-close" size={30} color={COLOR_Masker_Display_page["NotificationBar"]["icon"]}/></View>
      break;
      default:
       return (null)
    }
  }

  make_comment(comment){
    if(this.state.make_comment.original_comment !== undefined && "cid" in this.state.make_comment.original_comment){
      if(this.state.make_comment.original_comment["cid"] !== comment.cid){
        this.setState({comment_image:null,input:'',place_holder:undefined})
      }
    }
    var place_holder = undefined
    if('content' in comment){
      switch(true){
        case (comment.content[0].type.includes("text") || comment.content[0].type.includes("Text")):
          place_holder = " " + Lan["Reply"] + " " +comment.nickname+" : "+comment.content.filename
          if(place_holder.length > 15){
            place_holder = place_holder.substring(0,15) + "..."
          }
        break;
        case (comment.content[0].type.includes("image") || comment.content[0].type.includes("Image")):
          place_holder = " " + Lan["Reply"] + " " +comment.nickname+" : "+comment.content.filename
        break;
      }
    }
    
    this.setState({make_comment:{
      original_comment:comment,
      place_holder:place_holder
    }})
    if(this.state.composer_show){
      this._textInput.blur()
      this.setState({composer_show:false,MainViewHeight:height- STATUSBAR_HEIGHT - HEADER_HEIGHT})
    }else{
      setTimeout(async()=>{
        if(global.keyboardHeight == null){
          this.setState({composer_show:true})
          if(this.state.comment_image){
            setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT}),500)
          }else{
            setTimeout(()=>this.setState({MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - global.keyboardHeight - this.state.inputSize.height}),500)
          }
          
        }else{
          if(this.state.comment_image){
            this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height - COMMMENT_IMAGE_HEIGHT})  
          }else{
            this.setState({composer_show:true,MainViewHeight:height - STATUSBAR_HEIGHT - HEADER_HEIGHT- global.keyboardHeight - this.state.inputSize.height})  
          }
          
        }
        this._textInput.focus()
      },500)
    }
  }

  async send_comment(comment,original_comment){
    this.onScroll()
    body = []
    if(this.state.comment_image){
      this.notification(notifications['warn'].type,"Uploading image...")
      response = await chatImageMax2048(this.state.comment_image)
      if(response == "getPackSize_error"){
        this.notification(notifications['error'].type,"File cannot be found")
      }else if(response == false){
        //说明前面出现了error, 需要重连
        this.notification(notifications['error'].type,"Comment failed")
      }else if(response.ok){
        json = await response.json()
        var filename = json["filename"]
        body.push({"type":"image/jpg",filename:filename})
        if(!comment == ''){
          body.push({"type":"text/plain",filename:comment})
        }
      }else if(response.status == 401){
        this.notification(notifications['error'].type,"Comment failed")
      }else{
        this.notification(notifications['error'].type,"Comment failed")
      }
    }else{
      if(!comment.trim() == ''){
        body.push({"type":"text/plain",filename:comment})
      }else{
        return
      }
    }

    var db_type
    db_type = "MASKERS"


    original_comment_info = {}

    //parent_id
    if(original_comment.parent_id == "0"){
      original_comment_info["parent_id"] = original_comment.cid
    }else{
      original_comment_info["parent_id"] = original_comment.parent_id
    }

    //reply_id
    original_comment_info["reply_id"] = original_comment.cid

    //db_id
    original_comment_info["db_id"] = original_comment.db_id

    response = await sendComment(original_comment_info,body,db_type)
    // console.log(response)
    if(response == false){
      //说明前面出现了error, 需要重连
      this.notification(notifications['error'].type,"Comment failed")
    }else if(response.ok){
      this.notification(notifications['success'].type,"Comment Success!")
      
    }else if(response.status == 401){
      this.notification(notifications['error'].type,"Comment failed")
    }else{
      this.notification(notifications['error'].type,"Comment failed")
    }
  }
  async change_comment_image(comment_image){
    await this.setState({comment_image:comment_image})
    await this._textInput.focus()
  }
  render(){
    if(this.state.loading){    
      return(
        <View style={{flex:1}}>
          {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                             barStyle:"dark-content"})}
          {ButtonHeader({layout:"searchMasker",
                        left_button_onPress:() => this.back(),
                        left_button_text:Lan["Back"]})}
          <View style={[Masker_Display_page_style.scroll_view,{justifyContent:"center"}]}>
            <Spinner color='#C4C4C4'/>
          </View>
          <MO_Alerts show={this.state.show} 
                     type={this.state.type}
                     showCancelButton={false}
                     title={this.state.title}
                     message={this.state.message}
                     retry={async () => {await this.retry(this.state.caller)}}/>
        </View>
      )
    }else{
      menu = this.renderMenu()
      composer = <CustomComposer setRef={el => this._textInput = el}
                               onInputSizeChanged={this.onInputSizeChanged}
                               setEmojiModalVisible={this.setEmojiModalVisible}
                               modalVisible={this.state.EmojiModalVisible}
                               EmojiCallback={this.EmojiCallback}
                               input={this.state.input}
                               onChangeText={this.onChangeText}
                               clearText={this.clearText}
                               imageOnPress={this.imageOnPress}
                               comment_image={this.state.comment_image}
                               remove_image={this.remove_image}
                               place_holder={this.state.make_comment.place_holder}
                               comment={this.state.make_comment.original_comment}
                               send_comment={this.send_comment}
                               navigation={this.props.navigation}
                               change_comment_image={this.change_comment_image}/>
      return(
          <View style={{backgroundColor:FILLING_COLOR}}>
              {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                                 barStyle:"dark-content"})}
              {ButtonHeader({layout:"searchMasker",
                            left_button_onPress:() => this.back(),
                            left_button_text:Lan["Back"],
                            right_button:menu})}
              <View style={{height:this.state.MainViewHeight,
                              width:width,
                              flexDirection:"column",
                              alignItems:'center',
                              justifyContent:'flex-start'}}>
              <Comments_container comments={this.comments} 
                                  navigation={this.props.navigation}
                                  header_card={this.renderHeader()}
                                  purpose={this.purpose}
                                  onEndReached={this.onEndReached}
                                  onEndReachedThreshold={0.1}
                                  ListFooterComponent={this.renderSpinner}
                                  onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                                  extraData={this.state}
                                  like={this.comment_like}
                                  dislike={this.comment_dislike}
                                  onScroll={this.onScroll}
                                  make_comment={this.make_comment}
                                  notification={this.notification}
                                  />
              </View>
              {composer}
              <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   showCancelButton={false}
                   title={this.state.title}
                   message={this.state.message}
                   retry={async () => {await this.retry(this.state.caller)}}/>
              <DropdownAlert
                ref={ref => this.dropdown = ref}
                showCancel={false}
                startDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
                endDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
                updateStatusBar={false}
                replaceEnabled
                tapToCloseEnabled
                panResponderEnabled
                renderTitle={()=>{return(null)}}
                renderImage={this.renderNotificationBarImage}
                defaultContainer={{margin:0,  flexDirection: 'row',alignItems:"center", backgroundColor: TRANSPARENT }}
                defaultTextContainer={{ flex: 1, margin: 8 ,alignSelf: 'center', flexDirection:'row',alignItems:'center',justifyContent:"flex-start"}}
                messageNumOfLines={3}
                messageStyle={{fontSize: 12, textAlign: 'left', fontWeight: '400', color: COLOR_Masker_Display_page["DropdownAlert"]["text"], backgroundColor: TRANSPARENT}}
                closeInterval={0}
              />
          </View>
      )
    }
  }
}
const Masker_Display_page_style = StyleSheet.create({
  scroll_view:{
    height:height - HEADER_HEIGHT - STATUSBAR_HEIGHT,
    width:width,
    backgroundColor:FILLING_COLOR,
    flexDirection:"column",
    alignSelf:"center",
    justifyContent:"center",
    alignItems:"center",
    
  },
  content_wrapper:{
    marginTop:10,
    width:width - 20,
    backgroundColor:FILLING_COLOR,
    borderRadius:15,
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:5,
    marginBottom:5,
    marginLeft:5,
    marginRight:5,
    width:(width  - 20),
  },
  button:{
    margin:5
  },
  number:{
    fontSize:13,
    color:COLOR_Masker_Display_page["number"]
  },
  masker_menuOptions: {
    paddingHorizontal:10,
    paddingVertical:3
  },
  masker_menuTrigger: {
    padding: 5,
  },
  explanation:{
    backgroundColor:COLOR_Masker_Display_page["explanation"],
    padding:10,
    
  },
  empty_container:{
    backgroundColor:COLOR_Masker_Display_page["empty_container"],
    borderRadius:5,
    flexDirection:"row",
    justifyContent:"center",
    alignItems:"center",
    height: height * 1/4,
  },
  empty_indicator:{
    fontSize:15,
    color:THEME_COLOR
  },
  notificationBarImage:{
    height:30,
    width:30,
    margin: 3,
    alignSelf: 'center', 
    flexDirection:'row',
    alignItems:'center',
    justifyContent:"center"
  },
  list: {
    flex: 1,
    marginTop:20,
  },
  status_bar:{
    flexDirection:"row",
    alignItems:"center",
    justifyContent:"flex-start",
    backgroundColor:TRANSPARENT,
    marginTop:200 * (2.5 / 100),
    marginBottom:200 * (2.5 / 100),
    marginLeft:5,
    marginRight:5,
    width:width  - 20,

    //test
    // borderWidth:1,
    
  },
  button:{
    margin:5,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center"
  },

})




