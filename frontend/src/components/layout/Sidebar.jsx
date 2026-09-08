import { NavLink, useLocation } from "react-router-dom";
import { NAV, AI_ENGINE_NAV, SYSTEM_NAV } from "../../lib/constants";
import { Icon } from "../icons";
import { ChevronRight, ShieldAlert, Cpu } from "lucide-react";

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex h-full w-64 shrink-0 flex-col border-r border-slate-200/80 bg-white select-none">
      {/* Brand Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-3.5">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-md shadow-purple-500/20">
          <ShieldAlert className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 tracking-tight">MuleGuard AI</div>
          <div className="text-[11px] font-medium text-slate-400">Investigation Intelligence</div>
        </div>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-3 scrollbar-thin">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-lg px-3 py-2 text-[13px] transition ${
                isActive
                  ? "bg-purple-600 text-white font-medium shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Icon name={item.icon} className={`h-4 w-4 ${isActive ? "text-white" : "text-slate-500"}`} />
                <span className="flex-1 truncate">{item.label}</span>
                {item.badge ? (
                  item.badge === "AIL" ? (
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        isActive ? "bg-purple-700/60 text-purple-100" : "bg-purple-100 text-purple-700"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : (
                    <span
                      className={`rounded-full px-1.5 py-0.2 text-[10px] font-semibold ${
                        isActive ? "bg-white/20 text-white" : "bg-red-500 text-white"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )
                ) : null}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User Profile Card */}
      <div className="border-t border-slate-100 p-3 bg-slate-50/50">
        <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-slate-100/80 transition cursor-pointer">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-purple-700 to-indigo-600 text-white font-bold text-xs shadow-inner">
            IV
            <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-900 truncate">Inspector Vijay</div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Field Officer</span>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </div>
      </div>
    </aside>
  );
}
