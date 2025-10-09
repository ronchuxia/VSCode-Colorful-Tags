import * as vscode from 'vscode';
import * as path from 'path';
import { TagColor } from './types';
import { TagManager } from './tagManager';

/**
 * Tree item types
 */
type TreeItemType = 'tag' | 'file';

/**
 * Custom tree item with metadata
 */
class TagTreeItem extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    public readonly collapsibleState: vscode.TreeItemCollapsibleState,
    public readonly type: TreeItemType,
    public readonly tagColor?: TagColor,
    public readonly filePath?: string
  ) {
    super(label, collapsibleState);

    if (type === 'file' && filePath) {
      // File item - make it clickable
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(filePath)]
      };
      this.resourceUri = vscode.Uri.file(filePath);
      this.tooltip = filePath;
    } else if (type === 'tag') {
      // Tag group item
      this.contextValue = 'tagGroup';
      this.tooltip = `Files tagged with ${label}`;
    }
  }
}

/**
 * Provides tree data for the Tags sidebar view
 */
export class TagsTreeDataProvider implements vscode.TreeDataProvider<TagTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TagTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private tagManager: TagManager) {
    // Refresh tree when tags change
    tagManager.onDidChangeTags(() => {
      this.refresh();
    });
  }

  /**
   * Refresh the tree view
   */
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }

  /**
   * Get tree item representation
   */
  getTreeItem(element: TagTreeItem): vscode.TreeItem {
    return element;
  }

  /**
   * Get children of a tree item
   */
  getChildren(element?: TagTreeItem): Thenable<TagTreeItem[]> {
    if (!element) {
      // Root level - show tag colors that have files
      return Promise.resolve(this.getTagGroups());
    } else if (element.type === 'tag' && element.tagColor) {
      // Tag level - show files with this tag
      return Promise.resolve(this.getFilesForTag(element.tagColor));
    } else {
      // File level - no children
      return Promise.resolve([]);
    }
  }

  /**
   * Get tag groups (colors) that have tagged files
   */
  private getTagGroups(): TagTreeItem[] {
    const usedTags = this.tagManager.getUsedTags();

    if (usedTags.length === 0) {
      return [];
    }

    return usedTags.map(color => {
      const tagName = this.tagManager.getTagName(color);
      const fileCount = this.tagManager.getFilesByTag(color).length;
      const label = `${tagName} (${fileCount})`;

      return new TagTreeItem(
        label,
        vscode.TreeItemCollapsibleState.Expanded,
        'tag',
        color
      );
    });
  }

  /**
   * Get files for a specific tag
   */
  private getFilesForTag(color: TagColor): TagTreeItem[] {
    const files = this.tagManager.getFilesByTag(color);

    return files.map(filePath => {
      const fileName = path.basename(filePath);

      return new TagTreeItem(
        fileName,
        vscode.TreeItemCollapsibleState.None,
        'file',
        undefined,
        filePath
      );
    });
  }
}
