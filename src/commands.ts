import * as vscode from 'vscode';
import { TagColor, TagColorQuickPickItem } from './types';
import { TagManager } from './tagManager';
import { FileWatcher } from './fileWatcher';

/**
 * Command handlers for the extension
 */
export class Commands {
  constructor(
    private tagManager: TagManager,
    private fileWatcher: FileWatcher
  ) {}

  /**
   * Register all commands
   */
  registerCommands(context: vscode.ExtensionContext): void {
    context.subscriptions.push(
      // Functional commands
      vscode.commands.registerCommand('colorful-tags.addTag', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.addTag(resource)),
      vscode.commands.registerCommand('colorful-tags.removeTag', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.removeTag(resource)),
      vscode.commands.registerCommand('colorful-tags.setTagName', () => this.setTagName()),
      vscode.commands.registerCommand('colorful-tags.refresh', () => this.refresh()),
      // Context menu commands
      vscode.commands.registerCommand('colorful-tags.openToSide', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.openToSide(resource)),
      vscode.commands.registerCommand('colorful-tags.revealInExplorer', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.revealInExplorer(resource)),
      vscode.commands.registerCommand('colorful-tags.revealFileInOS', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.revealFileInOS(resource)),
      vscode.commands.registerCommand('colorful-tags.copyFilePath', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.copyFilePath(resource)),
      vscode.commands.registerCommand('colorful-tags.copyRelativeFilePath', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.copyRelativeFilePath(resource)),
      vscode.commands.registerCommand('colorful-tags.renameFile', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.renameFile(resource)),
      vscode.commands.registerCommand('colorful-tags.deleteFile', (resource: vscode.Uri | vscode.TreeItem | undefined) => this.deleteFile(resource))
    );
  }

  /**
   * Add a color tag to a file or folder
   */
  private async addTag(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    // Get the file path from URI, TreeItem, or active editor
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    // Show quick pick to select a color
    const colorItems: TagColorQuickPickItem[] = [
      { label: '$(circle-filled) Red', color: TagColor.Red, description: this.tagManager.getTagName(TagColor.Red) },
      { label: '$(circle-filled) Orange', color: TagColor.Orange, description: this.tagManager.getTagName(TagColor.Orange) },
      { label: '$(circle-filled) Yellow', color: TagColor.Yellow, description: this.tagManager.getTagName(TagColor.Yellow) },
      { label: '$(circle-filled) Green', color: TagColor.Green, description: this.tagManager.getTagName(TagColor.Green) },
      { label: '$(circle-filled) Blue', color: TagColor.Blue, description: this.tagManager.getTagName(TagColor.Blue) },
      { label: '$(circle-filled) Purple', color: TagColor.Purple, description: this.tagManager.getTagName(TagColor.Purple) },
      { label: '$(circle-filled) Gray', color: TagColor.Gray, description: this.tagManager.getTagName(TagColor.Gray) }
    ];

    const selected = await vscode.window.showQuickPick(colorItems, {
      placeHolder: 'Select a color tag'
    });

    if (selected) {
      this.tagManager.addTag(filePath, selected.color);
      vscode.window.showInformationMessage(`Tag ${selected.color} added to ${this.getFileName(filePath)}`);
    }
  }

  /**
   * Remove a color tag from a file or folder
   */
  private async removeTag(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    if (!this.tagManager.hasTag(filePath)) {
      vscode.window.showWarningMessage(`${this.getFileName(filePath)} has no tag`);
      return;
    }

    this.tagManager.removeTag(filePath);
    vscode.window.showInformationMessage(`Tag removed from ${this.getFileName(filePath)}`);
  }

  /**
   * Set a custom name for a tag color
   */
  private async setTagName(): Promise<void> {
    // Show quick pick to select a color
    const colorItems: TagColorQuickPickItem[] = [
      { label: 'Red', color: TagColor.Red, description: this.tagManager.getTagName(TagColor.Red) },
      { label: 'Orange', color: TagColor.Orange, description: this.tagManager.getTagName(TagColor.Orange) },
      { label: 'Yellow', color: TagColor.Yellow, description: this.tagManager.getTagName(TagColor.Yellow) },
      { label: 'Green', color: TagColor.Green, description: this.tagManager.getTagName(TagColor.Green) },
      { label: 'Blue', color: TagColor.Blue, description: this.tagManager.getTagName(TagColor.Blue) },
      { label: 'Purple', color: TagColor.Purple, description: this.tagManager.getTagName(TagColor.Purple) },
      { label: 'Gray', color: TagColor.Gray, description: this.tagManager.getTagName(TagColor.Gray) }
    ];

    const selected = await vscode.window.showQuickPick(colorItems, {
      placeHolder: 'Select a tag color to rename'
    });

    if (!selected) {
      return;
    }

    // Show input box to enter new name
    const newName = await vscode.window.showInputBox({
      prompt: `Enter a new name for ${selected.label} tag`,
      value: this.tagManager.getTagName(selected.color),
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Tag name cannot be empty';
        }
        return null;
      }
    });

    if (newName) {
      this.tagManager.setTagName(selected.color, newName.trim());
      vscode.window.showInformationMessage(`Tag ${selected.label} renamed to "${newName}"`);
    }
  }

  /**
   * Get file path from URI, TreeItem, or active editor
   */
  private getFilePath(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): string | undefined {
    if (!uriOrTreeItem) {
      // Try to get from active editor
      const activeEditor = vscode.window.activeTextEditor;
      if (activeEditor) {
        return activeEditor.document.uri.fsPath;
      }
      return undefined;
    }

    // Check if it's a URI
    if (uriOrTreeItem instanceof vscode.Uri) {
      return uriOrTreeItem.fsPath;
    }

    // Check if it's a TreeItem with resourceUri
    if ('resourceUri' in uriOrTreeItem && uriOrTreeItem.resourceUri) {
      return uriOrTreeItem.resourceUri.fsPath;
    }

    return undefined;
  }

  /**
   * Get file name from path
   */
  private getFileName(filePath: string): string {
    const parts = filePath.split(/[\\/]/);
    return parts[parts.length - 1] || filePath;
  }

  /**
   * Refresh and clean up invalid tags
   */
  private async refresh(): Promise<void> {
    const removedCount = await this.fileWatcher.cleanup();

    if (removedCount > 0) {
      vscode.window.showInformationMessage(`Removed ${removedCount} invalid tag(s)`);
    } else {
      vscode.window.showInformationMessage('All tags are valid');
    }
  }

  /**
   * Open file to the side (in split editor)
   */
  private async openToSide(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('vscode.open', uri, vscode.ViewColumn.Beside);
  }

  /**
   * Reveal file or folder in Explorer view
   */
  private async revealInExplorer(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('revealInExplorer', uri);
  }

  /**
   * Reveal file or folder in OS file manager (Finder/Explorer/File Manager)
   */
  private async revealFileInOS(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('revealFileInOS', uri);
  }

  /**
   * Copy absolute file path to clipboard
   */
  private async copyFilePath(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('copyFilePath', uri);
  }

  /**
   * Copy workspace-relative file path to clipboard
   */
  private async copyRelativeFilePath(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const uri = vscode.Uri.file(filePath);
    await vscode.commands.executeCommand('copyRelativeFilePath', uri);
  }

  /**
   * Rename file or folder
   */
  private async renameFile(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const oldName = this.getFileName(filePath);
    const parentDir = filePath.substring(0, filePath.lastIndexOf(oldName));

    // Show input box to enter new name
    const newName = await vscode.window.showInputBox({
      prompt: 'Enter new name',
      value: oldName,
      validateInput: (value) => {
        if (!value || value.trim().length === 0) {
          return 'Name cannot be empty';
        }
        if (value.includes('/') || value.includes('\\')) {
          return 'Name cannot contain path separators';
        }
        return null;
      }
    });

    if (!newName || newName === oldName) {
      return;
    }

    const oldUri = vscode.Uri.file(filePath);
    const newUri = vscode.Uri.file(parentDir + newName);

    const edit = new vscode.WorkspaceEdit();
    edit.renameFile(oldUri, newUri, { overwrite: false });

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      vscode.window.showInformationMessage(`Renamed to ${newName}`);
    } else {
      vscode.window.showErrorMessage('Failed to rename');
    }
  }

  /**
   * Delete file or folder
   */
  private async deleteFile(uriOrTreeItem: vscode.Uri | vscode.TreeItem | undefined): Promise<void> {
    const filePath = this.getFilePath(uriOrTreeItem);
    if (!filePath) {
      vscode.window.showErrorMessage('No file or folder selected');
      return;
    }

    const fileName = this.getFileName(filePath);
    const uri = vscode.Uri.file(filePath);

    // Show confirmation dialog
    const choice = await vscode.window.showWarningMessage(
      `Are you sure you want to delete '${fileName}'?`,
      {
        detail: 'You can restore the file from system trash bin if available.',
        modal: true
      },
      'Delete'
    );

    if (choice !== 'Delete') {
      return;
    }

    const edit = new vscode.WorkspaceEdit();
    edit.deleteFile(uri, { recursive: true, ignoreIfNotExists: true });

    const success = await vscode.workspace.applyEdit(edit);
    if (success) {
      vscode.window.showInformationMessage(`Deleted ${fileName}`);
    } else {
      vscode.window.showErrorMessage('Failed to delete');
    }
  }
}
