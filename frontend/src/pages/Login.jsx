import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DEPARTMENTS } from "../lib/constants";
import { signIn } from "../lib/auth";
import { Icon } from "../components/icons";

export default function Login() {
  const navigate = useNavigate();
  const [refId, setRefId] = useState("");
  const [dept, setDept] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function submit(e) {
    e.preventDefault();
    if (!refId.trim() || !dept || !password) {
      setError("All fields are required.");
      return;
    }
    signIn({ refId: refId.trim(), dept });
    navigate("/dashboard", { replace: true });
  }

  return (
    <div className="flex min-h-full flex-col bg-[#F8FAFC]">
      <div className="flex items-center justify-between border-b border-line bg-white px-8 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-brand">
            <Icon name="custody" className="h-5 w-5" />
          </div>
          <div>
            <div className="text-sm font-semibold text-slate-900">Chandigarh Police</div>
            <div className="text-[11px] text-slate-500">Investigation Intelligence Platform</div>
          </div>
        </div>
        <div className="text-[11px] text-slate-500">Authorized personnel only</div>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <form onSubmit={submit} className="w-full max-w-md rounded-lg border border-line bg-white p-7">
          <div className="mb-6">
            <div className="text-[11px] font-medium uppercase tracking-wide text-brand">Secure access</div>
            <h1 className="mt-1 text-xl font-semibold text-slate-900">MuleGuard AI Sign In</h1>
            <p className="mt-1 text-sm text-slate-500">
              Multi-source investigation system for cyber crime, fraud, and intelligence units.
            </p>
          </div>

          <label className="label" htmlFor="ref">
            Police Ref ID
          </label>
          <input
            id="ref"
            className="field mb-4"
            value={refId}
            onChange={(e) => setRefId(e.target.value)}
            placeholder="e.g. CHD-CYB-2041"
          />

          <label className="label" htmlFor="dept">
            Branch / Department
          </label>
          <select id="dept" className="field mb-4" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Select department</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          <label className="label" htmlFor="pw">
            Password
          </label>
          <input
            id="pw"
            type="password"
            className="field mb-4"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
          />

          {error ? <p className="mb-3 text-sm text-red-600">{error}</p> : null}

          <button type="submit" className="btn-primary w-full">
            Sign In
          </button>

          <p className="mt-4 text-center text-[11px] text-slate-400">
            Access is logged. Session is stored locally for this workstation only.
          </p>
        </form>
      </div>
    </div>
  );
}
