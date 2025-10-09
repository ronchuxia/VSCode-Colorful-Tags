import * as vscode from 'vscode';
import { TagColor } from './types';

/**
 * Central service for managing file and folder tags
 */
export class TagManager {
  /** In-memory map of file paths to their assigned tag colors */
  private tags: Map<string, TagColor> = new Map();

  /** Map of tag colors to their custom names */
  private tagNames: Map<TagColor, string> = new Map();

  /** Event emitter for when tags change */
  private _onDidChangeTags = new vscode.EventEmitter<void>();
  public readonly onDidChangeTags = this._onDidChangeTags.event;

  constructor() {
    // Initialize default tag names
    this.tagNames.set(TagColor.Red, 'Red');
    this.tagNames.set(TagColor.Orange, 'Orange');
    this.tagNames.set(TagColor.Yellow, 'Yellow');
    this.tagNames.set(TagColor.Green, 'Green');
    this.tagNames.set(TagColor.Blue, 'Blue');
    this.tagNames.set(TagColor.Purple, 'Purple');
    this.tagNames.set(TagColor.Gray, 'Gray');
  }

  /**
   * Add or update a tag for a file or folder
   */
  addTag(filePath: string, color: TagColor): void {
    this.tags.set(filePath, color);
    this._onDidChangeTags.fire();
  }

  /**
   * Remove a tag from a file or folder
   */
  removeTag(filePath: string): void {
    if (this.tags.delete(filePath)) {
      this._onDidChangeTags.fire();
    }
  }

  /**
   * Get the tag color for a file or folder
   */
  getTag(filePath: string): TagColor | undefined {
    return this.tags.get(filePath);
  }

  /**
   * Check if a file or folder has a tag
   */
  hasTag(filePath: string): boolean {
    return this.tags.has(filePath);
  }

  /**
   * Get all file paths that have a specific tag color
   */
  getFilesByTag(color: TagColor): string[] {
    const files: string[] = [];
    for (const [path, tagColor] of this.tags.entries()) {
      if (tagColor === color) {
        files.push(path);
      }
    }
    return files;
  }

  /**
   * Get all tag colors that are currently in use
   */
  getUsedTags(): TagColor[] {
    const usedTags = new Set<TagColor>();
    for (const color of this.tags.values()) {
      usedTags.add(color);
    }
    return Array.from(usedTags);
  }

  /**
   * Set a custom name for a tag color
   */
  setTagName(color: TagColor, name: string): void {
    this.tagNames.set(color, name);
    this._onDidChangeTags.fire();
  }

  /**
   * Get the name for a tag color (custom or default)
   */
  getTagName(color: TagColor): string {
    return this.tagNames.get(color) || color;
  }

  /**
   * Get all tags as a plain object (for storage)
   */
  getAllTags(): { [filePath: string]: TagColor } {
    const result: { [filePath: string]: TagColor } = {};
    for (const [path, color] of this.tags.entries()) {
      result[path] = color;
    }
    return result;
  }

  /**
   * Get all tag names as a plain object (for storage)
   */
  getAllTagNames(): { [color: string]: string } {
    const result: { [color: string]: string } = {};
    for (const [color, name] of this.tagNames.entries()) {
      result[color] = name;
    }
    return result;
  }

  /**
   * Load tags from storage
   */
  loadTags(tags: { [filePath: string]: TagColor }): void {
    this.tags.clear();
    for (const [path, color] of Object.entries(tags)) {
      this.tags.set(path, color);
    }
    this._onDidChangeTags.fire();
  }

  /**
   * Load tag names from storage
   */
  loadTagNames(tagNames: { [color: string]: string }): void {
    for (const [color, name] of Object.entries(tagNames)) {
      this.tagNames.set(color as TagColor, name);
    }
    this._onDidChangeTags.fire();
  }

  /**
   * Clear all tags
   */
  clearAll(): void {
    this.tags.clear();
    this._onDidChangeTags.fire();
  }
}
