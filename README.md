# My Notes - Personal Note Taking App

A powerful, feature-rich note-taking web application built with React and Supabase. Perfect for capturing insights while learning from YouTube videos, reading articles, or browsing content online.

## Features

### Core Functionality

- **Quick Note Entry**: Large, distraction-free text area with auto-save functionality
- **Markdown Support**: Full markdown formatting including bold, italics, lists, code blocks, and more
- **Auto-Save**: Automatically saves your notes every 3 seconds while typing
- **Tag System**: Organize notes with hashtags (e.g., #javascript, #tutorial, #article)
- **Categories**: Organize notes into folders like Programming, Design, Business, etc.

### Organization

- **Powerful Search**: Search across all notes, titles, content, and tags
- **Smart Filtering**: Filter by tags, categories, and dates
- **Pin Notes**: Keep important notes at the top of your list
- **Favorites**: Star your most important notes for quick access
- **Sort Options**: Automatic sorting with pinned notes always on top

### Note Types

- Quick notes for brief insights
- Detailed notes with markdown sections
- Code snippets with syntax highlighting
- Quote highlights
- Mixed content with formatting

### Export & Backup

- **PDF Export**: Export individual notes or all notes as professionally formatted PDFs
- **JSON Backup**: Export all notes as JSON for backup purposes
- **Import**: Restore notes from JSON backup files
- **Formatted PDFs**: Preserve formatting including headings, bold, italics, and lists

### Smart Features

- **Dark/Light Mode**: Toggle between dark and light themes
- **Keyboard Shortcuts**:
  - `Ctrl+N` / `Cmd+N` - Create new note
  - `Ctrl+F` / `Cmd+F` - Focus search
  - `Ctrl+D` / `Cmd+D` - Toggle dark mode
- **Preview Mode**: View formatted markdown in real-time
- **Word & Character Count**: Track your writing progress
- **Duplicate Notes**: Create templates by duplicating existing notes
- **Relative Timestamps**: See when notes were last updated

### UI/UX Features

- Clean, minimalist interface
- Responsive design (desktop and tablet optimized)
- Collapsible sidebar for distraction-free writing
- Smooth animations and transitions
- Color-coded tags and categories
- Comfortable reading fonts

## Tech Stack

- **Frontend**: React 18 with JSX
- **Database**: Supabase (PostgreSQL)
- **Styling**: Plain CSS with CSS variables for theming
- **PDF Generation**: jsPDF
- **Markdown Rendering**: react-markdown
- **Code Highlighting**: react-syntax-highlighter
- **Icons**: Lucide React

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. The Supabase database is already configured in the `.env` file

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Project Structure

```
notes-app/
├── src/
│   ├── components/        # React components
│   │   ├── Sidebar.jsx
│   │   ├── NoteEditor.jsx
│   │   ├── NoteList.jsx
│   │   ├── SearchBar.jsx
│   │   ├── TagFilter.jsx
│   │   ├── Toolbar.jsx
│   │   └── ExportModal.jsx
│   ├── context/           # React Context
│   │   └── NotesContext.jsx
│   ├── hooks/             # Custom hooks
│   │   └── useAutoSave.js
│   ├── utils/             # Utility functions
│   │   ├── pdfExport.js
│   │   └── helpers.js
│   ├── lib/               # External service clients
│   │   └── supabase.js
│   ├── styles/            # CSS files
│   │   └── App.css
│   └── App.tsx            # Main app component
├── supabase/
│   └── migrations/        # Database migrations
└── package.json
```

## Database Schema

The app uses a single `notes` table with the following structure:

- `id` (uuid) - Unique identifier
- `title` (text) - Note title
- `content` (text) - Markdown formatted content
- `tags` (text[]) - Array of tags
- `category` (text) - Note category
- `is_pinned` (boolean) - Pin status
- `is_favorite` (boolean) - Favorite status
- `is_deleted` (boolean) - Soft delete flag
- `created_at` (timestamp) - Creation time
- `updated_at` (timestamp) - Last update time

## Usage Tips

### Markdown Formatting

- Use `**text**` for **bold**
- Use `*text*` for *italic*
- Use `` `code` `` for `inline code`
- Use `## Heading` for headings
- Use `- item` for bullet lists
- Use `> quote` for blockquotes

### Tags

Simply type `#tagname` anywhere in your note content, and it will automatically be extracted and added to the note's tag list.

### Categories

Use the category dropdown in the editor to assign notes to different categories like Programming, Design, Business, etc.

### Export

Click the export icon in the toolbar to:
- Export the current note as PDF
- Export all notes as a single PDF
- Backup all notes as JSON
- Import notes from a JSON backup

## Features in Detail

### Auto-Save

Notes are automatically saved 3 seconds after you stop typing. You'll see a "Saving..." indicator while the save is in progress, and "Saved [time]" when complete.

### Search & Filter

The search bar finds matches in note titles, content, and tags. Combine search with tag filters and category filters for powerful organization.

### Dark Mode

Toggle between light and dark themes using the moon/sun icon in the toolbar or press `Ctrl+D` / `Cmd+D`.

### PDF Export

Exported PDFs include:
- Note title and metadata
- Creation date and tags
- Formatted content with proper styling
- Professional layout with margins

## Browser Compatibility

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Performance

- Fast initial load
- Instant search and filtering
- Smooth animations
- Efficient auto-save with debouncing
- Optimized rendering with React

## Security

- Row Level Security (RLS) enabled on database
- No authentication required (personal use)
- Client-side data encryption available via Supabase

## License

This project is open source and available for personal use.
