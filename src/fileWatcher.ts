import * as vscode from 'vscode';
import * as path from 'path';
import { TagManager } from './tagManager';
import { TagsTreeDataProvider } from './treeDataProvider';

/**
 * Handles file system operations to keep tags synchronized with file changes
 * Supports both VS Code workspace events and external file operations
 */
export class FileWatcher {
  /** Recently handled files to avoid double-processing */
  private recentlyHandled = new Set<string>();

  /** Debounce timeout for tree view refresh */
  private refreshTimeout?: NodeJS.Timeout;

  constructor(
    private tagManager: TagManager,
    private context: vscode.ExtensionContext,
    private treeDataProvider: TagsTreeDataProvider
  ) {}

  /**
   * Register file watchers for rename and delete events
   */
  register(): void {
    // Handle renames from VS Code UI
    this.context.subscriptions.push(
      vscode.workspace.onDidRenameFiles((event) => {
        event.files.forEach((file) => {
          const oldPath = file.oldUri.fsPath;
          const newPath = file.newUri.fsPath;

          // Mark as handled (prevent FS watcher from re-processing)
          this.markAsHandled(oldPath);
          this.markAsHandled(newPath);

          // Update tags
          this.updatePathsOnRename(oldPath, newPath);
        });

        // Refresh tree view (debounced)
        this.scheduleRefresh();
      })
    );

    // Handle deletes from VS Code UI
    this.context.subscriptions.push(
      vscode.workspace.onDidDeleteFiles((event) => {
        event.files.forEach((file) => {
          const deletedPath = file.fsPath;
          this.markAsHandled(deletedPath);
          this.removePathsOnDelete(deletedPath);
        });

        // Refresh tree view (debounced)
        this.scheduleRefresh();
      })
    );

    // Handle creates from VS Code UI
    this.context.subscriptions.push(
      vscode.workspace.onDidCreateFiles((event) => {
        event.files.forEach((file) => {
          this.markAsHandled(file.fsPath);
        });

        // Refresh tree view (debounced)
        this.scheduleRefresh();
      })
    );
  }

  /**
   * Update tag paths when a file or folder is renamed
   * Handles both direct renames and parent folder renames
   */
  private updatePathsOnRename(oldPath: string, newPath: string): void {
    // Tagged item itself renamed
    if (this.tagManager.hasTag(oldPath)) {
      const tag = this.tagManager.getTag(oldPath);
      if (tag) {
        this.tagManager.removeTag(oldPath);
        this.tagManager.addTag(newPath, tag);
      }
    }

    // Parent folder of tagged item renamed: rename all nested tags
    const allTags = this.tagManager.getAllTags();
    const oldPathWithSep = oldPath + path.sep;

    for (const [taggedPath, color] of Object.entries(allTags)) {
      if (taggedPath.startsWith(oldPathWithSep)) {
        const relativePath = taggedPath.substring(oldPath.length);
        const newTaggedPath = newPath + relativePath;
        this.tagManager.removeTag(taggedPath);
        this.tagManager.addTag(newTaggedPath, color);
      }
    }
  }

  /**
   * Remove tags when a file or folder is deleted
   * Handles both direct deletes and parent folder deletes
   */
  private removePathsOnDelete(deletedPath: string): void {
    // Tagged item removed
    if (this.tagManager.hasTag(deletedPath)) {
      this.tagManager.removeTag(deletedPath);
    }

    // Parent folder of tagged item removed: remove all nested tags
    const allTags = this.tagManager.getAllTags();
    const deletedPathWithSep = deletedPath + path.sep;

    for (const taggedPath of Object.keys(allTags)) {
      if (taggedPath.startsWith(deletedPathWithSep)) {
        this.tagManager.removeTag(taggedPath);
      }
    }
  }

  /**
   * Mark a file as recently handled to avoid double-processing
   * Automatically clears after 200ms
   */
  private markAsHandled(filePath: string): void {
    this.recentlyHandled.add(filePath);
    setTimeout(() => this.recentlyHandled.delete(filePath), 200);
  }

  /**
   * Schedule a tree view refresh with debouncing
   * Batches multiple rapid file operations into a single refresh
   */
  private scheduleRefresh(): void {
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout);
    }
    this.refreshTimeout = setTimeout(() => {
      this.treeDataProvider.refresh();
      this.refreshTimeout = undefined;
    }, 100);
  }
}
