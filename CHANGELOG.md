# Change Log

All notable changes to the "Colorful Tags" extension will be documented in this file.

## [0.1.0] - 2025-10-10

### Added
- Tag files and folders with 7 colors
- Right-click context menu commands
  - Add Tag
  - Remove Tag
- Dedicated sidebar view showing all tagged items grouped by color
- Custom tag names
- Automatic update for file operations within VSCode:
  - Rename / move
  - Create
  - Delete
- Manual refresh for file operations outside VSCode

### Highlights
- Expand tagged folders to view contents in it in the sidebar (like favorites)
- Tags are preserved when files are moved or renamed within VSCode
- Tags are removed when files are deleted within VSCode (they won't come back even if you undo, or create a new file with the same name)
- Automatically updates the side bar (if you create / delete an untagged file in a tagged folder, the side bar will refresh to reflect the change)
- Tags are preserved across VSCode sessions

### Known Issues
- Git decorations may override tag colors
- External file operations (terminal, git, Finder) require manual refresh
- Tags are not preserved when files are renamed outside VSCode

## [Unreleased]

### Planned Features
- Show tagged files in Explorer view (like Outline/Timeline panel)
- User settings for customization
  - Toggle tag visibility in Explorer
  - Configure auto-update behavior
- Custom tag colors
  - User-defined colors
  - Unlimited types of tags
- Multiple tags per file
- Direct tag editing in sidebar view
  - Change tag colors / names from sidebar
  - Quick tag switching / removing
- Right-click context menu in sidebar view
  - Rename file
  - Delete file
  - Explorer-like context menu actions
- Drag and drop support in sidebar
  - Reorder files within tag groups
  - Move files between different tags
- Undo-safe tag deletion (restore tags when file deletion is undone)
- Automatic detection of external file operations
- Tag search and filter functionality
- Bulk tag operations (tag multiple files at once)
