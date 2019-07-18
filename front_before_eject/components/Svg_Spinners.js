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
        borderBottomWidth:5,
        borderColor:"#181818"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={365}
          width={width}
          y1={this.props.start}
          y2={(parseInt(this.props.end) - 20).toString()}
        > 
          <Svg.Rect x="5" y="10" rx="5" ry="5" width="40" height="40" />
          <Svg.Rect x="50" y="17" rx="5" ry="5" width="60" height="10" />
          <Svg.Rect x="50" y="32" rx="5" ry="5" width="30" height="10" />
          <Svg.Rect x="5" y="60" rx="5" ry="5" width={(width - 10 ).toString()} height="20" />
          <Svg.Rect x="5" y="85" rx="5" ry="5" width={((width - 10  ) / 3).toString()} height="20" />
          <Svg.Rect x="10" y="120" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
          <Svg.Rect x="10" y="325" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="40" />
          
          
        </SvgAnimatedLinearGradient>
        <View style={{
          marginTop:5,
          marginBottom:5,
          flexDirection:"column",
          alignItems:"flex-start",
          justifyContent:"center",
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
        </View>

      </View>
    )
  }
}

export class DisplayCard_roast_text_spinner extends React.Component {
  render() {    
    return (
        <View style={{
          flex:1,
          borderBottomWidth:5,
          borderColor:"#181818"
        }}>
          <SvgAnimatedLinearGradient
            primaryColor="#cccccc"
            secondaryColor="#b0b0b0"
            height={150}
            width={width}
            y1={this.props.start}
            y2={(parseInt(this.props.end) - 30).toString()}
          > 
            <Svg.Rect x="5" y="10" rx="5" ry="5" width="40" height="40" />
            <Svg.Rect x="50" y="17" rx="5" ry="5" width="60" height="10" />
            <Svg.Rect x="50" y="32" rx="5" ry="5" width="30" height="10" />
            <Svg.Rect x="5" y="60" rx="5" ry="5" width={(width - 10 ).toString()} height="20" />
            <Svg.Rect x="5" y="85" rx="5" ry="5" width={((width - 10  ) / 3).toString()} height="20" />
            <Svg.Rect x="5" y="110" rx="5" ry="5" width={(width - 10).toString()} height="40" />
            
          </SvgAnimatedLinearGradient>
          <View style={{
            marginTop:5,
            marginBottom:5,
            flexDirection:"column",
            alignItems:"flex-start",
            justifyContent:"center",
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
        </View>

      </View>
        
    )
  }
}


export class DisplayCard_masker_text_spinner extends React.Component {
  render() {    
    return (
        <View style={{
          borderBottomWidth:1,
          borderColor:"#3F3F3F"
        }}>
          <SvgAnimatedLinearGradient
            primaryColor="#cccccc"
            secondaryColor="#b0b0b0"
            height={125}
            width={width}
            y1={this.props.start}
            y2={this.props.end}
          > 
            <Svg.Rect x="5" y="8" rx="5" ry="5" width="60" height="20" />
            <Svg.Rect x="5" y="35" rx="5" ry="5" width={(width - 5 * 2 ).toString()} height="70" />
            <Svg.Rect x={(width - 40).toString()} y="115" rx="5" ry="5" width="35" height="6" />
          </SvgAnimatedLinearGradient>
        </View>
    )
  }
}


export class DisplayCard_masker_full_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        // borderWidth:1,
        // borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={925}
          width={width}
          y1={this.props.start}
          y2={this.props.end}
        > 
          <Svg.Rect x="10" y="5" rx="5" ry="5" width="60" height="25" />
          
          <Svg.Rect x="10" y="40" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
          <Svg.Rect x="10" y="260" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          
          <Svg.Rect x="10" y="285" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="310" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          <Svg.Rect x="10" y="335" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          <Svg.Rect x="10" y="360" rx="5" ry="5" width={((width - 10 * 2) / 3).toString()} height="10" />
          <Svg.Rect x="10" y="380" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
          <Svg.Rect x="10" y="600" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          <Svg.Rect x="10" y="625" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="650" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="675" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="700" rx="5" ry="5" width={((width - 10 * 2) / 3).toString()} height="10" />
          <Svg.Rect x="10" y="720" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
        </SvgAnimatedLinearGradient>
      </View>
    )
  }
}


export class DisplayCard_roast_full_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        // borderWidth:1,
        // borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={925}
          width={width}
          y1={this.props.start}
          y2={this.props.end}
        > 
          <Svg.Rect x="10" y="10" rx="5" ry="5" width="40" height="40" />
          <Svg.Rect x="55" y="17" rx="5" ry="5" width="60" height="10" />
          <Svg.Rect x="55" y="32" rx="5" ry="5" width="30" height="10" />
          <Svg.Rect x="10" y="60" rx="5" ry="5" width={(width - 10 ).toString()} height="20" />
          <Svg.Rect x="10" y="85" rx="5" ry="5" width={((width - 10  ) / 3).toString()} height="20" />
          
          <Svg.Rect x="10" y="110" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
          <Svg.Rect x="10" y="340" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          <Svg.Rect x="10" y="365" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          
          
          
          <Svg.Rect x="10" y="390" rx="5" ry="5" width={((width - 10 * 2) / 3).toString()} height="10" />
          <Svg.Rect x="10" y="420" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="200" />
          <Svg.Rect x="10" y="650" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="675" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="700" rx="5" ry="5" width={((width - 10 * 2) / 3).toString()} height="10" />
          <Svg.Rect x="10" y="730" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="190" />
        </SvgAnimatedLinearGradient>
      </View>
    )
  }
}

export class Comment_image_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        borderBottomWidth:1,
        borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={240}
          width={width}
          y1={this.props.start}
          y2={(parseInt(this.props.end) - 30).toString()}
        > 
          <Svg.Rect x="10" y="10" rx="5" ry="5" width="40" height="40" />
          <Svg.Rect x="55" y="17" rx="5" ry="5" width="60" height="10" />
          <Svg.Rect x="55" y="32" rx="5" ry="5" width="30" height="10" />
          
          <Svg.Rect x="10" y="60" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="75" rx="5" ry="5" width={((width - 10 * 2)/2).toString()} height="10" />
          <Svg.Rect x="10" y="90" rx="5" ry="5" width={(width - 10 * 2 ).toString()} height="150" />
          
        </SvgAnimatedLinearGradient>
        <View style={{
          marginTop:5,
          marginLeft:5,
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"flex-start",
          backgroundColor:"transparent",
          width:(width  - 20),
          justifyContent:"flex-start"
        }}>
        <View style={{
          marginLeft:5,
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
            marginLeft:5,
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
      </View>
    )
  }
}

export class Comment_text_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        borderBottomWidth:1,
        borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={85}
          width={width}
          y1={this.props.start}
          y2={(parseInt(this.props.end)- 30).toString()}
        > 
          <Svg.Rect x="10" y="10" rx="5" ry="5" width="40" height="40" />
          <Svg.Rect x="55" y="17" rx="5" ry="5" width="60" height="10" />
          <Svg.Rect x="55" y="32" rx="5" ry="5" width="30" height="10" />
          
          <Svg.Rect x="10" y="60" rx="5" ry="5" width={(width - 10 * 2).toString()} height="10" />
          <Svg.Rect x="10" y="75" rx="5" ry="5" width={((width - 10 * 2)/2).toString()} height="10" />
          
          
        </SvgAnimatedLinearGradient>
        <View style={{
          marginTop:5,
          marginLeft:5,
          flexDirection:"row",
          alignItems:"center",
          justifyContent:"flex-start",
          backgroundColor:"transparent",
          width:(width  - 20),
          justifyContent:"flex-start"
        }}>
        <View style={{
          marginLeft:5,
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
            marginLeft:5,
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
      </View>
    )
  }
}
export class ScaledImage_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        // borderWidth:1,
        // borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={width * 9 / 16 + 5}
          width={width - 30}
        > 
          <Svg.Rect x="0" y="5" rx="5" ry="5" width={(width - 30).toString()} height={(width * 9 / 16).toString()} />
        </SvgAnimatedLinearGradient>
      </View>
    )
  }
}
export class ScaledImage_comment_spinner extends React.Component {
  render() {    
    return (
      <View style={{
        // borderWidth:1,
        // borderColor:"#3F3F3F"
      }}>
        <SvgAnimatedLinearGradient
          primaryColor="#cccccc"
          secondaryColor="#b0b0b0"
          height={(width / 4) * 16 / 9 + 5}
          width={width / 4}
        > 
          <Svg.Rect x="0" y="5" rx="5" ry="5" width={(width / 4).toString()} height={((width / 4) * 16 / 9).toString()} />
        </SvgAnimatedLinearGradient>
      </View>
    )
  }
}