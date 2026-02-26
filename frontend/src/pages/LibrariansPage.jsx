import { useEffect, useState } from "react";
import { adminService } from "../services/adminService";
import AddEditModal from "../components/AddEditModal";
import {
  UserPlus2,
  Users2,
  Mail,
  ShieldCheck,
  Edit3,
  IdCard,
} from "lucide-react";

export default function LibrariansPage() {
  const [librarians, setLibrarians] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLibrarian, setSelectedLibrarian] = useState(null);

  useEffect(() => {
    loadLibrarians();
  }, []);
  const loadLibrarians = async () => {
    try {
      const data = await adminService.getAllLibrarians();
      setLibrarians(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load librarians", err);
      setLibrarians([]);
    }
  };

  const handleSave = async (librarian) => {
    try {
      if (librarian.id)
        await adminService.updateLibrarian(librarian.id, librarian);
      else await adminService.addLibrarian(librarian);
      loadLibrarians();
      setShowModal(false);
    } catch (err) {
      console.error("Failed to save librarian", err);
      alert("Failed to save librarian");
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed bright background that stays crisp while scrolling */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: `url('/bibliolibrary.jpg')`,
          backgroundAttachment: "fixed",
        }}
      />
      {/* Golden glow + subtle veil for readability without hiding image */}
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      {/* Scrollable content */}
      <div className="relative h-screen overflow-y-auto">
        <div className="relative z-10 p-6">
          {/* Header */}
          <div className="flex items-center justify-between gap-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                <Users2 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                  Manage Librarians
                </h2>
                <p className="text-sm text-brown-800/85 -mt-0.5">
                  Add, update, and manage your librarian team.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-amber-300/50 bg-white/60 px-3 py-1.5 text-brown-900 shadow">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-semibold">
                  Total: {librarians.length}
                </span>
              </span>
              <button
                className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-4 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.35),0_10px_26px_rgba(245,158,11,0.45)] hover:brightness-105 hover:-translate-y-0.5 active:translate-y-0 transition-all"
                onClick={() => {
                  setSelectedLibrarian(null);
                  setShowModal(true);
                }}
              >
                <UserPlus2 className="w-4 h-4" />
                Add Librarian
              </button>
            </div>
          </div>

          {/* List */}
          <div className="rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-4 text-brown-900 shadow">
            {Array.isArray(librarians) && librarians.length > 0 ? (
              <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {librarians.map((lib) => (
                  <li
                    key={lib.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-white/40 bg-white/70 p-4 shadow hover:shadow-md transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-300">
                        <IdCard className="w-5 h-5" />
                      </span>
                      <div className="min-w-0">
                        <p className="font-semibold truncate">{lib.name}</p>
                        <p className="text-sm text-brown-800/80 inline-flex items-center gap-1 truncate">
                          <Mail className="w-3.5 h-3.5 text-amber-600" />
                          {lib.email}
                        </p>
                      </div>
                    </div>
                    <button
                      className="inline-flex items-center gap-1 rounded-lg border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 text-sm font-medium shadow hover:brightness-105 transition"
                      onClick={() => {
                        setSelectedLibrarian(lib);
                        setShowModal(true);
                      }}
                    >
                      <Edit3 className="w-4 h-4" />
                      Edit
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-brown-800/85">No librarians found</p>
            )}
          </div>

          {showModal && (
            <AddEditModal
              title={selectedLibrarian ? "Edit Librarian" : "Add Librarian"}
              fields={[
                { key: "name", label: "Name", required: true },
                { key: "email", label: "Email", required: true },
                {
                  key: "password",
                  label: "Password",
                  type: "password",
                  required: !selectedLibrarian,
                },
              ]}
              item={selectedLibrarian}
              onSave={handleSave}
              onClose={() => setShowModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
}
