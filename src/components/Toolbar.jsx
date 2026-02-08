import { useState } from 'react';
import { useNotesContext } from '../context/NotesContext';
import {
  Bold,
  Italic,
  Code,
  Heading2,
  List,
  Quote,
  FileDown,
  Copy,
  Pin,
  Star,
  Eye,
  EyeOff,
  Moon,
  Sun,
  CheckSquare,
  FileText,
} from 'lucide-react';
import ExportModal from './ExportModal';

const Toolbar = ({ onInsertMarkdown, previewMode, onTogglePreview, noteType, onChangeNoteType }) => {
  const { currentNote, duplicateNote, togglePin, toggleFavorite, darkMode, setDarkMode } =
    useNotesContext();
  const [showExportModal, setShowExportModal] = useState(false);

  const handleDuplicate = () => {
    if (currentNote) {
      duplicateNote(currentNote.id);
    }
  };

  const handleTogglePin = () => {
    if (currentNote) {
      togglePin(currentNote.id);
    }
  };

  const handleToggleFavorite = () => {
    if (currentNote) {
      toggleFavorite(currentNote.id);
    }
  };

  return (
    <>
      <div className="toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => onInsertMarkdown('bold')}
            className="toolbar-btn"
            title="Bold"
          >
            <Bold size={18} />
          </button>
          <button
            onClick={() => onInsertMarkdown('italic')}
            className="toolbar-btn"
            title="Italic"
          >
            <Italic size={18} />
          </button>
          <button
            onClick={() => onInsertMarkdown('code')}
            className="toolbar-btn"
            title="Code"
          >
            <Code size={18} />
          </button>
          <button
            onClick={() => onInsertMarkdown('heading')}
            className="toolbar-btn"
            title="Heading"
          >
            <Heading2 size={18} />
          </button>
          <button
            onClick={() => onInsertMarkdown('list')}
            className="toolbar-btn"
            title="List"
          >
            <List size={18} />
          </button>
          <button
            onClick={() => onInsertMarkdown('quote')}
            className="toolbar-btn"
            title="Quote"
          >
            <Quote size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => onChangeNoteType('note')}
            className={`toolbar-btn ${noteType === 'note' ? 'active' : ''}`}
            title="Note Mode"
          >
            <FileText size={18} />
          </button>
          <button
            onClick={() => onChangeNoteType('checklist')}
            className={`toolbar-btn ${noteType === 'checklist' ? 'active' : ''}`}
            title="Checklist Mode"
          >
            <CheckSquare size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={onTogglePreview}
            className={`toolbar-btn ${previewMode ? 'active' : ''}`}
            title={previewMode ? 'Edit Mode' : 'Preview Mode'}
          >
            {previewMode ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
          <button
            onClick={handleTogglePin}
            className={`toolbar-btn ${currentNote?.is_pinned ? 'active' : ''}`}
            title="Pin Note"
          >
            <Pin size={18} />
          </button>
          <button
            onClick={handleToggleFavorite}
            className={`toolbar-btn ${currentNote?.is_favorite ? 'active' : ''}`}
            title="Favorite"
          >
            <Star size={18} />
          </button>
          <button
            onClick={handleDuplicate}
            className="toolbar-btn"
            title="Duplicate Note"
          >
            <Copy size={18} />
          </button>
          <button
            onClick={() => setShowExportModal(true)}
            className="toolbar-btn"
            title="Export"
          >
            <FileDown size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="toolbar-btn"
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>

      {showExportModal && (
        <ExportModal onClose={() => setShowExportModal(false)} />
      )}
    </>
  );
};

export default Toolbar;
