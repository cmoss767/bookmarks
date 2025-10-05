// App configuration constants
export const APP_CONFIG = {
  // App Group ID for sharing data between main app and Share Extension
  APP_GROUP_ID: 'group.com.chrismoss.Markd',
  
  // Storage keys
  STORAGE_KEYS: {
    bookmarks: 'bookmarks',
    folders: 'folders',
  },
  
  // Subscription configuration
  SUBSCRIPTION: {
    productId: 'com.chrismoss.markd.premium.yearly',
    price: '$9.99',
    duration: 'year',
  },
  
  // Trial configuration
  TRIAL: {
    days: 7,
  },
  
  // Notification configuration
  NOTIFICATIONS: {
    dailyReminderTime: '09:00', // 9 AM
  },
} as const;

export default APP_CONFIG;