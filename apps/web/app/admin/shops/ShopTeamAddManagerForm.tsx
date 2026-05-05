"use client";

import { useState } from "react";
import { api } from "@/lib/api";

export default function ShopTeamAddManagerForm({
  shopId,
  onSuccess,
  onError,
}: {
  shopId: string;
  onSuccess: () => void;
  onError: (msg: string) => void;
}) {
  const [adding, setAdding] = useState(false);
  const [newMgr, setNewMgr] = useState({
    email: "",
    password: "",
    display_name: "",
    staff_role: "menu_manager" as "menu_manager" | "orders_manager",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMgr.email || !newMgr.password || !newMgr.display_name) {
      onError("Fill email, password, and display name.");
      return;
    }
    setAdding(true);
    try {
      await api.adminAddShopManager(shopId, newMgr);
      setNewMgr({
        email: "",
        password: "",
        display_name: "",
        staff_role: newMgr.staff_role,
      });
      onSuccess();
    } catch {
      onError("Could not add manager (email may already exist).");
    } finally {
      setAdding(false);
    }
  };

  return (
    <form onSubmit={submit} className="border-t border-white/10 pt-6 space-y-3">
      <p className="text-sm font-bold text-amber-500/90">Add manager</p>
      <select
        value={newMgr.staff_role}
        onChange={(e) =>
          setNewMgr({
            ...newMgr,
            staff_role: e.target.value as "menu_manager" | "orders_manager",
          })
        }
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
      >
        <option value="menu_manager">Menu manager</option>
        <option value="orders_manager">Orders manager</option>
      </select>
      <input
        type="email"
        required
        placeholder="Email"
        value={newMgr.email}
        onChange={(e) => setNewMgr({ ...newMgr, email: e.target.value })}
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
      />
      <input
        type="password"
        required
        placeholder="Password"
        value={newMgr.password}
        onChange={(e) => setNewMgr({ ...newMgr, password: e.target.value })}
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
      />
      <input
        required
        placeholder="Display name"
        value={newMgr.display_name}
        onChange={(e) => setNewMgr({ ...newMgr, display_name: e.target.value })}
        className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
      />
      <button
        type="submit"
        disabled={adding}
        className="w-full bg-white/10 hover:bg-white/15 py-3 rounded-xl font-bold text-sm disabled:opacity-50"
      >
        {adding ? "Adding…" : "Create manager login"}
      </button>
    </form>
  );
}
