import * as vscode from 'vscode';
import * as path from 'path';
import { TagManager } from './tagManager';
import { TagsTreeDataProvider } from './treeDataProvider';

/**
 * Handles file system operations to keep tags synchronized with file changes
 * Only handles VS Code UI operations - external operations require manual refresh
 */
export class FileWatcher {
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
          this.removePathsOnDelete(file.fsPath);
        });

        // Refresh tree view (debounced)
        this.scheduleRefresh();
      })
    );

    // Handle creates from VS Code UI
    this.context.subscriptions.push(
      vscode.workspace.onDidCreateFiles(() => {
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

  /**
   * Clean up invalid tags (files/folders that no longer exist)
   * Returns the number of tags removed
   */
  async cleanup(): Promise<number> {
    const allTags = this.tagManager.getAllTags();
    let removedCount = 0;

    for (const filePath of Object.keys(allTags)) {
      try {
        await vscode.workspace.fs.stat(vscode.Uri.file(filePath));
        // File exists, keep the tag
      } catch {
        // File doesn't exist, remove the tag
        this.tagManager.removeTag(filePath);
        removedCount++;
      }
    }

    // Always refresh tree view to update folder contents
    // (even if no tags were removed, untagged files in tagged folders may have changed)
    this.treeDataProvider.refresh();

    return removedCount;
  }
}
