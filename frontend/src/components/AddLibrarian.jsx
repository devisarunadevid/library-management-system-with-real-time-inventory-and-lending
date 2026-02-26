import React, { useState } from "react";
import api from "../services/api";
import {
  Library,
  UserPlus,
  Crown,
  Sparkles,
  Star,
  User,
  Mail,
  Lock,
  ArrowRightCircle,
} from "lucide-react";

export default function AddLibrarian() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/admin/add-librarian", { name, email, password });
      alert("Librarian added successfully!");
      setName("");
      setEmail("");
      setPassword("");
    } catch (err) {
      console.error(
        "Error adding librarian:",
        err.response?.data || err.message
      );
      alert("Failed to add librarian");
    }
  };

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url('/libraryimg.jpeg')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="absolute inset-0 bg-[rgba(15,10,3,0.35)] backdrop-blur-[1.5px]" />
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-amber-200/40 bg-white/85 text-stone-900 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.35)] backdrop-blur-xl">
          <div className="p-6 border-b border-amber-200/40 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 text-white shadow ring-1 ring-white/30">
                <Library className="w-6 h-6 drop-shadow" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold leading-none bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_1px_rgba(0,0,0,0.2)]">
                  Add Librarian
                </h2>
                <p className="text-xs text-stone-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Create a new librarian account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-amber-500">
              <Crown className="w-5 h-5" />
              <Star className="w-5 h-5" />
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                <span className="inline-flex items-center gap-2">
                  <User className="w-4.5 h-4.5 text-amber-600" />
                  Name
                </span>
              </label>
              <input
                type="text"
                className="w-full p-3 rounded-xl bg-white/70 border border-amber-200/60 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Enter full name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                <span className="inline-flex items-center gap-2">
                  <Mail className="w-4.5 h-4.5 text-amber-600" />
                  Email
                </span>
              </label>
              <input
                type="email"
                className="w-full p-3 rounded-xl bg-white/70 border border-amber-200/60 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@library.org"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-stone-800 mb-1">
                <span className="inline-flex items-center gap-2">
                  <Lock className="w-4.5 h-4.5 text-amber-600" />
                  Password
                </span>
              </label>
              <input
                type="password"
                className="w-full p-3 rounded-xl bg-white/70 border border-amber-200/60 outline-none focus:ring-2 focus:ring-amber-400/50 focus:border-amber-400/60 placeholder:text-stone-500"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white px-5 py-2.5 shadow hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] transition-all ring-1 ring-white/30"
              >
                <UserPlus className="w-4.5 h-4.5 text-white drop-shadow" />
                Add Librarian
                <ArrowRightCircle className="w-5 h-5 text-white/95 drop-shadow" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
