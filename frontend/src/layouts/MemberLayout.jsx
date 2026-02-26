// src/layouts/MemberLayout.jsx
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

export default function MemberLayout() {
  return (
    <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50">
      <Sidebar role="MEMBER" />
      <main className="flex-1 overflow-y-auto px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
