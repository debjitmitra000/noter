import { useEffect, useRef } from 'react';

const COLORS = [
  { name: 'None', value: null },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Yellow', value: '#eab308' },
  { name: 'Lime', value: '#84cc16' },
  { name: 'Green', value: '#22c55e' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Purple', value: '#a855f7' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Rose', value: '#f43f5e' },
];

const ColorPicker = ({ onSelectColor, onClose }) => {
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  return (
    <div className="color-picker-dropdown" ref={pickerRef}>
      <div className="color-picker-header">
        <span>Choose a color</span>
      </div>
      <div className="color-picker-grid">
        {COLORS.map((color) => (
          <button
            key={color.name}
            onClick={() => onSelectColor(color.value)}
            className="color-picker-item"
            title={color.name}
            style={{
              backgroundColor: color.value || 'transparent',
              border: color.value ? 'none' : '2px solid var(--border-color)',
            }}
          >
            {!color.value && <span className="color-none-text">None</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
