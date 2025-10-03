import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Linking,
  AppState,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getTrialRemainingDays, isSubscribed } from '../subscription/state';
import { scheduleDailyRandomBookmarkNotification, cancelAllScheduledNotifications } from '../notifications/scheduler';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

// IMPORTANT: This must match the App Group ID you created in Xcode
const appGroupId = 'group.com.chrismoss.Markd';
const userDefaultsKey = 'bookmarks';

// No storage initialization is needed here for this library

const HomeScreen = () => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const navigation = useNavigation();

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

  const deleteBookmark = useCallback(async (urlToDelete: string) => {
    Alert.alert(
      'Delete Bookmark',
      'Are you sure you want to delete this bookmark?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const updatedBookmarks = bookmarks.filter(url => url !== urlToDelete);
              await SharedGroupPreferences.setItem(
                userDefaultsKey,
                JSON.stringify(updatedBookmarks),
                appGroupId,
              );
              setBookmarks(updatedBookmarks);
              console.log('✅ Bookmark deleted successfully');
            } catch (error) {
              console.error('Failed to delete bookmark:', error);
              Alert.alert('Error', 'Failed to delete bookmark. Please try again.');
            }
          },
        },
      ],
    );
  }, [bookmarks]);

  useEffect(() => {
    loadBookmarks();
    (async () => {
      setTrialDaysLeft(await getTrialRemainingDays());
      setSubscribed(await isSubscribed());
    })();
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

  const renderBookmarkItem = ({ item }: { item: string }) => (
    <View style={styles.bookmarkItem}>
      <TouchableOpacity
        style={styles.bookmarkContent}
        onPress={() => handleOpenUrl(item)}
      >
        <Text style={styles.bookmarkText} numberOfLines={2}>
          {item}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => deleteBookmark(item)}
      >
        <Text style={styles.deleteButtonText}>×</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={styles.title}>Bookmarks</Text>
        {!subscribed && (
          <TouchableOpacity onPress={() => navigation.navigate('Paywall' as never)}>
            <View style={styles.upgradePill}>
              <Text style={styles.upgradePillText}>{trialDaysLeft > 0 ? `${trialDaysLeft}d left` : 'Upgrade'}</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => scheduleDailyRandomBookmarkNotification(9)}
        >
          <Text style={styles.actionButtonText}>Enable Daily Reminder</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionButton, styles.actionButtonSecondary]}
          onPress={() => cancelAllScheduledNotifications()}
        >
          <Text style={styles.actionButtonText}>Disable</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={bookmarks}
        keyExtractor={(item, index) => item + index}
        renderItem={renderBookmarkItem}
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
  actionsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 10,
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 6,
  },
  actionButtonSecondary: {
    backgroundColor: '#8E8E93',
  },
  actionButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  upgradePill: {
    backgroundColor: '#FF9500',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  upgradePillText: {
    color: '#fff',
    fontWeight: '700',
  },
  bookmarkItem: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  bookmarkContent: {
    flex: 1,
    padding: 15,
  },
  bookmarkText: {
    fontSize: 16,
    color: '#007AFF',
  },
  deleteButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF3B30',
    borderTopRightRadius: 8,
    borderBottomRightRadius: 8,
  },
  deleteButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
});

export default HomeScreen;
