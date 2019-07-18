/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import { View,Platform, Text } from 'react-native';
import SvgAnimatedLinearGradient from 'react-native-svg-animated-linear-gradient';
import { Svg } from 'expo';
//utilities
import { height, 
         width,
         STATUSBAR_HEIGHT,
         HEADER_HEIGHT,
         FOOTER_HEIGHT,
         TOP_TAB_HEIGHT } from '../utility/Util.js';

//Icons
import Ionicons from 'react-native-vector-icons/Ionicons';

//Languages
import { Lan } from '../utility/Languages.js';

export class DisplayCard_roast_image_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View> 
          <View style={{height:40,width:40,position:"absolute",left:5,top:10,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:17,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:32,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:20,width:width-10,position:"absolute",left:5,top:60,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:20,width:(width-10)/3,position:"absolute",left:5,top:85,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:200,width:width-10*2,position:"absolute",left:10,top:120,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:40,width:width-10*2,position:"absolute",left:10,top:325,backgroundColor:"#cccccc", borderRadius:3}}/>
        </View>
        {<View style={{
          marginTop:370,
          marginBottom:5,
          flexDirection:"column",
          alignItems:"center",
          justifyContent:"flex-start",
          height:20,
          width:width
        }}>
          <Text style={{fontSize:12,color:"#A0A0A0"}}>
            <Text style={{color:"#A0A0A0",}}> 
              {"  "}
            </Text> {"? 人"+Lan["Likes"]},
            <Text style={{color:"#A0A0A0",}}> 
              {"  "}
            </Text>
            {"? 人"+Lan["Comments"]},
          </Text>
        </View>}
        <View style={{height:1,width:(width - 10),position:"absolute",left:5,top:400,backgroundColor:"#cccccc", borderRadius:3}}/>
      </View>
    )
  }
}

export class DisplayCard_roast_text_spinner extends React.Component {
  render() {    
    return (
        <View style={{
          flex:1,
          marginBottom:5
        }}>
          <View> 
            <View style={{height:40,width:40,position:"absolute",left:5,top:10,backgroundColor:"#cccccc", borderRadius:3}}/>
            <View style={{height:10,width:60,position:"absolute",left:50,top:17,backgroundColor:"#cccccc", borderRadius:3}}/>
            <View style={{height:10,width:60,position:"absolute",left:50,top:32,backgroundColor:"#cccccc", borderRadius:3}}/>
            <View style={{height:20,width:width-10,position:"absolute",left:5,top:60,backgroundColor:"#cccccc", borderRadius:3}}/>
            <View style={{height:20,width:(width-10)/3,position:"absolute",left:5,top:85,backgroundColor:"#cccccc", borderRadius:3}}/>
            <View style={{height:40,width:(width - 10),position:"absolute",left:5,top:115,backgroundColor:"#cccccc", borderRadius:3}}/>
          </View>
          {<View style={{
            marginTop:160,
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:20,
            width:width
          }}>
            <Text style={{fontSize:12,color:"#A0A0A0"}}>
              <Text style={{color:"#A0A0A0",}}> 
                {"     "}
              </Text> {"人"+Lan["Likes"]},
              <Text style={{color:"#A0A0A0",}}> 
                {"     "}
              </Text>
              {"人"+Lan["Comments"]},
            </Text>
        </View>}
        <View style={{height:1,width:(width - 10),position:"absolute",left:5,top:185,backgroundColor:"#cccccc", borderRadius:3}}/>
      </View>
        
    )
  }
}


export class DisplayCard_masker_text_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5,
      }}>
        <View style={{height:20,width:60,position:"absolute",left:0,top:8,backgroundColor:"#cccccc", borderRadius:3}}/>
        <View style={{height:70,width:(width - 5 * 2 ),position:"absolute",left:0,top:35,backgroundColor:"#cccccc", borderRadius:3}}/>
        <View style={{height:6,width:35,position:"absolute",left:(width - 45),top:115,backgroundColor:"#cccccc", borderRadius:1}}/>
        {<View style={{
            marginTop:130,
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:1,
            width:(width - 10),
            backgroundColor:"#cccccc"
          }}>
        </View>}
      </View>
    )
  }
}


export class DisplayCard_masker_full_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View
          style={{
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
          }}> 
          <View style={{height:25,width:60,position:"absolute",left:5,top:5,backgroundColor:"#cccccc", borderRadius:3}}/>

          <View style={{height:200,width:(width - 10 * 2 ),position:"absolute",left:5,top:40,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:260,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:285,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:310,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:335,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:((width - 10 * 2) / 3 ),position:"absolute",left:5,top:360,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:200,width:(width - 10 * 2 ),position:"absolute",left:5,top:380,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:600,backgroundColor:"#cccccc", borderRadius:3}}/> 
          
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:625,backgroundColor:"#cccccc", borderRadius:3}}/> 
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:650,backgroundColor:"#cccccc", borderRadius:3}}/> 
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:675,backgroundColor:"#cccccc", borderRadius:3}}/> 
          <View style={{height:10,width:((width - 10 * 2) / 3),position:"absolute",left:5,top:700,backgroundColor:"#cccccc", borderRadius:3}}/> 
          <View style={{height:200,width:(width - 10 * 2 ),position:"absolute",left:5,top:720,backgroundColor:"#cccccc", borderRadius:3}}/> 
        </View>
        {<View style={{
            marginTop:940,
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:1,
            width:(width - 10),
            backgroundColor:"transparent"
          }}>
        </View>}
      </View>
    )
  }
}


export class DisplayCard_roast_full_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View
          style={{
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
          }}> 
          <View style={{height:40,width:40,position:"absolute",left:5,top:10,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:17,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:32,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:20,width:width-10,position:"absolute",left:5,top:60,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:20,width:(width-10)/3,position:"absolute",left:5,top:85,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:200,width:(width - 10 * 2 ),position:"absolute",left:5,top:110,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:340,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:365,backgroundColor:"#cccccc", borderRadius:3}}/>

          <View style={{height:10,width:((width - 10 * 2) / 3 ),position:"absolute",left:5,top:390,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:200,width:(width - 10 * 2 ),position:"absolute",left:5,top:420,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:650,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:5,top:675,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:((width - 10 * 2) / 3 ),position:"absolute",left:5,top:700,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:190,width:(width - 10 * 2 ),position:"absolute",left:5,top:730,backgroundColor:"#cccccc", borderRadius:3}}/>
        </View>
        {<View style={{
            marginTop:920,
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:1,
            width:(width - 10),
            backgroundColor:"transparent"
          }}>
        </View>}
      </View>
    )
  }
}

export class Comment_image_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View
          style={{
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
          }}> 
          <View style={{height:40,width:40,position:"absolute",left:0,top:10,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:17,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:30,position:"absolute",left:50,top:32,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:(width - 10 * 2 ),position:"absolute",left:0,top:60,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:((width - 10 * 2) / 2 ),position:"absolute",left:0,top:75,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:150,width:(width - 10 * 2 ),position:"absolute",left:0,top:90,backgroundColor:"#cccccc", borderRadius:3}}/>
          
        </View>
        <View style={{
          marginTop:230+15,
          marginLeft:0,
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"flex-start",
          backgroundColor:"transparent",
          width:(width  - 20),
        }}>
          <View style={{
            marginLeft:0,
            marginRight:5,
            marginBottom:5
          }} >
            <Ionicons name="ios-text" size={20} color="#C4C4C4"/>
          </View>
          <Text style={{
            fontSize:13,
            color:"black",
          }}> 
          {"     "}
          </Text> 
          <View style={{
            marginLeft:0,
            marginRight:5,
            marginBottom:5
          }}>
            <Ionicons name="ios-thumbs-up" size={20} color="#C4C4C4"/>
          </View>
          <Text style={{
            fontSize:13,
            color:"black",
          }}> 
          {"     "}
          </Text>
        </View>
        <View style={{height:1,width:(width - 10 * 2 ),position:"absolute",left:0,top:270,backgroundColor:"#cccccc", borderRadius:3}}/>
      </View>
    )
  }
}

export class Comment_text_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View> 
          <View style={{height:40,width:40,position:"absolute",left:0,top:10,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:60,position:"absolute",left:50,top:17,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:30,position:"absolute",left:50,top:32,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          <View style={{height:10,width:(width - 10 * 2),position:"absolute",left:0,top:60,backgroundColor:"#cccccc", borderRadius:3}}/>
          <View style={{height:10,width:((width - 10 * 2)/2),position:"absolute",left:0,top:75,backgroundColor:"#cccccc", borderRadius:3}}/>
          
          
        </View>
        <View style={{
          marginTop:90,
          marginLeft:0,
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"flex-start",
          backgroundColor:"transparent",
          width:(width  - 20),
        }}>
        <View style={{
          marginLeft:0,
          marginRight:5,
          marginBottom:5
        }} >
            <Ionicons name="ios-text" size={20} color="#C4C4C4"/>
          </View>
          <Text style={{
            fontSize:13,
            color:"black",
          }}> 
          {"     "}
          </Text> 
          <View style={{
            marginLeft:0,
            marginRight:5,
            marginBottom:5
          }}>
            <Ionicons name="ios-thumbs-up" size={20} color="#C4C4C4"/>
          </View>
          <Text style={{
            fontSize:13,
            color:"black",
          }}> 
          {"     "}
          </Text>
        </View>
        <View style={{height:1,width:(width - 10 * 2 ),position:"absolute",left:0,top:115,backgroundColor:"#cccccc", borderRadius:3}}/>
      </View>
    )
  }
}
export class ScaledImage_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View> 
          <View style={{height:(width * 9 / 16),width:(width - 30),position:"absolute",left:10,top:5,backgroundColor:"#cccccc", borderRadius:3}}/>
        </View>
        {<View style={{
            marginTop:(width * 9 / 16),
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:1,
            width:(width - 10),
            backgroundColor:"transparent"
          }}>
        </View>}
      </View>
    )
  }
}
export class ScaledImage_comment_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        flex:1,
        marginBottom:5
      }}>
        <View> 
          <View style={{height:((width / 4) * 16 / 9),width:(width / 4),position:"absolute",left:(width - (width / 4))/2-5,top:5,backgroundColor:"#cccccc", borderRadius:3}}/>
        </View>
        {<View style={{
            marginTop:((width / 4) * 16 / 9),
            marginBottom:5,
            flexDirection:"column",
            alignItems:"center",
            justifyContent:"flex-start",
            height:1,
            width:(width - 10),
            backgroundColor:"transparent"
          }}>
        </View>}
      </View>
    )
  }
}