import { useState } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { PlusCircle, X, Menu, Folder, Grid, List as ListIcon, Clock } from 'lucide-react';
import NoteList from './NoteList';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';

const Sidebar = () => {
  const { 
    addNote, 
    getAllCategories, 
    activeFilters, 
    setActiveFilters,
    viewMode,
    setViewMode,
    getRecentNotesList,
    setCurrentNote,
  } = useNotesContext();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showRecentNotes, setShowRecentNotes] = useState(false);

  const categories = getAllCategories();
  const recentNotes = getRecentNotesList();

  const handleNewNote = async (color = null) => {
    await addNote({ color });
    setShowColorPicker(false);
  };

  const handleCategorySelect = (category) => {
    if (selectedCategory === category) {
      setSelectedCategory(null);
      setActiveFilters({ ...activeFilters, category: null });
    } else {
      setSelectedCategory(category);
      setActiveFilters({ ...activeFilters, category });
    }
  };

  if (collapsed) {
    return (
      <div className="sidebar-collapsed">
        <button onClick={() => setCollapsed(false)} className="toggle-btn">
          <Menu size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h1 className="sidebar-title">My Notes</h1>
        <div className="sidebar-actions">
          <div className="new-note-btn-group">
            <button 
              onClick={() => handleNewNote()} 
              className="btn-icon" 
              title="New Note"
            >
              <PlusCircle size={20} />
            </button>
          </div>
          <button onClick={() => setCollapsed(true)} className="btn-icon" title="Collapse">
            <X size={20} />
          </button>
        </div>
      </div>

      <SearchBar />

      <div className="view-mode-toggle">
        <button
          onClick={() => setViewMode('card')}
          className={`view-mode-btn ${viewMode === 'card' ? 'active' : ''}`}
          title="Card View"
        >
          <Grid size={16} />
        </button>
        <button
          onClick={() => setViewMode('list')}
          className={`view-mode-btn ${viewMode === 'list' ? 'active' : ''}`}
          title="List View"
        >
          <ListIcon size={16} />
        </button>
      </div>

      {recentNotes.length > 0 && (
        <div className="recent-notes-section">
          <button
            className="section-toggle"
            onClick={() => setShowRecentNotes(!showRecentNotes)}
          >
            <Clock size={16} />
            <h3 className="section-title">Recent Notes</h3>
            <X 
              size={14} 
              className={`toggle-icon ${showRecentNotes ? 'open' : ''}`}
            />
          </button>
          {showRecentNotes && (
            <div className="recent-notes-list">
              {recentNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setCurrentNote(note)}
                  className="recent-note-item"
                >
                  {note.color && (
                    <div 
                      className="note-color-indicator"
                      style={{ backgroundColor: note.color }}
                    />
                  )}
                  <span className="recent-note-title">{note.title}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {categories.length > 0 && (
        <div className="categories-section">
          <h3 className="section-title">Categories</h3>
          <div className="categories-list">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategorySelect(category)}
                className={`category-item ${
                  selectedCategory === category ? 'active' : ''
                }`}
              >
                <Folder size={16} />
                <span>{category}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <TagFilter />

      <NoteList />
    </div>
  );
};

export default Sidebar;
