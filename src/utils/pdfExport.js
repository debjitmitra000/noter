import jsPDF from 'jspdf';

export const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const addTextWithWrapping = (doc, text, x, y, maxWidth, lineHeight = 7) => {
  const lines = doc.splitTextToSize(text, maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
};

const processMarkdown = (text) => {
  return text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/`(.+?)`/g, '$1')
    .replace(/#{1,6}\s/g, '')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1');
};

export const exportNoteToPDF = (note) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addTextWithWrapping(doc, note.title, margin, yPosition, maxWidth, 10);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Created: ${formatDate(note.created_at)}`, margin, yPosition);
  yPosition += 7;

  if (note.tags && note.tags.length > 0) {
    doc.text(`Tags: ${note.tags.join(', ')}`, margin, yPosition);
    yPosition += 7;
  }

  if (note.category) {
    doc.text(`Category: ${note.category}`, margin, yPosition);
    yPosition += 10;
  } else {
    yPosition += 5;
  }

  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  const content = processMarkdown(note.content);
  const paragraphs = content.split('\n\n');

  paragraphs.forEach((paragraph) => {
    if (paragraph.trim()) {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
      yPosition = addTextWithWrapping(doc, paragraph.trim(), margin, yPosition, maxWidth);
      yPosition += 5;
    }
  });

  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
  doc.save(filename);
};

export const exportMultipleNotesToPDF = (notes) => {
  if (notes.length === 0) return;

  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  notes.forEach((note, index) => {
    if (index > 0) {
      doc.addPage();
    }

    let yPosition = margin;

    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    yPosition = addTextWithWrapping(doc, note.title, margin, yPosition, maxWidth, 9);
    yPosition += 5;

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100);
    doc.text(`Created: ${formatDate(note.created_at)}`, margin, yPosition);
    yPosition += 6;

    if (note.tags && note.tags.length > 0) {
      doc.text(`Tags: ${note.tags.join(', ')}`, margin, yPosition);
      yPosition += 6;
    }

    yPosition += 3;
    doc.setDrawColor(200);
    doc.line(margin, yPosition, pageWidth - margin, yPosition);
    yPosition += 8;

    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont('helvetica', 'normal');

    const content = processMarkdown(note.content);
    const paragraphs = content.split('\n\n');

    paragraphs.forEach((paragraph) => {
      if (paragraph.trim()) {
        if (yPosition > pageHeight - margin) {
          doc.addPage();
          yPosition = margin;
        }
        yPosition = addTextWithWrapping(doc, paragraph.trim(), margin, yPosition, maxWidth, 6);
        yPosition += 4;
      }
    });
  });

  const filename = `notes_export_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(filename);
};

export const exportAllNotesToPDF = (notes) => {
  exportMultipleNotesToPDF(notes);
};

export const exportChecklistToPDF = (note) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;
  let yPosition = margin;

  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  yPosition = addTextWithWrapping(doc, note.title, margin, yPosition, maxWidth, 10);
  yPosition += 5;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Created: ${formatDate(note.created_at)}`, margin, yPosition);
  yPosition += 7;

  if (note.category) {
    doc.text(`Category: ${note.category}`, margin, yPosition);
    yPosition += 10;
  } else {
    yPosition += 5;
  }

  doc.setDrawColor(200);
  doc.line(margin, yPosition, pageWidth - margin, yPosition);
  yPosition += 10;

  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont('helvetica', 'normal');

  const todos = note.todos || [];
  const completedCount = todos.filter((todo) => todo.completed).length;

  if (todos.length > 0) {
    doc.setFontSize(10);
    doc.text(`Progress: ${completedCount} of ${todos.length} completed`, margin, yPosition);
    yPosition += 8;

    todos.forEach((todo) => {
      if (yPosition > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }

      const checkbox = todo.completed ? '[x]' : '[ ]';
      const todoText = `${checkbox} ${todo.text}`;
      const lines = doc.splitTextToSize(todoText, maxWidth - 10);

      if (todo.completed) {
        doc.setTextColor(150);
      } else {
        doc.setTextColor(0);
      }

      doc.text(lines, margin + 5, yPosition);
      yPosition += lines.length * 6 + 3;
    });
  }

  const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_checklist.pdf`;
  doc.save(filename);
};
