// src/components/SelectMemberDropdown.jsx
import React, { useEffect, useState } from "react";
import { memberService } from "../services/memberService";

export default function SelectMemberDropdown({ value = "", onSelect }) {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const fetchMembers = async () => {
      setLoading(true);
      try {
        const data = await memberService.getAll();
        if (!cancelled) {
          // normalize to ensure we have userId and display name/email
          const normalized = (data || []).map((m) => {
            const user = m.user ?? m.member ?? {};
            const userId = user.id ?? m.userId ?? m.memberUserId ?? m.id;
            const displayName =
              user.name ??
              user.fullName ??
              m.userName ??
              m.memberName ??
              user.email ??
              "Unknown";
            const email = user.email ?? m.userEmail ?? m.memberEmail ?? "";
            return { id: userId, name: displayName, email };
          });
          setMembers(normalized);
        }
      } catch (err) {
        console.error("Error loading members", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchMembers();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <select
      value={String(value ?? "")}
      onChange={(e) => onSelect(e.target.value)}
      className="border rounded-lg p-2 w-full"
      disabled={loading}
      aria-label="Select member"
    >
      {loading ? (
        <option>Loading members...</option>
      ) : (
        <>
          <option value="">Select Member</option>
          {members.map((m) => (
            // value is the userId (string)
            <option key={m.id} value={String(m.id ?? "")}>
              {m.name} {m.email ? `(${m.email})` : ""}
            </option>
          ))}
        </>
      )}
    </select>
  );
}
