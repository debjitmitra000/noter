import { useState } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { Star, Trash2, Pin } from 'lucide-react';
import { getRelativeTime, generatePreview, generateChecklistPreview } from '../utils/helpers';
import DeleteConfirmModal from './DeleteConfirmModal';

const NoteList = () => {
  const {
    currentNote,
    setCurrentNote,
    deleteNote,
    toggleFavorite,
    togglePin,
    getFilteredNotes,
  } = useNotesContext();

  const [deleteModal, setDeleteModal] = useState({ show: false, noteId: null, noteTitle: '' });

  const filteredNotes = getFilteredNotes();

  const handleNoteClick = (note) => {
    setCurrentNote(note);
  };

  const handleDelete = async (e, noteId, noteTitle) => {
    e.stopPropagation();
    setDeleteModal({ show: true, noteId, noteTitle });
  };

  const confirmDelete = async () => {
    if (deleteModal.noteId) {
      await deleteNote(deleteModal.noteId);
      setDeleteModal({ show: false, noteId: null, noteTitle: '' });
    }
  };

  const cancelDelete = () => {
    setDeleteModal({ show: false, noteId: null, noteTitle: '' });
  };

  const handleToggleFavorite = async (e, noteId) => {
    e.stopPropagation();
    await toggleFavorite(noteId);
  };

  const handleTogglePin = async (e, noteId) => {
    e.stopPropagation();
    await togglePin(noteId);
  };

  if (filteredNotes.length === 0) {
    return (
      <div className="notes-list">
        <div className="empty-state">
          <p>No notes found</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="notes-list">
        {filteredNotes.map((note) => {
          const preview = note.type === 'checklist' 
            ? generateChecklistPreview(note.todos || [])
            : generatePreview(note.content);

          return (
            <div
              key={note.id}
              className={`note-item ${currentNote?.id === note.id ? 'active' : ''}`}
              onClick={() => handleNoteClick(note)}
            >
              <div className="note-item-header">
                <h3 className="note-item-title">{note.title}</h3>
                <div className="note-item-actions">
                  <button
                    onClick={(e) => handleTogglePin(e, note.id)}
                    className={`btn-icon-small ${note.is_pinned ? 'active' : ''}`}
                    title={note.is_pinned ? 'Unpin' : 'Pin'}
                  >
                    <Pin size={14} />
                  </button>
                  <button
                    onClick={(e) => handleToggleFavorite(e, note.id)}
                    className={`btn-icon-small ${note.is_favorite ? 'active' : ''}`}
                    title={note.is_favorite ? 'Unfavorite' : 'Favorite'}
                  >
                    <Star size={14} />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, note.id, note.title)}
                    className="btn-icon-small danger"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <p className="note-item-preview">{preview}</p>
              <div className="note-item-footer">
                <span className="note-item-time">{getRelativeTime(note.updated_at)}</span>
                {note.tags && note.tags.length > 0 && (
                  <div className="note-item-tags">
                    {note.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="tag-badge">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {deleteModal.show && (
        <DeleteConfirmModal
          onClose={cancelDelete}
          onConfirm={confirmDelete}
          title="Delete Note"
          message={`Are you sure you want to delete "${deleteModal.noteTitle}"? This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default NoteList;