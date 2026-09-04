import { FIELD_MAP } from "../../lib/constants";

export default function NormalizationStep({ result }) {
  const rows = result?.data || [];
  const mapped = FIELD_MAP.filter((f) => f.mapped).length;
  const unmapped = FIELD_MAP.filter((f) => !f.mapped).length;

  return (
    <div className="grid grid-cols-12 gap-4">
      <section className="col-span-4 card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Field mapping</h3>
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-500">
              {["Source", "Standard", "Type"].map((h) => (
                <th key={h} className="border border-line px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {FIELD_MAP.map((f) => (
              <tr key={f.source}>
                <td className="border border-line px-2 py-2 font-mono text-slate-700">{f.source}</td>
                <td className="border border-line px-2 py-2 font-mono text-brand">{f.standard}</td>
                <td className="border border-line px-2 py-2 text-slate-500">{f.type}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-[11px] text-slate-500">
          Standard schema: event_id, type, source, target, timestamp, location, amount
        </p>
      </section>

      <section className="col-span-5 card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Unified preview</h3>
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-slate-50 text-left text-slate-500">
              {["event_id", "type", "source", "target", "timestamp", "location"].map((h) => (
                <th key={h} className="border border-line px-2 py-2 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.event_id}>
                {["event_id", "type", "source", "target", "timestamp", "location"].map((k) => (
                  <td key={k} className="border border-line px-2 py-1.5 text-slate-700">
                    {row[k]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="col-span-3 space-y-3">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-900">Schema status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Mapped</span>
              <span className="font-semibold text-emerald-700">{mapped}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unmapped</span>
              <span className="font-semibold text-amber-700">{unmapped}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Valid</span>
              <span className="font-semibold text-slate-900">{result?.processed?.valid?.toLocaleString() || "—"}</span>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-800">
            Schema validation passed
          </div>
        </div>
      </section>
    </div>
  );
}
