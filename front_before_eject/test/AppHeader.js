/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';
import {
  Text,
} from 'react-native';

import {Header,Left,Button,Icon,Right,Body,Title} from 'native-base';

export default class AppHeader extends Component {
  render() {
    return (
      <Header>
       <Left>
       <Button transparent
              onPress={()=>this.props.openDrawer()}
       >
         <Icon name='menu' />
       </Button>
       </Left>
       <Body>
         <Title>SDCC Wallet</Title>
       </Body>
       <Right>
         <Button transparent>
           <Icon name='bulb' />
         </Button>
       </Right>
     </Header>
    );
  }
}