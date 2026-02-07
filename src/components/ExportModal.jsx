import { useNotesContext } from '../context/NotesContext';
import { exportNoteToPDF, exportAllNotesToPDF } from '../utils/pdfExport';
import { exportNotesAsJSON, importNotesFromJSON } from '../utils/helpers';
import { X, FileText, Files, Database, Upload } from 'lucide-react';

const ExportModal = ({ onClose }) => {
  const { currentNote, notes, addNote } = useNotesContext();

  const handleExportCurrentNote = () => {
    if (currentNote) {
      exportNoteToPDF(currentNote);
      onClose();
    }
  };

  const handleExportAllNotes = () => {
    const activeNotes = notes.filter((note) => !note.is_deleted);
    if (activeNotes.length > 0) {
      exportAllNotesToPDF(activeNotes);
      onClose();
    } else {
      alert('No notes to export');
    }
  };

  const handleExportJSON = () => {
    const activeNotes = notes.filter((note) => !note.is_deleted);
    if (activeNotes.length > 0) {
      exportNotesAsJSON(activeNotes);
      onClose();
    } else {
      alert('No notes to export');
    }
  };

  const handleImportJSON = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        importNotesFromJSON(file)
          .then((importedNotes) => {
            let importedCount = 0;

            importedNotes.forEach((note) => {
              const { id, created_at, updated_at, is_deleted, ...noteData } = note;
              if (!is_deleted) {
                addNote(noteData);
                importedCount++;
              }
            });

            alert(`Successfully imported ${importedCount} notes`);
            onClose();
          })
          .catch((error) => {
            console.error('Import failed:', error);
            alert('Failed to import notes. Please check the file format.');
          });
      }
    };

    input.click();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Export & Import</h2>
          <button onClick={onClose} className="btn-icon">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="export-options">
            <button
              onClick={handleExportCurrentNote}
              className="export-option"
              disabled={!currentNote}
            >
              <FileText size={24} />
              <div className="export-option-text">
                <h3>Export Current Note</h3>
                <p>Export the current note as PDF</p>
              </div>
            </button>

            <button onClick={handleExportAllNotes} className="export-option">
              <Files size={24} />
              <div className="export-option-text">
                <h3>Export All Notes</h3>
                <p>Export all notes as a single PDF</p>
              </div>
            </button>

            <button onClick={handleExportJSON} className="export-option">
              <Database size={24} />
              <div className="export-option-text">
                <h3>Backup as JSON</h3>
                <p>Download all notes as JSON file</p>
              </div>
            </button>

            <button onClick={handleImportJSON} className="export-option">
              <Upload size={24} />
              <div className="export-option-text">
                <h3>Import from JSON</h3>
                <p>Restore notes from JSON backup</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
