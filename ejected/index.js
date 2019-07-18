/* Copyright (C) Heng Ye - All Rights Reserved
 * Unauthorized copying of this file, via any medium is strictly prohibited
 * Proprietary and confidential
 * Written by Heng Ye <leonyhenn@gmail.com>, July 2019
 */
import React, { Component } from 'react';
import { store } from './store/store.js';
import { Provider } from 'react-redux';
import WelcomePage from './navigations/intro.js';

const RNRedux = () => (
  <Provider store={store}>
    <WelcomePage/>
  </Provider>
)
export default RNRedux;
