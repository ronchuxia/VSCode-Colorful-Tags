# Colorful Tags

Tag FILES and FOLDERS with colors. 

Similar to macOS Finder tags, this extension lets you visually organize your workspace with colored labels. You can view all tagged items grouped by colors in a dedicated sidebar.

## Features

### 🎨 Color Tag Files and Folders
- Right-click any file or folder in the Explorer
- Add color tags: Red, Orange, Yellow, Green, Blue, Purple, Gray
- Tags are displayed as colored badges (●) in the Explorer

### 📋 Sidebar View
- Dedicated sidebar panel showing all tagged items
- Files grouped by tag color
- Click to open files or expand folders
- See tagged folder contents in the tree view

### ✏️ Customize Tag Names
- Rename tag colors to meaningful labels
- Example: Rename "Red" to "Important" or "Urgent"
- Tag names persist across sessions

### 🔄 Automatic Updates
- Tags automatically update when you:
  - Rename files or folders in VSCode
  - Move files or folders in VSCode
  - Delete files or folders in VSCode
- Parent folder renamed? All child tags update automatically
- Created a new file in a tagged folder? It shows up under the tagged folder in the sidebar

### 🧹 Manual Refresh
- Refresh button in sidebar toolbar
- Cleans up invalid tags (files moved / deleted outside VSCode)
- Updates folder contents
- Use after external file operations (terminal, git, etc.)

## Usage

### Add a Tag
1. Right-click a file or folder in Explorer
2. Select "Colorful Tags: Add Tag"
3. Choose a color

You can also use the command palette by pressing `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and typing "Colorful Tags: Add Tag".

### Remove a Tag
1. Right-click a tagged file or folder in Explorer
2. Select "Colorful Tags: Remove Tag"

You can also use the command palette by pressing `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux) and typing "Colorful Tags: Remove Tag".

### Rename a Tag Color
1. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
2. Type "Colorful Tags: Rename Tag"
3. Select color and enter new name

### View Tagged Files
- Click the tag icon in the Activity Bar (left sidebar)
- Expand tag groups to see tagged files
- Click files to open them
- Expand folders to browse contents

### Refresh Tags
- Click the refresh button (↻) in the sidebar toolbar
- Removes tags for files deleted / moved outside VSCode
- Updates folder contents

## How It Works

- **Storage**: Tags are stored per workspace (not globally)
- **VSCode Operations**: Automatically tracked (rename, move, delete)
- **External Operations**: Require manual refresh (terminal, git, Finder)
- **Performance**: Debounced refreshes handle bulk operations efficiently

## Known Issues

- **Git Decorations**: May override tag colors in some cases (VSCode platform limitation)
- **External Operations**: Tags not preserved when files renamed outside VSCode (use refresh button)

## Requirements

- VS Code 1.52.0 or higher

## Release Notes

### 0.1.0 (Initial Release)

- Tag files and folders with 7 colors
- Sidebar view with grouped tags
- Automatic tag updates for VSCode operations
- Manual refresh for external operations
- Custom tag names
- Expand tagged folders in sidebar

---

## Feedback & Issues

Found a bug or have a feature request? Please open an issue on [GitHub](https://github.com/ronchuxia/VSCode-Colorful-Tags/issues).

**Enjoy organizing your workspace!** 🎨
