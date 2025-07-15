declare module 'react-native-shared-group-preferences' {
  interface SharedGroupPreferences {
    getItem(key: string, appGroup: string): Promise<string | null>;
    setItem(key: string, value: string, appGroup: string): Promise<void>;
  }

  const preferences: SharedGroupPreferences;
  export default preferences;
} 