/*
  Written and reviewed by Heng Ye
  
  For MASKOFF.

  TODO:
  0. 检查 purpose
  1. 检查 console.error
  2. 检查 network failure
  3. 中英文
  4. 实机测验
  5. 墙
  6. 去掉不需要的 import, console.log , setTimeout 和 comments, 整理code
  2019.Jan.13
  
  0. BackHandler
  
  this._handleBackPress=this._handleBackPress.bind(this)

  componentDidMount(){
    BackHandler.addEventListener('hardwareBackPress', this._handleBackPress);
  }

  componentWillUnmount(){
    BackHandler.removeEventListener('hardwareBackPress', this._handleBackPress);
  }
*/