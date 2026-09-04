const NODES = [
  { id: "p1", x: 280, y: 80, label: "Rakesh Mehra", sub: "Person" },
  { id: "ph", x: 280, y: 220, label: "9876543210", sub: "Phone" },
  { id: "a1", x: 90, y: 220, label: "SBI •••1122", sub: "Account" },
  { id: "p2", x: 470, y: 220, label: "Anita Kaur", sub: "Mule" },
  { id: "ip", x: 280, y: 360, label: "103.21.44.18", sub: "IP" },
];

const EDGES = [
  ["p1", "ph"],
  ["ph", "a1"],
  ["ph", "p2"],
  ["p1", "ip"],
];

export default function IntelligenceGraph() {
  const byId = Object.fromEntries(NODES.map((n) => [n.id, n]));
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Intelligence Graph</h1>
        <p className="text-sm text-slate-500">Entity relationships for MG-2024-1024</p>
      </div>
      <div className="card p-4">
        <svg viewBox="0 0 560 430" className="h-[430px] w-full">
          {EDGES.map(([a, b]) => (
            <line
              key={a + b}
              x1={byId[a].x}
              y1={byId[a].y}
              x2={byId[b].x}
              y2={byId[b].y}
              stroke="#E5E7EB"
              strokeWidth="1.5"
            />
          ))}
          {NODES.map((n) => (
            <g key={n.id}>
              <circle cx={n.x} cy={n.y} r="28" fill="#fff" stroke="#2563EB" strokeWidth="1.5" />
              <text x={n.x} y={n.y + 46} textAnchor="middle" fontSize="11" fill="#0f172a">
                {n.label}
              </text>
              <text x={n.x} y={n.y + 60} textAnchor="middle" fontSize="10" fill="#64748b">
                {n.sub}
              </text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}
