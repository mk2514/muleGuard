import { Outlet, useLocation } from "react-router-dom";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function AppLayout() {
  const location = useLocation();
  const isGraph = location.pathname === "/graph";

  return (
    <div className="flex h-full bg-[#F8FAFC]">
      {!isGraph && <Sidebar />}
      <div className="flex min-w-0 flex-1 flex-col">
        {!isGraph && <Header />}
        <main className={`min-h-0 flex-1 ${isGraph ? "h-full w-full overflow-hidden p-0 bg-[#070B19]" : "overflow-y-auto p-5"}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

