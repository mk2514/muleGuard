import { ENTITIES } from "../lib/constants";

export default function Entities() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Entities</h1>
        <p className="text-sm text-slate-500">Resolved persons, phones, accounts and network identifiers</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              {["ID", "Type", "Name / Value", "Link", "Risk"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ENTITIES.map((e) => (
              <tr key={e.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{e.id}</td>
                <td className="px-4 py-3">{e.type}</td>
                <td className="px-4 py-3">{e.name}</td>
                <td className="px-4 py-3 text-slate-600">{e.link}</td>
                <td className="px-4 py-3">{e.risk}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
