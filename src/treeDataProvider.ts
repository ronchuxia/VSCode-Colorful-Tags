import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { TagColor } from './types';
import { TagManager } from './tagManager';

/**
 * Tree item types
 */
type TreeItemType = 'tag' | 'file' | 'folder';

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
      // File item - click to open
      this.command = {
        command: 'vscode.open',
        title: 'Open File',
        arguments: [vscode.Uri.file(filePath)]
      };
      this.resourceUri = vscode.Uri.file(filePath);
      this.tooltip = filePath;
      this.contextValue = 'file';
    } else if (type === 'folder' && filePath) {
      // Folder item - click to expand
      this.resourceUri = vscode.Uri.file(filePath);
      this.tooltip = filePath;
      this.contextValue = 'folder';
    } else if (type === 'tag') {
      // Tag group item
      this.tooltip = `Files tagged with ${label}`;
      this.contextValue = 'tagGroup';
    }
  }
}

/**
 * Provides tree data for the Tags sidebar view
 */
export class TagsTreeDataProvider implements vscode.TreeDataProvider<TagTreeItem> {
  private _onDidChangeTreeData = new vscode.EventEmitter<TagTreeItem | undefined | null | void>();
  readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

  constructor(private tagManager: TagManager) {}

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
      // Tag level - show files/folders with this tag
      return Promise.resolve(this.getFilesForTag(element.tagColor));
    } else if (element.type === 'folder' && element.filePath) {
      // Folder level - show contents of the folder
      return Promise.resolve(this.getFolderContents(element.filePath));
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

      // TODO: if the path is deleted, the item will be treated as a file
      const isDirectory = fs.existsSync(filePath) && fs.statSync(filePath).isDirectory();

      if (isDirectory) {
        // Folder - collapsible
        return new TagTreeItem(
          fileName,
          vscode.TreeItemCollapsibleState.Collapsed,
          'folder',
          undefined,
          filePath
        );
      } else {
        // File - not collapsible
        return new TagTreeItem(
          fileName,
          vscode.TreeItemCollapsibleState.None,
          'file',
          undefined,
          filePath
        );
      }
    });
  }

  /**
   * Get contents of a folder
   */
  private getFolderContents(folderPath: string): TagTreeItem[] {
    try {
      const items = fs.readdirSync(folderPath);

      return items.map(item => {
        const itemPath = path.join(folderPath, item);
        const isDirectory = fs.existsSync(itemPath) && fs.statSync(itemPath).isDirectory();

        if (isDirectory) {
          return new TagTreeItem(
            item,
            vscode.TreeItemCollapsibleState.Collapsed,
            'folder',
            undefined,
            itemPath
          );
        } else {
          return new TagTreeItem(
            item,
            vscode.TreeItemCollapsibleState.None,
            'file',
            undefined,
            itemPath
          );
        }
      });
    } catch (error) {
      console.error(`Error reading folder ${folderPath}:`, error);
      return [];
    }
  }
}
