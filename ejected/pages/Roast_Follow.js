/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
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
import { DisplayCard_roast } from '../components/Modules.js';

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
         getFollowedRoasts } from '../utility/HttpRequests.js'

import { Lan } from '../utility/Languages.js'

// Spinners
import { DisplayCard_roast_image_spinner } from '../components/Svg_Spinners.js'

import FontAwesome from 'react-native-vector-icons/FontAwesome';

//Component UI--checked
class Roast_Follow extends Component {
  constructor(props){
    super(props)
    this.state={
      start:this.props.frontPage["Roast"]["Follow"].length,
      reload_pressed:false,
      followOnRefreshing_push:false,
      followOnRefreshing_pull:false,
      followOnRefreshing_push_permission:true
    }
    
    
    this.viewDetail=this.viewDetail.bind(this)
    this.followOnRefresh=this.followOnRefresh.bind(this)
    this.reload_followed=this.reload_followed.bind(this)
    this.reload_frontpage=this.reload_frontpage.bind(this)
    this.render_refreshing_spinner=this.render_refreshing_spinner.bind(this)
  }
  viewDetail(item){
    this.props.navigation.navigate("Article_Roast_Display",{info:item,purpose:"searchRoast"})
  }

  componentDidUpdate(prevProps) {
    if (this.props.frontPage["Roast"]["Follow"].length !== prevProps.frontPage["Roast"]["Follow"].length) {
      this.setState({start:this.props.frontPage["Roast"]["Follow"].length})
    }  
  }

  async reload_frontpage(){
    this.setState({"reload_pressed":true})
    let response = await Relogin_Reload(global.current_location_bounds)
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

  async reload_followed(){
    this.setState({"reload_pressed":true})
    if(global.langauge == undefined){
      global.langauge = "Chinese"
    }
    let info = {start:this.state.start,language:global.langauge == "Chinese"?"Chi":"Eng"}
    console.log(info)
    let response = await getFollowedRoasts(info)
    console.log(response)
    if(response == false){
      this.setState({"reload_pressed":false})
    }else if(response == "no_location_info"){
      this.setState({"reload_pressed":false})
    }else if(response.ok){
      this.setState({"reload_pressed":false})
      let json = await response.json()  
      if(json["index"] > this.state.start){
        await this.setState({start:json["index"],followOnRefreshing_push_permission:true})
        let idle_frontPage = {
          "Roast":{
            "Recommend":this.props.frontPage["Roast"]["Recommend"],
            "Follow":this.props.frontPage["Roast"]["Follow"].concat(json["follow_list"]),
            "Keywords":this.props.frontPage["Roast"]["Keywords"]
            },
          "Masker":{
            "Recommend":this.props.frontPage["Masker"]["Recommend"],
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
  async followOnRefresh(action){
    if(action == "push"){
      if(this.state.followOnRefreshing_push_permission){
        this.setState({followOnRefreshing_push:true})
        await this.reload_followed()
        await this.setState({followOnRefreshing_push:false})  
      }
    }
    else if(action == "pull"){
      this.setState({followOnRefreshing_pull:true})
      await this.reload_followed()
      await this.setState({followOnRefreshing_pull:false})   
    } 
  }
  render_refreshing_spinner(){
    if(this.state.followOnRefreshing_push){
      return (<View
                  style={Roast_Follow_style.loader_container}
                >
                <DisplayCard_roast_image_spinner key={0}/>
              </View>)
    }else if(!this.state.followOnRefreshing_push_permission){
      return(
        (<View
            style={[Roast_Follow_style.loader_container,{flexDirection:"row",padding:5,borderBottomWidth:1,borderColor:STANDARD_BORDER_COLOR, width:width}]}
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
      if(this.props.frontPage["Roast"]["Follow"].length !== 0){
        return (
          <View style={Roast_Follow_style.results_wrapper}>
            <FlatList
              data={this.props.frontPage["Roast"]["Follow"]}
              keyExtractor={item => item.rid}
              renderItem={({item}) => <DisplayCard_roast roast={item} onPress={() => this.viewDetail(item)}/>}
              onRefresh={async () =>{await this.followOnRefresh("pull")}}
              refreshing={this.state.followOnRefreshing_pull}
              ListFooterComponent={this.render_refreshing_spinner}
              onEndReached={async () =>{await this.followOnRefresh("push")}}
              onEndReachedThreshold={0.1}
              extraData={{"1":this.props.frontPage["Roast"]["Follow"],"2":this.state.start}}
            />
          </View>
        );
      }else{
        if(this.state.reload_pressed){
          return(
            <View 
              style={Roast_Follow_style.results_wrapper}>
              <ActivityIndicator 
                size="large"
                color={THEME_COLOR}/>
            </View>
          )
        }else{
          return (
            <View 
              style={Roast_Follow_style.results_wrapper}>
              <Text style={Roast_Follow_style.reload_text}>
                {Lan["No_follow_refresh"]}
              </Text>
              <TouchableOpacity 
                style={Roast_Follow_style.reload_square}
                onPress={this.reload_followed}>
                <Text style={Roast_Follow_style.reload_text}>
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
            style={Roast_Follow_style.results_wrapper}>
            <ActivityIndicator 
              size="large"
              color={THEME_COLOR}/>
          </View>
        )
      }else{
        return (
          <View 
            style={Roast_Follow_style.results_wrapper}>
            <TouchableOpacity 
              style={Roast_Follow_style.reload_square}
              onPress={this.reload_frontpage}>
              <Text style={Roast_Follow_style.reload_text}>
                {Lan["reload"]}
              </Text>
            </TouchableOpacity>
          </View>
        );
      }
    }
  }
}
const Roast_Follow_style = StyleSheet.create({
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

export default connect(getPropsFromState)(Roast_Follow)