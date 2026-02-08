import { useState, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { useAutoSave } from '../hooks/useAutoSave';
import Toolbar from './Toolbar';
import ChecklistEditor from './ChecklistEditor';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { extractTagsFromContent, countWords, countCharacters } from '../utils/helpers';
import { CheckSquare, FileText } from 'lucide-react';

const NoteEditor = () => {
  const { currentNote, updateNote } = useNotesContext();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [category, setCategory] = useState('General');
  const [previewMode, setPreviewMode] = useState(false);
  const [noteType, setNoteType] = useState('note');

  const { save, saving, lastSaved } = useAutoSave(async (data) => {
    if (currentNote) {
      await updateNote(currentNote.id, data);
    }
  });

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setContent(currentNote.content);
      setTags(currentNote.tags || []);
      setCategory(currentNote.category || 'General');
      setNoteType(currentNote.type || 'note');
    }
  }, [currentNote]);

  useEffect(() => {
    if (currentNote) {
      const extractedTags = extractTagsFromContent(content);
      const uniqueTags = [...new Set([...tags, ...extractedTags])];

      save({
        title,
        content,
        tags: uniqueTags,
        category,
        type: noteType,
      });
    }
  }, [title, content, category, noteType]);

  const handleChangeNoteType = (newType) => {
    setNoteType(newType);
    updateNote(currentNote.id, { type: newType });
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const insertMarkdown = (syntax) => {
    const textarea = document.getElementById('note-content');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    let newText = '';

    switch (syntax) {
      case 'bold':
        newText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        newText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        newText = `\`${selectedText || 'code'}\``;
        break;
      case 'heading':
        newText = `\n## ${selectedText || 'Heading'}\n`;
        break;
      case 'list':
        newText = `\n- ${selectedText || 'List item'}\n`;
        break;
      case 'quote':
        newText = `\n> ${selectedText || 'Quote'}\n`;
        break;
      default:
        return;
    }

    const newContent = content.substring(0, start) + newText + content.substring(end);
    setContent(newContent);

    setTimeout(() => {
      textarea.focus();
      textarea.selectionStart = textarea.selectionEnd = start + newText.length;
    }, 0);
  };

  if (!currentNote) {
    return (
      <div className="editor-empty">
        <div className="empty-state">
          <h2>No note selected</h2>
          <p>Select a note from the sidebar or create a new one</p>
        </div>
      </div>
    );
  }

  if (noteType === 'checklist') {
    return <ChecklistEditor />;
  }

  const wordCount = countWords(content);
  const charCount = countCharacters(content);

  return (
    <div className="note-editor">
      <Toolbar
        onInsertMarkdown={insertMarkdown}
        previewMode={previewMode}
        onTogglePreview={() => setPreviewMode(!previewMode)}
        noteType={noteType}
        onChangeNoteType={handleChangeNoteType}
      />

      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note Title"
          className="editor-title-input"
        />
        <div className="editor-meta">
          <select
            value={category}
            onChange={handleCategoryChange}
            className="category-select"
          >
            <option value="General">General</option>
            <option value="Programming">Programming</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Learning">Learning</option>
            <option value="Personal">Personal</option>
          </select>
        </div>
      </div>

      {previewMode ? (
        <div className="editor-preview">
          <ReactMarkdown
            components={{
              code({ node, inline, className, children, ...props }) {
                const match = /language-(\w+)/.exec(className || '');
                return !inline && match ? (
                  <SyntaxHighlighter
                    style={vscDarkPlus}
                    language={match[1]}
                    PreTag="div"
                    {...props}
                  >
                    {String(children).replace(/\n$/, '')}
                  </SyntaxHighlighter>
                ) : (
                  <code className={className} {...props}>
                    {children}
                  </code>
                );
              },
            }}
          >
            {content}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          id="note-content"
          value={content}
          onChange={handleContentChange}
          placeholder="Start writing... Use # for tags, ## for headings, ** for bold, * for italic"
          className="editor-textarea"
        />
      )}

      <div className="editor-footer">
        <div className="editor-stats">
          <span>{wordCount} words</span>
          <span>{charCount} characters</span>
        </div>
        <div className="editor-status">
          {saving ? (
            <span className="saving">Saving...</span>
          ) : lastSaved ? (
            <span className="saved">
              Saved {new Date(lastSaved).toLocaleTimeString()}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NoteEditor;
