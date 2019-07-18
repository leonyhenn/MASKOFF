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
