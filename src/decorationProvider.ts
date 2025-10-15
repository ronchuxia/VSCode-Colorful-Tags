import * as vscode from 'vscode';
import { TagColor } from './types';
import { TagManager } from './tagManager';
import { Configuration } from './configuration';

/**
 * Provides file decorations (colored badges) for tagged files in the Explorer
 */
export class FileDecorationProvider implements vscode.FileDecorationProvider {
  private _onDidChangeFileDecorations = new vscode.EventEmitter<vscode.Uri | vscode.Uri[] | undefined>();
  readonly onDidChangeFileDecorations = this._onDidChangeFileDecorations.event;

  constructor(private tagManager: TagManager) {}

  /**
   * Refresh decorations (called when tags or configuration changes)
   */
  refresh(): void {
    this._onDidChangeFileDecorations.fire(undefined);
  }

  /**
   * Provide decoration for a file or folder
   */
  provideFileDecoration(uri: vscode.Uri): vscode.FileDecoration | undefined {
    // Check if decorations are enabled in settings
    if (!Configuration.getDecorationsEnabled()) {
      return undefined;
    }

    const filePath = uri.fsPath;
    const tagColor = this.tagManager.getTag(filePath);

    if (!tagColor) {
      return undefined;
    }

    // Get custom tag name or default color name
    const tagName = this.tagManager.getTagName(tagColor);

    // Map tag colors to VS Code theme colors
    const colorMap: Record<TagColor, string> = {
      [TagColor.Red]: 'charts.red',
      [TagColor.Orange]: 'charts.orange',
      [TagColor.Yellow]: 'charts.yellow',
      [TagColor.Green]: 'charts.green',
      [TagColor.Blue]: 'charts.blue',
      [TagColor.Purple]: 'charts.purple',
      [TagColor.Gray]: 'charts.gray'
    };

    return {
      badge: '●',
      color: new vscode.ThemeColor(colorMap[tagColor]),
      tooltip: `Tag: ${tagName}`
    };
  }
}
