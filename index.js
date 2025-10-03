/**
 * @format
 */

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import notifee, { EventType } from '@notifee/react-native';
import { scheduleDailyRandomBookmarkNotification } from './src/notifications/scheduler';

AppRegistry.registerComponent(appName, () => App);

// Optional: handle notification interactions
notifee.onForegroundEvent(({ type, detail }) => {
  if (type === EventType.PRESS) {
    // Reschedule for tomorrow when user taps
    scheduleDailyRandomBookmarkNotification(9);
  }
});
