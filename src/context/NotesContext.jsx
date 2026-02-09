import { createContext, useContext, useState, useEffect } from 'react';

const NotesContext = createContext();

const generateId = () => {
  return `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useNotesContext = () => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotesContext must be used within NotesProvider');
  }
  return context;
};

export const NotesProvider = ({ children }) => {
  const [notes, setNotes] = useState([]);
  const [currentNote, setCurrentNote] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState({ tags: [], category: null });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [viewMode, setViewMode] = useState(() => {
    const saved = localStorage.getItem('viewMode');
    return saved || 'card';
  });
  const [fontSize, setFontSize] = useState(() => {
    const saved = localStorage.getItem('fontSize');
    return saved || 'medium';
  });
  const [focusMode, setFocusMode] = useState(false);
  const [recentNotes, setRecentNotes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('fontSize', fontSize);
    document.documentElement.setAttribute('data-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    if (focusMode) {
      document.body.classList.add('focus-mode');
    } else {
      document.body.classList.remove('focus-mode');
    }
  }, [focusMode]);

  // Update recent notes when currentNote changes
  useEffect(() => {
    if (currentNote) {
      setRecentNotes(prev => {
        const filtered = prev.filter(id => id !== currentNote.id);
        return [currentNote.id, ...filtered].slice(0, 5);
      });
    }
  }, [currentNote]);

  const loadNotes = () => {
    try {
      const saved = localStorage.getItem('notes');
      if (saved) {
        const loadedNotes = JSON.parse(saved);
        const activeNotes = loadedNotes.filter((note) => !note.is_deleted);
        setNotes(activeNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotesToStorage = (updatedNotes) => {
    try {
      localStorage.setItem('notes', JSON.stringify(updatedNotes));
    } catch (error) {
      console.error('Error saving notes to localStorage:', error);
      if (error.name === 'QuotaExceededError') {
        alert('Storage limit exceeded. Please delete some notes.');
      }
    }
  };

  const addNote = (noteData = {}) => {
    try {
      const newNote = {
        id: generateId(),
        title: noteData.title || 'Untitled Note',
        content: noteData.content || '',
        tags: noteData.tags || [],
        category: noteData.category || 'General',
        type: noteData.type || 'note',
        todos: noteData.todos || [],
        canvasElements: noteData.canvasElements || [], // Added canvas support
        color: noteData.color || null,
        is_pinned: false,
        is_favorite: false,
        is_deleted: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const updatedNotes = [newNote, ...notes];
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);
      setCurrentNote(newNote);
      return newNote;
    } catch (error) {
      console.error('Error adding note:', error);
      return null;
    }
  };

  const updateNote = (id, updates) => {
    try {
      const updatedNotes = notes.map((note) =>
        note.id === id
          ? { ...note, ...updates, updated_at: new Date().toISOString() }
          : note
      );

      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);

      if (currentNote?.id === id) {
        setCurrentNote(updatedNotes.find((n) => n.id === id));
      }

      return updatedNotes.find((n) => n.id === id);
    } catch (error) {
      console.error('Error updating note:', error);
      return null;
    }
  };

  const deleteNote = (id) => {
    try {
      const updatedNotes = notes.filter((note) => note.id !== id);
      setNotes(updatedNotes);
      saveNotesToStorage(updatedNotes);

      if (currentNote?.id === id) {
        setCurrentNote(null);
      }
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const duplicateNote = (id) => {
    const noteToDuplicate = notes.find((n) => n.id === id);
    if (!noteToDuplicate) return;

    addNote({
      title: `${noteToDuplicate.title} (Copy)`,
      content: noteToDuplicate.content,
      tags: noteToDuplicate.tags,
      category: noteToDuplicate.category,
      type: noteToDuplicate.type,
      todos: noteToDuplicate.todos ? JSON.parse(JSON.stringify(noteToDuplicate.todos)) : [],
      canvasElements: noteToDuplicate.canvasElements ? JSON.parse(JSON.stringify(noteToDuplicate.canvasElements)) : [], // Deep copy canvas elements
      color: noteToDuplicate.color,
    });
  };

  const togglePin = (id) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      updateNote(id, { is_pinned: !note.is_pinned });
    }
  };

  const toggleFavorite = (id) => {
    const note = notes.find((n) => n.id === id);
    if (note) {
      updateNote(id, { is_favorite: !note.is_favorite });
    }
  };

  const getFilteredNotes = () => {
    let filtered = [...notes];

    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (note) =>
          note.title.toLowerCase().includes(search) ||
          note.content.toLowerCase().includes(search) ||
          note.tags.some((tag) => tag.toLowerCase().includes(search))
      );
    }

    if (activeFilters.tags.length > 0) {
      filtered = filtered.filter((note) =>
        activeFilters.tags.every((tag) => note.tags.includes(tag))
      );
    }

    if (activeFilters.category) {
      filtered = filtered.filter(
        (note) => note.category === activeFilters.category
      );
    }

    filtered.sort((a, b) => {
      if (a.is_pinned && !b.is_pinned) return -1;
      if (!a.is_pinned && b.is_pinned) return 1;
      return new Date(b.updated_at) - new Date(a.updated_at);
    });

    return filtered;
  };

  const getRecentNotesList = () => {
    return recentNotes
      .map(id => notes.find(n => n.id === id))
      .filter(Boolean);
  };

  const getAllTags = () => {
    const tagSet = new Set();
    notes.forEach((note) => {
      note.tags.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  };

  const getAllCategories = () => {
    const categorySet = new Set();
    notes.forEach((note) => {
      if (note.category) categorySet.add(note.category);
    });
    return Array.from(categorySet).sort();
  };

  const value = {
    notes,
    currentNote,
    setCurrentNote,
    searchTerm,
    setSearchTerm,
    activeFilters,
    setActiveFilters,
    darkMode,
    setDarkMode,
    viewMode,
    setViewMode,
    fontSize,
    setFontSize,
    focusMode,
    setFocusMode,
    loading,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    togglePin,
    toggleFavorite,
    getFilteredNotes,
    getRecentNotesList,
    getAllTags,
    getAllCategories,
    loadNotes,
  };

  return (
    <NotesContext.Provider value={value}>{children}</NotesContext.Provider>
  );
};