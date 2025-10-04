export type Bookmark = {
  id: string; // UUID
  title: string;
  url: string;
  tags: string[]; // array of tags/folders
  createdAt: number; // timestamp
};

export type Folder = {
  id: string;
  name: string;
  color: string; // hex color for UI
  createdAt: number;
}; 