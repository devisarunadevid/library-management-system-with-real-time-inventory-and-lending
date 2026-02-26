import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Book,
  Users,
  Activity,
  LogOut,
  Library,
  Plus,
  Layers,
  Rows3,
  Bell,
  Bookmark,
  Calendar,
  ClipboardList,
  History,
  Receipt,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  X,
} from "lucide-react";
import Table from "../components/Table";
import AddEditModal from "../components/AddEditModal";
import PlanModal from "../components/PlanModal";
import PaymentHistory from "../components/PaymentHistory";
import OfflinePaymentTracker from "../components/OfflinePaymentTracker";
import AdvancedFilter from "../components/AdvancedFilter";
import api from "../services/api";
import { memberService } from "../services/memberService";
import planService from "../services/planService";
import { bookService } from "../services/bookService";
import notificationService from "../services/notificationService";
import AdminNotificationBell from "../components/AdminNotificationBell";
import LibrarioChat from "../components/LibrarioChat";
import overdueService from "../services/overdueService";

export default function AdminPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("members");
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [users, setUsers] = useState([]);
  const [bookCount, setBookCount] = useState(0);
  const [_notifications, setNotifications] = useState([]);
  const [chatMinimized, setChatMinimized] = useState(true);
  const [borrowCount, setBorrowCount] = useState(0);

  // Loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Data loading states
  const [membersLoading, setMembersLoading] = useState(false);
  const [plansLoading, setPlansLoading] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);

  useEffect(() => {
    async function fetchCount() {
      try {
        const count = await overdueService.getBorrowedCount();
        setBorrowCount(count);
      } catch (err) {
        console.error("Failed to load borrowed books count:", err);
      }
    }
    fetchCount();
  }, []);

  const fetchBookCount = useCallback(async () => {
    try {
      const count = await bookService.getCount();
      setBookCount(count);
    } catch (err) {
      console.error("Error fetching book count", err);
    }
  }, []);

  const fetchBorrowCount = useCallback(async () => {
    try {
      const count = await overdueService.getBorrowedCount();
      setBorrowCount(count);
    } catch (err) {
      console.error("Error fetching borrow count", err);
    }
  }, []);

  const fetchMembers = useCallback(async () => {
    setMembersLoading(true);
    try {
      const data = await memberService.getAll();
      setMembers(data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load members. Please try again.");
    } finally {
      setMembersLoading(false);
    }
  }, []);

  const fetchPlans = useCallback(async () => {
    setPlansLoading(true);
    try {
      const res = await planService.getPlans();
      setPlans(res || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load membership plans. Please try again.");
    } finally {
      setPlansLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const res = await api.get("/users");
      setUsers(res.data || []);
      setError("");
    } catch (err) {
      console.error(err);
      setError("Failed to load users. Please try again.");
    } finally {
      setUsersLoading(false);
    }
  }, []);

  const refreshAllData = useCallback(async () => {
    setIsRefreshing(true);
    setError("");
    try {
      await Promise.all([
        fetchMembers(),
        fetchPlans(),
        fetchUsers(),
        fetchBookCount(),
        fetchBorrowCount(),
      ]);
      setSuccessMessage("Data refreshed successfully!");
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to refresh data. Please try again.");
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchMembers, fetchPlans, fetchUsers]);

  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          fetchMembers(),
          fetchPlans(),
          fetchUsers(),
          fetchBookCount(),
          fetchBorrowCount(),
        ]);
      } catch (err) {
        setError("Failed to load initial data. Please refresh the page.");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, [fetchMembers, fetchPlans, fetchUsers]);

  useEffect(() => {
    async function loadNotifications() {
      try {
        const res = await notificationService.getAdmin();
        setNotifications(res || []);
      } catch (err) {
        console.error("Failed to load admin notifications", err);
      }
    }
    loadNotifications();
  }, []);

  const handleMemberSave = async (member) => {
    try {
      if (!member.userId) return alert("Please select a user!");
      if (!member.planId) return alert("Please select a plan!");
      const payload = {
        userId: parseInt(member.userId, 10),
        planId: parseInt(member.planId, 10),
        startDate: member.startDate || new Date().toISOString().split("T")[0],
      };
      if (selectedMember)
        await memberService.update(selectedMember.id, payload);
      else await memberService.create(payload);
      fetchMembers();
      setShowMemberModal(false);
      setSelectedMember(null);
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to save member");
    }
  };
  const handleMemberDelete = async (id) => {
    if (window.confirm("Delete this member?")) {
      try {
        await memberService.delete(id);
        fetchMembers();
      } catch (err) {
        console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };
  const handlePlanDelete = async (id) => {
    if (window.confirm("Delete this plan?")) {
      await planService.deletePlan(id);
      fetchPlans();
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to logout. Try again.");
    } finally {
      localStorage.removeItem("role");
      navigate("/login");
    }
  };

  const memberColumns = [
    { key: "id", label: "ID" },
    { key: "userId", label: "User ID" },
    { key: "planId", label: "Plan ID" },
    { key: "planType", label: "Plan Type" },
    { key: "startDate", label: "Start Date" },
  ];
  const planColumns = [
    { key: "id", label: "ID" },
    { key: "type", label: "Type" },
    { key: "fees", label: "Fees" },
    { key: "durationDays", label: "Duration (Days)" },
    { key: "borrowingLimit", label: "Borrowing Limit" },
    { key: "finePerDay", label: "Fine/Day" },
  ];

  // Loading skeleton component
  const LoadingSkeleton = ({ className = "" }) => (
    <div className={`animate-pulse bg-white/20 rounded-xl ${className}`}>
      <div className="h-4 bg-white/30 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-white/20 rounded w-1/2"></div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen w-full relative">
        <div
          className="fixed inset-0 -z-10 bg-cover bg-center"
          style={{
            backgroundImage: "url('/bibliolibrary.jpg')",
            backgroundAttachment: "fixed",
          }}
        />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_800px_at_50%_-10%,rgba(255,214,130,0.18),transparent_60%)]" />
        <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

        <main className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                  <Library className="w-6 h-6" />
                </div>
                <div>
                  <div className="h-6 bg-white/30 rounded w-32 mb-2"></div>
                  <div className="h-4 bg-white/20 rounded w-24"></div>
                </div>
              </div>
              <div className="h-8 bg-white/20 rounded w-20"></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              <LoadingSkeleton className="p-6 h-24" />
              <LoadingSkeleton className="p-6 h-24" />
              <LoadingSkeleton className="p-6 h-24" />
            </div>

            <LoadingSkeleton className="p-6 h-64" />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative"
      role="main"
      aria-label="Admin Dashboard"
    >
      {/* Fixed, bright library background (no break on scroll) */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />
      {/* Light overlays to keep image visible and text readable */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_800px_at_50%_-10%,rgba(255,214,130,0.18),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <main className="relative z-10 p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Error and Success Messages */}
          {error && (
            <div
              className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
              <button
                onClick={() => setError("")}
                className="ml-auto text-red-500 hover:text-red-700 focus:outline-none focus:ring-2 focus:ring-red-400/60 rounded"
                aria-label="Dismiss error message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {successMessage && (
            <div
              className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 flex items-center gap-2"
              role="alert"
              aria-live="polite"
            >
              <CheckCircle className="w-5 h-5 flex-shrink-0" />
              <span>{successMessage}</span>
              <button
                onClick={() => setSuccessMessage("")}
                className="ml-auto text-green-500 hover:text-green-700 focus:outline-none focus:ring-2 focus:ring-green-400/60 rounded"
                aria-label="Dismiss success message"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className="p-3 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50"
                role="img"
                aria-label="Library Management System"
              >
                <Library className="w-6 h-6" aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Aurora Library
                </h1>
                <p className="text-brown-800/80 text-xs -mt-0.5">
                  Admin Dashboard
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <AdminNotificationBell />
              <button
                onClick={refreshAllData}
                disabled={isRefreshing}
                className="inline-flex items-center gap-2 rounded-xl border border-blue-300/50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 text-sm shadow hover:-translate-y-0.5 transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400/60"
                aria-label="Refresh all data"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
                {isRefreshing ? "Refreshing..." : "Refresh"}
              </button>
              <button
                onClick={logout}
                className="inline-flex items-center gap-2 rounded-xl border border-rose-300/50 bg-gradient-to-r from-rose-500 via-fuchsia-500 to-red-600 text-white px-3 py-2 text-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_28px_rgba(225,29,72,0.45)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_16px_42px_rgba(225,29,72,0.6)] transition focus:outline-none focus:ring-2 focus:ring-rose-400/60"
                aria-label="Logout from admin dashboard"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Title + Tabs */}
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-extrabold tracking-tight flex items-center gap-2 bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                <ClipboardList
                  className="w-6 h-6 text-amber-500"
                  aria-hidden="true"
                />
                Admin Dashboard
              </h2>
              <p className="text-brown-800/85 mt-1">
                Curate, organize, and manage your library with grace.
              </p>
            </div>
            <div
              className="inline-flex items-center rounded-2xl border border-amber-300/40 bg-white/40 p-1 backdrop-blur-lg shadow-md overflow-x-auto"
              role="tablist"
              aria-label="Dashboard sections"
            >
              <button
                onClick={() => setActiveTab("members")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  activeTab === "members"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow scale-105"
                    : "text-brown-800/85 hover:text-brown-900"
                }`}
                role="tab"
                aria-selected={activeTab === "members"}
                aria-controls="members-panel"
                id="members-tab"
              >
                <Rows3 className="w-4 h-4" aria-hidden="true" />
                Members
                {membersLoading && (
                  <Loader2 className="w-3 h-3 animate-spin ml-1" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("plans")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  activeTab === "plans"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow scale-105"
                    : "text-brown-800/85 hover:text-brown-900"
                }`}
                role="tab"
                aria-selected={activeTab === "plans"}
                aria-controls="plans-panel"
                id="plans-tab"
              >
                <Layers className="w-4 h-4" aria-hidden="true" />
                Plans
                {plansLoading && (
                  <Loader2 className="w-3 h-3 animate-spin ml-1" />
                )}
              </button>
              <button
                onClick={() => setActiveTab("payments")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  activeTab === "payments"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow scale-105"
                    : "text-brown-800/85 hover:text-brown-900"
                }`}
                role="tab"
                aria-selected={activeTab === "payments"}
                aria-controls="payments-panel"
                id="payments-tab"
              >
                <Receipt className="w-4 h-4" aria-hidden="true" />
                Payments
              </button>
              <button
                onClick={() => setActiveTab("offline-payments")}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-amber-400/60 ${
                  activeTab === "offline-payments"
                    ? "bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow scale-105"
                    : "text-brown-800/85 hover:text-brown-900"
                }`}
                role="tab"
                aria-selected={activeTab === "offline-payments"}
                aria-controls="offline-payments-panel"
                id="offline-payments-tab"
              >
                <History className="w-4 h-4" aria-hidden="true" />
                Offline Payments
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
            <div className="group relative overflow-hidden rounded-3xl border border-amber-300/40 bg-white/50 backdrop-blur-2xl p-6 text-brown-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow">
                  <Book className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-brown-800/80">Total Books</p>
                  <p className="text-2xl font-extrabold">{bookCount}</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-emerald-300/40 bg-white/50 backdrop-blur-2xl p-6 text-brown-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-400 to-teal-500 text-white shadow">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-brown-800/80">Active Members</p>
                  <p className="text-2xl font-extrabold">{members.length}</p>
                </div>
              </div>
            </div>
            <div className="group relative overflow-hidden rounded-3xl border border-sky-300/40 bg-white/50 backdrop-blur-2xl p-6 text-brown-900 shadow-md hover:shadow-xl transition transform hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-2xl bg-gradient-to-r from-sky-400 to-indigo-500 text-white shadow">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-brown-800/80">Borrowed Books</p>
                  <p className="text-2xl font-extrabold">{borrowCount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            {activeTab === "members" && (
              <div
                role="tabpanel"
                id="members-panel"
                aria-labelledby="members-tab"
              >
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={() => {
                      setSelectedMember(null);
                      setShowMemberModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    aria-label="Add new member to the library"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add New Member
                  </button>

                  <div className="flex items-center gap-2 text-sm text-brown-700">
                    <Info className="w-4 h-4" />
                    <span>Total Members: {members.length}</span>
                  </div>
                </div>

                {membersLoading ? (
                  <div className="rounded-3xl border border-white/40 bg-white/50 backdrop-blur-2xl p-6 shadow-md">
                    <div className="flex items-center justify-center gap-2 text-brown-700">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading members...</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/40 bg-white/50 backdrop-blur-2xl p-3 shadow-md">
                    <Table
                      columns={memberColumns}
                      data={members}
                      onEdit={(m) => {
                        setSelectedMember(m);
                        setShowMemberModal(true);
                      }}
                      onDelete={handleMemberDelete}
                    />
                  </div>
                )}
              </div>
            )}

            {activeTab === "plans" && (
              <div role="tabpanel" id="plans-panel" aria-labelledby="plans-tab">
                <div className="flex flex-col sm:flex-row gap-4 mb-4">
                  <button
                    onClick={() => {
                      setSelectedPlan(null);
                      setShowPlanModal(true);
                    }}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 transition focus:outline-none focus:ring-2 focus:ring-amber-400/60"
                    aria-label="Add new membership plan"
                  >
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Add New Plan
                  </button>

                  <div className="flex items-center gap-2 text-sm text-brown-700">
                    <Info className="w-4 h-4" />
                    <span>Total Plans: {plans.length}</span>
                  </div>
                </div>

                {plansLoading ? (
                  <div className="rounded-3xl border border-white/40 bg-white/50 backdrop-blur-2xl p-6 shadow-md">
                    <div className="flex items-center justify-center gap-2 text-brown-700">
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Loading plans...</span>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-3xl border border-white/40 bg-white/50 backdrop-blur-2xl p-3 shadow-md">
                    <Table
                      columns={planColumns}
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

            {activeTab === "payments" && (
              <div
                role="tabpanel"
                id="payments-panel"
                aria-labelledby="payments-tab"
              >
                <PaymentHistory role="ADMIN" />
              </div>
            )}

            {activeTab === "offline-payments" && (
              <div
                role="tabpanel"
                id="offline-payments-panel"
                aria-labelledby="offline-payments-tab"
              >
                <OfflinePaymentTracker role="ADMIN" />
              </div>
            )}
          </div>
        </div>
      </main>

      {showMemberModal && (
        <AddEditModal
          title={selectedMember ? "Edit Member" : "Add Member"}
          fields={[
            {
              key: "userId",
              label: "User",
              type: "select",
              options: users
                .filter((u) => {
                  if (selectedMember && u.id === selectedMember.userId)
                    return true;
                  return !members.some((m) => m.userId === u.id);
                })
                .map((u) => ({
                  value: u.id,
                  label: u.username ? `${u.username} (${u.email})` : u.email,
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

      {/* Floating AI Chat – Admin page: replace ONLY this block */}
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
            aria-controls="admin-chat-body"
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
              id="admin-chat-body"
              className="relative z-10 border-t border-white/20"
            >
              <div className="chat-scroll max-h-[70vh] overflow-y-auto p-2 sm:p-3 bg-gradient-to-b from-white/40 via-white/30 to-white/40 backdrop-blur-md text-black">
                <LibrarioChat
                  role="ADMIN"
                  context={{
                    overdueInfo: (members || []).reduce((acc, m) => {
                      acc[m?.username || m?.userId] = m?.overdueDays || 0;
                      return acc;
                    }, {}),
                    borrowedBooks: (members || []).reduce((acc, m) => {
                      acc[m?.username || m?.userId] = m?.borrowedBooks || [];
                      return acc;
                    }, {}),
                  }}
                />
              </div>
            </div>
          )}

          <style>{`
            .chat-scroll{scroll-behavior:smooth}
            .chat-scroll::-webkit-scrollbar{width:10px}
            .chat-scroll::-webkit-scrollbar-thumb{background:rgba(0,0,0,0.25);border-radius:9999px;border:2px solid transparent}
            .chat-scroll::-webkit-scrollbar-track{background:transparent}
          `}</style>
        </div>
      </div>
    </div>
  );
}
