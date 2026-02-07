import { useState } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { PlusCircle, X, Menu, Folder } from 'lucide-react';
import NoteList from './NoteList';
import SearchBar from './SearchBar';
import TagFilter from './TagFilter';

const Sidebar = () => {
  const { addNote, getAllCategories, activeFilters, setActiveFilters } = useNotesContext();
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const categories = getAllCategories();

  const handleNewNote = async () => {
    await addNote();
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
          <button onClick={handleNewNote} className="btn-icon" title="New Note">
            <PlusCircle size={20} />
          </button>
          <button onClick={() => setCollapsed(true)} className="btn-icon" title="Collapse">
            <X size={20} />
          </button>
        </div>
      </div>

      <SearchBar />

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
