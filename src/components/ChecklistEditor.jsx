import { useState, useEffect } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { useAutoSave } from '../hooks/useAutoSave';
import {
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Copy,
  Edit2,
  Check,
  X,
  Heading,
  Calendar,
  GripVertical,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';

const ChecklistEditor = () => {
  const { currentNote, updateNote } = useNotesContext();
  const [title, setTitle] = useState('');
  const [todos, setTodos] = useState([]);
  const [category, setCategory] = useState('General');
  const [inputValue, setInputValue] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [draggedItem, setDraggedItem] = useState(null);
  const [collapsedHeadings, setCollapsedHeadings] = useState({});

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
      save({ title, todos, category });
    }
  }, [title, todos, category]);

  const handleTitleChange = (e) => setTitle(e.target.value);
  const handleCategoryChange = (e) => setCategory(e.target.value);

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
          dueDate: null,
          parentId: null,
          collapsed: false,
          createdAt: new Date().toISOString(),
        };
      }
    });

    setTodos((prev) => [...prev, ...newItems]);
    setInputValue('');
  };

  const handleAddTodo = () => parseInput(inputValue, 'todo');
  const handleAddHeading = () => parseInput(inputValue, 'heading');

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
    setTodos((prev) =>
      prev.filter((todo) => todo.id !== id && todo.parentId !== id)
    );
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
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const setDueDate = (id, date) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, dueDate: date } : todo
      )
    );
  };

  const addSubtask = (parentId) => {
    const newSubtask = {
      id: `todo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: 'New subtask',
      completed: false,
      type: 'todo',
      dueDate: null,
      parentId,
      collapsed: false,
      createdAt: new Date().toISOString(),
    };
    setTodos((prev) => [...prev, newSubtask]);
    setEditingId(newSubtask.id);
    setEditingText(newSubtask.text);
  };

  const toggleCollapse = (id) => {
    setTodos((prev) =>
      prev.map((todo) =>
        todo.id === id ? { ...todo, collapsed: !todo.collapsed } : todo
      )
    );
  };

  const handleDragStart = (e, item) => {
    setDraggedItem(item);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetItem) => {
    e.preventDefault();
    if (!draggedItem || draggedItem.id === targetItem.id) return;
    const dragIndex = todos.findIndex((t) => t.id === draggedItem.id);
    const targetIndex = todos.findIndex((t) => t.id === targetItem.id);
    const newTodos = [...todos];
    newTodos.splice(dragIndex, 1);
    newTodos.splice(targetIndex, 0, draggedItem);
    setTodos(newTodos);
    setDraggedItem(null);
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  const getSubtasks = (parentId) =>
    todos.filter((todo) => todo.parentId === parentId);

  const toggleHeadingCollapse = (id) => {
    setCollapsedHeadings((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Render text with clickable URLs — opens in new tab
  const renderTextWithLinks = (text) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    return parts.map((part, i) =>
      urlRegex.test(part) ? (
        <a
          key={i}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            color: '#3b82f6',
            textDecoration: 'underline',
            textUnderlineOffset: '2px',
            wordBreak: 'break-all',
            cursor: 'pointer',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {part}
        </a>
      ) : (
        part
      )
    );
  };

  const completedCount = todos.filter(
    (todo) => todo.type === 'todo' && todo.completed && !todo.parentId
  ).length;
  const totalCount = todos.filter(
    (todo) => todo.type === 'todo' && !todo.parentId
  ).length;

  if (!currentNote) {
    return (
      <div className="editor-empty">
        <p>Create a note to start</p>
      </div>
    );
  }

  const renderTodoItem = (item, level = 0) => {
    const subtasks = getSubtasks(item.id);
    const hasSubtasks = subtasks.length > 0;
    const isCollapsed = item.collapsed;

    if (item.type === 'heading') {
      return (
        <div key={item.id} className="todo-heading-item">
          <Heading size={16} className="heading-icon" />
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
                <button className="btn-icon" onClick={() => saveEdit(item.id)} title="Save">
                  <Check size={14} />
                </button>
                <button className="btn-icon" onClick={cancelEditing} title="Cancel">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="collapse-btn" onClick={() => toggleHeadingCollapse(item.id)} title="Collapse section">
                {collapsedHeadings[item.id] ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>
              <h3 className="todo-heading-text">{renderTextWithLinks(item.text)}</h3>
              <div className="todo-item-actions">
                <button className="btn-icon-small" onClick={() => startEditing(item)} title="Edit heading">
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
      <div key={item.id}>
        <div
          className={`todo-item${level > 0 ? ' todo-subtask' : ''}${
            isOverdue(item.dueDate) && !item.completed ? ' todo-overdue' : ''
          }`}
          style={{ marginLeft: `${level * 24}px` }}
          draggable={level === 0}
          onDragStart={(e) => handleDragStart(e, item)}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, item)}
        >
          {level === 0 && (
            <div className="drag-handle">
              <GripVertical size={14} />
            </div>
          )}

          {hasSubtasks && (
            <button className="collapse-btn" onClick={() => toggleCollapse(item.id)}>
              {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {editingId === item.id ? (
            <div className="todo-edit-mode">
              <button className="todo-checkbox" onClick={() => toggleTodoComplete(item.id)}>
                {item.completed ? (
                  <CheckCircle2 size={18} className="icon-checked" />
                ) : (
                  <Circle size={18} className="icon-unchecked" />
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
                <button className="btn-icon" onClick={() => saveEdit(item.id)} title="Save">
                  <Check size={14} />
                </button>
                <button className="btn-icon" onClick={cancelEditing} title="Cancel">
                  <X size={14} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <button className="todo-checkbox" onClick={() => toggleTodoComplete(item.id)}>
                {item.completed ? (
                  <CheckCircle2 size={18} className="icon-checked" />
                ) : (
                  <Circle size={18} className="icon-unchecked" />
                )}
              </button>

              <span className={`todo-text${item.completed ? ' completed' : ''}`}>
                {renderTextWithLinks(item.text)}
              </span>

              {item.dueDate && (
                <span
                  className={`due-date${
                    isOverdue(item.dueDate) && !item.completed ? ' overdue' : ''
                  }`}
                >
                  <Calendar size={12} />
                  {new Date(item.dueDate).toLocaleDateString()}
                </span>
              )}

              <div className="todo-item-actions">
                <input
                  type="date"
                  onChange={(e) => setDueDate(item.id, e.target.value)}
                  className="due-date-input"
                  title="Set due date"
                />
                {level === 0 && (
                  <button
                    className="btn-icon-small"
                    onClick={() => addSubtask(item.id)}
                    title="Add subtask"
                  >
                    <Plus size={14} />
                  </button>
                )}
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

        {hasSubtasks &&
          !isCollapsed &&
          subtasks.map((subtask) => renderTodoItem(subtask, level + 1))}
      </div>
    );
  };

  return (
    <div className="checklist-container">
      <div className="editor-header">
        <input
          type="text"
          value={title}
          onChange={handleTitleChange}
          placeholder="Note title..."
          className="editor-title-input"
        />
        <select value={category} onChange={handleCategoryChange} className="category-select">
          <option value="General">General</option>
          <option value="Programming">Programming</option>
          <option value="Design">Design</option>
          <option value="Business">Business</option>
          <option value="Personal">Personal</option>
          <option value="Work">Work</option>
          <option value="Learning">Learning</option>
        </select>
      </div>

      <div className="checklist-progress">
        <p className="progress-text">{completedCount} of {totalCount} completed</p>
        {totalCount > 0 && (
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </div>

      <div className="todos-list">
        {(() => {
          let activeCollapsedHeadingId = null;
          return todos
            .filter((item) => !item.parentId)
            .map((item) => {
              if (item.type === 'heading') {
                activeCollapsedHeadingId = collapsedHeadings[item.id] ? item.id : null;
                return renderTodoItem(item);
              }
              if (activeCollapsedHeadingId) return null;
              return renderTodoItem(item);
            });
        })()}
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
          <button onClick={handleAddTodo} className="btn-add-todos" disabled={!inputValue.trim()}>
            <Plus size={18} />
            Add Items
          </button>
          <button onClick={handleAddHeading} className="btn-add-heading" disabled={!inputValue.trim()}>
            <Heading size={18} />
            Add Heading
          </button>
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