import { useNotesContext } from '../context/NotesContext';
import { Search, X } from 'lucide-react';

const SearchBar = () => {
  const { searchTerm, setSearchTerm } = useNotesContext();

  return (
    <div className="search-bar">
      <Search size={18} className="search-icon" />
      <input
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="search-input"
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="btn-icon-small"
          title="Clear search"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
};

export default SearchBar;
