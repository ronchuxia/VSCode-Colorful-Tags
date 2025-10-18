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

## [1.0.0] - 2025-10-16

### Added
- **Right-Click Context Menu in Sidebar**
  - **File Operations**
    - Open to the Side
    - Reveal in Explorer
    - Reveal in Finder/File Explorer
    - Open in Integrated Terminal
    - Rename (preserves tags)
    - Delete
  - **Folder Operations**
    - New File
    - New Folder
    - Reveal in Explorer
    - Reveal in Finder/File Explorer
    - Open in Integrated Terminal
    - Rename (preserves tags)
    - Delete
  - **Path Operations**
    - Copy Path
    - Copy Relative Path
  - **File Comparison**
    - Select for Compare
    - Compare with Selected
  - **Cut / Copy / Paste**
    - Cut files / folders (preserves tags)
    - Copy files / folders (doesn't copy tags)
    - Paste with automatic name increment ("file.txt" → "file copy.txt" → "file copy 2.txt")
  - **Tag Group Management**
    - Rename Tag (directly from context menu)
    - Clear Tag Group (remove all tags in a group)
- User Configurations
  - Toggle tag decorations in Explorer view


### Highlights
- Comprehensive context menu options in the sidebar that matches Explorer functionality
- Smart pasting with automatic name conflict resolution
- Tags are automatically preserved when files are renamed or moved (via cut+paste or rename)
- Context-aware menus (different options for files vs folders vs tag groups)
- Cross-platform compatibility

### Known Issues
- Cut/copy/paste only works within the sidebar (not from/to Explorer view)
- Delete operations cannot be undone

## [Unreleased]

### Planned Features
- User settings for customization
  - Configure auto-update behavior
- Custom tag colors
  - User-defined colors
  - Unlimited types of tags
- Multiple tags per file
- Drag and drop support in sidebar
  - Reorder files within tag groups
  - Move files between different tags
- Undo-safe tag deletion (restore tags when file deletion is undone)
- Automatic detection of external file operations
- Tag search and filter functionality
- Bulk tag operations (tag multiple files at once)
