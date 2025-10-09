// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { TagManager } from './tagManager';
import { TagStorageManager } from './tagStorage';
import { Commands } from './commands';
import { TagsTreeDataProvider } from './treeDataProvider';
import { FileDecorationProvider } from './decorationProvider';

// Global instances
let tagManager: TagManager;
let tagStorage: TagStorageManager;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	console.log('Colorful Tags extension is now active!');

	// Initialize TagManager
	tagManager = new TagManager();

	// Initialize TagStorage and load saved tags
	tagStorage = new TagStorageManager(context, tagManager);
	await tagStorage.load();

	// Save tags automatically when they change
	tagManager.onDidChangeTags(() => {
		tagStorage.save();
	});

	// Register commands
	const commands = new Commands(tagManager);
	commands.registerCommands(context);

	// Register tree view
	const treeDataProvider = new TagsTreeDataProvider(tagManager);
	vscode.window.registerTreeDataProvider('colorful-tags.tagsView', treeDataProvider);

	// Register file decoration provider
	const decorationProvider = new FileDecorationProvider(tagManager);
	context.subscriptions.push(
		vscode.window.registerFileDecorationProvider(decorationProvider)
	);
}

// This method is called when your extension is deactivated
export function deactivate() {}

// Export the manager instances for use in other modules
export function getTagManager(): TagManager {
	return tagManager;
}

export function getTagStorage(): TagStorageManager {
	return tagStorage;
}
