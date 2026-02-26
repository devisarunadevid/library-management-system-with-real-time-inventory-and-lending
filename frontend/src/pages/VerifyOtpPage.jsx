import { useState } from "react";
import { verifyOtp } from "../services/authService";
import { useNavigate } from "react-router-dom";
import {
  KeyRound,
  Mail,
  Crown,
  Sparkles,
  Star,
  ArrowRightCircle,
} from "lucide-react";

export default function VerifyOtpPage() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();

  const handleVerify = async () => {
    try {
      const res = await verifyOtp(email, otp);
      if (res.status === 200) {
        alert("OTP verified!");
        navigate("/reset-password", { state: { email, otp } });
      }
    } catch {
      alert("Invalid OTP!");
    }
  };

  return (
    <div
      className="min-h-screen w-screen flex items-center justify-center relative"
      style={{
        backgroundImage: `url('/libraryshelf.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[rgba(20,14,5,0.45)] backdrop-blur-[2px]" />
      <div className="relative z-10 bg-white/85 rounded-3xl shadow-2xl p-8 w-full max-w-md border border-amber-200 backdrop-blur-md ring-1 ring-white/30">
        <div className="flex justify-center mb-3">
          <div className="p-3 rounded-full bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white shadow ring-1 ring-white/40">
            <KeyRound className="w-8 h-8" />
          </div>
        </div>

        <div className="mb-2 flex items-center justify-center gap-2 text-amber-500">
          <Crown className="w-5 h-5" />
          <Star className="w-5 h-5" />
          <Sparkles className="w-5 h-5" />
        </div>

        <h2 className="text-2xl font-extrabold text-center mb-1 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
          Verify OTP
        </h2>
        <p className="text-stone-700 text-center mb-6">
          Enter the OTP sent to your registered email
        </p>

        <div className="space-y-4">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
              <Mail className="w-5 h-5" />
            </span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full pl-10 pr-4 py-2 border border-amber-200/70 rounded-lg bg-white/90 focus:ring-2 focus:ring-amber-400/60 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-600">
              <KeyRound className="w-5 h-5" />
            </span>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter OTP"
              className="w-full pl-10 pr-4 py-2 border border-amber-200/70 rounded-lg bg-white/90 focus:ring-2 focus:ring-amber-400/60 focus:outline-none placeholder:text-stone-400"
            />
          </div>

          <button
            onClick={handleVerify}
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white py-2.5 rounded-xl font-semibold shadow hover:brightness-110 transition ring-1 ring-white/30"
          >
            Verify OTP
            <ArrowRightCircle className="w-5 h-5 text-white/95" />
          </button>
        </div>

        <p className="text-center text-stone-700 text-sm mt-4">
          Wrong email?{" "}
          <span
            onClick={() => navigate("/forgot-password")}
            className="text-amber-600 font-semibold cursor-pointer hover:underline"
          >
            Go Back
          </span>
        </p>
      </div>
    </div>
  );
}
