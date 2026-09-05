import { Navigate, Route, Routes } from "react-router-dom";
import { isAuthenticated } from "./lib/auth";
import AppLayout from "./components/layout/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import CaseManagement from "./pages/CaseManagement";
import DataSources from "./pages/DataSources";
import Entities from "./pages/Entities";
import IntelligenceGraph from "./pages/IntelligenceGraph";
import GeospatialMap from "./pages/GeospatialMap";
import Timeline from "./pages/Timeline";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import ChainOfCustody from "./pages/ChainOfCustody";
import Output from './pages/Output';
import Preprocessing from './pages/Preprocessing';
import Normalization from './pages/Normalization';
import Enrichment from './pages/Enrichment';

function Protected({ children }) {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated() ? <Navigate to="/dashboard" replace /> : <Login />}
      />
      <Route
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cases" element={<CaseManagement />} />
        <Route path="/data-sources" element={<DataSources />} />
        <Route path="/entities" element={<Entities />} />
        <Route path="/graph" element={<IntelligenceGraph />} />
        <Route path="/map" element={<GeospatialMap />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/preprocessing" element={<Preprocessing />} />
        <Route path="/normalization" element={<Normalization />} />
        <Route path="/enrichment" element={<Enrichment />} />
        <Route path="/alerts" element={<Alerts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/custody" element={<ChainOfCustody />} />
        <Route path="/output" element={<Output />} />
      </Route>
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}
