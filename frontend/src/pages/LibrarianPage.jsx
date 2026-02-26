import { useEffect, useState, useCallback } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import Table from "../components/Table";
import AddEditModal from "../components/AddEditModal";
import { memberService } from "../services/memberService";
import planService from "../services/planService";
import PlanModal from "../components/PlanModal";
import NotificationBell from "../components/NotificationBell";
import {
  LogOut,
  LayoutDashboard,
  Users,
  Layers,
  BookOpen,
  GraduationCap,
  Sparkles,
  PlusCircle,
} from "lucide-react";
import LibrarioChat from "../components/LibrarioChat";

function DashboardStats() {
  const [stats, setStats] = useState({
    booksIssued: 0,
    booksReturned: 0,
    pendingFines: 0,
  });

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch(() =>
        setStats({ booksIssued: 0, booksReturned: 0, pendingFines: 0 })
      );
  }, []);

  const cardStyle =
    "rounded-2xl border border-amber-200/40 bg-gradient-to-br from-amber-50/80 to-orange-100/60 backdrop-blur-lg shadow-[0_4px_20px_rgba(0,0,0,0.1)] p-6 transition-all hover:shadow-[0_8px_30px_rgba(245,158,11,0.35)] hover:-translate-y-0.5";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      <div className={cardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="w-6 h-6 text-amber-600" />
          <p className="text-sm font-medium text-brown-800">Books Issued</p>
        </div>
        <p className="text-3xl font-extrabold text-brown-900">
          {stats.booksIssued}
        </p>
      </div>
      <div className={cardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <GraduationCap className="w-6 h-6 text-emerald-600" />
          <p className="text-sm font-medium text-brown-800">Books Returned</p>
        </div>
        <p className="text-3xl font-extrabold text-brown-900">
          {stats.booksReturned}
        </p>
      </div>
      <div className={cardStyle}>
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6 text-rose-600" />
          <p className="text-sm font-medium text-brown-800">Pending Fines</p>
        </div>
        <p className="text-3xl font-extrabold text-brown-900">
          ₹{stats.pendingFines}
        </p>
      </div>
    </div>
  );
}

export default function LibrarianPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [chatMinimized, setChatMinimized] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === "/librarian";

  const fetchMembers = useCallback(async () => {
    try {
      setMembers((await memberService.getAll()) || []);
    } catch {}
  }, []);

  const fetchPlans = useCallback(async () => {
    try {
      setPlans((await planService.getPlans()) || []);
    } catch {}
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
    } catch {}
  }, []);

  useEffect(() => {
    fetchMembers();
    fetchPlans();
    fetchUsers();
  }, [fetchMembers, fetchPlans, fetchUsers]);

  const handleMemberSave = async (member) => {
    try {
      if (!member.userId || !member.planId)
        return alert("Please select both user and plan");
      const payload = {
        userId: +member.userId,
        planId: +member.planId,
        startDate: member.startDate || new Date().toISOString().split("T")[0],
      };
      if (selectedMember)
        await memberService.update(selectedMember.id, payload);
      else await memberService.create(payload);
      fetchMembers();
      setShowMemberModal(false);
      setSelectedMember(null);
    } catch {
      alert("Failed to save member");
    }
  };

  const handleMemberDelete = async (id) => {
    if (confirm("Delete this member?")) {
      try {
        await memberService.delete(id);
        fetchMembers();
      } catch {
        alert("Failed to delete member");
      }
    }
  };

  const handlePlanSave = async (plan) => {
    try {
      if (plan.id) await planService.updatePlan(plan.id, plan);
      else await planService.addPlan(plan);
      fetchPlans();
      setShowPlanModal(false);
      setSelectedPlan(null);
    } catch {
      alert("Failed to save plan");
    }
  };

  const handlePlanDelete = async (id) => {
    if (confirm("Delete this plan?")) {
      try {
        await planService.deletePlan(id);
        fetchPlans();
      } catch {
        alert("Failed to delete plan");
      }
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
      localStorage.removeItem("role");
      localStorage.removeItem("userId");
      navigate("/login");
    } catch {}
  };

  return (
    <div className="grid grid-cols-[18rem_1fr] h-screen w-screen overflow-hidden">
      <Sidebar role="LIBRARIAN" />

      {/* Main with fixed bright background + golden overlays */}
      <div className="relative h-screen overflow-y-auto min-w-0">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: "url('/bibliolibrary.jpg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

        <div className="relative">
          {/* Dashboard Header */}
          {isDashboard && (
            <div className="relative flex items-center justify-between gap-4 mb-6 p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h2 className="text-2xl md:text-3xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Welcome, Librarian
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <NotificationBell />
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-rose-300/60 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-4 py-2 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(244,63,94,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition-all"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </div>
            </div>
          )}

          {/* Nested Routes */}
          <Outlet />

          {/* Tabs + Content */}
          {isDashboard && (
            <div className="relative px-6">
              <div className="inline-flex items-center rounded-2xl border border-white/40 bg-white/60 backdrop-blur p-1 mb-6 shadow-md">
                <button
                  onClick={() => setActiveTab("dashboard")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "dashboard"
                      ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow"
                      : "text-brown-800 hover:text-brown-900"
                  }`}
                >
                  <LayoutDashboard className="w-4 h-4" /> Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("members")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "members"
                      ? "bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow"
                      : "text-brown-800 hover:text-brown-900"
                  }`}
                >
                  <Users className="w-4 h-4" /> Manage Members
                </button>
                <button
                  onClick={() => setActiveTab("plans")}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                    activeTab === "plans"
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow"
                      : "text-brown-800 hover:text-brown-900"
                  }`}
                >
                  <Layers className="w-4 h-4" /> Membership Plans
                </button>
              </div>

              {activeTab === "dashboard" && <DashboardStats />}

              {activeTab === "members" && (
                <div>
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setShowMemberModal(true);
                    }}
                    className="mb-4 inline-flex items-center gap-2 rounded-xl border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-teal-600 text-white px-4 py-2 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(16,185,129,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Member
                  </button>
                  <Table
                    columns={[
                      { key: "userId", label: "User ID" },
                      { key: "planType", label: "Membership Plan" },
                      { key: "startDate", label: "Start Date" },
                    ]}
                    data={members}
                    onEdit={(m) => {
                      setSelectedMember(m);
                      setShowMemberModal(true);
                    }}
                    onDelete={handleMemberDelete}
                  />
                </div>
              )}

              {activeTab === "plans" && (
                <div>
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      setShowPlanModal(true);
                    }}
                    className="mb-4 inline-flex items-center gap-2 rounded-xl border border-sky-300/60 bg-gradient-to-r from-sky-500 to-blue-600 text-white px-4 py-2 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(59,130,246,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" /> Add Plan
                  </button>
                  <Table
                    columns={[
                      { key: "type", label: "Plan Type" },
                      { key: "fees", label: "Fees" },
                      { key: "durationMonths", label: "Duration (Months)" },
                      { key: "borrowingLimit", label: "Borrowing Limit" },
                      { key: "finePerDay", label: "Fine Per Day" },
                      { key: "durationDays", label: "Duration (Days)" },
                    ]}
                    data={plans}
                    onEdit={(p) => {
                      setSelectedPlan(p);
                      setShowPlanModal(true);
                    }}
                    onDelete={handlePlanDelete}
                  />
                </div>
              )}
            </div>
          )}

          {/* Modals */}
          {showMemberModal && (
            <AddEditModal
              title={selectedMember ? "Edit Member" : "Add Member"}
              fields={[
                {
                  key: "userId",
                  label: "Select User",
                  type: "select",
                  options: users
                    .filter(
                      (u) =>
                        (selectedMember && u.id === selectedMember.userId) ||
                        !members.some((m) => m.userId === u.id)
                    )
                    .map((u) => ({
                      value: u.id,
                      label: u.username || u.email,
                    })),
                  required: true,
                },
                {
                  key: "planId",
                  label: "Membership Plan",
                  type: "select",
                  options: plans.map((p) => ({ value: p.id, label: p.type })),
                  required: true,
                },
                {
                  key: "startDate",
                  label: "Start Date",
                  type: "date",
                  required: true,
                },
              ]}
              item={selectedMember}
              onSave={handleMemberSave}
              onClose={() => setShowMemberModal(false)}
            />
          )}

          {showPlanModal && (
            <PlanModal
              show={showPlanModal}
              initialData={selectedPlan}
              title={selectedPlan ? "Edit Plan" : "Add Plan"}
              onSave={handlePlanSave}
              onClose={() => setShowPlanModal(false)}
            />
          )}
        </div>
      </div>

      {/* Floating AI Chat – replace ONLY this block */}
      <div
        className={`fixed bottom-5 right-5 z-50 ${
          chatMinimized ? "w-[12rem]" : "w-[min(26rem,92vw)]"
        } transition-[width,transform] duration-300`}
      >
        <div className="relative overflow-hidden rounded-[26px] border border-white/20 bg-white/50 backdrop-blur-xl ring-1 ring-white/20 shadow-[0_18px_70px_rgba(0,0,0,0.28)]">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-full w-1.5 bg-gradient-to-b from-amber-400/80 to-orange-500/80" />
            <div className="absolute right-4 -top-3 h-6 w-3 rotate-6 rounded-b-[6px] bg-amber-400 shadow-[0_6px_18px_rgba(245,158,11,0.55)]" />
            <div className="absolute inset-0 bg-[radial-gradient(900px_420px_at_-10%_-20%,rgba(255,210,150,0.16),transparent_60%),radial-gradient(760px_420px_at_120%_10%,rgba(30,64,30,0.10),transparent_55%)]" />
          </div>

          <button
            type="button"
            onClick={() => setChatMinimized(!chatMinimized)}
            className="relative z-10 flex w-full items-center justify-between gap-3 px-3 py-2.5 border-b border-white/20 bg-gradient-to-r from-white/40 via-white/30 to-white/40 backdrop-blur-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 rounded-t-[22px]"
            aria-expanded={!chatMinimized}
            aria-controls="librarian-chat-body"
            title={chatMinimized ? "Open chat" : "Minimize chat"}
          >
            <span className="pointer-events-none absolute -top-1.5 right-2">
              <span className="absolute inset-0 animate-ping rounded-full bg-amber-400/60 h-2.5 w-2.5" />
              <span className="relative inline-block h-2.5 w-2.5 rounded-full bg-amber-400" />
            </span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="relative inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/40 ring-1 ring-white/40 shadow-inner">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 text-black/90">
                  <rect
                    x="6"
                    y="7"
                    width="12"
                    height="10"
                    rx="4"
                    fill="currentColor"
                    opacity=".18"
                  />
                  <rect
                    x="6"
                    y="7"
                    width="12"
                    height="10"
                    rx="4"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    fill="none"
                  />
                  <circle cx="10" cy="12" r="1.05" fill="currentColor" />
                  <circle cx="14" cy="12" r="1.05" fill="currentColor" />
                  <path
                    d="M9 15h6"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <path
                    d="M12 3.4v2"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                  <circle cx="12" cy="3" r=".95" fill="currentColor" />
                </svg>
              </span>
              <div className="min-w-0">
                <div className="font-semibold text-black truncate">
                  Librario Bot
                </div>
                {!chatMinimized && (
                  <div className="text-[11px] text-black/80 truncate">
                    Ask about books, fines, membership…
                  </div>
                )}
              </div>
            </div>

            <span
              className={`inline-block text-black text-base transition-transform ${
                chatMinimized ? "rotate-0" : "rotate-180"
              }`}
              aria-hidden="true"
            >
              ▾
            </span>
          </button>

          {!chatMinimized && (
            <div
              id="librarian-chat-body"
              className="relative z-10 border-t border-white/20"
            >
              <div className="chat-scroll max-h-[70vh] overflow-y-auto p-2 sm:p-3 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-md text-black">
                <LibrarioChat
                  role="LIBRARIAN"
                  context={{
                    members: (members || []).map((m) => ({
                      name: m?.name ?? m?.userName ?? "Member",
                      plan: m?.plan ?? m?.planType ?? m?.planName ?? "—",
                    })),
                  }}
                />
              </div>
            </div>
          )}

          <style>{`
            .chat-scroll{scroll-behavior:smooth}
            .chat-scroll::-webkit-scrollbar{width:10px}
            .chat-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,.25);border-radius:9999px;border:2px solid transparent}
            .chat-scroll::-webkit-scrollbar-track{background:transparent}
          `}</style>
        </div>
      </div>
    </div>
  );
}
