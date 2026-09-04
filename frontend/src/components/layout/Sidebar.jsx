import { NavLink } from "react-router-dom";
import { NAV } from "../../lib/constants";
import { Icon } from "../icons";

export default function Sidebar() {
  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r border-line bg-white">
      <div className="flex items-center gap-2.5 border-b border-line px-4 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-line bg-white text-brand">
          <Icon name="custody" className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">MuleGuard AI</div>
          <div className="text-[11px] text-slate-500">From Data to Justice</div>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-r-lg px-3 py-2 text-[13px] ${
                isActive
                  ? "border-l-[3px] border-brand bg-blue-50 font-medium text-brand"
                  : "border-l-[3px] border-transparent text-slate-600 hover:bg-slate-50"
              }`
            }
          >
            <Icon name={item.icon} className="h-4 w-4" />
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-red-600 px-1.5 text-[10px] font-medium text-white">
                {item.badge}
              </span>
            ) : null}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-line p-3">
        <div className="rounded-lg border border-line bg-slate-50 px-3 py-3">
          <div className="text-xs font-semibold text-slate-800">Safer Communities</div>
          <div className="mt-0.5 text-[11px] leading-4 text-slate-500">
            Stronger tomorrow. Chandigarh Police investigation cell.
          </div>
        </div>
      </div>
    </aside>
  );
}
