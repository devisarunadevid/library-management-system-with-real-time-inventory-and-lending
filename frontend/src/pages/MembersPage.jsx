import { useEffect, useState } from "react";
import { memberService } from "../services/memberService";
import { Users } from "lucide-react";

export default function MembersPage() {
  const [members, setMembers] = useState([]);

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    const data = await memberService.getAll();
    setMembers(data || []);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-cream-50">
          <Users className="w-5 h-5 text-amber-300" />
          <h2 className="text-xl sm:text-2xl font-semibold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
            Manage Members
          </h2>
        </div>

        <button className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all">
          ➕ Add Member
        </button>
      </div>

      <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-xl p-4">
        {members.length > 0 ? (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((m) => (
              <li
                key={m.id}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.05)_100%)] p-4 text-cream-50 shadow-[0_8px_30px_rgba(0,0,0,0.16)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_50px_rgba(0,0,0,0.28)]"
              >
                <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-gradient-to-br from-amber-300/35 to-orange-400/35 blur-2xl group-hover:scale-110 transition-transform" />
                <p className="font-semibold text-cream-50/95">{m.name}</p>
                <p className="text-cream-50/75 text-sm break-all">{m.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-cream-50/90">No members yet.</div>
        )}
      </div>
    </div>
  );
}
