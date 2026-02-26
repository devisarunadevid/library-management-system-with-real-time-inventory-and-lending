import { useState, useEffect } from "react";
import axios from "axios";
import { Settings2, IndianRupee } from "lucide-react";

export default function AdminFineConfig() {
  const [fine, setFine] = useState(10);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/config/fine")
      .then((res) => setFine(res.data))
      .catch((err) => console.error("Error fetching fine", err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    try {
      await axios.post("http://localhost:8080/api/config/fine", null, {
        params: { fine },
      });
      alert("Fine updated successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to update fine ❌");
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen w-full relative"
        style={{
          backgroundImage: `url('/libraryimg.jpeg')`, // place image inside public/
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-[rgba(20,14,5,0.55)] backdrop-blur-[2px]" />

        <div className="relative z-10 p-4 sm:p-6 lg:p-8">
          <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow mb-6">
            <Settings2 className="h-5 w-5 text-amber-300" />
            <h1 className="text-xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
              Fine Configuration
            </h1>
          </div>
          <div className="h-32 rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full relative"
      style={{
        backgroundImage: `url('/libraryimg.jpeg')`, // place image inside public/
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-[rgba(20,14,5,0.55)] backdrop-blur-[2px]" />

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 text-cream-50">
        <div className="mb-6 inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow">
          <Settings2 className="h-5 w-5 text-amber-300" />
          <h1 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Fine Configuration
          </h1>
        </div>

        <div className="max-w-md rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.14)_0%,rgba(255,255,255,0.06)_100%)] backdrop-blur-xl p-5 shadow-[0_10px_40px_rgba(0,0,0,0.18)]">
          <label className="block mb-2 text-cream-50/90 font-medium">
            Fine per day (₹)
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-cream-50/70">
              <IndianRupee className="h-4 w-4" />
            </span>
            <input
              type="number"
              value={fine}
              onChange={(e) => setFine(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/15 border border-white/15 text-cream-50 placeholder:text-cream-50/60 outline-none backdrop-blur-md focus:ring-2 focus:ring-amber-300/40 transition"
              placeholder="Enter fine amount"
            />
          </div>

          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] transition-all hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)]"
            >
              Save Fine
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
