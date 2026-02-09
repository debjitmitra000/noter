import { useState, useEffect, useRef } from 'react';
import { useNotesContext } from '../context/NotesContext';
import { useAutoSave } from '../hooks/useAutoSave';
import {
  Square,
  Circle,
  Minus,
  ArrowRight,
  Type,
  Pencil,
  Eraser,
  MousePointer,
  Trash2,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  X,
  Paintbrush,
} from 'lucide-react';

const CanvasEditor = () => {
  const { currentNote, updateNote } = useNotesContext();
  const canvasRef = useRef(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [tool, setTool] = useState('select');
  const [color, setColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('transparent');
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [elements, setElements] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentElement, setCurrentElement] = useState(null);
  const [selectedElement, setSelectedElement] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [resizeHandle, setResizeHandle] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showTextModal, setShowTextModal] = useState(false);
  const [showClearModal, setShowClearModal] = useState(false);
  const [textInput, setTextInput] = useState('');
  const [textPosition, setTextPosition] = useState(null);

  const { save, saving } = useAutoSave(async (data) => {
    if (currentNote) {
      await updateNote(currentNote.id, data);
    }
  });

  useEffect(() => {
    if (currentNote) {
      setTitle(currentNote.title);
      setCategory(currentNote.category || 'General');
      setElements(currentNote.canvasElements || []);
      setHistory([currentNote.canvasElements || []]);
      setHistoryStep(0);
    }
  }, [currentNote]);

  useEffect(() => {
    if (currentNote) {
      save({
        title,
        category,
        canvasElements: elements,
      });
    }
  }, [title, category, elements]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(panOffset.x, panOffset.y);
    ctx.scale(zoom, zoom);

    elements.forEach((element) => {
      drawElement(ctx, element, element === selectedElement);
    });

    if (currentElement) {
      drawElement(ctx, currentElement);
    }

    ctx.restore();
  }, [elements, currentElement, zoom, panOffset, selectedElement]);

  const drawElement = (ctx, element, isSelected = false) => {
    ctx.strokeStyle = element.color;
    ctx.lineWidth = element.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // Only set fillStyle if it's not transparent
    if (element.fillColor && element.fillColor !== 'transparent') {
      ctx.fillStyle = element.fillColor;
    }

    switch (element.type) {
      case 'pencil':
        ctx.beginPath();
        element.points.forEach((point, index) => {
          if (index === 0) {
            ctx.moveTo(point.x, point.y);
          } else {
            ctx.lineTo(point.x, point.y);
          }
        });
        ctx.stroke();
        break;

      case 'line':
        ctx.beginPath();
        ctx.moveTo(element.x1, element.y1);
        ctx.lineTo(element.x2, element.y2);
        ctx.stroke();
        break;

      case 'rectangle':
        if (element.filled && element.fillColor && element.fillColor !== 'transparent') {
          ctx.fillRect(element.x, element.y, element.width, element.height);
        }
        ctx.strokeRect(element.x, element.y, element.width, element.height);
        break;

      case 'circle':
        ctx.beginPath();
        const radius = Math.sqrt(
          Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)
        );
        ctx.arc(element.x1, element.y1, radius, 0, 2 * Math.PI);
        if (element.filled && element.fillColor && element.fillColor !== 'transparent') {
          ctx.fill();
        }
        ctx.stroke();
        break;

      case 'arrow':
        drawArrow(ctx, element.x1, element.y1, element.x2, element.y2, element.filled, element.fillColor);
        break;

      case 'text':
        ctx.font = `${element.fontSize || 16}px sans-serif`;
        ctx.fillStyle = element.color;
        ctx.fillText(element.text, element.x, element.y);
        break;

      default:
        break;
    }

    // Draw selection handles
    if (isSelected && tool === 'select') {
      drawSelectionHandles(ctx, element);
    }
  };

  const drawArrow = (ctx, x1, y1, x2, y2, filled, fillColor) => {
    const headLength = 15;
    const angle = Math.atan2(y2 - y1, x2 - x1);

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(x2, y2);
    ctx.lineTo(
      x2 - headLength * Math.cos(angle - Math.PI / 6),
      y2 - headLength * Math.sin(angle - Math.PI / 6)
    );
    ctx.lineTo(
      x2 - headLength * Math.cos(angle + Math.PI / 6),
      y2 - headLength * Math.sin(angle + Math.PI / 6)
    );
    ctx.lineTo(x2, y2);
    if (filled && fillColor && fillColor !== 'transparent') {
      ctx.fill();
    }
    ctx.stroke();
  };

  const drawSelectionHandles = (ctx, element) => {
    const bounds = getElementBounds(element);
    if (!bounds) return;

    ctx.strokeStyle = '#007bff';
    ctx.lineWidth = 2 / zoom;
    ctx.setLineDash([5 / zoom, 5 / zoom]);
    ctx.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
    ctx.setLineDash([]);

    const handleSize = 8 / zoom;
    const handles = [
      { x: bounds.x, y: bounds.y }, // top-left
      { x: bounds.x + bounds.width, y: bounds.y }, // top-right
      { x: bounds.x, y: bounds.y + bounds.height }, // bottom-left
      { x: bounds.x + bounds.width, y: bounds.y + bounds.height }, // bottom-right
    ];

    ctx.fillStyle = '#007bff';
    handles.forEach((handle) => {
      ctx.fillRect(
        handle.x - handleSize / 2,
        handle.y - handleSize / 2,
        handleSize,
        handleSize
      );
    });
  };

  const getElementBounds = (element) => {
    if (!element) return null;

    switch (element.type) {
      case 'rectangle':
        return {
          x: element.x,
          y: element.y,
          width: element.width,
          height: element.height,
        };
      case 'circle':
        const radius = Math.sqrt(
          Math.pow(element.x2 - element.x1, 2) + Math.pow(element.y2 - element.y1, 2)
        );
        return {
          x: element.x1 - radius,
          y: element.y1 - radius,
          width: radius * 2,
          height: radius * 2,
        };
      case 'line':
      case 'arrow':
        const minX = Math.min(element.x1, element.x2);
        const maxX = Math.max(element.x1, element.x2);
        const minY = Math.min(element.y1, element.y2);
        const maxY = Math.max(element.y1, element.y2);
        return {
          x: minX - 5,
          y: minY - 5,
          width: maxX - minX + 10,
          height: maxY - minY + 10,
        };
      case 'text':
        const textWidth = element.text.length * 8;
        return {
          x: element.x,
          y: element.y - 16,
          width: textWidth,
          height: 20,
        };
      case 'pencil':
        if (!element.points || element.points.length === 0) return null;
        const xs = element.points.map((p) => p.x);
        const ys = element.points.map((p) => p.y);
        return {
          x: Math.min(...xs) - 5,
          y: Math.min(...ys) - 5,
          width: Math.max(...xs) - Math.min(...xs) + 10,
          height: Math.max(...ys) - Math.min(...ys) + 10,
        };
      default:
        return null;
    }
  };

  const getMousePos = (e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left - panOffset.x) / zoom,
      y: (e.clientY - rect.top - panOffset.y) / zoom,
    };
  };

  const isPointInElement = (point, element) => {
    const bounds = getElementBounds(element);
    if (!bounds) return false;

    return (
      point.x >= bounds.x &&
      point.x <= bounds.x + bounds.width &&
      point.y >= bounds.y &&
      point.y <= bounds.y + bounds.height
    );
  };

  const getResizeHandle = (point, element) => {
    const bounds = getElementBounds(element);
    if (!bounds) return null;

    const handleSize = 8 / zoom;
    const handles = [
      { name: 'tl', x: bounds.x, y: bounds.y },
      { name: 'tr', x: bounds.x + bounds.width, y: bounds.y },
      { name: 'bl', x: bounds.x, y: bounds.y + bounds.height },
      { name: 'br', x: bounds.x + bounds.width, y: bounds.y + bounds.height },
    ];

    for (const handle of handles) {
      if (
        point.x >= handle.x - handleSize &&
        point.x <= handle.x + handleSize &&
        point.y >= handle.y - handleSize &&
        point.y <= handle.y + handleSize
      ) {
        return handle.name;
      }
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const pos = getMousePos(e);

    if (tool === 'select') {
      // Check if clicking on resize handle
      if (selectedElement) {
        const handle = getResizeHandle(pos, selectedElement);
        if (handle) {
          setIsResizing(true);
          setResizeHandle(handle);
          setDragStart(pos);
          return;
        }
      }

      // Check if clicking on an element
      const clickedElement = elements
        .slice()
        .reverse()
        .find((el) => isPointInElement(pos, el));

      if (clickedElement) {
        setSelectedElement(clickedElement);
        setIsDragging(true);
        setDragStart(pos);
      } else {
        setSelectedElement(null);
      }
      return;
    }

    if (tool === 'eraser') {
      const elementToRemove = elements
        .slice()
        .reverse()
        .find((el) => isPointInElement(pos, el));

      if (elementToRemove) {
        const newElements = elements.filter((el) => el !== elementToRemove);
        addToHistory(newElements);
      }
      return;
    }

    if (tool === 'text') {
      setTextPosition(pos);
      setShowTextModal(true);
      return;
    }

    setIsDrawing(true);

    let newElement;
    if (tool === 'pencil') {
      newElement = {
        id: Date.now(),
        type: 'pencil',
        points: [pos],
        color,
        fillColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        strokeWidth,
        filled: false,
      };
    } else if (tool === 'line' || tool === 'arrow') {
      newElement = {
        id: Date.now(),
        type: tool,
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color,
        fillColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        strokeWidth,
        filled: tool === 'arrow',
      };
    } else if (tool === 'rectangle') {
      newElement = {
        id: Date.now(),
        type: 'rectangle',
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0,
        color,
        fillColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        strokeWidth,
        filled: true,
      };
    } else if (tool === 'circle') {
      newElement = {
        id: Date.now(),
        type: 'circle',
        x1: pos.x,
        y1: pos.y,
        x2: pos.x,
        y2: pos.y,
        color,
        fillColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        strokeWidth,
        filled: true,
      };
    }

    setCurrentElement(newElement);
  };

  const handleMouseMove = (e) => {
    const pos = getMousePos(e);

    if (isDragging && selectedElement && tool === 'select') {
      const dx = pos.x - dragStart.x;
      const dy = pos.y - dragStart.y;

      const movedElement = moveElement(selectedElement, dx, dy);
      const newElements = elements.map((el) =>
        el === selectedElement ? movedElement : el
      );
      setElements(newElements);
      setSelectedElement(movedElement);
      setDragStart(pos);
      return;
    }

    if (isResizing && selectedElement && tool === 'select') {
      const resizedElement = resizeElement(selectedElement, resizeHandle, pos, dragStart);
      const newElements = elements.map((el) =>
        el === selectedElement ? resizedElement : el
      );
      setElements(newElements);
      setSelectedElement(resizedElement);
      return;
    }

    if (!isDrawing || !currentElement) return;

    if (tool === 'pencil') {
      setCurrentElement({
        ...currentElement,
        points: [...currentElement.points, pos],
      });
    } else if (tool === 'line' || tool === 'arrow') {
      setCurrentElement({
        ...currentElement,
        x2: pos.x,
        y2: pos.y,
      });
    } else if (tool === 'rectangle') {
      const width = pos.x - currentElement.x;
      const height = pos.y - currentElement.y;
      setCurrentElement({
        ...currentElement,
        width,
        height,
      });
    } else if (tool === 'circle') {
      setCurrentElement({
        ...currentElement,
        x2: pos.x,
        y2: pos.y,
      });
    }
  };

  const handleMouseUp = () => {
    if (currentElement) {
      addToHistory([...elements, currentElement]);
      setCurrentElement(null);
    }
    if (isDragging && selectedElement) {
      addToHistory(elements);
    }
    if (isResizing && selectedElement) {
      addToHistory(elements);
    }
    setIsDrawing(false);
    setIsDragging(false);
    setIsResizing(false);
    setResizeHandle(null);
  };

  const moveElement = (element, dx, dy) => {
    switch (element.type) {
      case 'rectangle':
        return { ...element, x: element.x + dx, y: element.y + dy };
      case 'circle':
        return {
          ...element,
          x1: element.x1 + dx,
          y1: element.y1 + dy,
          x2: element.x2 + dx,
          y2: element.y2 + dy,
        };
      case 'line':
      case 'arrow':
        return {
          ...element,
          x1: element.x1 + dx,
          y1: element.y1 + dy,
          x2: element.x2 + dx,
          y2: element.y2 + dy,
        };
      case 'text':
        return { ...element, x: element.x + dx, y: element.y + dy };
      case 'pencil':
        return {
          ...element,
          points: element.points.map((p) => ({ x: p.x + dx, y: p.y + dy })),
        };
      default:
        return element;
    }
  };

  const resizeElement = (element, handle, currentPos, startPos) => {
    const dx = currentPos.x - startPos.x;
    const dy = currentPos.y - startPos.y;

    switch (element.type) {
      case 'rectangle':
        let newRect = { ...element };
        if (handle.includes('r')) {
          newRect.width += dx;
        }
        if (handle.includes('l')) {
          newRect.x += dx;
          newRect.width -= dx;
        }
        if (handle.includes('b')) {
          newRect.height += dy;
        }
        if (handle.includes('t')) {
          newRect.y += dy;
          newRect.height -= dy;
        }
        return newRect;

      case 'circle':
        if (handle === 'br' || handle === 'tr' || handle === 'bl' || handle === 'tl') {
          return { ...element, x2: currentPos.x, y2: currentPos.y };
        }
        return element;

      case 'line':
      case 'arrow':
        if (handle === 'br' || handle === 'tr') {
          return { ...element, x2: element.x2 + dx, y2: element.y2 + dy };
        } else if (handle === 'tl' || handle === 'bl') {
          return { ...element, x1: element.x1 + dx, y1: element.y1 + dy };
        }
        return element;

      default:
        return element;
    }
  };

  const addToHistory = (newElements) => {
    const newHistory = history.slice(0, historyStep + 1);
    newHistory.push(newElements);
    setHistory(newHistory);
    setHistoryStep(newHistory.length - 1);
    setElements(newElements);
  };

  const undo = () => {
    if (historyStep > 0) {
      setHistoryStep(historyStep - 1);
      setElements(history[historyStep - 1]);
      setSelectedElement(null);
    }
  };

  const redo = () => {
    if (historyStep < history.length - 1) {
      setHistoryStep(historyStep + 1);
      setElements(history[historyStep + 1]);
      setSelectedElement(null);
    }
  };

  const clearCanvas = () => {
    setShowClearModal(true);
  };

  const confirmClear = () => {
    addToHistory([]);
    setSelectedElement(null);
    setShowClearModal(false);
  };

  const handleZoomIn = () => {
    setZoom(Math.min(zoom + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom(Math.max(zoom - 0.1, 0.3));
  };

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
  };

  const handleTextSubmit = () => {
    if (textInput.trim() && textPosition) {
      const newElement = {
        id: Date.now(),
        type: 'text',
        text: textInput,
        x: textPosition.x,
        y: textPosition.y,
        fontSize: 16,
        color,
        fillColor: fillColor === 'transparent' ? 'transparent' : fillColor,
        strokeWidth,
      };
      addToHistory([...elements, newElement]);
      setTextInput('');
      setTextPosition(null);
      setShowTextModal(false);
    }
  };

  const updateSelectedElementColor = (newColor) => {
    if (selectedElement) {
      const updatedElement = { ...selectedElement, color: newColor };
      const newElements = elements.map((el) =>
        el === selectedElement ? updatedElement : el
      );
      setElements(newElements);
      setSelectedElement(updatedElement);
      addToHistory(newElements);
    }
  };

  const updateSelectedElementFillColor = (newFillColor) => {
    if (selectedElement) {
      const updatedElement = { ...selectedElement, fillColor: newFillColor };
      const newElements = elements.map((el) =>
        el === selectedElement ? updatedElement : el
      );
      setElements(newElements);
      setSelectedElement(updatedElement);
      addToHistory(newElements);
    }
  };

  const toggleSelectedElementFill = () => {
    if (selectedElement && (selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'arrow')) {
      const updatedElement = { ...selectedElement, filled: !selectedElement.filled };
      const newElements = elements.map((el) =>
        el === selectedElement ? updatedElement : el
      );
      setElements(newElements);
      setSelectedElement(updatedElement);
      addToHistory(newElements);
    }
  };

  if (!currentNote) {
    return (
      <div className="editor-empty">
        <p>Create a canvas to start drawing</p>
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
          placeholder="Canvas Title"
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

      <div className="canvas-toolbar">
        <div className="toolbar-group">
          <button
            onClick={() => setTool('select')}
            className={`toolbar-btn ${tool === 'select' ? 'active' : ''}`}
            title="Select & Move"
          >
            <MousePointer size={18} />
          </button>
          <button
            onClick={() => setTool('pencil')}
            className={`toolbar-btn ${tool === 'pencil' ? 'active' : ''}`}
            title="Pencil"
          >
            <Pencil size={18} />
          </button>
          <button
            onClick={() => setTool('line')}
            className={`toolbar-btn ${tool === 'line' ? 'active' : ''}`}
            title="Line"
          >
            <Minus size={18} />
          </button>
          <button
            onClick={() => setTool('arrow')}
            className={`toolbar-btn ${tool === 'arrow' ? 'active' : ''}`}
            title="Arrow"
          >
            <ArrowRight size={18} />
          </button>
          <button
            onClick={() => setTool('rectangle')}
            className={`toolbar-btn ${tool === 'rectangle' ? 'active' : ''}`}
            title="Rectangle"
          >
            <Square size={18} />
          </button>
          <button
            onClick={() => setTool('circle')}
            className={`toolbar-btn ${tool === 'circle' ? 'active' : ''}`}
            title="Circle"
          >
            <Circle size={18} />
          </button>
          <button
            onClick={() => setTool('text')}
            className={`toolbar-btn ${tool === 'text' ? 'active' : ''}`}
            title="Text"
          >
            <Type size={18} />
          </button>
          <button
            onClick={() => setTool('eraser')}
            className={`toolbar-btn ${tool === 'eraser' ? 'active' : ''}`}
            title="Eraser"
          >
            <Eraser size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <div className="color-picker-inline">
            <label>Stroke:</label>
            <input
              type="color"
              value={selectedElement ? selectedElement.color : color}
              onChange={(e) => {
                if (selectedElement) {
                  updateSelectedElementColor(e.target.value);
                } else {
                  setColor(e.target.value);
                }
              }}
              className="color-input"
            />
          </div>
          <div className="color-picker-inline">
            <label>Fill:</label>
            <input
              type="color"
              value={selectedElement ? (selectedElement.fillColor === 'transparent' ? '#ffffff' : selectedElement.fillColor) : (fillColor === 'transparent' ? '#ffffff' : fillColor)}
              onChange={(e) => {
                if (selectedElement) {
                  updateSelectedElementFillColor(e.target.value);
                } else {
                  setFillColor(e.target.value);
                }
              }}
              className="color-input"
            />
          </div>
          {selectedElement && (selectedElement.type === 'rectangle' || selectedElement.type === 'circle' || selectedElement.type === 'arrow') && (
            <button
              onClick={toggleSelectedElementFill}
              className={`toolbar-btn ${selectedElement.filled ? 'active' : ''}`}
              title="Toggle Fill"
            >
              <Paintbrush size={18} />
            </button>
          )}
          <div className="stroke-width-picker">
            <label>Width:</label>
            <input
              type="range"
              min="1"
              max="20"
              value={strokeWidth}
              onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
              className="stroke-width-input"
            />
            <span className="stroke-width-value">{strokeWidth}px</span>
          </div>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button
            onClick={undo}
            disabled={historyStep <= 0}
            className="toolbar-btn"
            title="Undo"
          >
            <Undo size={18} />
          </button>
          <button
            onClick={redo}
            disabled={historyStep >= history.length - 1}
            className="toolbar-btn"
            title="Redo"
          >
            <Redo size={18} />
          </button>
          <button onClick={clearCanvas} className="toolbar-btn" title="Clear Canvas">
            <Trash2 size={18} />
          </button>
        </div>

        <div className="toolbar-divider" />

        <div className="toolbar-group">
          <button onClick={handleZoomOut} className="toolbar-btn" title="Zoom Out">
            <ZoomOut size={18} />
          </button>
          <span className="zoom-level">{Math.round(zoom * 100)}%</span>
          <button onClick={handleZoomIn} className="toolbar-btn" title="Zoom In">
            <ZoomIn size={18} />
          </button>
        </div>
      </div>

      <div className="canvas-container">
        <canvas
          ref={canvasRef}
          width={1200}
          height={800}
          className="drawing-canvas"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      <div className="editor-footer">
        <div className="editor-stats">
          <span>{elements.length} elements</span>
          <span>Zoom: {Math.round(zoom * 100)}%</span>
          {selectedElement && <span>Selected: {selectedElement.type}</span>}
        </div>
        <div className="editor-status">
          {saving && <span className="saving">Saving...</span>}
          {!saving && <span className="saved">Saved</span>}
        </div>
      </div>

      {/* Text Input Modal */}
      {showTextModal && (
        <div className="modal-overlay" onClick={() => setShowTextModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Text</h2>
              <button onClick={() => setShowTextModal(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleTextSubmit();
                  }
                }}
                placeholder="Enter text..."
                className="text-modal-input"
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowTextModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleTextSubmit} className="btn-primary">
                Add Text
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      {showClearModal && (
        <div className="modal-overlay" onClick={() => setShowClearModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Clear Canvas</h2>
              <button onClick={() => setShowClearModal(false)} className="btn-icon">
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to clear the entire canvas? This action cannot be undone.</p>
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowClearModal(false)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={confirmClear} className="btn-danger">
                Clear Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CanvasEditor;