const REPORTS = [
  { id: "R-441", title: "CDR summary — May 2024", status: "Ready" },
  { id: "R-442", title: "Fund flow narrative", status: "Ready" },
  { id: "R-443", title: "Entity dossier — Rakesh Mehra", status: "Draft" },
];

export default function Reports() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500">Export-ready investigation products</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {REPORTS.map((r) => (
          <div key={r.id} className="card p-4">
            <div className="text-xs text-slate-500">{r.id}</div>
            <div className="mt-1 text-sm font-medium text-slate-900">{r.title}</div>
            <div className="mt-3 text-xs text-slate-500">{r.status}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
