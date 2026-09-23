import { Routes, Route, Navigate } from "react-router-dom";
import { useStore } from "./store/useStore";
import Login from "./pages/Login";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Intake from "./pages/Intake";
import MatterWorkspace from "./pages/MatterWorkspace";
import Approvals from "./pages/Approvals";
import Billing from "./pages/Billing";
import Admin from "./pages/Admin";
import AuditLog from "./pages/AuditLog";
import Reports from "./pages/Reports";
import Clients from "./pages/Clients";
import ConflictCheck from "./pages/ConflictCheck";
import Calendar from "./pages/Calendar";
import Tasks from "./pages/Tasks";
import TimeTracker from "./pages/TimeTracker";
import Profile from "./pages/Profile";

export default function App() {
  const currentUser = useStore((s) => s.currentUser);

  if (!currentUser) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/intake" element={<Intake />} />
        <Route path="/matters/:id" element={<MatterWorkspace />} />
        <Route path="/approvals" element={<Approvals />} />
        <Route path="/billing" element={<Billing />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/audit" element={<AuditLog />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/clients" element={<Clients />} />
        <Route path="/conflict" element={<ConflictCheck />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/time" element={<TimeTracker />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}