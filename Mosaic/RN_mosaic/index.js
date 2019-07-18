import React from 'react'
import PropTypes from 'prop-types'
import ReactNative, {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TouchableWithoutFeedback,
  Dimensions,
  ViewPropTypes,
  StyleSheet,
  PixelRatio
} from 'react-native'
import SketchCanvas from './src/SketchCanvas'
import { requestPermissions } from './src/handlePermissions';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { takeSnapshotAsync } from 'expo'
const uuidv1 = require('uuid/v1');

var RNFS = require('react-native-fs');
const height = Dimensions.get('screen').height;
const width = Dimensions.get('screen').width;

export default class RNSketchCanvas extends React.Component {
  static propTypes = {
    containerStyle: ViewPropTypes.style,
    canvasStyle: ViewPropTypes.style,
    onStrokeStart: PropTypes.func,
    onStrokeChanged: PropTypes.func,
    onStrokeEnd: PropTypes.func,
    onClosePressed: PropTypes.func,
    onUndoPressed: PropTypes.func,
    onClearPressed: PropTypes.func,
    onPathsChange: PropTypes.func,
    user: PropTypes.string,

    closeComponent: PropTypes.node,
    eraseComponent: PropTypes.node,
    undoComponent: PropTypes.node,
    clearComponent: PropTypes.node,
    saveComponent: PropTypes.node,
    strokeComponent: PropTypes.func,
    strokeSelectedComponent: PropTypes.func,
    strokeWidthComponent: PropTypes.func,

    strokeColors: PropTypes.arrayOf(PropTypes.shape({ color: PropTypes.string })),
    defaultStrokeIndex: PropTypes.number,
    defaultStrokeWidth: PropTypes.number,

    minStrokeWidth: PropTypes.number,
    maxStrokeWidth: PropTypes.number,
    strokeWidthStep: PropTypes.number,

    savePreference: PropTypes.func,
    onSketchSaved: PropTypes.func,

    text: PropTypes.arrayOf(PropTypes.shape({
      text: PropTypes.string,
      font: PropTypes.string,
      fontSize: PropTypes.number,
      fontColor: PropTypes.string,
      overlay: PropTypes.oneOf(['TextOnSketch', 'SketchOnText']),
      anchor: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
      position: PropTypes.shape({ x: PropTypes.number, y: PropTypes.number }),
      coordinate: PropTypes.oneOf(['Absolute', 'Ratio']),
      alignment: PropTypes.oneOf(['Left', 'Center', 'Right']),
      lineHeightMultiple: PropTypes.number,
    })),
    localSourceImage: PropTypes.shape({ filename: PropTypes.string, directory: PropTypes.string, mode: PropTypes.string }),

    permissionDialogTitle: PropTypes.string,
    permissionDialogMessage: PropTypes.string,
  };

  static defaultProps = {
    containerStyle: null,
    canvasStyle: null,
    onStrokeStart: () => { },
    onStrokeChanged: () => { },
    onStrokeEnd: () => { },
    onClosePressed: () => { },
    onUndoPressed: () => { },
    onClearPressed: () => { },
    onPathsChange: () => { },
    user: null,

    closeComponent: null,
    eraseComponent: null,
    undoComponent: null,
    clearComponent: null,
    saveComponent: null,
    strokeComponent: null,
    strokeSelectedComponent: null,
    strokeWidthComponent: null,

    strokeColors: [
      { color: '#000000' },
      { color: '#FF0000' },
      { color: '#00FFFF' },
      { color: '#0000FF' },
      { color: '#0000A0' },
      { color: '#ADD8E6' },
      { color: '#800080' },
      { color: '#FFFF00' },
      { color: '#00FF00' },
      { color: '#FF00FF' },
      { color: '#FFFFFF' },
      { color: '#C0C0C0' },
      { color: '#808080' },
      { color: '#FFA500' },
      { color: '#A52A2A' },
      { color: '#800000' },
      { color: '#008000' }],
    alphlaValues: ['33', '77', 'AA', 'FF'],
    defaultStrokeIndex: 0,
    defaultStrokeWidth: 3,

    minStrokeWidth: 3,
    maxStrokeWidth: 30,
    strokeWidthStep: 3,

    savePreference: null,
    onSketchSaved: () => { },

    text: null,
    localSourceImage: null,

    permissionDialogTitle: '',
    permissionDialogMessage: '',
  };


  constructor(props) {
    super(props)

    this.state = {
      color: this.props.strokeColors[props.defaultStrokeIndex].color,
      strokeWidth: this.props.defaultStrokeWidth,
      alpha: 'FF'
    }

    this._colorChanged = false
    this._strokeWidthStep = props.strokeWidthStep
    this._alphaStep = -1
  }

  test(){
    console.log("i m in rnsketch!")
  }

  clear() {
    this._sketchCanvas.clear()
  }

  undo() {
    return this._sketchCanvas.undo()
  }

  addPath(data) {
    this._sketchCanvas.addPath(data)
  }

  deletePath(id) {
    this._sketchCanvas.deletePath(id)
  }

  async save() {
    try{
      const pixelRatio = PixelRatio.get();
      var imageHeight = this.props.imageHeight / pixelRatio;
      var imageWidth = this.props.imageWidth / pixelRatio;
      var base64 = await takeSnapshotAsync(this._sketchCanvas, {
        result: 'base64',
        height: imageHeight,
        width: imageWidth,
        quality: 0.6,
        format: 'jpg',
      });
      extension =  this.props.localSourceImage.filename.split('.').pop();
      var path = RNFS.DocumentDirectoryPath + '/MASKOFF_TEMP';
      var temp_filename = path+"/"+uuidv1()+"."+extension
      result = await RNFS.mkdir(path)
      result = await RNFS.writeFile(temp_filename, base64, 'base64')
      console.log("save()",temp_filename)
      return temp_filename
    }catch(err){
      console.log(err)
    }
    
  }

  setStrokeWidth(SW) {
    
    this.setState({ strokeWidth: SW })
  }

  _renderItem = ({ item, index }) => (
    <TouchableOpacity style={{ marginHorizontal: 2.5 }} onPress={() => {
      if (this.state.color === item.color) {
        const index = this.props.alphlaValues.indexOf(this.state.alpha)
        if (this._alphaStep < 0) {
          this._alphaStep = index === 0 ? 1 : -1
          this.setState({ alpha: this.props.alphlaValues[index + this._alphaStep] })
        } else {
          this._alphaStep = index === this.props.alphlaValues.length - 1 ? -1 : 1
          this.setState({ alpha: this.props.alphlaValues[index + this._alphaStep] })
        }
      } else {
        this.setState({ color: item.color })
        this._colorChanged = true
      }
    }}>
      {this.state.color !== item.color && this.props.strokeComponent && this.props.strokeComponent(item.color)}
      {this.state.color === item.color && this.props.strokeSelectedComponent && this.props.strokeSelectedComponent(item.color + this.state.alpha, index, this._colorChanged)}
    </TouchableOpacity>
  )

  componentDidUpdate() {
    this._colorChanged = false
  }

  async componentDidMount() {
    const isStoragePermissionAuthorized = await requestPermissions(
      this.props.permissionDialogTitle,
      this.props.permissionDialogMessage,
    );
  }

  render() {
    return (
      <View style={{backgroundColor:'black'}}>
        <View style={this.props.containerStyle}>
          <SketchCanvas
            ref={ref => this._sketchCanvas = ref}
            style={this.props.canvasStyle}
            strokeColor={this.state.color + (this.state.color.length === 9 ? '' : this.state.alpha)}
            onStrokeStart={this.props.onStrokeStart}
            onStrokeChanged={this.props.onStrokeChanged}
            onStrokeEnd={this.props.onStrokeEnd}
            user={this.props.user}
            strokeWidth={this.state.strokeWidth}
            onSketchSaved={(success, path) => this.props.onSketchSaved(success, path)}
            onPathsChange={this.props.onPathsChange}
            text={this.props.text}
            localSourceImage={this.props.localSourceImage}
            permissionDialogTitle={this.props.permissionDialogTitle}
            permissionDialogMessage={this.props.permissionDialogMessage}
          />
          
        </View>
        <View style={{ flexDirection: 'row',justifyContent:"space-evenly",backgroundColor:"black",position:"absolute",bottom:46,left:0,width:width}}>  
          <TouchableWithoutFeedback onPress={() => { this.setStrokeWidth(30) }} style={[styles.wide,{}]}>
            <Text style={[styles.text,{color:this.state.strokeWidth == 30?"#2DA157":"white"}]}>粗</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => { this.setStrokeWidth(16) }} style={[styles.mid,{}]}>
            <Text style={[styles.text,{color:this.state.strokeWidth == 16?"#2DA157":"white"}]}>中</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => { this.setStrokeWidth(6) }} style={[styles.narrow,{}]}>
            <Text style={[styles.text,{color:this.state.strokeWidth == 6?"#2DA157":"white"}]}>细</Text>
          </TouchableWithoutFeedback>
          <TouchableWithoutFeedback onPress={() => { this.props.onUndoPressed(this.undo())}}>
            <View style={[styles.undo,{}]}>
              <Ionicons name="ios-undo" color={"white"} size={25}/>
            </View>
          </TouchableWithoutFeedback>
        </View> 
        <View style={{ flexDirection: 'row',backgroundColor:"black"}}>
          <FlatList
            data={this.props.strokeColors}
            extraData={this.state}
            keyExtractor={() => Math.ceil(Math.random() * 10000000).toString()}
            renderItem={this._renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
          />
        </View>
      </View>
    );
  }
};

RNSketchCanvas.MAIN_BUNDLE = SketchCanvas.MAIN_BUNDLE;
RNSketchCanvas.DOCUMENT = SketchCanvas.DOCUMENT;
RNSketchCanvas.LIBRARY = SketchCanvas.LIBRARY;
RNSketchCanvas.CACHES = SketchCanvas.CACHES;

export {
  SketchCanvas
}

const styles = StyleSheet.create({
  wide:{
    
    backgroundColor:"transparent",
    flexDirection:"column",
    justifyContent:"center",
    
  },
  mid:{
    
    
    backgroundColor:"transparent",
    flexDirection:"column",
    justifyContent:"center"
  },
  narrow:{
    
    backgroundColor:"transparent",
    flexDirection:"column",
    justifyContent:"center"
  },
  undo:{
    backgroundColor:"transparent",
    margin:5,
    flexDirection:"row",
    justifyContent:"center",
    alignSelf:"flex-end"
  },
  circle:{
    color:"#2DA157",
    alignSelf:"center",
    textAlignVertical:"center"
  },
  text:{
    margin:5,
    fontSize:20,
    alignSelf:"center"
  }
});

