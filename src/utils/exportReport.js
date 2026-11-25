import { jsPDF } from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import { CATEGORIES, CONFIDENCE_META } from '../constants/categories.js';
import { OTHER_TYPE, TYPE_META } from '../constants/fileTypes.js';
import { formatBytes } from './format.js';

function csvCell(value) {
  const s = String(value ?? '');
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export function exportCsv(results, driveNames) {
  const rows = [
    ['Drives scanned', driveNames.join('; ')],
    ['Generated', new Date().toLocaleString()],
    [],
    ['Category', 'Confidence', 'Name', 'Path', 'Size (bytes)', 'Size', 'Reason'],
  ];
  for (const item of results.flagged) {
    const cat = CATEGORIES.find((c) => c.key === item.category);
    rows.push([
      cat ? cat.label : item.category,
      cat ? CONFIDENCE_META[cat.confidence].label : '',
      item.name,
      item.path,
      item.size,
      formatBytes(item.size),
      item.reason,
    ]);
  }
  const csv = rows.map((row) => row.map(csvCell).join(',')).join('\r\n');
  const stamp = new Date().toISOString().slice(0, 10);
  downloadBlob(new Blob([csv], { type: 'text/csv;charset=utf-8;' }), `diskwatch-report-${stamp}.csv`);
}

export function exportPdf(results, driveNames, typeTotals) {
  const doc = new jsPDF();
  const stamp = new Date();
  const margin = 14;
  let y = 18;

  doc.setFontSize(16);
  doc.text('DiskWatch Scanner Report', margin, y);
  y += 7;
  doc.setFontSize(10);
  doc.setTextColor(110);
  doc.text(`Generated ${stamp.toLocaleString()} — drives: ${driveNames.join(', ')}`, margin, y);
  doc.setTextColor(0);
  y += 8;

  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Total scanned', 'Files', 'Folders', 'Reclaimable']],
    body: [[
      formatBytes(results.totalSize),
      results.totalFiles.toLocaleString(),
      results.totalFolders.toLocaleString(),
      formatBytes(CATEGORIES.reduce((s, c) => s + results.categoryTotals[c.key].size, 0)),
    ]],
    theme: 'plain',
    styles: { fontSize: 9 },
  });
  y = doc.lastAutoTable.finalY + 8;

  doc.setFontSize(12);
  doc.text('By cleanup category', margin, y);
  y += 3;
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['Category', 'Confidence', 'Size', 'Items']],
    body: CATEGORIES.map((c) => [
      c.label,
      CONFIDENCE_META[c.confidence].label,
      formatBytes(results.categoryTotals[c.key].size),
      results.categoryTotals[c.key].count.toLocaleString(),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [42, 120, 214] },
  });
  y = doc.lastAutoTable.finalY + 8;

  if (typeTotals) {
    doc.setFontSize(12);
    doc.text('By file type', margin, y);
    y += 3;
    const typeRows = [...TYPE_META, OTHER_TYPE]
      .map((t) => ({ ...t, ...typeTotals[t.key] }))
      .filter((t) => t.count > 0)
      .map((t) => [t.label, formatBytes(t.size), t.count.toLocaleString()]);
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Type', 'Size', 'Files']],
      body: typeRows,
      styles: { fontSize: 9 },
      headStyles: { fillColor: [42, 120, 214] },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (results.topFolders.length > 0) {
    if (y > 260) {
      doc.addPage();
      y = 18;
    }
    doc.setFontSize(12);
    doc.text('Biggest folders', margin, y);
    y += 3;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Folder', 'Size']],
      body: results.topFolders.slice(0, 15).map((f) => [f.path, formatBytes(f.size)]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [42, 120, 214] },
      columnStyles: { 0: { cellWidth: 140 } },
    });
    y = doc.lastAutoTable.finalY + 8;
  }

  if (results.flagged.length > 0) {
    if (y > 250) {
      doc.addPage();
      y = 18;
    }
    doc.setFontSize(12);
    doc.text('Cleanup suggestions', margin, y);
    y += 3;
    autoTable(doc, {
      startY: y,
      margin: { left: margin, right: margin },
      head: [['Category', 'Confidence', 'Name', 'Size', 'Reason']],
      body: results.flagged.map((item) => {
        const cat = CATEGORIES.find((c) => c.key === item.category);
        return [cat ? cat.label : item.category, cat ? CONFIDENCE_META[cat.confidence].label : '', item.name, formatBytes(item.size), item.reason];
      }),
      styles: { fontSize: 7.5 },
      headStyles: { fillColor: [42, 120, 214] },
      columnStyles: { 4: { cellWidth: 70 } },
    });
  }

  doc.save(`diskwatch-report-${stamp.toISOString().slice(0, 10)}.pdf`);
}
