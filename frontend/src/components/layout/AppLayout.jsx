import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const isGraph = location.pathname === "/graph";
  const isAnomaly = location.pathname.startsWith("/anomaly-engine");

  return (
    <div className="flex h-full bg-[#F8FAFC]">
      {!isGraph && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!isGraph && !isAnomaly && <Header />}
        <main className={`min-h-0 flex-1 ${
          isGraph
            ? "h-full w-full overflow-hidden p-0 bg-[#070B19]"
            : isAnomaly
            ? "overflow-y-auto bg-[#F8FAFC]"
            : "overflow-y-auto p-5"
        }`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

