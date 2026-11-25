import { useMemo, useState } from 'react';
import { formatBytes } from '../utils/format.js';
import { searchScan } from '../utils/search.js';
import RankedList from './RankedList.jsx';

export default function SearchPanel({ results }) {
  const [query, setQuery] = useState('');
  const { extMatches, nameMatches } = useMemo(() => searchScan(results, query), [results, query]);
  const active = query.trim().length > 0;

  return (
    <section className="card p-5 sm:p-6 mb-6">
      <h3 className="font-semibold mb-3 text-sm">Search this scan</h3>
      <input
        className="w-full text-sm rounded-md px-3 py-2 hairline border bg-transparent mb-1"
        placeholder="e.g. zip, mp4, node_modules, invoice..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
        Searches file extensions and names/paths across everything this scan looked at, not just the cleanup suggestions.
      </p>

      {active && extMatches.length === 0 && nameMatches.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No matches for "{query}".
        </p>
      )}

      {extMatches.map((m) => (
        <div key={m.ext} className="mb-4">
          <p className="text-sm font-medium mb-2">
            .{m.ext} files — {formatBytes(m.size)} across {m.count.toLocaleString()} file{m.count === 1 ? '' : 's'}
            {m.count > m.top.length && (
              <span className="font-normal" style={{ color: 'var(--text-muted)' }}>
                {' '}
                (showing {m.top.length} largest)
              </span>
            )}
          </p>
          <RankedList items={m.top} emptyLabel="No files found." />
        </div>
      ))}

      {nameMatches.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2">Files & folders matching "{query}"</p>
          <RankedList items={nameMatches} emptyLabel="No matches." />
        </div>
      )}
    </section>
  );
}
