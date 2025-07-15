import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddBookmarkScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Bookmark</Text>
      <Text>This will be the form to add new bookmarks.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
  },
});

export default AddBookmarkScreen; 