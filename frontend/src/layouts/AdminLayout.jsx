import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";

export default function AdminLayout() {
  return (
    <div className="grid grid-cols-[18rem_1fr] h-screen w-screen overflow-hidden">
      <Sidebar role="ADMIN" />
      <div className="h-screen overflow-y-auto min-w-0">
        <Outlet />
      </div>
    </div>
  );
}
