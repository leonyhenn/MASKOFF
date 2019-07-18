/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  x0. 检查 purpose
  x1. 检查 console.error
  x2. 检查 network failure
  x3. 中英文
  x4. 实机测验
  5. 墙
  6. 去掉不需要的 import, console.log , setTimeout 和 comments, 整理code
  7. Spinner
  2019.Feb.4
  
  x0. BackHandler
*/

//official modules
import React,{ Component } from 'react';
import { View,
         Text,
         Keyboard,
         FlatList,
         ScrollView,
         StyleSheet,
         BackHandler, } from 'react-native';
import MO_Alerts from '../components/MO_Alerts.js'

//MASKOFF custom modules
import { SearchBarHeader,
         MASKOFFStatusBar,
         DisplayCard_roast,
         DisplayCard_masker,
         SearchReminderContainer,
         SearchRecommendContainer } from '../components/Modules.js';

//utilities
import { width,
         height, 
         HEADER_HEIGHT,
         STATUSBAR_HEIGHT } from '../utility/Util.js';
import { SearchMaskers,
         SearchRoasts } from "../utility/HttpRequests"

//redux modules
import { connect } from 'react-redux'
import { store } from '../store/store.js';
import { searchKeyword,
         newSearchResults,
         addToSearchResults } from '../store/actions.js';

//Languages
import { Lan } from '../utility/Languages.js';

// Spinners
import { DisplayCard_roast_image_spinner,
         DisplayCard_masker_text_spinner } from '../components/Svg_Spinners.js'

import { FILLING_COLOR,
         BACKGROUND_COLOR,
         STATUS_BAR_COLOR,
         COLOR_Search_n_Recommend,
         THEME_COLOR } from '../utility/colors.js'

class Search_n_Recommend extends Component {
  constructor(props){
    super(props)
    this.state={
      submited:false,
      index:0,
      show:false,
      title:'',
      message:'',
      isSearching:false,
      retry_caller:undefined
    }
    
    this.purpose = this.props.navigation.getParam("purpose")

    this.retry=this.retry.bind(this)
    this.submit=this.submit.bind(this)
    this.cancel=this.cancel.bind(this)
    this.search=this.search.bind(this)
    this._onRefresh=this._onRefresh.bind(this)
    this.viewDetail=this.viewDetail.bind(this)
    this.renderSpinner=this.renderSpinner.bind(this)
    this.pressTextInput=this.pressTextInput.bind(this)
    this.searchByKeyword=this.searchByKeyword.bind(this)
    this._handleBackPress=this._handleBackPress.bind(this)
    
  }

  async submit(){
    await this.setState({submited:true})
    this.search()
    Keyboard.dismiss()
  }

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }

  async componentDidUpdate(prevProps){
    if (this.props.search[0] !== prevProps.search[0]) {
      if (!this.state.submited){
        await this.setState({index:0})
      }
    }
  }

  renderSpinner(){
    if(this.purpose == "searchRoast" && this.state.isSearching){
      return <DisplayCard_roast_image_spinner  start={"0"} end={"395"}/>
    }else if(this.purpose == "searchMasker" && this.state.isSearching){
      return <DisplayCard_masker_text_spinner start={"0"} end={"125"}/>
    }
    return null
  }

  _handleBackPress(){
    this.cancel()
    return true
  }

  async search(){
    this.setState({isSearching:true,show:false,retry_caller:undefined})
    if (this.props.search[0].trim() == ""){
      return
    }
    keyword = {"keyword":this.props.search[0],"index":this.state.index}
    
    if(this.purpose == "searchMasker"){
      response = await SearchMaskers(keyword)
      
    }else{
      response = await SearchRoasts(keyword)
    } 
    
    if(response == false){
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',retry_caller:"search"})},100)
      return 
    }else if(response.ok){
      const json = await response.json();
      await store.dispatch(newSearchResults(json["results"]))
      await this.setState({index:this.props.search[1].length})
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',retry_caller:"search"})},100)
    }
    this.setState({isSearching:false})    
  }

  async pressTextInput(){
    await this.setState({submited:false}) 
  }

  async cancel(){
    await store.dispatch(searchKeyword({keyword:''}))
    await store.dispatch(newSearchResults([]))
    this.props.navigation.goBack()
  }

  _onRefresh = async () =>{
    this.setState({isSearching:true,show:false,retry_caller:undefined})
    keyword = {"keyword":this.props.search[0],"index":this.state.index}
    if(this.purpose == "searchMasker"){
      response = await SearchMaskers(keyword)
    }else{
      response = await SearchRoasts(keyword)
    }
    
    if(response == false){
      setTimeout(async ()=>{await this.setState({show:true,type:"No_Internet",message:'',title:'',retry_caller:"_onRefresh"})},100)
    }else if(response.ok){
      var json = await response.json();
      if(json["index"] >= this.state.index){
        await store.dispatch(addToSearchResults(json["results"]))
        await this.setState({index:this.props.search[1].length})
      }
    }else if(response.status == 401){
      this.props.navigation.navigate("Login")
    }else{
      setTimeout(async ()=>{await this.setState({show:true,type:"Bad_Response",message:'',title:'',retry_caller:"_onRefresh"})},100)
    }
    this.setState({isSearching:false})       
  }

  viewDetail(item){
    if (this.purpose == "searchRoast" ){
      this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchRoast"})
    }else if(this.purpose == "searchMasker" ){
      this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})
    }
  }

  async searchByKeyword(keyword){
    await store.dispatch(searchKeyword({keyword:keyword}))
    this.submit()
  }

  async retry(){
    if(this.state.retry_caller == "_onRefresh"){
      await this.search()
    }else if(this.state.retry_caller == "search"){
      await this._onRefresh()
    }
  }
  
  render() {
    //在没有点击submit 以及没有输入任何search关键词的时候, 显示推荐搜索页面
    if (this.props.search[0] == '' && this.state.submited == false){
      result_section = <SearchRecommendContainer recommended={this.purpose == "searchMasker"?this.props.frontPage.Masker.Keywords:this.props.frontPage.Roast.Keywords}
                                                 onPress={this.searchByKeyword}/>
    //如果没有点击submit, 但是有输入关键词, 显示和关键词相关的推荐搜索页面(还未实现)以及关键词补全(还未实现)                                                
    }else if(this.props.search[0] != '' && this.state.submited == false){
      result_section = <SearchReminderContainer input={this.props.search[0]}
                                                navigation={this.props.navigation}
                                                onPress={this.submit}/>
    //如果输入了搜索词,且点击了搜索, 那么显示搜索结果(还未实现)
    }else if(this.props.search[0] != '' && this.state.submited == true){
      if(this.props.search[1].length == 0 && !this.state.isSearching){
        result_section = <View style={[Search_n_Recommend_style.results_wrapper,{backgroundColor:BACKGROUND_COLOR}]}>
                          <Text style={Search_n_Recommend_style.empty_reminder}>{this.purpose == "searchMasker"?Lan['Empty_Results_Masker']:Lan['Empty_Results_Roast']}</Text>
                        </View>
      }else if(this.props.search[1].length !== 0 && !this.state.isSearching){
        result_section = <View style={Search_n_Recommend_style.results_wrapper}>
                            <FlatList
                              data={this.props.search[1]}
                              keyExtractor={item => this.purpose == "searchMasker"?item.aid:item.rid}
                              renderItem={({item}) => this.purpose == "searchMasker"?<DisplayCard_masker info={item} onPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})}/>:<DisplayCard_roast roast={item} onPress={() => this.viewDetail(item)}/>}
                              onEndReached={this._onRefresh}
                              ListFooterComponent={this.renderSpinner}
                              extraData={this.state.isSearching}
                              onEndReachedThreshold={0.3}
                            />
                          </View>

      }else if(this.state.isSearching && this.props.search[1].length == 0){
        temp = []
        if(this.purpose == "searchRoast"){
          temp.push(<DisplayCard_roast_image_spinner  start={"0"} end={"395"} key={0}/>)
          temp.push(<DisplayCard_roast_image_spinner  start={"395"} end={"790"} key={1}/>)
          temp.push(<DisplayCard_roast_image_spinner  start={"790"} end={"1185"} key={2}/>)
          temp.push(<DisplayCard_roast_image_spinner  start={"1185"} end={"1580"} key={3}/>)
          temp.push(<DisplayCard_roast_image_spinner  start={"1580"} end={"1975"} key={4}/>)
        }else if(this.purpose == "searchMasker"){
        
          temp.push(<DisplayCard_masker_text_spinner start={"0"} end={"125"} key={0}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"125"} end={"250"} key={1}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"250"} end={"375"} key={2}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"375"} end={"500"} key={3}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"500"} end={"625"} key={4}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"625"} end={"750"} key={5}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"750"} end={"875"} key={6}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"875"} end={"1000"} key={7}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1000"} end={"1125"} key={8}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1125"} end={"1250"} key={9}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1250"} end={"1375"} key={10}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1375"} end={"1500"} key={11}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1500"} end={"1625"} key={12}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1625"} end={"1750"} key={13}/>)
          temp.push(<DisplayCard_masker_text_spinner start={"1750"} end={"1875"} key={14}/>)
        }
        result_section = <ScrollView 
                              style={{
                                height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
                                width:width,
                                backgroundColor:FILLING_COLOR
                              }}
                              contentContainerStyle={{
                                flexDirection:"column",
                                justifyContent:"flex-start",
                                alignItems:"center"
                              }}>
                            {temp}
                          </ScrollView>
      }
    }
  return (
    <View style={{flex:1}}>
      <MASKOFFStatusBar backgroundColor={STATUS_BAR_COLOR} barStyle="dark-content"/>
      <SearchBarHeader placeholder={Lan["Search_in_MASKOFF"]}
                       navigation={this.props.navigation}
                       onSubmitEditing={this.submit}
                       onFocus={()=>{this.pressTextInput()}}
                       cancel={() => {this.cancel()}}
                       autoFocus={true}/>
      {result_section}
      <MO_Alerts show={this.state.show} 
                 type={this.state.type}
                 retry={async () => {await this.retry()}}
                 showCancelButton={false}
                 closeOnTouchOutside={false}
                 onConfirmPressed={this.notice}
                 title={this.state.title}
                 message={this.state.message}/>
    </View>
  );
  }
}
const Search_n_Recommend_style = StyleSheet.create({
  results_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT,
    width:width,
    backgroundColor:COLOR_Search_n_Recommend["results_wrapper"],
    flexDirection:"column",
    justifyContent:"flex-start",
    alignItems:"center"
  },
  empty_reminder:{
    marginTop:height / 12,
    width:width * 0.85,
    fontSize:15,
    color:THEME_COLOR
  }
})

const getPropsFromState = state => ({
  search: state.search,
  frontPage: state.frontPage
})

export default connect(getPropsFromState)(Search_n_Recommend)