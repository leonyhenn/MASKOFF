// import React, { Component } from 'react';
// import { store } from './store/store.js';
// import { Root } from 'native-base'
// import { Provider } from 'react-redux';
// import TestField from './test/TestField.js';
// import { Font, AppLoading } from "expo";

// export default class RNRedux extends Component{
// 	constructor(props){
//     super(props);
//     this.state=({done_loading: false })
//   }
//   async componentWillMount() {
//     await Font.loadAsync({
//       Arial: require("./assets/fonts/arial.ttf"),
//     });
//     this.setState({ done_loading: true });
//   }
// 	render(){
// 		if (!this.state.done_loading) {
//       return (
//         <Provider store={store}>
//           <AppLoading />
//         </Provider>
//       )
//     }
//     return(
// 			<Provider store={store}>
//         <Root>
//     		  <TestField/>
//         </Root>
//   		</Provider>
// 		)
// 	}
// }


import React, { Component } from 'react';
import { store } from './store/store.js';
import { MenuProvider,
         renderers } from 'react-native-popup-menu';
const { Popover } = renderers
import { Provider } from 'react-redux';
import { Root } from 'native-base'
import App from './navigations/intro.js';

const RNRedux = () => (
  <Provider store={store}>
    <MenuProvider>
      <Root>
        <App/>
      </Root>
    </MenuProvider>
  </Provider>
)
export default RNRedux;


