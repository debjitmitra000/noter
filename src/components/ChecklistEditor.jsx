import { useState, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { CheckCircle2, Circle, Plus, Trash2, Copy, Edit2, Check, X, Heading } from 'lucide-react';

const ChecklistEditor = () => {
  const { currentNote, updateNote } = useNotesContext();
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [category, setCategory] = useState('General');
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');

  const { save, saving } = useAutoSave(async (data) => {
    if (currentNote) {
      await updateNote(currentNote.id, data);
    }
  });

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setTodos(currentNote.todos || []);
      setCategory(currentNote.category || 'General');
    }
  }, [currentNote]);

  useEffect(() => {
    if (currentNote) {
      save({
        title,
        todos,
        category,
      });
    }
  }, [title, todos, category]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const parseInput = (input, itemType = 'todo') => {
    if (!input.trim()) return;

    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newItems = lines.map((text) => {
      if (itemType === 'heading') {
        return {
          id: `heading_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          type: 'heading',
          createdAt: new Date().toISOString(),
        };
      } else {
        return {
          id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          text,
          completed: false,
          type: 'todo',
          createdAt: new Date().toISOString(),
        };
      }
    });

    setTodos((prev) => [...prev, ...newItems]);
    setInputValue('');
  };

  const handleAddTodo = () => {
    parseInput(inputValue, 'todo');
  };

  const handleAddHeading = () => {
    parseInput(inputValue, 'heading');
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault();
      parseInput(inputValue);
    }
  };

  const toggleTodoComplete = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const deleteTodo = (id) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id));
  };

  const startEditing = (todo) => {
    setEditingId(todo.id);
    setEditingText(todo.text);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditingText('');
  };

  const saveEdit = (id) => {
    if (editingText.trim()) {
      setTodos((prev) =>
        prev.map((todo) =>
          todo.id === id ? { ...todo, text: editingText.trim() } : todo
        )
      );
    }
    cancelEditing();
  };

  const handleEditKeyDown = (e, id) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveEdit(id);
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      // Optional: Add a toast notification here
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const completedCount = todos.filter((todo) => todo.type === 'todo' && todo.completed).length;
  const totalCount = todos.filter((todo) => todo.type === 'todo').length;

  if (!currentNote) {
    return (
      <div className="editor-empty">
        <p>Create a note to start</p>
      </div>
    );
  }

  return (
    <div className="note-editor">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          className="editor-title-input"
          placeholder="Checklist Title"
        />
        <select
          value={category}
          onChange={handleCategoryChange}
          className="category-select"
        >
          <option>General</option>
          <option>Programming</option>
          <option>Design</option>
          <option>Business</option>
          <option>Personal</option>
          <option>Work</option>
          <option>Learning</option>
        </select>
      </div>

      <div className="checklist-container">
        <div className="checklist-progress">
          <div className="progress-text">
            {completedCount} of {totalCount} completed
          </div>
          {totalCount > 0 && (
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              ></div>
            </div>
          )}
        </div>

        <div className="todos-list">
          {todos.map((item) => {
            if (item.type === 'heading') {
              return (
                <div key={item.id} className="todo-heading-item">
                  {editingId === item.id ? (
                    <div className="todo-edit-mode">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                        className="todo-edit-input heading-edit"
                        autoFocus
                      />
                      <div className="todo-edit-actions">
                        <button
                          className="btn-icon-small success"
                          onClick={() => saveEdit(item.id)}
                        >
                          <Check size={16} />
                        </button>
                        <button
                          className="btn-icon-small"
                          onClick={cancelEditing}
                        >
                          <X size={16} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Heading size={18} className="heading-icon" />
                      <h3 className="todo-heading-text">{item.text}</h3>
                      <div className="todo-item-actions">
                        <button
                          className="btn-icon-small"
                          onClick={() => startEditing(item)}
                          title="Edit heading"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          className="btn-icon-small danger"
                          onClick={() => deleteTodo(item.id)}
                          title="Delete heading"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            }

            return (
              <div key={item.id} className="todo-item">
                {editingId === item.id ? (
                  <div className="todo-edit-mode">
                    <button
                      className="todo-checkbox"
                      onClick={() => toggleTodoComplete(item.id)}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={24} className="icon-checked" />
                      ) : (
                        <Circle size={24} className="icon-unchecked" />
                      )}
                    </button>
                    <input
                      type="text"
                      value={editingText}
                      onChange={(e) => setEditingText(e.target.value)}
                      onKeyDown={(e) => handleEditKeyDown(e, item.id)}
                      className="todo-edit-input"
                      autoFocus
                    />
                    <div className="todo-edit-actions">
                      <button
                        className="btn-icon-small success"
                        onClick={() => saveEdit(item.id)}
                      >
                        <Check size={16} />
                      </button>
                      <button
                        className="btn-icon-small"
                        onClick={cancelEditing}
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      className="todo-checkbox"
                      onClick={() => toggleTodoComplete(item.id)}
                    >
                      {item.completed ? (
                        <CheckCircle2 size={24} className="icon-checked" />
                      ) : (
                        <Circle size={24} className="icon-unchecked" />
                      )}
                    </button>
                    <span
                      className={`todo-text ${item.completed ? 'completed' : ''}`}
                    >
                      {item.text}
                    </span>
                    <div className="todo-item-actions">
                      <button
                        className="btn-icon-small"
                        onClick={() => copyToClipboard(item.text)}
                        title="Copy to clipboard"
                      >
                        <Copy size={14} />
                      </button>
                      <button
                        className="btn-icon-small"
                        onClick={() => startEditing(item)}
                        title="Edit todo"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        className="btn-icon-small danger"
                        onClick={() => deleteTodo(item.id)}
                        title="Delete todo"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        <div className="checklist-input-section">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type items or headings here. Press Shift+Enter or click a button below to add them."
            className="checklist-input"
          />
          <div className="checklist-input-actions">
            <button
              onClick={handleAddTodo}
              className="btn-add-todos"
              disabled={!inputValue.trim()}
            >
              <Plus size={18} />
              Add Items
            </button>
            <button
              onClick={handleAddHeading}
              className="btn-add-heading"
              disabled={!inputValue.trim()}
            >
              <Heading size={18} />
              Add Heading
            </button>
          </div>
        </div>
      </div>

      <div className="editor-footer">
        <div className="editor-status">
          {saving && <span className="saving">Saving...</span>}
          {!saving && <span className="saved">Saved</span>}
        </div>
      </div>
    </div>
  );
};

export default ChecklistEditor;