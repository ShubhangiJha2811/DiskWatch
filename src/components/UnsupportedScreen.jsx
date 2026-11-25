export default function UnsupportedScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="card p-8 max-w-md text-center">
        <h1 className="text-xl font-semibold mb-2">DiskWatch Scanner</h1>
        <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
          This tool needs the File System Access API, available in desktop Chrome or Edge. Please open this link in one of those browsers.
        </p>
      </div>
    </div>
  );
}
