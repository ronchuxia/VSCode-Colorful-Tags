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
      vscode.commands.registerCommand('colorful-tags.addTag', (uri: vscode.Uri) => this.addTag(uri)),
      vscode.commands.registerCommand('colorful-tags.removeTag', (uri: vscode.Uri) => this.removeTag(uri)),
      vscode.commands.registerCommand('colorful-tags.setTagName', () => this.setTagName()),
      vscode.commands.registerCommand('colorful-tags.refresh', () => this.refresh())
    );
  }

  /**
   * Add a color tag to a file or folder
   */
  private async addTag(uri: vscode.Uri | undefined): Promise<void> {
    // Get the file path from URI or active editor
    const filePath = this.getFilePath(uri);
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
  private async removeTag(uri: vscode.Uri | undefined): Promise<void> {
    const filePath = this.getFilePath(uri);
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
   * Get file path from URI or active editor
   */
  private getFilePath(uri: vscode.Uri | undefined): string | undefined {
    if (uri) {
      return uri.fsPath;
    }

    // Try to get from active editor
    const activeEditor = vscode.window.activeTextEditor;
    if (activeEditor) {
      return activeEditor.document.uri.fsPath;
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
}
