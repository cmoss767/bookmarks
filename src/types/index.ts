export type Bookmark = {
  id: string; // UUID
  title: string;
  url: string;
  folder?: string; // optional folder/tag
}; 