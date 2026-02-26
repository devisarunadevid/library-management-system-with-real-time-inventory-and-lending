import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import PageTransition from "./components/PageTransition";
import {
  performanceMonitor,
  preloadCriticalResources,
  addResourceHints,
} from "./utils/performance";
import { ariaUtils, focusManagement } from "./utils/accessibility";

// Layouts
import AdminLayout from "./layouts/AdminLayout";

// (you can also create MemberLayout, LibrarianLayout later if you want similar sidebars)

// Lazy load pages for better performance
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));
const ChangePassword = lazy(() => import("./pages/ChangePassword"));
const VerifyOtpPage = lazy(() => import("./pages/VerifyOtpPage"));
const BooksPage = lazy(() => import("./pages/BooksPage"));
const MembershipPlansPage = lazy(() => import("./pages/MembershipPlansPage"));
const LibrariansPage = lazy(() => import("./pages/LibrariansPage"));
const MemberBooksPage = lazy(() => import("./pages/MemberBooksPage"));
const TransactionsPage = lazy(() => import("./pages/TransactionsPage"));
const MemberTransactions = lazy(() => import("./pages/MemberTransactions"));
const ReservationsPage = lazy(() => import("./pages/ReservationsPage"));
const AdminFineConfig = lazy(() => import("./pages/AdminFineConfig"));
const BorrowedBooks = lazy(() => import("./pages/BorrowedBooks"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Reservation = lazy(() => import("./pages/Reservation"));
const AdminAlerts = lazy(() => import("./pages/AdminAlerts"));
const AdminBorrowRequests = lazy(() => import("./pages/AdminBorrowRequests"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const MemberMembershipPlans = lazy(() =>
  import("./pages/MemberMembershipPlans")
);
const MemberRequestsPage = lazy(() => import("./pages/MemberRequestsPage"));
const AdminMembershipRequests = lazy(() =>
  import("./pages/AdminMembershipRequests")
);
const OverdueBooksPage = lazy(() => import("./pages/OverdueBooksPage"));
const BorrowRecords = lazy(() => import("./pages/BorrowRecords"));
const AdminNotifications = lazy(() => import("./pages/AdminNotifications"));
const LibrarianPage = lazy(() => import("./pages/LibrarianPage"));
const OfflinePaymentForm = lazy(() => import("./pages/OfflinePaymentForm"));

// Dashboards (optional landing pages)
const AdminPage = lazy(() => import("./pages/AdminPage"));
const MemberPage = lazy(() => import("./pages/MemberPage"));

// Components
import ProtectedRoute from "./components/ProtectedRoute";
import PaymentPage from "./components/PaymentPage";

// Loading component for Suspense
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-amber-50 to-orange-100">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto mb-4"></div>
      <p className="text-amber-700 font-medium">Loading...</p>
    </div>
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const [showTransition, setShowTransition] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    performanceMonitor.start("page-transition");
    setShowTransition(true);
    setIsLoading(true);

    const timer = setTimeout(() => {
      setShowTransition(false);
      setIsLoading(false);
      performanceMonitor.end("page-transition");
    }, 1200);

    return () => clearTimeout(timer);
  }, [location.pathname]);

  // Announce page changes to screen readers
  useEffect(() => {
    const pageTitle = document.title;
    ariaUtils.announce(`Navigated to ${pageTitle}`, "polite");
  }, [location.pathname]);

  return (
    <>
      {showTransition && <PageTransition />}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
            <span className="text-gray-700">Loading page...</span>
          </div>
        </div>
      )}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* --- Public Routes --- */}
          <Route
            path="/login"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <LoginPage />
              </Suspense>
            }
          />
          <Route
            path="/register"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <RegisterPage />
              </Suspense>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ForgotPassword />
              </Suspense>
            }
          />
          <Route
            path="/verify-otp"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <VerifyOtpPage />
              </Suspense>
            }
          />
          <Route
            path="/reset-password"
            element={
              <Suspense fallback={<LoadingSpinner />}>
                <ResetPassword />
              </Suspense>
            }
          />

          {/* --- Admin Protected Routes with Sidebar Layout --- */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute role="ADMIN">
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminPage />} />
            <Route path="books" element={<BooksPage />} />
            <Route path="membership-plans" element={<MembershipPlansPage />} />
            <Route path="add-librarian" element={<LibrariansPage />} />{" "}
            <Route path="borrow-requests" element={<AdminBorrowRequests />} />
            <Route path="admin-alerts" element={<AdminAlerts />} />
            <Route
              path="membership-requests"
              element={<AdminMembershipRequests />}
            />
            <Route path="overdue-books" element={<OverdueBooksPage />} />
            {/* ✅ here */}
          </Route>

          {/* --- Member Protected Routes --- */}
          <Route
            path="/member"
            element={
              <ProtectedRoute role="MEMBER">
                <MemberPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<div />} />
            <Route path="books" element={<MemberBooksPage />} />
            <Route path="borrowed-books" element={<BorrowedBooks />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route
              path="payment"
              element={<PaymentPage userId={1} requestId={101} amount={499} />}
            />
            <Route
              path="/member/renew-membership"
              element={<MemberMembershipPlans />}
            />
            <Route path="requests" element={<MemberRequestsPage />} />

            {/* ✅ */}
          </Route>

          {/* --- Librarian Protected Routes --- */}
          <Route
            path="/librarian"
            element={
              <ProtectedRoute role="LIBRARIAN">
                <LibrarianPage />
              </ProtectedRoute>
            }
          >
            <Route path="books" element={<BooksPage />} />
            <Route path="notifications" element={<NotificationsPage />} />
            <Route path="offline-payment" element={<OfflinePaymentForm />} />
            <Route path="overdue-books" element={<OverdueBooksPage />} />
            <Route path="borrow-records" element={<BorrowRecords />} />
          </Route>

          {/* --- Common Protected Routes --- */}
          <Route
            path="/change-password"
            element={
              <ProtectedRoute role={["ADMIN", "LIBRARIAN", "MEMBER"]}>
                <ChangePassword />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute role={["ADMIN", "LIBRARIAN", "MEMBER"]}>
                <BooksPage />
              </ProtectedRoute>
            }
          />

          {/* --- Default Fallback --- */}
          <Route path="*" element={<LoginPage />} />
        </Routes>
      </AnimatePresence>
    </>
  );
}

export default function App() {
  // Performance optimizations
  useEffect(() => {
    // Preload critical resources
    preloadCriticalResources();

    // Add resource hints
    addResourceHints();

    // Initialize performance monitoring
    performanceMonitor.start("app-initialization");

    // Set up accessibility features
    document.documentElement.setAttribute("lang", "en");
    document.documentElement.setAttribute("dir", "ltr");

    // Announce app loading to screen readers
    ariaUtils.announce("Library Management System loaded", "polite");

    performanceMonitor.end("app-initialization");
  }, []);

  // Focus management for the entire app
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Skip to main content with Alt + M
      if (e.altKey && e.key === "m") {
        e.preventDefault();
        const main = document.querySelector("main");
        if (main) {
          main.focus();
          main.scrollIntoView({ behavior: "smooth" });
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div
      className="App"
      role="application"
      aria-label="Library Management System"
    >
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="skip-link focus:not-sr-only"
        onFocus={(e) => {
          e.target.style.position = "static";
          e.target.style.width = "auto";
          e.target.style.height = "auto";
        }}
        onBlur={(e) => {
          e.target.style.position = "absolute";
          e.target.style.width = "1px";
          e.target.style.height = "1px";
        }}
      >
        Skip to main content
      </a>

      <AnimatedRoutes />
    </div>
  );
}
