import { useState, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { useAutoSave } from '../hooks/useAutoSave';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';

const ChecklistEditor = () => {
  const { currentNote, updateNote } = useNotesContext();
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [category, setCategory] = useState('General');
  const [inputValue, setInputValue] = useState('');

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

  const parseInput = (input) => {
    if (!input.trim()) return;

    const lines = input
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);

    const newTodos = lines.map((text) => ({
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text,
      completed: false,
      createdAt: new Date().toISOString(),
    }));

    setTodos((prev) => [...prev, ...newTodos]);
    setInputValue('');
  };

  const handleAddTodo = () => {
    parseInput(inputValue);
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

  const completedCount = todos.filter((todo) => todo.completed).length;
  const totalCount = todos.length;

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
          {todos.map((todo) => (
            <div key={todo.id} className="todo-item">
              <button
                className="todo-checkbox"
                onClick={() => toggleTodoComplete(todo.id)}
              >
                {todo.completed ? (
                  <CheckCircle2 size={24} className="icon-checked" />
                ) : (
                  <Circle size={24} className="icon-unchecked" />
                )}
              </button>
              <span
                className={`todo-text ${todo.completed ? 'completed' : ''}`}
              >
                {todo.text}
              </span>
              <button
                className="btn-icon-small danger"
                onClick={() => deleteTodo(todo.id)}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="checklist-input-section">
          <textarea
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder="Type items here. Press Shift+Enter to add multiple items at once, or paste lines separated by breaks."
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
            <span className="hint-text">
              Tip: Paste multiple lines or press Shift+Enter to add all at once
            </span>
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
