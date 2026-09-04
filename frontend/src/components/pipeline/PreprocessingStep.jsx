import { useState } from "react";
import { Icon } from "../icons";
import { INGESTED_SOURCES, PROCESS_STEPS, RAW_ROWS } from "../../lib/constants";

const TABS = [
  { id: "cdr", label: "CDR" },
  { id: "bank", label: "Bank" },
  { id: "ip", label: "IP" },
];

export default function PreprocessingStep({ progress, activeIndex, result }) {
  const [tab, setTab] = useState("cdr");
  const processed = result?.processed || { valid: 0, missing: 0, duplicates: 0 };
  const total = result?.total_events || 0;
  const sample = result?.data || [];

  const issues = [
    { label: "Invalid phone numbers", count: 342 },
    { label: "Ambiguous timestamps", count: 118 },
    { label: "Missing location / tower", count: 86 },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-3 card p-3">
          <div className="mb-2 flex items-center justify-between px-1">
            <h3 className="text-sm font-semibold text-slate-900">Ingested sources</h3>
            <span className="badge bg-emerald-50 text-emerald-700">Live</span>
          </div>
          <div className="space-y-2">
            {INGESTED_SOURCES.map((s) => (
              <div key={s.name} className="rounded-lg border border-line px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[13px] font-medium text-slate-800">{s.name}</div>
                  <span className="badge bg-emerald-50 text-emerald-700">{s.status}</span>
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  {s.records} records · {s.format}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="col-span-4 card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900">Preprocessing pipeline</h3>
            <span className="badge bg-blue-50 text-brand">In Progress</span>
          </div>
          <ol className="space-y-2">
            {PROCESS_STEPS.map((step, i) => {
              const done = i < activeIndex;
              const current = i === activeIndex;
              return (
                <li key={step.id} className="flex gap-3 rounded-lg border border-line px-3 py-2">
                  <span
                    className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border ${
                      done
                        ? "border-emerald-600 bg-emerald-600 text-white"
                        : current
                          ? "border-brand text-brand"
                          : "border-line text-slate-400"
                    }`}
                  >
                    {done ? (
                      <Icon name="check" className="h-3.5 w-3.5" />
                    ) : current ? (
                      <Icon name="spinner" className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <span className="text-[10px]">{step.id}</span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <div className="text-[13px] font-medium text-slate-800">{step.title}</div>
                    <div className="text-[11px] text-slate-500">{step.detail}</div>
                    <div className="text-[11px] text-slate-400">
                      {(done || current) && total ? `${total.toLocaleString()} rows` : "—"}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="col-span-5 card p-4">
          <div className="mb-3 flex gap-1 border-b border-line">
            {TABS.map((t) => (
              <button
                key={t.id}
                className={`-mb-px border-b-2 px-3 py-2 text-xs font-medium ${
                  tab === t.id ? "border-brand text-brand" : "border-transparent text-slate-500"
                }`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Raw data</h4>
          <table className="mb-4 w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {(tab === "cdr"
                  ? ["caller", "receiver", "date", "duration", "tower", "type"]
                  : tab === "bank"
                    ? ["from", "to", "date", "amount", "mode", "note"]
                    : ["ip", "event", "time", "city", "status"]
                ).map((h) => (
                  <th key={h} className="border border-line px-2 py-1.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {RAW_ROWS[tab].map((row, i) => (
                <tr key={i}>
                  {row.map((cell) => (
                    <td key={cell} className="border border-line px-2 py-1.5 text-slate-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Normalized</h4>
          <table className="w-full border-collapse text-[11px]">
            <thead>
              <tr className="bg-slate-50 text-left text-slate-500">
                {["event_id", "type", "source", "target", "timestamp", "location"].map((h) => (
                  <th key={h} className="border border-line px-2 py-1.5 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(sample.length ? sample : []).slice(0, 4).map((row) => (
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
      </div>

      <section className="card p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-slate-800">Processing data… {progress}%</span>
          <span className="text-xs text-slate-500">Normalizing and mapping records</span>
        </div>
        <div className="h-2 overflow-hidden rounded-lg bg-slate-100">
          <div className="h-full bg-brand" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-4 gap-3">
          {[
            ["Total", total.toLocaleString()],
            ["Valid", processed.valid.toLocaleString()],
            ["Missing", processed.missing.toLocaleString()],
            ["Duplicates", processed.duplicates.toLocaleString()],
          ].map(([k, v]) => (
            <div key={k} className="rounded-lg border border-line px-3 py-2">
              <div className="text-[11px] text-slate-500">{k}</div>
              <div className="text-sm font-semibold text-slate-900">{v}</div>
            </div>
          ))}
        </div>
        <div className="mt-3 text-xs text-slate-600">
          Issues: {issues.map((i) => `${i.label} (${i.count})`).join(" · ")}
        </div>
      </section>
    </div>
  );
}
