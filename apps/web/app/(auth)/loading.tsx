export default function Loading() {
  return (
    <div className="min-h-screen p-6 md:p-8 space-y-6">
      <div className="h-8 w-64 rounded-md bg-secondary shimmer" />
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[0,1,2,3].map((i) => (<div key={i} className="h-28 rounded-2xl bg-card border border-border/50 shimmer" />))}
      </div>
      <div className="h-64 rounded-2xl bg-card border border-border/50 shimmer" />
    </div>
  );
}
