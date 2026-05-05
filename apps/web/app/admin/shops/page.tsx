"use client";

import { useState, useEffect } from "react";
import Dialog from "@/components/ui/Dialog";
import { api } from "@/lib/api";
import AdminOnboardModal from "./AdminOnboardModal";
import ShopTeamManageModal from "./ShopTeamManageModal";

type Shop = {
  id: string;
  name: string;
  slug: string;
  address: string;
  is_open: boolean;
  subscription_status: string;
};

function normalizeShop(raw: Record<string, unknown>): Shop {
  return {
    id: String(raw.id ?? ""),
    name: String(raw.name ?? ""),
    slug: String(raw.slug ?? ""),
    address: String(raw.address ?? ""),
    is_open: Boolean(raw.is_open),
    subscription_status: String(raw.subscription_status ?? "trial"),
  };
}

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [onboardOpen, setOnboardOpen] = useState(false);
  const [manageId, setManageId] = useState<string | null>(null);
  const [manageName, setManageName] = useState("");

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    title: string;
    desc: string;
    variant: "default" | "danger" | "success" | "warning";
  }>({ isOpen: false, title: "", desc: "", variant: "default" });

  const loadShops = () => {
    setFetchError(null);
    api
      .getShops()
      .then((data: unknown) => {
        const rows = Array.isArray(data) ? data : [];
        setShops(rows.map((r) => normalizeShop(r as Record<string, unknown>)));
      })
      .catch(() =>
        setFetchError(
          "Could not load shops. Check NEXT_PUBLIC_API_URL and CORS on your Worker."
        )
      );
  };

  useEffect(() => {
    loadShops();
  }, []);

  const openManage = (shop: Shop) => {
    setManageId(shop.id);
    setManageName(shop.name);
  };

  return (
    <div>
      <Dialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState({ ...dialogState, isOpen: false })}
        title={dialogState.title}
        description={dialogState.desc}
        variant={dialogState.variant}
      />

      <AdminOnboardModal
        open={onboardOpen}
        onClose={() => setOnboardOpen(false)}
        onCreated={() => {
          loadShops();
          setDialogState({
            isOpen: true,
            title: "Shop created",
            desc: "Shop and logins are ready. Managers can sign in at /login.",
            variant: "success",
          });
        }}
        onError={(msg) =>
          setDialogState({
            isOpen: true,
            title: "Something went wrong",
            desc: msg,
            variant: "danger",
          })
        }
      />

      <ShopTeamManageModal
        open={manageId !== null}
        shopId={manageId}
        shopName={manageName}
        onClose={() => setManageId(null)}
        onError={(msg) =>
          setDialogState({
            isOpen: true,
            title: "Error",
            desc: msg,
            variant: "danger",
          })
        }
        onUpdated={() => loadShops()}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">
            Shop Directory
          </h1>
          <p className="text-zinc-400">Manage and onboard coffee shops</p>
        </div>
        <button
          type="button"
          onClick={() => setOnboardOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105 active:scale-95"
        >
          + Onboard Shop
        </button>
      </div>

      {fetchError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-sm flex justify-between gap-4 flex-wrap items-center">
          <span>{fetchError}</span>
          <button
            type="button"
            onClick={loadShops}
            className="text-amber-400 font-bold underline"
          >
            Retry
          </button>
        </div>
      )}

      <div className="glass-panel overflow-hidden bg-zinc-900/40 border border-white/5 shadow-2xl rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-sm text-zinc-400">
              <th className="p-5 font-medium">Shop Details</th>
              <th className="p-5 font-medium">Location</th>
              <th className="p-5 font-medium">Status</th>
              <th className="p-5 font-medium">Subscription</th>
              <th className="p-5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {shops.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-12 text-center text-zinc-500 italic">
                  No shops found. Onboard one or verify your API/database.
                </td>
              </tr>
            ) : (
              shops.map((shop) => (
                <tr
                  key={shop.id}
                  className="hover:bg-white/5 transition-colors group"
                >
                  <td className="p-5 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-zinc-800 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl uppercase shadow-inner">
                      {shop.name.charAt(0)}
                    </div>
                    <div>
                      <span className="font-bold text-white group-hover:text-amber-400 transition-colors block">
                        {shop.name}
                      </span>
                      <span className="text-xs text-zinc-500 font-mono block">
                        /{shop.slug}
                      </span>
                    </div>
                  </td>
                  <td className="p-5 text-zinc-400 text-sm">{shop.address}</td>
                  <td className="p-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${
                        shop.is_open
                          ? "bg-green-500/10 text-green-400 border border-green-500/20"
                          : "bg-red-500/10 text-red-400 border border-red-500/20"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          shop.is_open ? "bg-green-500 animate-pulse" : "bg-red-500"
                        }`}
                      />
                      {shop.is_open ? "OPERATING" : "CLOSED"}
                    </span>
                  </td>
                  <td className="p-5">
                    <span className="text-xs text-amber-400 font-bold px-2.5 py-1 bg-amber-500/10 rounded-md border border-amber-500/20 capitalize tracking-wide">
                      {shop.subscription_status}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button
                      type="button"
                      onClick={() => openManage(shop)}
                      className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-white/5"
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
