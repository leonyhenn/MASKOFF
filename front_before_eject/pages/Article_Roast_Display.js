/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x0. 检查purpose
  x1. 检查console.error
  2. 检查network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  x6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  x7. 解决flatlist 不render spinner的问题
  x8. 解决article的评论
  x9. 解决评论区的头像
  x10. 给article加上评论和like
  x11. implement like 和评论
  x12. performance on articles
  x13. Spinner?
  x14. multithread read, 解决502问题
  x15. MO_Alert(安装 未检查)
  2019.Jan.06
  
  x0. BackHandler

  x将所有setState / dispatch改为async/await, 取消所有除了show:false之外的取消设定
  x重新测试
  2019.Jan.17
*/
//official modules
import React, { Component } from 'react';
import { View,
         Text,
         Keyboard,
         Platform,
         ScrollView,
         StyleSheet,
         Dimensions,
         BackHandler,
         TouchableOpacity, } from 'react-native';

import { ImagePicker,
         Permissions } from 'expo'

import uuid from 'uuid'

//Spinner
import { DisplayCard_masker_full_spinner,
         DisplayCard_roast_full_spinner,
         Comment_image_spinner,
         Comment_text_spinner } from '../components/Svg_Spinners.js'

//MASKOFF custom modules
import { MASKOFFStatusBar,
         ButtonHeader,
         DisplayCard_roast_full,
         DisplayCard_masker_full,
         Comments_container } from '../components/Modules.js';
import { CustomComposer } from '../components/Comments_Modules.js'
import MO_Alerts from '../components/MO_Alerts.js'

//redux modules
import { connect } from 'react-redux';
import { store } from '../store/store.js';
import { addConversation,
         loadPostMasker,
         loadPostRoast } from '../store/actions.js';

//popover menu
import { Menu,
         MenuProvider,
         MenuOptions,
         MenuOption,
         MenuTrigger,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers

//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         getPermission } from '../utility/Util.js';

//HttpRequests
import { Like,
         Dislike,
         Follow,
         Unfollow,
         getComments,
         deleteRoast,
         deleteArticle,
         getArticleByAid,
         sendComment,
         chatImageMax2048 } from '../utility/HttpRequests.js'

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';
import {  WaveIndicator } from 'react-native-indicators';

//Languages
import { Lan } from '../utility/Languages.js';

//Dropdown Alert
import DropdownAlert from 'react-native-dropdownalert';
import { notifications } from '../components/Dropdown_Alert_helpers.js'

//colors
import { THEME_COLOR,
         TRANSPARENT,
         BACKGROUND_COLOR,
         STATUS_BAR_COLOR,
         COLOR_HEADER_TEXT,
         SEPERATE_BAR_COLOR,
         STANDARD_BORDER_COLOR,
         COLOR_Article_Roast_Display } from '../utility/colors.js'

const COMMMENT_IMAGE_HEIGHT = 100 + 20

class Article_Roast_Display extends Component{
  constructor(props){
    super(props)
    this.state={
      input:'',
      selection:0,
      loading:true,
      isOpen: false,
      selectedItem: 'About',
      fetchComments:false,
      show:false,
      type:undefined,
      message:undefined,
      title:undefined,
      caller:undefined,
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
    
    this.info=this.props.navigation.getParam("info")
    this.purpose = this.props.navigation.getParam("purpose")
    
    this.back=this.back.bind(this)
    this.like=this.like.bind(this)
    this.retry=this.retry.bind(this)
    this.follow=this.follow.bind(this)
    this.toggle = this.toggle.bind(this)
    this.dislike=this.dislike.bind(this)
    this.unfollow=this.unfollow.bind(this)
    this.onScroll=this.onScroll.bind(this)
    this.clearText=this.clearText.bind(this)
    this.handleMenu=this.handleMenu.bind(this)
    this.renderMenu=this.renderMenu.bind(this)
    this.make_comment=this.make_comment.bind(this)
    this.send_comment=this.send_comment.bind(this)
    this.remove_image=this.remove_image.bind(this)
    this.imageOnPress=this.imageOnPress.bind(this)
    this.onChangeText=this.onChangeText.bind(this)
    this.onEndReached=this.onEndReached.bind(this)
    this.notification=this.notification.bind(this)
    this.renderSpinner=this.renderSpinner.bind(this)
    this.EmojiCallback=this.EmojiCallback.bind(this)
    this.vote_callback=this.vote_callback.bind(this)
    this.talk_to_author=this.talk_to_author.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    this._keyboardDidShow=this._keyboardDidShow.bind(this) 
    this._keyboardDidHide=this._keyboardDidHide.bind(this)
    this.onInputSizeChanged=this.onInputSizeChanged.bind(this)
    this.setEmojiModalVisible=this.setEmojiModalVisible.bind(this)
    this.fetchFurtherComments=this.fetchFurtherComments.bind(this)
    this.check_same_user_author=this.check_same_user_author.bind(this) 
    this.firstGetArticleComment=this.firstGetArticleComment.bind(this)
    this.renderNotificationBarImage=this.renderNotificationBarImage.bind(this)
    this.author_same_update_article=this.author_same_update_article.bind(this)
    this.author_same_delete_article=this.author_same_delete_article.bind(this)
    
    this.unmount=false
    this.firstCommentsFetchDone = false
    this.onEndReachedCalledDuringMomentum = true;
    this.index = 0;
    this.offset = 0;

    
    global.keyboardHeight = null
    
    
  }

  componentWillUnmount(){
    this.unmount=true
    Keyboard.removeListener('keyboardDidShow', this._keyboardDidShow);
    Keyboard.removeListener('keyboardDidHide', this._keyboardDidHide);
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  _handleBackPress(){
    this.back()
    return true 
  }

  async _firstConnect(){
    if(!this.unmount){
      await this.setState({show:false,caller:undefined})
    }
    switch(this.purpose){
      case "searchMasker":
        response = await getArticleByAid(this.info["aid"])
        if(response == false){
          //说明前面出现了error, 需要重连
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',caller:"_firstConnect"})},100)
          }
        }else if(response.ok){
          json = await response.json()  
          this.article = await json["article"]
          this.comments = []
          if(!this.unmount){
            await this.setState({loading:false})  
          }
        }else if(response.status == 401){Z
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',caller:"_firstConnect"})},100)
          }
          return
        }

      break;
      case "searchRoast":
        this.roast = this.info
        this.comments = []
        if(!this.unmount){
          await this.setState({loading:false})
        }
        response = await getComments(global.server + "/comments/" + this.roast.rid + "/ROASTS/" + "0")
        if(response == false){
          //说明前面出现了error, 需要重连
        }else if(response.ok){
          json = await response.json()  
          this.comments = await json["comments"]
          this.index = await json["index"]
          for (var i=0;i<this.comments.length;i++){
            this.comments[i]["key"] = i.toString()
          }
          this.firstCommentsFetchDone = true
          if(!this.unmount){
            await this.setState({})
          }
        }else if(response.status == 401){
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          return
        }
      break;
    }
  }

  async componentWillMount(){
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', this._keyboardDidShow);
    this.keyboardDidShowListener = Keyboard.addListener('keyboardDidHide', this._keyboardDidHide);
    await this._firstConnect()
  }

  async firstGetArticleComment(){
    response = await getComments(global.server + "/comments/" + this.info["aid"] + "/ARTICLES/" + "0")
    if(response == false){
      //说明前面出现了error, 需要重连
    }else if(response.ok){
      json = await response.json()  
      this.comments = await json["comments"]
      this.index = await json["index"]
      for (var i=0;i<this.comments.length;i++){
        this.comments[i]["key"] = i.toString()
      }
      this.firstCommentsFetchDone = true
      if(!this.unmount){
        await this.setState({})  
      }
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      //如果response不ok, 让用户重连试试
      return
    }
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

  async componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
    switch(this.purpose){
      case "searchMasker":
        await this.firstGetArticleComment()
      break;
    }
  }
  
  async toggle() {
    if(!this.unmount){
      await this.setState({
        isOpen: !this.state.isOpen,
      });
    }
  }

  async updateMenuState(isOpen){
    if(!this.unmount){
      await this.setState({ isOpen });
    }
  }

  onMenuItemSelected = async (item) => {
    if(!this.unmount){
      await this.setState({
        isOpen: false,
        selectedItem: item,
      });
    }
  }
  
  back(){
    this.props.navigation.goBack()
  }

  check_same_user_author(purpose){
    if(purpose=="searchMasker"){
      if(this.article["author_uid"] == global.uid){
        return true
      }
      return false
    }else if(purpose=="searchRoast"){
      if(this.roast["author_uid"] == global.uid){
        return true
      }
      return false
    }
  }

  async author_same_update_article(){
    if(!this.unmount){
      await this.setState({isOpen:false})
    }
    if(this.purpose == "searchMasker"){
      await store.dispatch(loadPostMasker(this.article))
      this.props.navigation.navigate("Post_alias_post_article",{purpose:"updateArticle",name:this.article["name"],aid:this.article["aid"]})
    }else if(this.purpose == "searchRoast"){
      await store.dispatch(loadPostRoast(this.roast))    
      this.props.navigation.navigate("Post_title",{purpose:"updateRoast",rid:this.roast["rid"]})
    }
  }

  async talk_to_author(){
    if(!this.unmount){
      await this.setState({isOpen:false,show:false,caller:undefined})
    }
    if(this.check_same_user_author(this.purpose)){
      if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:Lan['You_Are_The_Author'],title:Lan['Wait']})},100)
      }
    }else{
      conversation = await global.IMClient.createConversation({
        members: ['Tom'],
        name: 'Tom & Jerry',
        unique: true
      })
      await store.dispatch(addConversation(conversation))
      await this.props.navigation.navigate("Chat",{
                                           maskname:this.article["author_uid"],
                                           mode:"modal",
                                           conversation:conversation})
    }
  }
  async author_same_delete_article(purpose){
    if(!this.unmount){
      await this.setState({isOpen:false,show:false,caller:undefined})
    }
    switch(this.purpose){
      case "searchMasker":
        response = await deleteArticle(this.article.aid)
        if(response == false){
          //说明前面出现了error, 需要重连
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',caller:"author_same_delete_article"})},100)
          }
        }else if(response.ok){
          json = await response.json()  
          return
        }else if(response.status == 401){
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',caller:"author_same_delete_article"})},100)
          }
          return
        }
      break;
      case "searchRoast":
        response = await deleteRoast(this.roast.rid)
        if(response == false){
          //说明前面出现了error, 需要重连
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',caller:"author_same_delete_article"})},100)
          }
        }else if(response.ok){
          json = await response.json()  
          return
        }else if(response.status == 401){
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          if(!this.unmount){
            setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',caller:"author_same_delete_article"})},100)
          }
          return
        }
      break;
    }
  }
  renderMenu(){
    switch(true){
      case this.purpose=="searchMasker" && this.check_same_user_author(this.purpose):
        return (<Menu onSelect={(value) => this.handleMenu(value)}
                                  renderer={Popover} 
                                  rendererProps={{ preferredPlacement: 'bottom' }}>
                              <MenuTrigger style={Article_Roast_Display_style.masker_menuTrigger} >
                                <Ionicons name="ios-menu"
                                            size={20}
                                            color={COLOR_HEADER_TEXT}/>
                              </MenuTrigger>
                              <MenuOptions style={Article_Roast_Display_style.masker_menuOptions}>
                                <MenuOption value={"Update_article"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['Update_article']}</Text>
                                </MenuOption>
                                <MenuOption value={"See_more"}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['See_more']}</Text>
                                </MenuOption>
                                <MenuOption value={"Delete_article"}>
                                  <Text style={{color: COLOR_Article_Roast_Display["delete"]}}>{Lan['Delete_article']}</Text>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>)
      break;
      case this.purpose=="searchMasker" && !this.check_same_user_author(this.purpose):
        return (<Menu onSelect={(value) => this.handleMenu(value,this.purpose)}
                                  renderer={Popover} 
                                  rendererProps={{ preferredPlacement: 'bottom' }}>
                              <MenuTrigger style={Article_Roast_Display_style.masker_menuTrigger} >
                                <Ionicons name="ios-menu"
                                            size={20}
                                            color={COLOR_HEADER_TEXT}/>
                              </MenuTrigger>
                              <MenuOptions style={Article_Roast_Display_style.masker_menuOptions}>
                                <MenuOption value={"Chat_author"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['Chat_author']}</Text>
                                </MenuOption>
                                <MenuOption value={"See_more"}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['See_more']}</Text>
                                </MenuOption>
                                <MenuOption value={"Test"}>
                                  <Text style={{color: THEME_COLOR}}>测试</Text>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>)
      break;
      case this.purpose=="searchRoast" && this.check_same_user_author(this.purpose):
        return (<Menu onSelect={(value) => this.handleMenu(value)}
                                  renderer={Popover} 
                                  rendererProps={{ preferredPlacement: 'bottom' }}>
                              <MenuTrigger style={Article_Roast_Display_style.masker_menuTrigger} >
                                <Ionicons name="ios-menu"
                                            size={20}
                                            color={COLOR_HEADER_TEXT}/>
                              </MenuTrigger>
                              <MenuOptions style={Article_Roast_Display_style.masker_menuOptions}>
                                <MenuOption value={"Update_article"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['Update_article']}</Text>
                                </MenuOption>
                                <MenuOption value={"Delete_article"}>
                                  <Text style={{color: COLOR_Article_Roast_Display["delete"]}}>{Lan['Delete_article']}</Text>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>)
      break;
      case this.purpose=="searchRoast" && !this.check_same_user_author(this.purpose):
        return (<Menu onSelect={(value) => this.handleMenu(value,this.purpose)}
                                  renderer={Popover} 
                                  rendererProps={{ preferredPlacement: 'bottom' }}>
                              <MenuTrigger style={Article_Roast_Display_style.masker_menuTrigger} >
                                <Ionicons name="ios-menu"
                                            size={20}
                                            color={COLOR_HEADER_TEXT}/>
                              </MenuTrigger>
                              <MenuOptions style={Article_Roast_Display_style.masker_menuOptions}>
                                <MenuOption value={"Chat_author"} customStyles={{optionWrapper:{borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR}}}>
                                  <Text style={{color: THEME_COLOR}}>{Lan['Chat_author']}</Text>
                                </MenuOption>
                                <MenuOption value={"Test"}>
                                  <Text style={{color: THEME_COLOR}}>测试</Text>
                                </MenuOption>
                              </MenuOptions>
                            </Menu>)
      break;
    }
  }
  renderSpinner(){
    switch(true){
      //1 1 1
      case (this.state.fetchComments && this.comments.length==0 && this.firstCommentsFetchDone == true):
        return (<TouchableOpacity style={Article_Roast_Display_style.empty_container}
                  onPress={this.purpose == "searchRoast"?
                  ()=>{this.make_comment({db_id:this.roast.rid,db_type:"ROASTS",parent_id:"0",reply_id:"0",cid:"0"})}:
                  ()=>{this.make_comment({db_id:this.article.aid,db_type:"ARTICLES",parent_id:"0",reply_id:"0",cid:"0"})
                }}
                  >
                  <Text style={Article_Roast_Display_style.empty_indicator}> {Lan["Empty_Comments"]} </Text>
                </TouchableOpacity>)
      break;
      //1 1 0
      case (this.state.fetchComments && this.comments.length==0 && !(this.firstCommentsFetchDone == true)):
        return (<TouchableOpacity
                  onPress={this.onEndReached}
                >
                 <Comment_image_spinner start={"1000"} end={"1265"} key={1}/>
                </TouchableOpacity>)
      break;
      //1 0 1
      case (this.state.fetchComments && !(this.comments.length==0) && this.firstCommentsFetchDone == true):
        return (<TouchableOpacity
                  onPress={this.onEndReached}
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
        return (<TouchableOpacity style={Article_Roast_Display_style.empty_container}
                  onPress={this.purpose == "searchRoast"?
                  ()=>{this.make_comment({db_id:this.roast.rid,db_type:"ROASTS",parent_id:"0",reply_id:"0",cid:"0"})}:
                  ()=>{this.make_comment({db_id:this.article.aid,db_type:"ARTICLES",parent_id:"0",reply_id:"0",cid:"0"})}}
                  >
                  <Text style={Article_Roast_Display_style.empty_indicator}> {Lan["Empty_Comments"]} </Text>
                </TouchableOpacity>)
      break;
      //0 1 0
      case (!(this.state.fetchComments) && this.comments.length==0 && !(this.firstCommentsFetchDone == true)):
        return (<TouchableOpacity
                  onPress={this.onEndReached}
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

  async retry(caller){
    switch(caller){
      case "_firstConnect":
        await this._firstConnect()
      break;
      case "author_same_delete_article":
        await this.author_same_delete_article()
      break;
    }
  }

  handleMenu(value){
    switch(value){
      case "See_more":
        this.more()
        break;
      case "Update_article":
        this.author_same_update_article()
        break;
      case "Delete_article":
        this.author_same_delete_article()
        break;
      case "Update_article":
        this.author_same_update_article()
        break;
      case "Chat_author":
        this.talk_to_author()
        break;
      case "Test":
        
        
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

  async more(){
    if(!this.unmount){
      await this.setState({isOpen:false})
    }
    this.props.navigation.push("Masker_Display_page",{"mid":this.info.mid})
  }

  async fetchFurtherComments(){
    if(!this.unmount){
      await this.setState({show:false,caller:undefined})
    }
    switch(this.purpose){
      case "searchMasker":
        response = await getComments(global.server + "/comments/" + this.info["aid"] + "/ARTICLES/" + this.index.toString())

        if(response == false){
          //说明前面出现了error, 需要重连
        }else if(response.ok){
          json = await response.json()  

          if (json["index"] > this.index){
            this.comments = await this.comments.concat(json["comments"])
            this.index = await json["index"]
            for (var i=0;i<this.comments.length;i++){
              this.comments[i]["key"] = i.toString()
            }
            if(!this.unmount){
              await this.setState({fetchComments:false})
            }
          }else if(json["index"] == -1){
            if(!this.unmount){
              await this.setState({fetchComments:false})
            }
          }
        }else if(response.status == 401){
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          return
        }
      break;
      case "searchRoast":
        response = await getComments(global.server+"/comments/"+this.roast.rid+"/ROASTS/"+this.index.toString())
        if(response == false){
          //说明前面出现了error, 需要重连
        }else if(response.ok){
          json = await response.json()  
          if (json["index"] > this.index){
            this.comments = await this.comments.concat(json["comments"])
            this.index = await json["index"]
            for (var i=0;i<this.comments.length;i++){
              this.comments[i]["key"] = i.toString()
            }
            if(!this.unmount){
              await this.setState({fetchComments:false})
            }
          }else if(json["index"] == -1){
            if(!this.unmount){
              await this.setState({fetchComments:false})
            }
          }
        }else if(response.status == 401){
          this.props.navigation.navigate("Login")
        }else{
          //如果response不ok, 让用户重连试试
          return
        }
      break;
    }
  }

  onEndReached = async ({ distanceFromEnd }) => {
    if(!this.unmount){
      await this.setState({fetchComments:false})
      if(!this.onEndReachedCalledDuringMomentum){
        await this.setState({fetchComments:true})
        await this.fetchFurtherComments()
        this.onEndReachedCalledDuringMomentum = true;
      }
    }
  }

  async like(object_type,object_id){
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

  async dislike(object_type,object_id){
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

  async follow(object_type,object_id){
    response = await Follow(object_type,object_id)
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

  async unfollow(object_type,object_id){
    response = await Unfollow(object_type,object_id)
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
        return <View style={Article_Roast_Display_style.notificationBarImage}><WaveIndicator color={COLOR_Article_Roast_Display['icons']['notification_bar']} waveMode='outline' size={25}/></View>
      break;
      case notifications['success'].type:
        return <View style={Article_Roast_Display_style.notificationBarImage}><Ionicons name="ios-checkmark" size={30} color={COLOR_Article_Roast_Display['icons']['notification_bar']}/></View>
      break;
      case notifications['error'].type:
        return <View style={Article_Roast_Display_style.notificationBarImage}><Ionicons name="ios-close" size={30} color={COLOR_Article_Roast_Display['icons']['notification_bar']}/></View>
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
    this.notification(notifications['warn'].type,"Commenting...")
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
    if(this.purpose == "searchRoast"){
      db_type = "ROASTS"
    }else if(this.purpose == "searchMasker"){
      db_type = "MASKERS"
    }


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
    if(response == false){
      //说明前面出现了error, 需要重连
      this.notification(notifications['error'].type,"Comment failed")
    }else if(response.ok){
      this.notification(notifications['success'].type,"Comment Success!")
      json = await response.json()  
      comment = await json["comment"]
      await this.props.navigation.navigate("View_Comment",{comment:comment,purpose:this.purpose})
    }else if(response.status == 401){
      this.notification(notifications['error'].type,"Comment failed")
    }else{
      this.notification(notifications['error'].type,"Comment failed")
    }
  }

  async vote_callback(situation){
    switch(situation){
      case "network": 
        message = Lan['No_Internet']
        title = ''
        break;
      case "success":
        message = Lan['Vote_success']
        title = ''
        break;
      case "conflict":
        message = Lan['Vote_conflict']
        title = Lan['Wait']
        break;
      case "empty_vote":
        message = Lan['Vote_empty']
        title = Lan['Wait']
        break;
    }
    if(!this.unmount){
      await this.setState({isOpen:false,show:false,caller:undefined})
    }
    if(!this.unmount){
        setTimeout(async ()=>{await this.setState({show:true,type:"Notice",message:message,title:title})},100)
      }
  }

  render(){
    
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
                               send_comment={this.send_comment}/>
        
    if(this.state.loading){
        spinners = []
        if(this.purpose == "searchMasker"){
          spinner_content=<DisplayCard_masker_full_spinner start={"0"} end={"925"}/>
        }else{
          spinner_content = <DisplayCard_roast_full_spinner start={"0"} end={"925"}/>
        }
        spinners.push(<Comment_image_spinner start={"1000"} end={"1265"} key={1}/>)
        spinners.push(<Comment_text_spinner start={"1265"} end={"1375"} key={2}/>)
        spinners.push(<Comment_image_spinner start={"1375"} end={"1640"} key={3}/>)
        spinners.push(<Comment_text_spinner start={"1640"} end={"1750"} key={4}/>)
        spinners.push(<Comment_image_spinner start={"1750"} end={"2015"} key={5}/>)
        
        return(
          <View style={{flex:1,backgroundColor:BACKGROUND_COLOR}}>
            {MASKOFFStatusBar({backgroundColor:STATUS_BAR_COLOR, 
                               barStyle:"dark-content"})}
            {ButtonHeader({layout:"searchMasker",
                          left_button_onPress:() => this.back(),
                          left_button_text:Lan["Back"],
                          right_button_text:Lan["More"]})}
            <ScrollView style={Article_Roast_Display_style.scroll_view}
                        contentContainerStyle={{flexDirection:"column",
                                                justifyContent:"flex-start",
                                                alignItems:'center'}}>
              {spinner_content}
              <View style={Article_Roast_Display_style.seperate_bar}/>
                <View style={Article_Roast_Display_style.header}>
                  <Text style={Article_Roast_Display_style.header_text}>
                    {Lan["Comments_section"]}
                  </Text>
                </View>
              
              {spinners}
            </ScrollView>
            <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   retry={async () => {await this.retry(this.state.caller)}}
                   showCancelButton={false}
                   title={this.state.title}
                   message={this.state.message}/>
          </View>)
      }else{
      menu = this.renderMenu()
        return(
            <View style={{backgroundColor:BACKGROUND_COLOR}}>
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
                                      header_card={this.purpose == "searchRoast"?<DisplayCard_roast_full 
                                                      info={this.info} 
                                                      comment_onPress={()=>{
                                                          this.make_comment({
                                                          db_id:this.roast.rid,
                                                          db_type:"ROASTS",
                                                          parent_id:"0",
                                                          reply_id:"0",
                                                          cid:"0",
                                                        })
                                                      }}
                                                      like={this.like}
                                                      dislike={this.dislike}
                                                      follow={this.follow}
                                                      unfollow={this.unfollow}
                                                      notification={this.notification}
                                                      navigation={this.props.navigation}
                                                      vote_callback={this.vote_callback}
                                                    />:<DisplayCard_masker_full 
                                                    article={this.article} 
                                                    comment_onPress={()=>{
                                                      this.make_comment({
                                                        db_id:this.article.aid,
                                                        db_type:"ARTICLES",
                                                        parent_id:"0",
                                                        reply_id:"0",
                                                        cid:"0",
                                                      })
                                                    }}
                                                    like={this.like}
                                                    dislike={this.dislike}
                                                    follow={this.follow}
                                                    unfollow={this.unfollow}
                                                    notification={this.notification}
                                                    navigation={this.props.navigation}
                                                    vote_callback={this.vote_callback}
                                                  />}
                                      purpose={this.purpose}
                                      onEndReached={this.onEndReached}
                                      onEndReachedThreshold={0.1}
                                      ListFooterComponent={this.renderSpinner}
                                      onMomentumScrollBegin={() => { this.onEndReachedCalledDuringMomentum = false; }}
                                      extraData={this.state.fetchComments}
                                      like={this.like}
                                      dislike={this.dislike}
                                      onScroll={this.onScroll}
                                      make_comment={this.make_comment}
                                      />
                    
                </View>
                {composer}
                <MO_Alerts show={this.state.show} 
                   type={this.state.type}
                   retry={async () => {await this.retry(this.state.caller)}}
                   showCancelButton={false}
                   title={this.state.title}
                   message={this.state.message}/>
                <DropdownAlert
                    ref={ref => this.dropdown = ref}
                    showCancel={false}
                    startDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
                    endDelta={STATUSBAR_HEIGHT+HEADER_HEIGHT}
                    replaceEnabled
                    updateStatusBar={false}
                    tapToCloseEnabled
                    panResponderEnabled
                    renderTitle={()=>{return(null)}}
                    renderImage={this.renderNotificationBarImage}
                    defaultContainer={{margin:0,  flexDirection: 'row',alignItems:"center", backgroundColor: TRANSPARENT, }}
                    defaultTextContainer={{ flex: 1, margin: 8 ,alignSelf: 'center', flexDirection:'row',alignItems:'center',justifyContent:"flex-start"}}
                    messageNumOfLines={3}
                    messageStyle={{fontSize: 12, textAlign: 'left', fontWeight: '400', color: COLOR_Article_Roast_Display['DropdownAlert']['text'], backgroundColor: TRANSPARENT}}
                    closeInterval={0}
                  />
            </View>
        )
    }
  }
}
const Article_Roast_Display_style = StyleSheet.create({
  scroll_view:{
    height:height - HEADER_HEIGHT - STATUSBAR_HEIGHT,
    width:width,
    backgroundColor:BACKGROUND_COLOR,
  },
  masker_menuOptions: {
    margin:10,
    marginTop:3,
    marginBottom:3
  },
  masker_menuTrigger: {
    margin: 5,
  },
  seperate_bar:{
    width:width,
    height:5,
    backgroundColor:SEPERATE_BAR_COLOR
  },
  header:{
    borderRadius:5,
    width:width,
    height:40,
    borderBottomWidth:1,
    borderColor:STANDARD_BORDER_COLOR,
    flexDirection:"row",
    justifyContent:"flex-start",
    alignItems:"center",
    backgroundColor:"white"
  },
  header_text:{
    fontWeight:"600",
    fontSize:17,
    color:COLOR_Article_Roast_Display["header_text"],
    marginLeft:10,
  },
  empty_container:{
    backgroundColor:'white',
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
  }
})

const getPropsFromState = state => ({
  conversations:state.conversations,
})

export default connect(getPropsFromState)(Article_Roast_Display)



