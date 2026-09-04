import { useNavigate } from "react-router-dom";
import { Icon } from "../icons";

export default function OutputStep({ result }) {
  const navigate = useNavigate();
  const processed = result?.processed || { valid: 0, missing: 0, duplicates: 0 };
  const total = result?.total_events || 0;

  return (
    <div className="space-y-4">
      <section className="card px-6 py-8 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 text-emerald-700">
          <Icon name="check" className="h-6 w-6" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">Data processing completed successfully</h2>
        <p className="mt-1 text-sm text-slate-500">
          Normalized events are ready for entity resolution, graph analysis, and alerts.
        </p>
      </section>

      <section className="grid grid-cols-5 gap-3">
        {[
          ["Total", total.toLocaleString()],
          ["Valid", processed.valid.toLocaleString()],
          ["Missing", processed.missing.toLocaleString()],
          ["Duplicates", processed.duplicates.toLocaleString()],
          ["Time", "00:00:50"],
        ].map(([k, v]) => (
          <div key={k} className="card p-4">
            <div className="text-xs text-slate-500">{k}</div>
            <div className="mt-1 text-xl font-semibold text-slate-900">{v}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-4 gap-3">
        <button className="card flex items-center gap-3 p-4 text-left hover:bg-slate-50" onClick={() => navigate("/graph")}>
          <Icon name="graph" className="h-5 w-5 text-brand" />
          <div>
            <div className="text-sm font-medium">View Graph</div>
            <div className="text-xs text-slate-500">Open intelligence graph</div>
          </div>
        </button>
        <button className="card flex items-center gap-3 p-4 text-left hover:bg-slate-50" onClick={() => navigate("/map")}>
          <Icon name="map" className="h-5 w-5 text-brand" />
          <div>
            <div className="text-sm font-medium">View Map</div>
            <div className="text-xs text-slate-500">Geospatial overlay</div>
          </div>
        </button>
        <button className="card flex items-center gap-3 p-4 text-left hover:bg-slate-50" onClick={() => navigate("/alerts")}>
          <Icon name="alerts" className="h-5 w-5 text-brand" />
          <div>
            <div className="text-sm font-medium">View Alerts</div>
            <div className="text-xs text-slate-500">Pattern detections</div>
          </div>
        </button>
        <button
          className="card flex items-center gap-3 p-4 text-left hover:bg-slate-50"
          onClick={() => {
            const blob = new Blob([JSON.stringify(result || {}, null, 2)], { type: "application/json" });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "muleguard-normalized.json";
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Icon name="download" className="h-5 w-5 text-brand" />
          <div>
            <div className="text-sm font-medium">Download</div>
            <div className="text-xs text-slate-500">Normalized JSON export</div>
          </div>
        </button>
      </section>
    </div>
  );
}
