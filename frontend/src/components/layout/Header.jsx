import { useNavigate } from "react-router-dom";
import { getSession, signOut } from "../../lib/auth";
import { Icon } from "../icons";

export default function Header() {
  const navigate = useNavigate();
  const { refId, dept } = getSession();

  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-line bg-white px-5">
      <div className="relative max-w-xl flex-1">
        <Icon name="search" className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
        <input className="field pl-9" placeholder="Search cases, entities, files..." />
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button className="relative rounded-lg border border-line p-2 text-slate-600">
          <Icon name="bell" />
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[9px] text-white">
            3
          </span>
        </button>
        <div className="flex items-center gap-2 border-l border-line pl-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-line bg-slate-50 text-xs font-semibold text-brand">
            IR
          </div>
          <div className="leading-tight">
            <div className="text-xs font-medium text-slate-800">Inspector Raj</div>
            <div className="text-[11px] text-slate-500">
              {dept || "Chandigarh Police"} · {refId || "—"}
            </div>
          </div>
          <button
            className="ml-1 text-slate-400 hover:text-slate-700"
            title="Sign out"
            onClick={() => {
              signOut();
              navigate("/login", { replace: true });
            }}
          >
            <Icon name="logout" />
          </button>
        </div>
      </div>
    </header>
  );
}
