import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  BookOpen,
  Crown,
  Sparkles,
  Star,
  Mail,
  Lock,
  ArrowRightCircle,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from "lucide-react";
import api from "../services/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();
  const emailRef = useRef(null);
  const passwordRef = useRef(null);
  const submitRef = useRef(null);

  // Focus management for accessibility
  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  // Form validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (value && !validateEmail(value)) {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
    setError("");
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setPassword(value);
    if (value && !validatePassword(value)) {
      setPasswordError("Password must be at least 6 characters");
    } else {
      setPasswordError("");
    }
    setError("");
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Client-side validation
    if (!email || !password) {
      setError("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      setEmailError("Please enter a valid email address");
      setIsLoading(false);
      return;
    }

    if (!validatePassword(password)) {
      setPasswordError("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await api.post("auth/login", { email, password });
      const { sessionId, role, user } = response.data;

      sessionStorage.setItem("sessionId", sessionId);
      localStorage.setItem("role", role.toUpperCase());
      localStorage.setItem("userId", user.id);
      localStorage.setItem("userEmail", user.email);
      localStorage.setItem("user", JSON.stringify(user));

      switch (role.toUpperCase()) {
        case "ADMIN":
          navigate("/admin");
          break;
        case "LIBRARIAN":
          navigate("/librarian");
          break;
        case "MEMBER":
          navigate("/member");
          break;
        default:
          setError("Unknown role! Please contact administrator.");
      }
    } catch (err) {
      console.error("Login error:", err?.response?.data || err?.message);
      const errorMessage =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Invalid credentials, please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && e.target === emailRef.current) {
      e.preventDefault();
      passwordRef.current?.focus();
    } else if (e.key === "Enter" && e.target === passwordRef.current) {
      e.preventDefault();
      submitRef.current?.click();
    }
  };

  return (
    <div
      className="flex h-screen w-screen items-center justify-center relative"
      style={{
        backgroundImage: `url('/libraryshelf.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
      role="main"
      aria-label="Library Management System Login"
    >
      <div className="absolute inset-0 bg-[rgba(20,14,5,0.45)] backdrop-blur-[2px]" />
      <div className="relative z-10 bg-white/85 backdrop-blur-md p-6 sm:p-8 rounded-3xl shadow-2xl w-full max-w-md mx-4 hover:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition border border-amber-200 ring-1 ring-white/30">
        <div className="flex flex-col items-center mb-6">
          <div
            className="p-3 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white mb-3 shadow ring-1 ring-white/40"
            role="img"
            aria-label="Library Management System Logo"
          >
            <BookOpen size={28} aria-hidden="true" />
          </div>
          <div
            className="mb-2 flex items-center justify-center gap-2 text-amber-500"
            aria-hidden="true"
          >
            <Crown className="w-5 h-5" />
            <Star className="w-5 h-5" />
            <Sparkles className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Welcome Back
          </h1>
          <p className="text-stone-700 text-sm mt-1">
            Login to Library Management System
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center gap-2"
            role="alert"
            aria-live="polite"
          >
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4" noValidate>
          <div className="space-y-1">
            <label htmlFor="email" className="sr-only">
              Email Address
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600"
                aria-hidden="true"
              >
                <Mail className="w-5 h-5" />
              </span>
              <input
                ref={emailRef}
                id="email"
                type="email"
                placeholder="Email Address"
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-400/60 outline-none bg-white/90 placeholder:text-stone-400 transition-colors ${
                  emailError
                    ? "border-red-300 focus:ring-red-400/60"
                    : "border-amber-200/70 focus:border-amber-400"
                }`}
                value={email}
                onChange={handleEmailChange}
                onKeyDown={handleKeyDown}
                required
                aria-describedby={emailError ? "email-error" : undefined}
                aria-invalid={!!emailError}
                autoComplete="email"
              />
            </div>
            {emailError && (
              <p
                id="email-error"
                className="text-red-600 text-xs mt-1 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-3 h-3" />
                {emailError}
              </p>
            )}
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="sr-only">
              Password
            </label>
            <div className="relative">
              <span
                className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600"
                aria-hidden="true"
              >
                <Lock className="w-5 h-5" />
              </span>
              <input
                ref={passwordRef}
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className={`w-full pl-10 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-amber-400/60 outline-none bg-white/90 placeholder:text-stone-400 transition-colors ${
                  passwordError
                    ? "border-red-300 focus:ring-red-400/60"
                    : "border-amber-200/70 focus:border-amber-400"
                }`}
                value={password}
                onChange={handlePasswordChange}
                onKeyDown={handleKeyDown}
                required
                aria-describedby={passwordError ? "password-error" : undefined}
                aria-invalid={!!passwordError}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-amber-600 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-400/60 rounded p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
                tabIndex={0}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {passwordError && (
              <p
                id="password-error"
                className="text-red-600 text-xs mt-1 flex items-center gap-1"
                role="alert"
              >
                <AlertCircle className="w-3 h-3" />
                {passwordError}
              </p>
            )}
          </div>

          <button
            ref={submitRef}
            type="submit"
            disabled={isLoading || !!emailError || !!passwordError}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-110 transform hover:scale-[1.02] transition ring-1 ring-white/30 shadow disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:brightness-100 focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2"
            aria-describedby="login-button-description"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing In...
              </>
            ) : (
              <>
                Login
                <ArrowRightCircle className="w-5 h-5 text-white/95" />
              </>
            )}
          </button>
          <p id="login-button-description" className="sr-only">
            Click to sign in to your account
          </p>
        </form>

        <div className="mt-6 text-sm text-center text-stone-700 space-y-3">
          <p>
            <Link
              to="/forgot-password"
              className="text-amber-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 rounded"
              aria-label="Forgot your password? Click to reset it"
            >
              Forgot Password?
            </Link>
          </p>
          <p>
            Don't have an account?{" "}
            <Link
              to="/register"
              className="text-amber-600 font-semibold hover:underline focus:outline-none focus:ring-2 focus:ring-amber-400/60 focus:ring-offset-2 rounded"
              aria-label="Don't have an account? Click to register"
            >
              Register here
            </Link>
          </p>
        </div>

        {/* Skip to main content for screen readers */}
        <div className="sr-only">
          <a
            href="#main-content"
            className="focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-2 rounded border"
          >
            Skip to main content
          </a>
        </div>
      </div>
    </div>
  );
}
