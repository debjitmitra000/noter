import { useEffect } from 'react';
import { NotesProvider, useNotesContext } from './context/NotesContext';
import Sidebar from './components/Sidebar';
import NoteEditor from './components/NoteEditor';
import './styles/App.css';

const AppContent = () => {
  const { addNote, darkMode, setDarkMode, focusMode, setFocusMode } = useNotesContext();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        addNote();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'f' && !focusMode) {
        e.preventDefault();
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
          searchInput.focus();
        }
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        setDarkMode(!darkMode);
      }

      if (e.key === 'F11') {
        e.preventDefault();
        setFocusMode(!focusMode);
      }

      if (e.key === 'Escape' && focusMode) {
        setFocusMode(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [addNote, darkMode, setDarkMode, focusMode, setFocusMode]);

  return (
    <div className="app-container">
      <Sidebar />
      <NoteEditor />
    </div>
  );
};

function App() {
  return (
    <NotesProvider>
      <AppContent />
    </NotesProvider>
  );
}

export default App;
