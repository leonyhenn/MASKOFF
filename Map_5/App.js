// import React from 'react';
// import {Animated, View, Text, StyleSheet} from 'react-native';
// import MapboxGL from '@mapbox/react-native-mapbox-gl';

// import sheet from './styles/sheet';

// import BaseExamplePropTypes from './components/common/BaseExamplePropTypes';
// import Page from './components/common/Page';
// import Bubble from './components/common/Bubble';

// const ANNOTATION_SIZE = 45;

// const styles = StyleSheet.create({
//   annotationContainer: {
//     width: ANNOTATION_SIZE,
//     height: ANNOTATION_SIZE,
//     alignItems: 'center',
//     justifyContent: 'center',
//     backgroundColor: 'white',
//     borderRadius: ANNOTATION_SIZE / 2,
//     borderWidth: StyleSheet.hairlineWidth,
//     borderColor: 'rgba(0, 0, 0, 0.45)',
//   },
//   annotationFill: {
//     width: ANNOTATION_SIZE - 3,
//     height: ANNOTATION_SIZE - 3,
//     borderRadius: (ANNOTATION_SIZE - 3) / 2,
//     backgroundColor: 'orange',
//     transform: [{scale: 0.6}],
//   },
// });

// class ShowPointAnnotation extends React.Component {
//   static propTypes = {
//     ...BaseExamplePropTypes,
//   };

//   constructor(props) {
//     super(props);

//     this.state = {
//       activeAnnotationIndex: -1,
//       previousActiveAnnotationIndex: -1,

//       backgroundColor: 'blue',
//       coordinates: [[-73.99155, 40.73581]],
//     };

//     this._scaleIn = null;
//     this._scaleOut = null;

//     this.onPress = this.onPress.bind(this);
//     MapboxGL.setAccessToken('pk.eyJ1IjoibGVvbnloZW5uIiwiYSI6ImNqdzAxMTFvbjA2OTY0OWtzeTNnOTF5MWUifQ.UqGq-ZkOQ1kSR-TlVwET6A');
//   }

//   onPress(feature) {
//     const coords = Object.assign([], this.state.coordinates);
//     coords.push(feature.geometry.coordinates);
//     this.setState({coordinates: coords});
//   }

//   onAnnotationSelected(activeIndex, feature) {
//     if (this.state.activeIndex === activeIndex) {
//       return;
//     }

//     this._scaleIn = new Animated.Value(0.6);
//     Animated.timing(this._scaleIn, {toValue: 1.0, duration: 200}).start();
//     this.setState({activeAnnotationIndex: activeIndex});

//     if (this.state.previousActiveAnnotationIndex !== -1) {
//       this._map.moveTo(feature.geometry.coordinates, 500);
//     }
//   }

//   onAnnotationDeselected(deselectedIndex) {
//     const nextState = {};

//     if (this.state.activeAnnotationIndex === deselectedIndex) {
//       nextState.activeAnnotationIndex = -1;
//     }

//     this._scaleOut = new Animated.Value(1);
//     Animated.timing(this._scaleOut, {toValue: 0.6, duration: 200}).start();
//     nextState.previousActiveAnnotationIndex = deselectedIndex;
//     this.setState(nextState);
//   }

//   renderAnnotations() {
//     const items = [];

//     for (let i = 0; i < this.state.coordinates.length; i++) {
//       const coordinate = this.state.coordinates[i];
//       const title = `Longitude: ${this.state.coordinates[i][0]} Latitude: ${
//         this.state.coordinates[i][1]
//       }`;
//       const id = `pointAnnotation${i}`;

//       const animationStyle = {};
//       if (i === this.state.activeAnnotationIndex) {
//         animationStyle.transform = [{scale: this._scaleIn}];
//       } else if (i === this.state.previousActiveAnnotationIndex) {
//         animationStyle.transform = [{scale: this._scaleOut}];
//       }

//       items.push(
//         <MapboxGL.PointAnnotation
//           key={id}
//           id={id}
//           title="Test"
//           selected={i === 0}
//           onSelected={feature => this.onAnnotationSelected(i, feature)}
//           onDeselected={() => this.onAnnotationDeselected(i)}
//           coordinate={coordinate}
//         >
//           <View style={styles.annotationContainer}>
//             <Animated.View style={[styles.annotationFill, animationStyle]} />
//           </View>

//           <MapboxGL.Callout title={title} />
//         </MapboxGL.PointAnnotation>
//       );
//     }

//     return items;
//   }

//   render() {
//     return (
//       <Page {...this.props}>
//         <MapboxGL.MapView
//           ref={c => (this._map = c)}
//           zoomLevel={16}
//           onPress={this.onPress}
//           onDidFinishLoadingMap={this.onDidFinishLoadingMap}
//           centerCoordinate={this.state.coordinates[0]}
//           style={sheet.matchParent}
//           styleURL={"mapbox://styles/leonyhenn/cjw5mdwdt2zin1cntf3gk771m"}
//         >
//           {this.renderAnnotations()}
//         </MapboxGL.MapView>
//       </Page>
//     );
//   }
// }

// export default ShowPointAnnotation;


import React from 'react';
import MapboxGL from '@mapbox/react-native-mapbox-gl';
import {
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Icon} from 'react-native-elements';
import SafeAreaView from 'react-native-safe-area-view';

import MapHeader from './components/common/MapHeader';
// Styles
import sheet from './styles/sheet';
import colors from './styles/colors';
// Utils
import {IS_ANDROID} from './utils';
import config from './utils/config';
// Examples
import MASKOFF_map from './components/MASKOFF_map'
import ShowMap from './components/ShowMap';
import SetPitch from './components/SetPitch';
import SetBearing from './components/SetBearing';
import ShowClick from './components/ShowClick';
import FlyTo from './components/FlyTo';
import FitBounds from './components/FitBounds';
import SetUserTrackingModes from './components/SetUserTrackingModes';
import SetUserLocationVerticalAlignment from './components/SetUserLocationVerticalAlignment';
import ShowRegionChange from './components/ShowRegionChange';
import CustomIcon from './components/CustomIcon';
import YoYo from './components/YoYo';
import EarthQuakes from './components/EarthQuakes';
import GeoJSONSource from './components/GeoJSONSource';
import WatercolorRasterTiles from './components/WatercolorRasterTiles';
import TwoByTwo from './components/TwoByTwo';
import IndoorBuilding from './components/IndoorBuilding';
import QueryAtPoint from './components/QueryAtPoint';
import QueryWithRect from './components/QueryWithRect';
import ShapeSourceIcon from './components/ShapeSourceIcon';
import CustomVectorSource from './components/CustomVectorSource';
import ShowPointAnnotation from './components/ShowPointAnnotation';
import CreateOfflineRegion from './components/CreateOfflineRegion';
import DriveTheLine from './components/DriveTheLine';
import ImageOverlay from './components/ImageOverlay';
import DataDrivenCircleColors from './components/DataDrivenCircleColors';
import ChoroplethLayerByZoomLevel from './components/ChoroplethLayerByZoomLevel';
import PointInMapView from './components/PointInMapView';
import TakeSnapshot from './components/TakeSnapshot';
import TakeSnapshotWithMap from './components/TakeSnapshotWithMap';
import GetZoom from './components/GetZoom';
import GetCenter from './components/GetCenter';
import UserLocationChange from './components/UserLocationChange';

const styles = StyleSheet.create({
  noPermissionsText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  exampleList: {
    flex: 1,
  },
  exampleListItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#ccc',
  },
  exampleListItem: {
    paddingVertical: 32,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.secondary.white,
  },
  exampleListLabel: {
    fontSize: 18,
  },
  exampleBackground: {
    flex: 1,
    backgroundColor: colors.primary.pinkFaint,
  },
});

MapboxGL.setAccessToken(config.get('accessToken'));

class ExampleItem {
  constructor(label, Component) {
    this.label = label;
    this.Component = Component;
  }
}

const Examples = [
  new ExampleItem('MASKOFF_map', MASKOFF_map),
  new ExampleItem('Show Map', ShowMap),
  new ExampleItem('Set Pitch', SetPitch),
  new ExampleItem('Set Bearing', SetBearing),
  new ExampleItem('Show Click', ShowClick),
  new ExampleItem('Fly To', FlyTo),
  new ExampleItem('Fit Bounds', FitBounds),
  new ExampleItem('Set User Tracking Modes', SetUserTrackingModes),
  new ExampleItem(
    'Set User Location Vertical Alignment',
    SetUserLocationVerticalAlignment,
  ),
  new ExampleItem('Show Region Change', ShowRegionChange),
  new ExampleItem('Custom Icon', CustomIcon),
  new ExampleItem('Yo Yo Camera', YoYo),
  new ExampleItem('Clustering Earthquakes', EarthQuakes),
  new ExampleItem('GeoJSON Source', GeoJSONSource),
  new ExampleItem('Watercolor Raster Tiles', WatercolorRasterTiles),
  new ExampleItem('Two Map Views', TwoByTwo),
  new ExampleItem('Indoor Building Map', IndoorBuilding),
  new ExampleItem('Query Feature Point', QueryAtPoint),
  new ExampleItem('Query Features Bounding Box', QueryWithRect),
  new ExampleItem('Shape Source From Icon', ShapeSourceIcon),
  new ExampleItem('Custom Vector Source', CustomVectorSource),
  new ExampleItem('Show Point Annotation', ShowPointAnnotation),
  new ExampleItem('Create Offline Region', CreateOfflineRegion),
  new ExampleItem('Animation Along a Line', DriveTheLine),
  new ExampleItem('Image Overlay', ImageOverlay),
  new ExampleItem('Data Driven Circle Colors', DataDrivenCircleColors),
  new ExampleItem('Choropleth Layer By Zoom Level', ChoroplethLayerByZoomLevel),
  new ExampleItem('Get Pixel Point in MapView', PointInMapView),
  new ExampleItem('Take Snapshot Without Map', TakeSnapshot),
  new ExampleItem('Take Snapshot With Map', TakeSnapshotWithMap),
  new ExampleItem('Get Current Zoom', GetZoom),
  new ExampleItem('Get Center', GetCenter),
  new ExampleItem('User Location Updates', UserLocationChange),
];

class App extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isFetchingAndroidPermission: IS_ANDROID,
      isAndroidPermissionGranted: true,
      activeExample: -1,
    };

    this.renderItem = this.renderItem.bind(this);
    this.onCloseExample = this.onCloseExample.bind(this);
  }

  async componentWillMount() {
    if (IS_ANDROID) {
      const isGranted = await MapboxGL.requestAndroidLocationPermissions();
      this.setState({
        isAndroidPermissionGranted: isGranted,
        isFetchingAndroidPermission: false,
      });
    }
  }

  getActiveItem() {
    if (
      this.state.activeExample < 0 ||
      this.state.activeExample >= Examples.length
    ) {
      return null;
    }
    return Examples[this.state.activeExample];
  }

  onExamplePress(activeExamplePosition) {
    this.setState({activeExample: activeExamplePosition});
  }

  onCloseExample() {
    this.setState({activeExample: -1});
  }

  renderItem({item, index}) {
    return (
      <View style={styles.exampleListItemBorder}>
        <TouchableOpacity onPress={() => this.onExamplePress(index)}>
          <View style={styles.exampleListItem}>
            <Text style={styles.exampleListLabel}>{item.label}</Text>
            <Icon name="keyboard-arrow-right" />
          </View>
        </TouchableOpacity>
      </View>
    );
  }

  renderActiveExample() {
    const item = this.getActiveItem();

    const modalProps = {
      visible: !!item,
      transparent: true,
      animationType: 'slide',
      onRequestClose: this.onCloseExample,
    };

    return (
      <Modal {...modalProps}>
        <SafeAreaView
          style={[sheet.matchParent, {backgroundColor: colors.primary.pink}]}
          forceInset={{top: 'always'}}
        >
          <View style={styles.exampleBackground}>
            {modalProps.visible ? (
              <item.Component
                key={item.label}
                label={item.label}
                onDismissExample={this.onCloseExample}
              />
            ) : null}
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  render() {
    if (IS_ANDROID && !this.state.isAndroidPermissionGranted) {
      if (this.state.isFetchingAndroidPermission) {
        return null;
      }
      return (
        <SafeAreaView
          style={[sheet.matchParent, {backgroundColor: colors.primary.blue}]}
          forceInset={{top: 'always'}}
        >
          <View style={sheet.matchParent}>
            <Text style={styles.noPermissionsText}>
              You need to accept location permissions in order to use this
              example applications
            </Text>
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView
        style={[sheet.matchParent, {backgroundColor: colors.primary.blue}]}
        forceInset={{top: 'always'}}
      >
        <View style={sheet.matchParent}>
          <MapHeader label="React Native Mapbox GL" />

          <View style={sheet.matchParent}>
            <FlatList
              style={styles.exampleList}
              data={Examples}
              keyExtractor={item => item.label}
              renderItem={this.renderItem}
            />
          </View>

          {this.renderActiveExample()}
        </View>
      </SafeAreaView>
    );
  }
}

export default App;
