import { useState, useEffect } from "react";
import {
  KeyRound,
  Lock,
  ShieldCheck,
  Crown,
  Sparkles,
  Star,
  ArrowRightCircle,
} from "lucide-react";
import { resetPassword } from "../services/authService";
import { useLocation, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const location = useLocation();
  const navigate = useNavigate();

  // Read email and otp from location.state
  const { email, otp: otpFromState } = location.state || {};

  // Redirect to forgot-password if email is missing
  useEffect(() => {
    if (!email) {
      navigate("/forgot-password");
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    try {
      // Use OTP from input or from previous state
      await resetPassword(email, otp || otpFromState, newPassword);
      alert("Password reset successfully!");
      navigate("/login");
    } catch (err) {
      console.error(err.response?.data || err.message);
      alert("Failed to reset password.");
    }
  };

  // If email is missing, don't render anything
  if (!email) return null;

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
        <h2 className="text-3xl font-extrabold mb-2 text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
          Reset Your Password
        </h2>
        <p className="mb-6 text-center text-stone-700 text-sm">
          A secure golden reset for{" "}
          <span className="font-semibold">{email}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center border rounded-xl px-3 py-2 bg-white/90 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/60 border-amber-200/70">
            <KeyRound className="w-5 h-5 text-amber-600 mr-2" />
            <input
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full outline-none bg-transparent placeholder:text-stone-400"
              required
            />
          </div>

          <div className="flex items-center border rounded-xl px-3 py-2 bg-white/90 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/60 border-amber-200/70">
            <Lock className="w-5 h-5 text-amber-600 mr-2" />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full outline-none bg-transparent placeholder:text-stone-400"
              required
            />
          </div>

          <div className="flex items-center border rounded-xl px-3 py-2 bg-white/90 shadow-sm focus-within:ring-2 focus-within:ring-amber-400/60 border-amber-200/70">
            <ShieldCheck className="w-5 h-5 text-amber-600 mr-2" />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full outline-none bg-transparent placeholder:text-stone-400"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white py-3 font-semibold shadow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/30"
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
