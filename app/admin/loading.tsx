export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <div>
        <div className="h-8 w-48 rounded-md bg-slate-200" />
        <div className="mt-3 h-4 w-72 rounded-md bg-slate-200" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-36 rounded-lg border bg-white shadow-sm" />
        ))}
      </div>
      <div className="h-96 rounded-lg border bg-white shadow-sm" />
    </div>
  );
}
