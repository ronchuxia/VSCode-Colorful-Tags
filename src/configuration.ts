import * as vscode from 'vscode';

/**
 * Configuration manager for Colorful Tags extension
 */
export class Configuration {
  private static readonly SECTION = 'colorful-tags';

  /**
   * Get whether to show tag decorations in Explorer view
   */
  static getDecorationsEnabled(): boolean {
    const config = vscode.workspace.getConfiguration(this.SECTION);
    return config.get<boolean>('decorationsEnabled', true);
  }

  /**
   * Listen for configuration changes
   */
  static onDidChange(callback: () => void): vscode.Disposable {
    return vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.SECTION)) {
        callback();
      }
    });
  }
}
