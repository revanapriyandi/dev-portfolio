// Skeleton shown while an admin page loads its data.
export default function Loading() {
  return (
    <div className="mx-auto max-w-6xl animate-pulse space-y-6" aria-label="Loading">
      <div className="h-3 w-24 rounded bg-panel" />
      <div className="h-9 w-56 rounded-lg bg-panel" />
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 rounded-2xl border border-line bg-panel" />)}
      </div>
      <div className="h-56 rounded-2xl border border-line bg-panel" />
    </div>
  );
}
