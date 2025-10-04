import { Bookmark, Folder } from '../types';

// Default folders/tags
const DEFAULT_FOLDERS: Folder[] = [
  { id: 'work', name: 'Work', color: '#007AFF', createdAt: Date.now() },
  { id: 'personal', name: 'Personal', color: '#34C759', createdAt: Date.now() },
  { id: 'reading', name: 'Reading', color: '#FF9500', createdAt: Date.now() },
  { id: 'shopping', name: 'Shopping', color: '#FF3B30', createdAt: Date.now() },
];

// Generate a simple UUID
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Extract title from URL
export const extractTitleFromUrl = (url: string): string => {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '');
  } catch {
    return url;
  }
};

// Validate URL
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Get default folders
export const getDefaultFolders = (): Folder[] => {
  return [...DEFAULT_FOLDERS];
};

// Create a new bookmark
export const createBookmark = (
  url: string,
  title?: string,
  tags: string[] = []
): Bookmark => {
  return {
    id: generateId(),
    title: title || extractTitleFromUrl(url),
    url,
    tags,
    createdAt: Date.now(),
  };
};

// Create a new folder
export const createFolder = (name: string, color: string): Folder => {
  return {
    id: generateId(),
    name,
    color,
    createdAt: Date.now(),
  };
};

// Filter bookmarks by tag
export const filterBookmarksByTag = (bookmarks: Bookmark[], tag: string): Bookmark[] => {
  if (!tag) return bookmarks;
  return bookmarks.filter(bookmark => bookmark.tags.includes(tag));
};

// Get all unique tags from bookmarks
export const getAllTags = (bookmarks: Bookmark[]): string[] => {
  const tagSet = new Set<string>();
  bookmarks.forEach(bookmark => {
    bookmark.tags.forEach(tag => tagSet.add(tag));
  });
  return Array.from(tagSet).sort();
};

// Get bookmark count by tag
export const getBookmarkCountByTag = (bookmarks: Bookmark[], tag: string): number => {
  return bookmarks.filter(bookmark => bookmark.tags.includes(tag)).length;
};