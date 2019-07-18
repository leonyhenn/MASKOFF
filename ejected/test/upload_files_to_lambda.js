import React, { Component } from "react";
import { View, Button, Platform } from 'react-native'
var BUTTONS = [
  { text: "Option 0", icon: "american-football", iconColor: "#2c8ef4" },
  { text: "Option 1", icon: "analytics", iconColor: "#f42ced" },
  { text: "Option 2", icon: "aperture", iconColor: "#ea943b" },
  { text: "Delete", icon: "trash", iconColor: "#fa213b" },
  { text: "Cancel", icon: "close", iconColor: "#25de5b" }
];
var DESTRUCTIVE_INDEX = 3;
var CANCEL_INDEX = 4;
ec2 = "http://35.183.77.9"
global.server = "PLACEHOLDER_FOR_GITHUB"
global.access_token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1aWQiOiJjYzY5NmY1NC1hYWM5LTQzNDgtYjhkZC1lYTM5ODQzZDg4YzMiLCJleHAiOjE4NTE1MzMwMjEuNzE5NDkzMn0.qA68plRLbsgedicXzBjk6KSNK5jICFXpfPf8wsFrSEk"
localhost = "http://localhost:5000"
export default class TestField extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  async connect(){
    var userInfo = {
      "smacc":"codenamejoker",
      "smacc_type":"WeChat",
      "gender":"1"
    }
    if Platform.
    data = new FormData()
    var response = await fetch("content://media/external/images/media/38057");
    data_type = response["headers"]["map"]["content-type"][0]
    data_filename = response["_bodyInit"]["_data"]["name"]
    console.log("data_type",data_type)
    console.log("data_filename",data_filename)
    // const blob = await response.blob();
    // data.append('file', blob)
    data.append('file',{uri:"content://media/external/images/media/38057",type: data_type,name: data_filename})
    data.append('filename',"decoy.jpg")
    // data = {'file':blob,'filename':'decoy.jpg'}
    console.log(data)
    var response = await fetch(global.server+"/upload",{
      method:"POST",
      headers:{'Content-type':'multipart/form-data',
              'access-token':global.access_token},
      body:data
      });
    console.log(response)
    const json = await response.json();

    // var response = await fetch(ec2+"/",{
    //   method:"GET",
    //   headers:{},
      
    //   });
    // const json = await response.json();

    // const response = await fetch(global.server+"/users",{
    //     method:'POST',
    //     headers:{
    //       'Accept':'application/json',
    //       'Content-type':'application/json'
    //     },
    //     body:JSON.stringify(userInfo)
    //   })
    // const json = await response.json();
    console.log(json)
  }
  render() {
    
    return (
      
      
        <View style={{flex:1,flexDirection:"column",alignItems:"center",justifyContent:"center",backgroundColor:'yellow'}}>
          <Button
            onPress={() => this.connect()}
            style={{height:100,width:100,backgroundColor:"black"}}
            title="connect"
          >
      
          </Button>
        </View>
      
    );
  }
}
