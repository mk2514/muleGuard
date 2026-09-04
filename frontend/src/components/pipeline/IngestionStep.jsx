import { Icon } from "../icons";
import { SOURCE_TYPES } from "../../lib/constants";

const ICONS = {
  upload: "upload",
  api: "api",
  cdr: "phone",
  bank: "bank",
  upi: "wallet",
  ip: "ip",
  email: "mail",
  social: "social",
  docs: "docs",
  images: "image",
  video: "video",
  multilang: "lang",
};

export default function IngestionStep({
  sourceId,
  setSourceId,
  files,
  setFiles,
  meta,
  setMeta,
  onStart,
  busy,
}) {
  function onDrop(e) {
    e.preventDefault();
    setFiles(Array.from(e.dataTransfer.files || []));
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-12 gap-4">
        <section className="col-span-3 card p-3">
          <h3 className="mb-2 px-1 text-sm font-semibold text-slate-900">Select Data Source</h3>
          <div className="space-y-1">
            {SOURCE_TYPES.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => {
                  setSourceId(s.id);
                  setMeta((m) => ({ ...m, source_type: s.label }));
                }}
                className={`flex w-full items-center gap-2 rounded-lg border px-2.5 py-2 text-left text-[13px] ${
                  sourceId === s.id
                    ? "border-brand bg-blue-50 text-brand"
                    : "border-transparent text-slate-700 hover:bg-slate-50"
                }`}
              >
                <Icon name={ICONS[s.id]} className="h-4 w-4 shrink-0" />
                {s.label}
              </button>
            ))}
          </div>
        </section>

        <section className="col-span-5 space-y-4">
          <div
            className="card flex flex-col items-center justify-center px-6 py-10 text-center"
            onDragOver={(e) => e.preventDefault()}
            onDrop={onDrop}
            style={{ borderStyle: "dashed" }}
          >
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg border border-line text-brand">
              <Icon name="upload" className="h-5 w-5" />
            </div>
            <div className="text-sm font-medium text-slate-800">Drag and drop files here</div>
            <div className="mt-1 text-xs text-slate-500">CSV, XLSX, PDF, JSON, images, video, ZIP · Max 2GB</div>
            <label className="btn-primary mt-4 cursor-pointer">
              Choose Files
              <input
                type="file"
                className="hidden"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
              />
            </label>
            {files.length > 0 ? (
              <div className="mt-4 w-full text-left text-xs text-slate-600">
                {files.map((f) => (
                  <div key={f.name} className="truncate border-t border-line py-1.5">
                    {f.name}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="col-span-4 space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Supported Formats</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["csv", "CSV"],
                ["json", "JSON"],
                ["pdf", "PDF"],
                ["image", "Image"],
                ["video", "Video"],
              ].map(([icon, label]) => (
                <div key={label} className="rounded-lg border border-line px-2 py-3 text-center">
                  <Icon name={icon} className="mx-auto h-5 w-5 text-brand" />
                  <div className="mt-1 text-xs font-medium text-slate-700">{label}</div>
                </div>
              ))}
            </div>
            <div className="mt-3 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-[11px] text-slate-600">
              Uploaded evidence is stored read-only. Originals are retained for chain of custody.
            </div>
          </div>
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Recent Uploads</h3>
            {[
              ["cdr_data_may.csv", "Completed"],
              ["sbi_statement.xlsx", "Completed"],
              ["ip_logs.json", "Processing"],
            ].map(([name, status]) => (
              <div key={name} className="flex items-center justify-between border-b border-line py-2 last:border-0">
                <div>
                  <div className="text-xs font-medium text-slate-800">{name}</div>
                  <div className="text-[11px] text-slate-500">Case MG-2024-1024</div>
                </div>
                <span
                  className={`badge ${
                    status === "Completed" ? "bg-emerald-50 text-emerald-700" : "bg-blue-50 text-brand"
                  }`}
                >
                  {status}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="card p-4">
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Evidence metadata</h3>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="label">source_type</label>
            <input
              className="field"
              value={meta.source_type}
              onChange={(e) => setMeta({ ...meta, source_type: e.target.value })}
            />
          </div>
          <div>
            <label className="label">org</label>
            <input
              className="field"
              placeholder="Airtel, SBI, NPCI"
              value={meta.org}
              onChange={(e) => setMeta({ ...meta, org: e.target.value })}
            />
          </div>
          <div>
            <label className="label">case_id</label>
            <input
              className="field"
              value={meta.case_id}
              onChange={(e) => setMeta({ ...meta, case_id: e.target.value })}
            />
          </div>
          <div className="col-span-3">
            <label className="label">desc</label>
            <textarea
              className="field min-h-20"
              value={meta.desc}
              onChange={(e) => setMeta({ ...meta, desc: e.target.value })}
            />
          </div>
          <div>
            <label className="label">date</label>
            <input
              type="date"
              className="field"
              value={meta.date}
              onChange={(e) => setMeta({ ...meta, date: e.target.value })}
            />
          </div>
          <div>
            <label className="label">timezone</label>
            <select className="field" value={meta.timezone} onChange={(e) => setMeta({ ...meta, timezone: e.target.value })}>
              <option>Asia/Kolkata</option>
              <option>UTC</option>
              <option>Asia/Dubai</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setFiles([]);
              setMeta({
                source_type: "Upload Files",
                org: "",
                desc: "",
                case_id: "MG-2024-1024",
                date: "2024-05-12",
                timezone: "Asia/Kolkata",
              });
            }}
          >
            Reset
          </button>
          <button type="button" className="btn-primary" disabled={busy} onClick={onStart}>
            {busy ? "Starting…" : "Start Processing"}
          </button>
        </div>
      </section>
    </div>
  );
}
