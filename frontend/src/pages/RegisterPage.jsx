import { useState } from "react";
import api from "../services/api";
import {
  BookOpen,
  Crown,
  Sparkles,
  User as UserIcon,
  Mail,
  Lock,
  ArrowRightCircle,
  ShieldCheck,
} from "lucide-react";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post("/auth/register", { name, email, password });
      setMessage(res.data.message || "Registered successfully!");
    } catch (err) {
      setMessage(err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/libraryshelf.jpeg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />
      <div className="absolute inset-0 bg-[rgba(20,14,5,0.45)] backdrop-blur-[2px]" />

      <div className="relative z-10 bg-white/85 backdrop-blur-md p-8 rounded-3xl shadow-2xl w-full max-w-md hover:shadow-[0_20px_70px_rgba(0,0,0,0.35)] transition border border-amber-200 ring-1 ring-white/30">
        <div className="flex flex-col items-center mb-6">
          <div className="relative">
            <span className="absolute -top-2 -left-2 text-amber-400/90 drop-shadow">
              <Crown className="w-4 h-4" />
            </span>
            <div className="p-3 rounded-2xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white mb-3 shadow-md ring-1 ring-white/40">
              <BookOpen size={28} className="drop-shadow" />
            </div>
          </div>
          <h2 className="text-2xl font-extrabold text-center bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
            Register New Member
          </h2>
          <p className="text-amber-800/90 text-sm mt-1 inline-flex items-center gap-1">
            Library Management System{" "}
            <Sparkles className="w-4 h-4 text-amber-500" />
          </p>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <UserIcon className="w-4.5 h-4.5 text-amber-600" />
              Full Name
            </label>
            <input
              className="w-full px-4 py-2.5 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 outline-none bg-white/90 shadow-sm"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <Mail className="w-4.5 h-4.5 text-amber-600" />
              Email Address
            </label>
            <input
              className="w-full px-4 py-2.5 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 outline-none bg-white/90 shadow-sm"
              type="email"
              placeholder="Email Address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-amber-800 font-semibold mb-1">
              <Lock className="w-4.5 h-4.5 text-amber-600" />
              Create Password
            </label>
            <input
              className="w-full px-4 py-2.5 border border-amber-300/60 rounded-xl focus:ring-2 focus:ring-amber-400/60 outline-none bg-white/90 shadow-sm"
              type="password"
              placeholder="Create Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 hover:brightness-105 transform hover:scale-[1.01] active:scale-[0.99] transition-all shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_10px_26px_rgba(245,158,11,0.45)] ring-1 ring-white/40 inline-flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-5 h-5 text-white/95 drop-shadow" />
            Register
            <ArrowRightCircle className="w-5 h-5 text-white/95 drop-shadow" />
          </button>
        </form>

        {message && (
          <p
            className={`mt-4 text-center font-semibold ${
              message.toLowerCase().includes("success")
                ? "text-emerald-600"
                : "text-rose-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
}
