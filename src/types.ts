/**
 * Available tag colors matching macOS Finder tags
 */
export enum TagColor {
  Red = 'Red',
  Orange = 'Orange',
  Yellow = 'Yellow',
  Green = 'Green',
  Blue = 'Blue',
  Purple = 'Purple',
  Gray = 'Gray'
}

/**
 * Storage schema for persisting tags
 */
export interface TagStorage {
  /** Map of file/folder paths to their tag colors */
  tags: {
    [filePath: string]: TagColor;
  };
  /** Map of tag colors to their custom names */
  tagNames: {
    [color: string]: string;
  };
}

/**
 * Quick pick item for selecting tag colors
 */
export interface TagColorQuickPickItem {
  label: string;
  description?: string;
  color: TagColor;
}
