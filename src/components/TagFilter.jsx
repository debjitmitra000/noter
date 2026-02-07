import { useNotesContext } from '../context/NotesContext';
import { X } from 'lucide-react';

const TagFilter = () => {
  const { getAllTags, activeFilters, setActiveFilters } = useNotesContext();

  const allTags = getAllTags();

  const toggleTag = (tag) => {
    const currentTags = activeFilters.tags;
    if (currentTags.includes(tag)) {
      setActiveFilters({
        ...activeFilters,
        tags: currentTags.filter((t) => t !== tag),
      });
    } else {
      setActiveFilters({
        ...activeFilters,
        tags: [...currentTags, tag],
      });
    }
  };

  const clearAllTags = () => {
    setActiveFilters({ ...activeFilters, tags: [] });
  };

  if (allTags.length === 0) return null;

  return (
    <div className="tag-filter">
      <div className="tag-filter-header">
        <h3 className="section-title">Tags</h3>
        {activeFilters.tags.length > 0 && (
          <button onClick={clearAllTags} className="btn-text-small">
            Clear all
          </button>
        )}
      </div>
      <div className="tag-list">
        {allTags.map((tag) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`tag-item ${
              activeFilters.tags.includes(tag) ? 'active' : ''
            }`}
          >
            #{tag}
            {activeFilters.tags.includes(tag) && <X size={12} />}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TagFilter;
