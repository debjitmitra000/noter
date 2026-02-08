import { useState, useEffect } from 'react';
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
  Maximize,
  Type,
  Clock,
  Play,
  Pause,
  RotateCcw,
} from 'lucide-react';
import ExportModal from './ExportModal';
import PomodoroModal from './PomodoroModal';

const Toolbar = ({ onInsertMarkdown, previewMode, onTogglePreview, noteType, onChangeNoteType }) => {
  const { currentNote, duplicateNote, togglePin, toggleFavorite, darkMode, setDarkMode, focusMode, setFocusMode, fontSize, setFontSize } =
    useNotesContext();
  const [showExportModal, setShowExportModal] = useState(false);
  const [showFontMenu, setShowFontMenu] = useState(false);
  const [showPomodoroModal, setShowPomodoroModal] = useState(false);

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

  const handleFontSizeChange = (size) => {
    setFontSize(size);
    setShowFontMenu(false);
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
            onClick={() => setFocusMode(!focusMode)}
            className={`toolbar-btn ${focusMode ? 'active' : ''}`}
            title="Focus Mode"
          >
            <Maximize size={18} />
          </button>
          
          <div className="font-size-menu">
            <button
              onClick={() => setShowFontMenu(!showFontMenu)}
              className={`toolbar-btn ${showFontMenu ? 'active' : ''}`}
              title="Font Size"
            >
              <Type size={18} />
            </button>
            {showFontMenu && (
              <div className="dropdown-menu">
                <button
                  onClick={() => handleFontSizeChange('small')}
                  className={`dropdown-item ${fontSize === 'small' ? 'active' : ''}`}
                >
                  Small
                </button>
                <button
                  onClick={() => handleFontSizeChange('medium')}
                  className={`dropdown-item ${fontSize === 'medium' ? 'active' : ''}`}
                >
                  Medium
                </button>
                <button
                  onClick={() => handleFontSizeChange('large')}
                  className={`dropdown-item ${fontSize === 'large' ? 'active' : ''}`}
                >
                  Large
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => setShowPomodoroModal(true)}
            className="toolbar-btn"
            title="Pomodoro Timer"
          >
            <Clock size={18} />
          </button>

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

      {showPomodoroModal && (
        <PomodoroModal onClose={() => setShowPomodoroModal(false)} />
      )}
    </>
  );
};

export default Toolbar;
