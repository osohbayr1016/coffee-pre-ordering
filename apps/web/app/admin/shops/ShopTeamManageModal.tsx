"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import ShopTeamAddManagerForm from "./ShopTeamAddManagerForm";

type ManagerRow = {
  id: string;
  email: string;
  display_name: string;
  staff_role: string;
};

export default function ShopTeamManageModal({
  open,
  shopId,
  shopName,
  onClose,
  onError,
  onUpdated,
}: {
  open: boolean;
  shopId: string | null;
  shopName: string;
  onClose: () => void;
  onError: (msg: string) => void;
  onUpdated: () => void;
}) {
  const [owner, setOwner] = useState<{
    email: string;
    display_name: string;
  } | null>(null);
  const [managers, setManagers] = useState<ManagerRow[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTeam = () => {
    if (!shopId) return;
    setLoading(true);
    api
      .adminGetShopTeam(shopId)
      .then((data: {
        owner?: { email?: string; display_name?: string };
        managers?: ManagerRow[];
      }) => {
        setOwner(
          data.owner
            ? {
                email: data.owner.email ?? "",
                display_name: data.owner.display_name ?? "",
              }
            : null
        );
        setManagers(Array.isArray(data.managers) ? data.managers : []);
      })
      .catch(() => onError("Could not load team."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!open || !shopId) return;
    loadTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reload only when modal opens for this shop
  }, [open, shopId]);

  if (!open || !shopId) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
      <div className="glass-panel w-full max-w-lg p-8 rounded-2xl border border-white/10 my-auto max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-black mb-1">Manage shop</h2>
        <p className="text-sm text-zinc-400 mb-6">{shopName}</p>

        {loading ? (
          <p className="text-zinc-500 text-sm">Loading…</p>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                Owner
              </p>
              {owner ? (
                <div className="bg-black/40 rounded-xl p-4 border border-white/10 text-sm">
                  <p className="font-semibold text-white">{owner.display_name}</p>
                  <p className="text-zinc-400 font-mono text-xs mt-1">{owner.email}</p>
                  <p className="text-zinc-500 text-xs mt-2">Role: shop_owner</p>
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No owner loaded.</p>
              )}
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-zinc-500 uppercase mb-2">
                Managers
              </p>
              <ul className="space-y-2">
                {managers.length === 0 ? (
                  <li className="text-zinc-500 text-sm">No managers yet.</li>
                ) : (
                  managers.map((m) => (
                    <li
                      key={m.id}
                      className="flex justify-between items-center bg-black/40 rounded-lg px-4 py-2 border border-white/10 text-sm"
                    >
                      <span className="text-white">{m.display_name}</span>
                      <span className="text-amber-500/90 text-xs font-bold capitalize">
                        {m.staff_role.replace("_", " ")}
                      </span>
                    </li>
                  ))
                )}
              </ul>
            </div>

            <ShopTeamAddManagerForm
              shopId={shopId}
              onSuccess={() => {
                loadTeam();
                onUpdated();
              }}
              onError={onError}
            />
          </>
        )}

        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full py-2 text-zinc-500 hover:text-white text-sm"
        >
          Close
        </button>
      </div>
    </div>
  );
}
