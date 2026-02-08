export const extractTagsFromContent = (content) => {
  const tagRegex = /#(\w+)/g;
  const matches = content.match(tagRegex);
  if (!matches) return [];
  return [...new Set(matches.map((tag) => tag.substring(1)))];
};

export const generatePreview = (content, length = 100) => {
  const plainText = content.replace(/[#*`]/g, '').trim();
  if (plainText.length <= length) return plainText;
  return plainText.substring(0, length) + '...';
};

export const generateChecklistPreview = (todos) => {
  if (!todos || todos.length === 0) {
    return 'Empty checklist';
  }

  const todoItems = todos.filter(item => item.type === 'todo' || !item.type);
  const completedCount = todoItems.filter(item => item.completed).length;
  const totalCount = todoItems.length;

  if (totalCount === 0) {
    return 'No items yet';
  }

  const firstItems = todoItems.slice(0, 2).map(item => item.text).join(', ');
  const preview = totalCount > 2 ? `${firstItems}...` : firstItems;

  return `${completedCount}/${totalCount} items • ${preview}`;
};

export const getRelativeTime = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

export const exportNotesAsJSON = (notes) => {
  const dataStr = JSON.stringify(notes, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `notes_backup_${new Date().toISOString().split('T')[0]}.json`;
  link.click();
  URL.revokeObjectURL(url);
};

export const importNotesFromJSON = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const notes = JSON.parse(e.target.result);
        resolve(notes);
      } catch (error) {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

export const countWords = (text) => {
  const words = text.trim().split(/\s+/);
  return text.trim() === '' ? 0 : words.length;
};

export const countCharacters = (text) => {
  return text.length;
};