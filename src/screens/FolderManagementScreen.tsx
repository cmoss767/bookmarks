import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Folder } from '../types';
import { createFolder, getDefaultFolders } from '../utils/bookmarkManager';
import SharedGroupPreferences from 'react-native-shared-group-preferences';

const appGroupId = 'group.com.chrismoss.Markd';
const foldersKey = 'folders';

const COLORS = [
  '#007AFF', '#34C759', '#FF9500', '#FF3B30', '#AF52DE',
  '#FF2D92', '#5AC8FA', '#FFCC00', '#FF6B6B', '#4ECDC4',
  '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'
];

const FolderManagementScreen = () => {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);
  const [folderName, setFolderName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#007AFF');
  const navigation = useNavigation();

  useEffect(() => {
    loadFolders();
  }, []);

  const loadFolders = async () => {
    try {
      const jsonString = await SharedGroupPreferences.getItem(foldersKey, appGroupId);
      if (jsonString) {
        const folders = JSON.parse(jsonString);
        setFolders(folders);
      } else {
        // Initialize with default folders
        const defaultFolders = getDefaultFolders();
        await SharedGroupPreferences.setItem(foldersKey, JSON.stringify(defaultFolders), appGroupId);
        setFolders(defaultFolders);
      }
    } catch (error) {
      console.error('Failed to load folders:', error);
      setFolders(getDefaultFolders());
    }
  };

  const saveFolders = async (updatedFolders: Folder[]) => {
    try {
      await SharedGroupPreferences.setItem(foldersKey, JSON.stringify(updatedFolders), appGroupId);
      setFolders(updatedFolders);
    } catch (error) {
      console.error('Failed to save folders:', error);
      Alert.alert('Error', 'Failed to save folders. Please try again.');
    }
  };

  const openAddModal = () => {
    setEditingFolder(null);
    setFolderName('');
    setSelectedColor('#007AFF');
    setIsModalVisible(true);
  };

  const openEditModal = (folder: Folder) => {
    setEditingFolder(folder);
    setFolderName(folder.name);
    setSelectedColor(folder.color);
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    setEditingFolder(null);
    setFolderName('');
    setSelectedColor('#007AFF');
  };

  const saveFolder = async () => {
    if (!folderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }

    try {
      let updatedFolders: Folder[];
      
      if (editingFolder) {
        // Update existing folder
        updatedFolders = folders.map(folder =>
          folder.id === editingFolder.id
            ? { ...folder, name: folderName.trim(), color: selectedColor }
            : folder
        );
      } else {
        // Create new folder
        const newFolder = createFolder(folderName.trim(), selectedColor);
        updatedFolders = [...folders, newFolder];
      }

      await saveFolders(updatedFolders);
      closeModal();
    } catch (error) {
      console.error('Failed to save folder:', error);
      Alert.alert('Error', 'Failed to save folder. Please try again.');
    }
  };

  const deleteFolder = (folderId: string) => {
    Alert.alert(
      'Delete Folder',
      'Are you sure you want to delete this folder? Bookmarks with this tag will keep the tag but you won\'t be able to filter by it.',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const updatedFolders = folders.filter(folder => folder.id !== folderId);
            await saveFolders(updatedFolders);
          },
        },
      ],
    );
  };

  const renderFolderItem = ({ item }: { item: Folder }) => (
    <View style={styles.folderItem}>
      <View style={styles.folderInfo}>
        <View style={[styles.colorIndicator, { backgroundColor: item.color }]} />
        <View style={styles.folderDetails}>
          <Text style={styles.folderName}>{item.name}</Text>
          <Text style={styles.folderDate}>
            Created {new Date(item.createdAt).toLocaleDateString()}
          </Text>
        </View>
      </View>
      <View style={styles.folderActions}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => openEditModal(item)}
        >
          <Text style={styles.editButtonText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => deleteFolder(item.id)}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderColorOption = (color: string) => (
    <TouchableOpacity
      key={color}
      style={[
        styles.colorOption,
        { backgroundColor: color },
        selectedColor === color && styles.selectedColorOption,
      ]}
      onPress={() => setSelectedColor(color)}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Manage Folders</Text>
        <TouchableOpacity style={styles.addButton} onPress={openAddModal}>
          <Text style={styles.addButtonText}>+ Add</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={folders}
        keyExtractor={(item) => item.id}
        renderItem={renderFolderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            No folders yet. Create one to organize your bookmarks!
          </Text>
        }
      />

      <Modal
        visible={isModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal}>
              <Text style={styles.cancelButton}>Cancel</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              {editingFolder ? 'Edit Folder' : 'New Folder'}
            </Text>
            <TouchableOpacity onPress={saveFolder}>
              <Text style={styles.saveButton}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalContent}>
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Folder Name</Text>
              <TextInput
                style={styles.input}
                value={folderName}
                onChangeText={setFolderName}
                placeholder="Enter folder name"
                autoFocus
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Color</Text>
              <View style={styles.colorGrid}>
                {COLORS.map(renderColorOption)}
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  folderItem: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginVertical: 5,
    borderRadius: 8,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  folderInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  colorIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    marginRight: 12,
  },
  folderDetails: {
    flex: 1,
  },
  folderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  folderDate: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  folderActions: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  cancelButton: {
    fontSize: 16,
    color: '#FF3B30',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  modalContent: {
    flex: 1,
    padding: 20,
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  selectedColorOption: {
    borderColor: '#333',
  },
});

export default FolderManagementScreen;