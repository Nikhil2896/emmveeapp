/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import messaging from '@react-native-firebase/messaging';

messaging().setBackgroundMessageHandler(async () => {
  console.log('Message handled in the background!');
});

messaging().onNotificationOpenedApp(async () => {
  console.log('Notification caused app to open from background state');
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('Notification caused app to open from quit state:');
    }
  });

messaging().onMessage(async data => {
  console.log('Notification onMessage Listner', data);
});

AppRegistry.registerComponent(appName, () => App);
