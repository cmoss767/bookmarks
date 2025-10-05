import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Bookmark, Folder } from '../types';
import { createBookmark, isValidUrl, getDefaultFolders } from '../utils/bookmarkManager';
import SharedGroupPreferences from 'react-native-shared-group-preferences';
import { APP_CONFIG } from '../config/app';

const { APP_GROUP_ID, STORAGE_KEYS } = APP_CONFIG;

const AddBookmarkScreen = () => {
  const [url, setUrl] = useState('');
  const [title, setTitle] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [availableFolders, setAvailableFolders] = useState<Folder[]>([]);
  const navigation = useNavigation();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const jsonString = await SharedGroupPreferences.getItem(STORAGE_KEYS.folders, APP_GROUP_ID);
      if (jsonString) {
        const folders = JSON.parse(jsonString);
        setAvailableFolders(folders);
      } else {
        // Initialize with default folders
        const defaultFolders = getDefaultFolders();
        await SharedGroupPreferences.setItem(STORAGE_KEYS.folders, JSON.stringify(defaultFolders), APP_GROUP_ID);
        setAvailableFolders(defaultFolders);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      setAvailableFolders(getDefaultFolders());
    }
  };

  const toggleTag = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    );
  };

  const saveBookmark = async () => {
    if (!url.trim()) {
      Alert.alert('Error', 'Please enter a URL');
      return;
    }

    if (!isValidUrl(url)) {
      Alert.alert('Error', 'Please enter a valid URL');
      return;
    }

    try {
      // Load existing bookmarks
      const jsonString = await SharedGroupPreferences.getItem(STORAGE_KEYS.bookmarks, APP_GROUP_ID);
      const existingBookmarks: Bookmark[] = jsonString ? JSON.parse(jsonString) : [];

      // Create new bookmark
      const newBookmark = createBookmark(url, title.trim() || undefined, selectedTags);

      // Add to existing bookmarks
      const updatedBookmarks = [newBookmark, ...existingBookmarks];

      // Save back to storage
      await SharedGroupPreferences.setItem(STORAGE_KEYS.bookmarks, JSON.stringify(updatedBookmarks), APP_GROUP_ID);

      Alert.alert('Success', 'Bookmark added successfully!', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error) {
      console.error('Failed to save bookmark:', error);
      Alert.alert('Error', 'Failed to save bookmark. Please try again.');
    }
  };

  const renderTagButton = (folder: Folder) => {
    const isSelected = selectedTags.includes(folder.id);
    return (
      <TouchableOpacity
        key={folder.id}
        style={[
          styles.tagButton,
          { backgroundColor: isSelected ? folder.color : '#f0f0f0' },
        ]}
        onPress={() => toggleTag(folder.id)}
      >
        <Text
          style={[
            styles.tagButtonText,
            { color: isSelected ? '#fff' : '#333' },
          ]}
        >
          {folder.name}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <Text style={styles.title}>Add Bookmark</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.label}>URL *</Text>
            <TextInput
              style={styles.input}
              value={url}
              onChangeText={setUrl}
              placeholder="https://example.com"
              keyboardType="url"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Title (optional)</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Custom title"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Tags</Text>
            <View style={styles.tagsContainer}>
              {availableFolders.map(renderTagButton)}
            </View>
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={saveBookmark}>
            <Text style={styles.saveButtonText}>Save Bookmark</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  inputGroup: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tagButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  tagButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddBookmarkScreen; 