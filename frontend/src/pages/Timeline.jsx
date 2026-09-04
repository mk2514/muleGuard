const EVENTS = [
  { t: "12 May 13:45", title: "Voice call", detail: "9876543210 → 9123456780 · Chennai tower" },
  { t: "12 May 14:02", title: "Voice call", detail: "9876543210 → 9988776655 · Sector 17" },
  { t: "12 May 14:18", title: "SMS", detail: "9123456780 → 9876543210 · Mohali" },
  { t: "12 May 15:41", title: "Inbound call", detail: "9012345678 → 9876543210 · Panchkula" },
  { t: "12 May 16:09", title: "IMPS 85,000", detail: "SBI collection account → mule account" },
];

export default function Timeline() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Timeline</h1>
        <p className="text-sm text-slate-500">Chronology of normalized events</p>
      </div>
      <div className="card p-6">
        <ol className="space-y-4">
          {EVENTS.map((e, i) => (
            <li key={e.t} className="flex gap-4">
              <div className="flex w-28 shrink-0 flex-col items-end">
                <span className="text-xs font-medium text-slate-700">{e.t}</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="h-2.5 w-2.5 rounded-full bg-brand" />
                {i < EVENTS.length - 1 ? <span className="w-px flex-1 bg-line" /> : null}
              </div>
              <div className="pb-4">
                <div className="text-sm font-medium text-slate-900">{e.title}</div>
                <div className="text-xs text-slate-500">{e.detail}</div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
