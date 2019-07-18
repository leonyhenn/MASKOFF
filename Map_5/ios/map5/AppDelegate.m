// Copyright 2015-present 650 Industries. All rights reserved.

#import "AppDelegate.h"
#import <react-native-baidu-map/BaiduMapViewManager.h>



@implementation AppDelegate

// Put your app delegate methods here. Remember to also call methods from EXStandaloneAppDelegate superclass
// in order to keep Expo working. See example below.

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{[BaiduMapViewManager initSDK:@"REsAUWnqZ51PdWy7yAVx8ESMFCuqLSLD"];
  return [super application:application didFinishLaunchingWithOptions:launchOptions];
}

@end
