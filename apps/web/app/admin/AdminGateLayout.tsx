"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import AdminSidebarNav from "./AdminSidebarNav";

export default function AdminGateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [ready, setReady] = useState(false);

  const isLogin =
    pathname.includes("/admin/login");

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isLogin) {
      setReady(true);
      return;
    }
    const t = localStorage.getItem("bonum_admin_token");
    if (!t) {
      router.replace("/admin/login/");
      return;
    }
    setReady(true);
  }, [isLogin, router]);

  if (!ready && !isLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-500">
        Checking admin session…
      </div>
    );
  }

  if (isLogin) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">{children}</div>
    );
  }

  return (
    <div className="min-h-screen flex bg-zinc-950 text-white font-sans">
      <aside className="w-64 border-r border-white/5 bg-black/60 backdrop-blur-xl hidden md:flex flex-col shadow-2xl z-50">
        <div className="p-6 border-b border-white/5 bg-gradient-to-b from-white/5 to-transparent">
          <h2 className="text-2xl font-black tracking-widest bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent drop-shadow-sm">
            BONUM
          </h2>
          <p className="text-xs text-amber-500/70 mt-1 uppercase tracking-widest font-bold">
            Platform Admin
          </p>
        </div>

        <AdminSidebarNav />

        <div className="p-4 border-t border-white/5">
          <button
            type="button"
            className="block w-full text-left px-4 py-2 text-sm text-red-500/70 hover:text-red-400 transition-colors"
            onClick={() => {
              localStorage.removeItem("bonum_admin_token");
              router.push("/admin/login/");
            }}
          >
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="md:hidden p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h2 className="font-bold tracking-widest text-amber-500">BONUM</h2>
          <button type="button" className="p-2 bg-white/5 rounded">
            ☰
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">{children}</div>
      </main>
    </div>
  );
}
