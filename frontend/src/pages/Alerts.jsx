const ALERTS = [
  { id: "AL-102", severity: "High", title: "Hub number with 40+ unique counterparts in 24h", time: "12 May 16:22" },
  { id: "AL-099", severity: "High", title: "Rapid fund layering across three banks", time: "12 May 16:09" },
  { id: "AL-088", severity: "Medium", title: "Repeated failed logins from Chennai IP", time: "12 May 13:41" },
  { id: "AL-071", severity: "Low", title: "New SIM associated with known mule account", time: "11 May 09:14" },
];

export default function Alerts() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Alerts</h1>
        <p className="text-sm text-slate-500">Rule and pattern detections</p>
      </div>
      <div className="space-y-2">
        {ALERTS.map((a) => (
          <div key={a.id} className="card flex items-center justify-between px-4 py-3">
            <div>
              <div className="text-sm font-medium text-slate-900">{a.title}</div>
              <div className="text-xs text-slate-500">
                {a.id} · {a.time}
              </div>
            </div>
            <span
              className={`badge ${
                a.severity === "High"
                  ? "bg-red-50 text-red-700"
                  : a.severity === "Medium"
                    ? "bg-amber-50 text-amber-700"
                    : "bg-slate-100 text-slate-600"
              }`}
            >
              {a.severity}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
