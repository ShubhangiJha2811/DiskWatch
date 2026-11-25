import { exportCsv, exportPdf } from '../utils/exportReport.js';

export default function ExportButtons({ results, driveNames, typeTotals }) {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      <span className="text-sm mr-1" style={{ color: 'var(--text-muted)' }}>
        Export report:
      </span>
      <button className="px-3 py-1.5 rounded-md text-xs font-medium hairline border" onClick={() => exportCsv(results, driveNames)}>
        CSV
      </button>
      <button className="px-3 py-1.5 rounded-md text-xs font-medium hairline border" onClick={() => exportPdf(results, driveNames, typeTotals)}>
        PDF
      </button>
    </div>
  );
}
