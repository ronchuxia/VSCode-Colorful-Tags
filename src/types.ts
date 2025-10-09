/**
 * Available tag colors matching macOS Finder tags
 */
export enum TagColor {
  Red = 'red',
  Orange = 'orange',
  Yellow = 'yellow',
  Green = 'green',
  Blue = 'blue',
  Purple = 'purple',
  Gray = 'gray'
}

/**
 * Information about a tag including its color and optional custom name
 */
export interface TagInfo {
  color: TagColor;
  name?: string;
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
