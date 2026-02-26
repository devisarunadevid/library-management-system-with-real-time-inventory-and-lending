import { useState } from "react";
import {
  BookOpen,
  Crown,
  Sparkles,
  Star,
  Lock,
  ShieldCheck,
  ArrowRightCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import { resetPassword } from "../services/authService";

export default function ChangePassword() {
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";
  const otp = location.state?.otp || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      await resetPassword(email, otp, newPassword);
      alert("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      console.error(
        "Reset password error:",
        err?.response?.data || err?.message
      );
      alert("Failed to reset password. Try again.");
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
    >
      <div className="absolute inset-0 bg-[rgba(20,14,5,0.45)] backdrop-blur-[2px]" />
      <div className="relative z-10 bg-white/85 backdrop-blur-md p-10 rounded-3xl shadow-2xl w-full max-w-md border border-amber-200 ring-1 ring-white/30">
        <div className="mb-2 flex items-center justify-center gap-2 text-amber-500">
          <Crown className="w-5 h-5" />
          <Star className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white rounded-full shadow-md ring-1 ring-white/40">
            <BookOpen size={28} />
          </div>
          <h2 className="text-3xl font-extrabold mt-3 text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Reset Password
          </h2>
          <p className="text-stone-700 text-sm mt-1">
            Enter your new password{email ? ` for ${email}` : ""}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-stone-800 font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                <Lock className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200/70 rounded-lg bg-white/90 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400/60 outline-none transition"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-stone-800 font-medium mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
                <ShieldCheck className="w-4.5 h-4.5" />
              </span>
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-amber-200/70 rounded-lg bg-white/90 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-400/60 outline-none transition"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white py-2.5 font-semibold shadow hover:shadow-lg hover:scale-[1.02] active:scale-[0.99] transition-all ring-1 ring-white/30"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
            Reset Password
            <ArrowRightCircle className="w-5 h-5 text-white/95" />
          </button>
        </form>
      </div>
    </div>
  );
}
