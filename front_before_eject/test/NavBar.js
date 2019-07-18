/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React from 'react';
import { Text } from 'react-native';
import NavBar, { NavTitle, NavButton } from 'react-native-nav';


export default function NavBarCustom() {
  return (
    <NavBar>
      <NavButton />
      <NavTitle>
        💬 Gifted Chat{'\n'}
        <Text style={{ fontSize: 10, color: '#aaa' }}>({"666"})</Text>
      </NavTitle>
      <NavButton />
    </NavBar>
  );
}