# MASKOFF
### [Project demo page](https://hengye.me/MASKOFF)

This was my startup project, I wrote about **42,000** lines. Dedicated a year into it. Partner bounced at the last moment and fund was pulled out, right after I complete the entire project and before getting on the plane to China.

All code are under **strict copyright**, *please do not distribute, copy or modify.* I post it on one purpose, for showing my ability.

All sensitive information, such as access tokens, request endpoints, are replaced by '**PLACEHOLDER_FOR_GITHUB**'.

### Project intro:
* There are three main components in this project: 
  - [/backend/lambda](https://github.com/leonyhenn/MASKOFF/tree/master/backend/lambda), the backend of the app.
    - it was held on AWS lambda, until I found out lambda is not compatible with multi-thread module which can dramatically increase the backend performance.
  - [/ejected](https://github.com/leonyhenn/MASKOFF/tree/master/ejected), App front end, ejected from Expo.
  - [/front_before_eject](https://github.com/leonyhenn/MASKOFF/tree/master/front_before_eject), App front end, Expo-compatible version.
  - in [/ejected](https://github.com/leonyhenn/MASKOFF/tree/master/ejected) and [/front_before_eject](https://github.com/leonyhenn/MASKOFF/tree/master/front_before_eject), there are several folders, I ll take [/ejected](https://github.com/leonyhenn/MASKOFF/tree/master/ejected) as an example:
    - [/pages](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/pages): each page of the app
    - [/navigations](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/navigations): React-Navigation2 module of the app
    - [/components](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/components): some shared components among pages
    - [/decoy](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/decoy): don't mind, just some decoy data
    - [/leancloud](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/leancloud): real time chat test module, service provided by leancloud
    - [/store](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/store): Redux module of the app
    - [/expo_push](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/expo_push): expo push service. Did not work out due to a most of Android phone in China removed the entire Google FSM package
    - [/test](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/test): test ground for new modules
    - [/utility](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/utility): some shared utilities in the App
  - Now Don't be shy, take a look around!
### Frontend:
* About **32,000** lines of React Native code(That I wrote, not include any community modules), off-Expo
* Hundreds of components, 

  - Some are really delicated and complicated, which I am proud of, such as [/ejected/pages/Article_Roast_Display.js](https://github.com/leonyhenn/MASKOFF/blob/master/ejected/pages/Article_Roast_Display.js)
  - Due to it is a startup project, there are also components that are not so delicated

* Includes **ExpoKit**, **Redux**, **React-Navigation2** and **SQLite**
  - **ExpoKit** is scattered all over the front end
  - **Redux** is specifically written in [/ejected/store](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/store) and [/front_before_eject/store](https://github.com/leonyhenn/MASKOFF/tree/master/front_before_eject/store)
  - **React-Navigation2** is specifically written in [/ejected/navigations](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/navigations) and [/front_before_eject/navigations](https://github.com/leonyhenn/MASKOFF/tree/master/front_before_eject/navigations)
  - **SQLite** is specifically written in [/ejected/pages/ChatPage.js](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/pages/ChatPage.js) and [/front_before_eject/pages/ChatPage.js](https://github.com/leonyhenn/MASKOFF/tree/master/front_before_eject/pages/ChatPage.js) to store chat history
* includes **linking**
  - Due to the project was developed by me only, I tried to stay in Expo as much as I can, but there are modules that Expo do not support.
  - All linkings can be found in [/ejected/android/settings.gradle](https://github.com/leonyhenn/MASKOFF/tree/master/ejected/android/settings.gradle)
* Familiar with most community packages and **performance optimization**
  - I have literately tried at least a hundred of community modules
  - Due to the App is for commercial use, I value the performance the most
  - for example, you can see my performance optimization work in [set renderAheadOffset={1500} as a prop can greatly boost the performance](https://github.com/sskhandek/react-native-emoji-input/issues/36#issue-438605362) and [TextInput not support Chinese input/clear() function doesn't work in recent release of Reac-Native](https://github.com/facebook/react-native/issues/18767#issuecomment-403685280)


### Backend:
* Python3 backend, **Flask** framework, about **10,000** lines
  - Chose Flask due to its lightweight feature
* **Multi-threaded** structure to increase performance
  - Multi-thread modules are in [/backend/lambda/comments_mp_helpers.py](https://github.com/leonyhenn/MASKOFF/blob/master/backend/lambda/comments_mp_helpers.py), [/backend/lambda/frontpage.py](https://github.com/leonyhenn/MASKOFF/blob/master/backend/lambda/frontpage.py) and [/backend/lambda/utility.py](https://github.com/leonyhenn/MASKOFF/blob/master/backend/lambda/utility.py)
* Use **JSON Web Token** as auth tool
  - Auth is in [/backend/lambda/utility.py](https://github.com/leonyhenn/MASKOFF/blob/master/backend/lambda/utility.py)
* **DynamoDB** and **MongoDB** as database, Runs on **AWS EC2, Lambda**
  - DynamoDB are scattered in the entire backend
  - In the first version on AWS EC2, data was stored in MongoDB. Have to transfer to DynamoDB after migrate to AWS Lambda
* Connects to **Elasticsearch** engine
  - Search engine queries samples can be found in [/backend/lambda/frontpage.py](https://github.com/leonyhenn/MASKOFF/blob/master/backend/lambda/frontpage.py)
* [**unittest**](https://github.com/leonyhenn/MASKOFF/tree/master/backend/lambda/unittest)

 
### FAQ
* Why is it not on Github at the start?
  - It was a startup project, I was really trying to make it as fast as I can. Early stage requires a lot of trials of React Native and a couple times of re-factor. It was in a private repo in the beginning, because of too many times of refactoring, I choose to abandon that repo, along with Github, I am the only dev anyway.
