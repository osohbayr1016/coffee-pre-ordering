"use client";

export type OnboardFormState = {
  name: string;
  address: string;
  lat: number | null;
  lng: number | null;
  owner_email: string;
  owner_password: string;
  owner_display_name: string;
  menu_manager_email: string;
  menu_manager_password: string;
  menu_manager_display_name: string;
  orders_manager_email: string;
  orders_manager_password: string;
  orders_manager_display_name: string;
};

export default function AdminOnboardStaffSections({
  form,
  setForm,
}: {
  form: OnboardFormState;
  setForm: React.Dispatch<React.SetStateAction<OnboardFormState>>;
}) {
  return (
    <>
      <div className="border-t border-white/10 pt-5 space-y-3">
        <p className="text-sm font-bold text-amber-500/90">Shop owner</p>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            required
            type="email"
            placeholder="Owner email"
            value={form.owner_email}
            onChange={(e) => setForm({ ...form, owner_email: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            required
            type="password"
            placeholder="Password"
            value={form.owner_password}
            onChange={(e) => setForm({ ...form, owner_password: e.target.value })}
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            required
            placeholder="Display name"
            value={form.owner_display_name}
            onChange={(e) =>
              setForm({ ...form, owner_display_name: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 space-y-3">
        <p className="text-sm font-bold text-zinc-400">Menu manager (optional)</p>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Email"
            value={form.menu_manager_email}
            onChange={(e) =>
              setForm({ ...form, menu_manager_email: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.menu_manager_password}
            onChange={(e) =>
              setForm({ ...form, menu_manager_password: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            placeholder="Display name"
            value={form.menu_manager_display_name}
            onChange={(e) =>
              setForm({ ...form, menu_manager_display_name: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
        </div>
      </div>

      <div className="border-t border-white/10 pt-5 space-y-3">
        <p className="text-sm font-bold text-zinc-400">Orders manager (optional)</p>
        <div className="grid md:grid-cols-3 gap-3">
          <input
            type="email"
            placeholder="Email"
            value={form.orders_manager_email}
            onChange={(e) =>
              setForm({ ...form, orders_manager_email: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            type="password"
            placeholder="Password"
            value={form.orders_manager_password}
            onChange={(e) =>
              setForm({ ...form, orders_manager_password: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
          <input
            placeholder="Display name"
            value={form.orders_manager_display_name}
            onChange={(e) =>
              setForm({ ...form, orders_manager_display_name: e.target.value })
            }
            className="bg-black/50 border border-white/10 rounded-xl p-3 text-white text-sm"
          />
        </div>
      </div>
    </>
  );
}
