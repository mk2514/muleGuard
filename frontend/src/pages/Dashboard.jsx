import { useNavigate } from "react-router-dom";
import { CASES } from "../lib/constants";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500">Operational overview — Chandigarh Police investigation cell</p>
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[
          ["Active cases", "18"],
          ["Entities under watch", "246"],
          ["Open alerts", "12"],
          ["Sources ingested", "64"],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">{v}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Priority cases</h2>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-500">
                <th className="pb-2">Case</th>
                <th className="pb-2">Unit</th>
                <th className="pb-2">Risk</th>
              </tr>
            </thead>
            <tbody>
              {CASES.slice(0, 3).map((c) => (
                <tr key={c.id} className="border-t border-line">
                  <td className="py-2">
                    <div className="font-medium">{c.id}</div>
                    <div className="text-xs text-slate-500">{c.title}</div>
                  </td>
                  <td className="py-2 text-slate-600">{c.unit}</td>
                  <td className="py-2">{c.risk}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
        <section className="card p-4">
          <h2 className="mb-3 text-sm font-semibold">Pipeline status</h2>
          <p className="text-sm text-slate-600">
            Case MG-2024-1024 has CDR, bank, UPI and IP sources staged. Continue from Data Sources to run ingestion through output.
          </p>
          <button className="btn-primary mt-4" onClick={() => navigate("/data-sources")}>
            Open Data Sources
          </button>
        </section>
      </div>
    </div>
  );
}
