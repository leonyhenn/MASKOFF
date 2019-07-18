/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 后端实现
  1. 检查console.error
  2. 检查network failure
  3. 中英文
  4. 实机测验
  5. 墙
  6. 去掉不需要的import, console.log, setTimeout和comments, 整理code
  2019.Jan.03
*/
//official modules
import React, { Component } from 'react';
import { View, 
         Text,
         FlatList,
         ScrollView,
         StyleSheet,
         TouchableOpacity,
         ActivityIndicator } from 'react-native';

//MASKOFF custom modules
import { DisplayCard_masker } from '../components/Modules.js';

// SVG Spinners
import { DisplayCard_masker_text_spinner } from '../components/Svg_Spinners.js';

//redux
import { store } from '../store/store.js';
import { pushFrontPage } from '../store/actions.js';

//utilities
import { height, 
         width,
         FOOTER_HEIGHT,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         TOP_TAB_HEIGHT } from '../utility/Util.js';

//redux modules
import { connect } from 'react-redux'

import { THEME_COLOR,
         FILLING_COLOR,
         STANDARD_BORDER_COLOR } from '../utility/colors.js'

import { Relogin_Reload,
         getRecommendArticles } from '../utility/HttpRequests.js'

import { Lan } from '../utility/Languages.js'

import FontAwesome from 'react-native-vector-icons/FontAwesome';

//Component UI--checked
class Masker_Recommend extends Component {
  constructor(props){
    super(props)
    this.state={
      start:this.props.frontPage["Masker"]["Recommend"].length,
      reload_pressed:false,
      recommendOnRefreshing_push:false,
      recommendOnRefreshing_pull:false,
      followOnRefreshing_push_permission:true
    }
    this.viewDetail=this.viewDetail.bind(this)
    this.recommendOnRefresh=this.recommendOnRefresh.bind(this)
    this.reload_recommend=this.reload_recommend.bind(this)
    this.reload_frontpage=this.reload_frontpage.bind(this)
    this.render_refreshing_spinner=this.render_refreshing_spinner.bind(this)
  }
  viewDetail(item){
    this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})  
  }
  componentDidUpdate(prevProps) {
    if (this.props.frontPage["Masker"]["Recommend"].length !== prevProps.frontPage["Masker"]["Recommend"].length) {
      this.setState({start:this.props.frontPage["Masker"]["Recommend"].length})
    }  
  }

  async reload_frontpage(){
    this.setState({"reload_pressed":true})
    let response = await Relogin_Reload(global.current_location_bounds)
    console.log(response.ok)
    if(response == false){
      this.setState({"reload_pressed":false})
    }else if(response == "no_location_info"){
      this.setState({"reload_pressed":false})
    }else if(response.ok){
      this.setState({"reload_pressed":false})
      if(!response.bodyUsed){
        let json = await response.json()  
        let valid = json["token_valid"]
        if(valid){
          await store.dispatch(pushFrontPage(json["front_page"]))
        }
      }
    }else{
      this.setState({"reload_pressed":false})
    }  
  }

  async reload_recommend(){
    this.setState({"reload_pressed":true})
    if(global.langauge == undefined){
      global.langauge = "Chinese"
    }
    let info = {start:this.state.start,language:global.langauge == "Chinese"?"Chi":"Eng"}
    console.log(info)
    let response = await getRecommendArticles(info)
    await console.log(response)
    if(response == false){
      this.setState({"reload_pressed":false})
    }else if(response == "no_location_info"){
      this.setState({"reload_pressed":false})
    }else if(response.ok){
      this.setState({"reload_pressed":false})
      let json = await response.json()  
      await console.log(json)
      if(json["index"] > this.state.start){
        await this.setState({start:json["index"],followOnRefreshing_push_permission:true})
        let idle_frontPage = {
          "Roast":{
            "Follow":this.props.frontPage["Roast"]["Follow"],
            "Recommend":this.props.frontPage["Roast"]["Recommend"],
            "Keywords":this.props.frontPage["Roast"]["Keywords"]
            },
          "Masker":{
            "Recommend":this.props.frontPage["Masker"]["Recommend"].concat(json["recommend_list"]),
            "Follow":this.props.frontPage["Masker"]["Follow"],
            "Keywords":this.props.frontPage["Masker"]["Keywords"]
            }
        }
        await store.dispatch(pushFrontPage(idle_frontPage))
      }else{
        this.setState({followOnRefreshing_push_permission:false})
      }
      
      this.setState({"reload_pressed":false})
    }else{
      this.setState({"reload_pressed":false})
    }  
  }
  async recommendOnRefresh(action){
    if(action == "push"){
      if(this.state.followOnRefreshing_push_permission){
        this.setState({recommendOnRefreshing_push:true})
        await this.reload_recommend()
        await this.setState({recommendOnRefreshing_push:false})  
      }
    }
    else if(action == "pull"){
      this.setState({recommendOnRefreshing_pull:true})
      await this.reload_recommend()
      await this.setState({recommendOnRefreshing_pull:false})   
    } 
  }

  render_refreshing_spinner(){
    if(this.state.recommendOnRefreshing_push){
      return (<View
                  style={Masker_Recommend_style.loader_container}
                >
                <DisplayCard_masker_text_spinner key={0}/>
              </View>)
    }else if(!this.state.followOnRefreshing_push_permission){
      return(
        (<View
            style={[Masker_Recommend_style.loader_container,{flexDirection:"row",padding:5,borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR, width:width}]}
          >
           <FontAwesome name={"smile-o"} size={20} color={"#C4C4C4"} />
           <Text style={{color:"#C4C4C4"}}>
            {Lan['End_of_scroll']}
           </Text>
         </View>)
      )
    }else{
      return null
    }
  }
  render() {
    if(this.props.frontPage.get){
      if(this.props.frontPage["Masker"]["Follow"].length !== 0){
        return (
          <View 
            style={{
              height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
              width:width,
              flexDirection:"column",
              justifyContent:"center",
              alignItems:"center",
            }}>
            <FlatList
              data={this.props.frontPage["Masker"]["Recommend"]}
              keyExtractor={item => item.aid}
              renderItem={({item}) => <DisplayCard_masker info={item} onPress={() => this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchMasker"})}/>}              
              onRefresh={async () =>{await this.recommendOnRefresh("pull")}}
              refreshing={this.state.recommendOnRefreshing_pull}
              ListFooterComponent={this.render_refreshing_spinner}
              onEndReached={async () =>{await this.recommendOnRefresh("push")}}
              onEndReachedThreshold={0.1}
              extraData={{"1":this.props.frontPage["Masker"]["Recommend"],"2":this.state.start}}
            />
          </View>
        );
      }else{
        if(this.state.reload_pressed){
          return(
            <View 
              style={Masker_Recommend_style.results_wrapper}>
              <ActivityIndicator 
                size="large"
                color={THEME_COLOR}/>
            </View>
          )
        }else{
          return (
            <View 
              style={Masker_Recommend_style.results_wrapper}>
              <Text style={Masker_Recommend_style.reload_text}>
                {Lan["No_follow_refresh"]}
              </Text>
              <TouchableOpacity 
                style={Masker_Recommend_style.reload_square}
                onPress={this.reload_followed}>
                <Text style={Masker_Recommend_style.reload_text}>
                  {Lan["reload"]}
                </Text>
              </TouchableOpacity>
            </View>
          );
        }
      }
    }else{
      if(this.state.reload_pressed){
        return(
          <View 
            style={Masker_Recommend_style.results_wrapper}>
            <ActivityIndicator 
              size="large"
              color={THEME_COLOR}/>
          </View>
        )
      }else{
        return (
          <View 
            style={Masker_Recommend_style.results_wrapper}>
            <TouchableOpacity 
              style={Masker_Recommend_style.reload_square}
              onPress={this.reload_frontpage}>
              <Text style={Masker_Recommend_style.reload_text}>
                {Lan["reload"]}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }
}
const Masker_Recommend_style = StyleSheet.create({
  results_wrapper:{
    height:height - STATUSBAR_HEIGHT - HEADER_HEIGHT - FOOTER_HEIGHT - TOP_TAB_HEIGHT,
    width:width,
    flexDirection:"column",
    justifyContent:"center",
    alignItems:"center",
    backgroundColor:"white"
  },
  reload_text:{
    fontSize:18,
    color:THEME_COLOR,
    margin:5
  },
  reload_square:{
    borderRadius:3,
    borderColor:THEME_COLOR,
    borderWidth:1
  },
  loader_container:{
    justifyContent:"center",
    alignItems:"center",
    alignSelf:"center"
  }
})
const getPropsFromState = state => ({
  frontPage: state.frontPage
})

export default connect(getPropsFromState)(Masker_Recommend)