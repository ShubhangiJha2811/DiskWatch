import RankedList from './RankedList.jsx';

export default function RankedFolders({ topFolders, topFiles }) {
  return (
    <div className="grid sm:grid-cols-2 gap-6 mb-6">
      <section className="card p-5">
        <h3 className="font-semibold mb-3 text-sm">Biggest folders</h3>
        <RankedList items={topFolders} emptyLabel="No subfolders found." />
      </section>
      <section className="card p-5">
        <h3 className="font-semibold mb-3 text-sm">Biggest files</h3>
        <RankedList items={topFiles} emptyLabel="No files found." />
      </section>
    </div>
  );
}
