import { PIPELINE_STEPS } from "../../lib/constants";
import { Icon } from "../icons";

export default function Stepper({ current }) {
  return (
    <ol className="flex items-center gap-2">
      {PIPELINE_STEPS.map((step, i) => {
        const done = current > step.id;
        const active = current === step.id;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                  done
                    ? "border-emerald-600 bg-emerald-600 text-white"
                    : active
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-white text-slate-400"
                }`}
              >
                {done ? <Icon name="check" className="h-4 w-4" /> : step.id}
              </span>
              <span className="min-w-0">
                <div className={`truncate text-sm font-medium ${active ? "text-brand" : done ? "text-slate-800" : "text-slate-400"}`}>
                  {step.title}
                </div>
                <div className="truncate text-[11px] text-slate-500">{step.caption}</div>
              </span>
            </div>
            {i < PIPELINE_STEPS.length - 1 ? (
              <div className={`h-px flex-1 ${done ? "bg-emerald-500" : "bg-line"}`} />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
