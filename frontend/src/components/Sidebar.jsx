// src/components/Sidebar.jsx
import { NavLink } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import {
  Library,
  LayoutDashboard,
  UserPlus,
  Layers,
  BookOpen,
  Rows3,
  NotebookPen,
  Users,
  CalendarDays,
  Receipt,
  AlertCircle,
  Bell,
  IndianRupee,
  ClipboardList,
  ListChecks,
  AlertTriangle,
  Hourglass,
  Sparkles,
  Star,
  Crown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import notificationService from "../services/notificationService";

export default function Sidebar({ role }) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.id;
  const menuRef = useRef(null);
  const menuItemsRef = useRef([]);

  useEffect(() => {
    const fetchCount = async () => {
      try {
        let count = 0;

        if (role === "ADMIN") {
          const adminNotifications = await notificationService.getAdmin();
          count = adminNotifications.length;
        } else if (userId) {
          count = await notificationService.getUnreadCount(userId);
        }

        setUnreadCount(Number(count) || 0);
      } catch (err) {
        console.error(err);
      }
    };

    fetchCount();
    const interval = setInterval(fetchCount, 10000);
    return () => clearInterval(interval);
  }, [role, userId]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    const menuItems = menuItemsRef.current.filter(Boolean);

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) => (prev < menuItems.length - 1 ? prev + 1 : 0));
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : menuItems.length - 1));
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        if (focusedIndex >= 0 && menuItems[focusedIndex]) {
          menuItems[focusedIndex].click();
        }
        break;
      case "Escape":
        setIsMobileMenuOpen(false);
        break;
    }
  };

  // Focus management
  useEffect(() => {
    if (focusedIndex >= 0 && menuItemsRef.current[focusedIndex]) {
      menuItemsRef.current[focusedIndex].focus();
    }
  }, [focusedIndex]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const menuConfig = {
    ADMIN: [
      { name: "Dashboard", path: "/admin", icon: LayoutDashboard },
      { name: "Admin Alerts", path: "/admin/admin-alerts", icon: AlertCircle },
      { name: "Overdue Books", path: "/admin/overdue-books", icon: Hourglass },
      {
        name: "Membership Requests",
        path: "/admin/membership-requests",
        icon: ListChecks,
      },
      {
        name: "Borrow Requests",
        path: "/admin/borrow-requests",
        icon: ClipboardList,
      },
      { name: "Add Librarian", path: "/admin/add-librarian", icon: UserPlus },
      {
        name: "Membership Plans",
        path: "/admin/membership-plans",
        icon: Layers,
      },
      { name: "Books", path: "/admin/books", icon: BookOpen },
    ],
    LIBRARIAN: [
      { name: "Dashboard", path: "/librarian", icon: LayoutDashboard },
      { name: "Notifications", path: "/librarian/notifications", icon: Bell },
      { name: "Manage Books", path: "/librarian/books", icon: NotebookPen },
      {
        name: "Overdue Books",
        path: "/librarian/overdue-books",
        icon: AlertTriangle,
      },
      {
        name: "Borrow Records",
        path: "/librarian/borrow-records",
        icon: Rows3,
      },
      {
        name: "Record Offline Payment",
        path: "/librarian/offline-payment",
        icon: IndianRupee,
      },
    ],
    MEMBER: [
      { name: "Dashboard", path: "/member", icon: LayoutDashboard },
      { name: "Notifications", path: "/member/notifications", icon: Bell },
      { name: "Browse Books", path: "/member/books", icon: BookOpen },
      {
        name: "My Borrowed Books",
        path: "/member/borrowed-books",
        icon: Rows3,
      },
    ],
  };

  const menuItems = menuConfig[role] || [];

  const linkClasses = ({ isActive }) =>
    [
      "group flex items-center justify-between gap-3 px-4 py-3 rounded-2xl transition-all font-medium",
      "border backdrop-blur-md ring-1 ring-white/20",
      isActive
        ? "bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 border-amber-300/30 text-white shadow-[0_10px_28px_rgba(245,158,11,0.45)]"
        : "bg-white/5 border-white/10 text-slate-300 hover:bg-gradient-to-r hover:from-yellow-500 hover:via-amber-500 hover:to-orange-500 hover:border-amber-300/30 hover:text-white hover:shadow-[0_10px_28px_rgba(245,158,11,0.45)]",
    ].join(" ");

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white/90 backdrop-blur-md border border-amber-200/50 shadow-lg hover:bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400/60"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        aria-label="Toggle navigation menu"
        aria-expanded={isMobileMenuOpen}
        aria-controls="mobile-menu"
      >
        {isMobileMenuOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <Menu className="w-5 h-5" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        ref={menuRef}
        className={`sticky top-0 h-screen w-72 flex-col border-r border-white/10 bg-cover bg-center bg-fixed text-slate-200 backdrop-blur-xl transition-transform duration-300 z-40 ${
          isMobileMenuOpen ? "fixed left-0 top-0 flex" : "hidden md:flex"
        }`}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&q=80&w=800')",
        }}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Overlay for bright golden theme with readable text */}
        <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" />

        {/* Logo */}
        <div className="relative p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div
              className="p-2.5 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow-lg ring-1 ring-white/40"
              role="img"
              aria-label="Librario Library Management System"
            >
              <Library className="w-6 h-6 drop-shadow" aria-hidden="true" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold tracking-wide bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.35)]">
                Librario
              </h2>
              <p className="text-xs text-slate-300 -mt-0.5 capitalize flex items-center gap-1">
                <Sparkles
                  className="w-3.5 h-3.5 text-amber-400"
                  aria-hidden="true"
                />
                {role?.toLowerCase()}
              </p>
            </div>
          </div>
          <div
            className="hidden sm:flex items-center gap-1.5 text-amber-400"
            aria-hidden="true"
          >
            <Crown className="w-4.5 h-4.5" />
            <Star className="w-4.5 h-4.5" />
          </div>
        </div>

        {/* Menu */}
        <nav
          className="relative flex-1 px-3 pb-6 space-y-2 overflow-y-auto z-10"
          role="menubar"
          aria-label="Navigation menu"
          onKeyDown={handleKeyDown}
          tabIndex={0}
        >
          {menuItems.map((item, index) => {
            const Icon = item.icon || LayoutDashboard;
            const isNotifications = item.name === "Notifications";
            const display = unreadCount > 99 ? "99+" : unreadCount;

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={linkClasses}
                ref={(el) => (menuItemsRef.current[index] = el)}
                role="menuitem"
                tabIndex={focusedIndex === index ? 0 : -1}
                aria-current={
                  window.location.pathname === item.path ? "page" : undefined
                }
                aria-describedby={
                  isNotifications && unreadCount > 0
                    ? `notification-count-${index}`
                    : undefined
                }
              >
                <div className="flex items-center gap-3">
                  {/* Icon container with golden glow */}
                  <span
                    className="inline-flex h-9 w-9 items-center justify-center rounded-xl 
                                  bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow-md ring-1 ring-white/30
                                  group-hover:brightness-110 transition-all"
                    aria-hidden="true"
                  >
                    <Icon className="w-5 h-5 drop-shadow" />
                  </span>
                  <span className="text-sm">{item.name}</span>
                </div>

                {/* Right adornment / Notifications badge */}
                {isNotifications && unreadCount > 0 ? (
                  <span
                    className="relative inline-flex items-center justify-center rounded-full border border-amber-300/40 bg-gradient-to-br from-amber-500 to-orange-500 px-2 py-0.5 text-xs font-bold text-white shadow-[0_6px_16px_rgba(245,158,11,0.45)]"
                    id={`notification-count-${index}`}
                    aria-label={`${unreadCount} unread notifications`}
                  >
                    {display}
                    <span className="absolute -z-10 inset-0 rounded-full bg-amber-400/40 blur-md" />
                  </span>
                ) : (
                  <ChevronRight
                    className="w-4 h-4 text-amber-300 opacity-80 group-hover:opacity-100 transition"
                    aria-hidden="true"
                  />
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Mobile close button */}
        <div className="md:hidden p-4 border-t border-white/10">
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="w-full p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white focus:outline-none focus:ring-2 focus:ring-amber-400/60"
            aria-label="Close navigation menu"
          >
            Close Menu
          </button>
        </div>
      </aside>
    </>
  );
}
