"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import AdminOnboardMapSection from "./AdminOnboardMapSection";
import AdminOnboardStaffSections, {
  type OnboardFormState,
} from "./AdminOnboardStaffSections";

const EMPTY_FORM: OnboardFormState = {
  name: "",
  address: "",
  lat: null,
  lng: null,
  owner_email: "",
  owner_password: "",
  owner_display_name: "",
  menu_manager_email: "",
  menu_manager_password: "",
  menu_manager_display_name: "",
  orders_manager_email: "",
  orders_manager_password: "",
  orders_manager_display_name: "",
};

export default function AdminOnboardModal({
  open,
  onClose,
  onCreated,
  onError,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
  onError: (msg: string) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState<OnboardFormState>(EMPTY_FORM);

  if (!open) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.lat === null || form.lng === null) {
      onError("Pick the shop location on the map.");
      return;
    }
    setLoading(true);
    try {
      await api.adminCreateShop({
        name: form.name,
        address: form.address,
        lat: form.lat,
        lng: form.lng,
        owner_email: form.owner_email,
        owner_password: form.owner_password,
        owner_display_name: form.owner_display_name,
        menu_manager_email: form.menu_manager_email || undefined,
        menu_manager_password: form.menu_manager_password || undefined,
        menu_manager_display_name: form.menu_manager_display_name || undefined,
        orders_manager_email: form.orders_manager_email || undefined,
        orders_manager_password: form.orders_manager_password || undefined,
        orders_manager_display_name: form.orders_manager_display_name || undefined,
      });
      setForm(EMPTY_FORM);
      onCreated();
      onClose();
    } catch {
      onError("Could not create shop. Check emails are unique and API is deployed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-2xl p-8 rounded-2xl border border-white/10 my-auto shadow-2xl">
        <h2 className="text-2xl font-black mb-2">Onboard coffee shop</h2>
        <p className="text-sm text-zinc-400 mb-6">
          Creates the shop, owner login, and optional menu / orders managers.
        </p>

        <form onSubmit={submit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                Shop name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
                Address
              </label>
              <input
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 outline-none"
              />
            </div>
          </div>

          <AdminOnboardMapSection
            lat={form.lat}
            lng={form.lng}
            onChange={(lat, lng) => setForm({ ...form, lat, lng })}
          />

          <AdminOnboardStaffSections form={form} setForm={setForm} />

          <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-zinc-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-2.5 rounded-xl font-bold disabled:opacity-50"
            >
              {loading ? "Saving…" : "Create shop"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
