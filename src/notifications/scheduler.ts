import notifee, { AndroidImportance, TimestampTrigger, TriggerType, RepeatFrequency, AuthorizationStatus } from '@notifee/react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { Bookmark } from '../types';

const APP_GROUP_ID = 'group.com.chrismoss.Markd';
const USER_DEFAULTS_KEY = 'bookmarks';
const ANDROID_CHANNEL_ID = 'daily-bookmark-channel';

export async function createAndroidChannel(): Promise<string> {
  const channelId = await notifee.createChannel({
    id: ANDROID_CHANNEL_ID,
    name: 'Daily Bookmark',
    importance: AndroidImportance.HIGH,
  });
  return channelId;
}

export async function requestNotificationPermission(): Promise<boolean> {
  const settings = await notifee.requestPermission();
  return (
    settings.authorizationStatus === AuthorizationStatus.AUTHORIZED ||
    settings.authorizationStatus === AuthorizationStatus.PROVISIONAL
  );
}

function pickRandom<T>(items: T[]): T | undefined {
  if (!items || items.length === 0) return undefined;
  const index = Math.floor(Math.random() * items.length);
  return items[index];
}

async function loadBookmarks(): Promise<string[]> {
  try {
    const jsonString = await SharedGroupPreferences.getItem(
      USER_DEFAULTS_KEY,
      APP_GROUP_ID,
    );
    if (!jsonString) return [];
    const stored = JSON.parse(jsonString);
    
    if (Array.isArray(stored)) {
      // Check if it's the new Bookmark format or old string format
      if (stored.length > 0 && typeof stored[0] === 'object' && 'url' in stored[0]) {
        // New Bookmark format - extract URLs
        return (stored as Bookmark[]).map(bookmark => bookmark.url);
      } else {
        // Old string format
        return stored as string[];
      }
    }
    
    return [];
  } catch {
    return [];
  }
}

export async function scheduleDailyRandomBookmarkNotification(hourLocal: number = 9): Promise<void> {
  // Ensure channel exists on Android
  await createAndroidChannel();

  const granted = await requestNotificationPermission();
  if (!granted) return;

  const bookmarks = await loadBookmarks();
  const randomUrl = pickRandom(bookmarks);
  if (!randomUrl) return;

  // Compute next trigger time at the desired hour local time
  const now = new Date();
  const triggerDate = new Date(now);
  triggerDate.setHours(hourLocal, 0, 0, 0);
  if (triggerDate.getTime() <= now.getTime()) {
    triggerDate.setDate(triggerDate.getDate() + 1);
  }

  const trigger: TimestampTrigger = {
    type: TriggerType.TIMESTAMP,
    timestamp: triggerDate.getTime(),
    repeatFrequency: RepeatFrequency.DAILY,
    alarmManager: {
      allowWhileIdle: true,
    },
  } as any;

  await notifee.createTriggerNotification(
    {
      title: 'Your daily bookmark',
      body: randomUrl,
      android: {
        channelId: ANDROID_CHANNEL_ID,
        pressAction: { id: 'default' },
      },
      ios: {
        categoryId: 'daily-bookmark',
      },
    },
    trigger,
  );
}

export async function cancelAllScheduledNotifications(): Promise<void> {
  await notifee.cancelAllNotifications();
}

