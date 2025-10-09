import * as vscode from 'vscode';
import { TagManager } from './tagManager';
import { TagStorage } from './types';

/**
 * Handles persistence of tags using VS Code's storage APIs
 */
export class TagStorageManager {
  private static readonly STORAGE_KEY = 'colorful-tags.data';

  constructor(
    private context: vscode.ExtensionContext,
    private tagManager: TagManager
  ) {}

  /**
   * Load tags from storage and populate the TagManager
   */
  async load(): Promise<void> {
    try {
      const data = this.context.globalState.get<TagStorage>(TagStorageManager.STORAGE_KEY);

      if (data) {
        // Load tags
        if (data.tags) {
          this.tagManager.loadTags(data.tags);
        }

        // Load custom tag names
        if (data.tagNames) {
          this.tagManager.loadTagNames(data.tagNames);
        }

        console.log('Tags loaded successfully from storage');
      } else {
        console.log('No saved tags found');
      }
    } catch (error) {
      console.error('Error loading tags from storage:', error);
      vscode.window.showErrorMessage('Failed to load tags from storage');
    }
  }

  /**
   * Save current tags to storage
   */
  async save(): Promise<void> {
    try {
      const data: TagStorage = {
        tags: this.tagManager.getAllTags(),
        tagNames: this.tagManager.getAllTagNames()
      };

      await this.context.globalState.update(TagStorageManager.STORAGE_KEY, data);
      console.log('Tags saved successfully to storage');
    } catch (error) {
      console.error('Error saving tags to storage:', error);
      vscode.window.showErrorMessage('Failed to save tags to storage');
    }
  }

  /**
   * Clear all stored tags
   */
  async clear(): Promise<void> {
    try {
      await this.context.globalState.update(TagStorageManager.STORAGE_KEY, undefined);
      this.tagManager.clearAll();
      console.log('Tags cleared from storage');
    } catch (error) {
      console.error('Error clearing tags from storage:', error);
      vscode.window.showErrorMessage('Failed to clear tags from storage');
    }
  }
}
