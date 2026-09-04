const PINS = [
  { x: 42, y: 38, label: "Sector 17, Chandigarh" },
  { x: 58, y: 48, label: "Mohali" },
  { x: 62, y: 28, label: "Panchkula" },
  { x: 22, y: 62, label: "Chennai (remote hop)" },
];

export default function GeospatialMap() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Geospatial Map</h1>
        <p className="text-sm text-slate-500">Event locations derived from CDR towers and IP geolocation</p>
      </div>
      <div className="card relative h-[480px] overflow-hidden bg-slate-100">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(#E5E7EB 1px, transparent 1px), linear-gradient(90deg, #E5E7EB 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            backgroundColor: "#F8FAFC",
          }}
        />
        {PINS.map((p) => (
          <div key={p.label} className="absolute" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
            <div className="h-3 w-3 rounded-full border-2 border-white bg-brand" />
            <div className="mt-1 whitespace-nowrap rounded border border-line bg-white px-2 py-1 text-[11px] text-slate-700">
              {p.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
