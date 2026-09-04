const LOG = [
  { t: "12 May 10:14", actor: "Insp. Raj", action: "Seized CDR export from Airtel", hash: "a91c…e2" },
  { t: "12 May 10:22", actor: "Insp. Raj", action: "Uploaded to MuleGuard (read-only)", hash: "a91c…e2" },
  { t: "12 May 11:03", actor: "SI Kaur", action: "Bank statement received from SBI", hash: "c33b…19" },
  { t: "12 May 16:40", actor: "System", action: "Normalization complete — export sealed", hash: "f01e…88" },
];

export default function ChainOfCustody() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Chain of Custody</h1>
        <p className="text-sm text-slate-500">Evidence handling log for MG-2024-1024</p>
      </div>
      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs text-slate-500">
            <tr>
              {["Time", "Actor", "Action", "Hash"].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LOG.map((r) => (
              <tr key={r.t + r.action} className="border-t border-line">
                <td className="px-4 py-3 text-slate-600">{r.t}</td>
                <td className="px-4 py-3">{r.actor}</td>
                <td className="px-4 py-3">{r.action}</td>
                <td className="px-4 py-3 font-mono text-xs">{r.hash}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
