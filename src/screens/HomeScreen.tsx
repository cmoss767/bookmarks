import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  AppState,
} from 'react-native';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

// IMPORTANT: This must match the App Group ID you created in Xcode
const appGroupId = 'group.com.chrismoss.Markd';
const userDefaultsKey = 'bookmarks';

// No storage initialization is needed here for this library

const HomeScreen = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const loadBookmarks = useCallback(async () => {
    console.log('🔄 Loading bookmarks...');
    try {
      const jsonString = await SharedGroupPreferences.getItem(
        userDefaultsKey,
        appGroupId,
      );
      console.log(
        '✅ Successfully loaded bookmarks:',
        jsonString ? 'data found' : 'no data',
      );

      if (jsonString) {
        const storedBookmarks = JSON.parse(jsonString);
        if (Array.isArray(storedBookmarks)) {
          setBookmarks(storedBookmarks.reverse());
        }
      } else {
        setBookmarks([]);
      }
    } catch (error) {
      // Library sometimes throws just the number 1 as an error during startup
      // This appears to be a race condition but doesn't affect functionality
      if (error === 1) {
        console.warn(
          '⚠️ App Group access temporarily unavailable (startup race condition)',
        );
        setBookmarks([]); // Set empty state as fallback
      } else {
        console.error('Failed to load bookmarks:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        console.error('Error type:', typeof error);
        console.error('Error message:', (error as Error)?.message);
        console.error('Error code:', (error as any)?.code);
      }
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active') {
        loadBookmarks();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [loadBookmarks]);

  const handleOpenUrl = (url: string) => {
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        console.log("Don't know how to open URI: " + url);
      }
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bookmarks</Text>
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.bookmarkItem}
            onPress={() => handleOpenUrl(item)}
          >
            <Text style={styles.bookmarkText}>{item}</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No bookmarks yet. Share a URL to add one!
          </Text>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  bookmarkItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bookmarkText: {
    fontSize: 16,
    color: '#007AFF',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;
