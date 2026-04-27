"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function AdminHome() {
  const [metrics, setMetrics] = useState({
    totalShops: 0,
    activeSubs: 0,
    totalOrders: 0,
    platformRevenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getAdminMetrics()
      .then(setMetrics)
      .catch(err => console.error("Failed to load metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-3xl font-black mb-2 tracking-tight">Platform Metrics</h1>
      <p className="text-zinc-400 mb-8">Real-time overview of your coffee pre-ordering ecosystem.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className={`glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-black/80 transition-opacity duration-500 ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
          <h3 className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2"><span className="text-amber-500">🏪</span> Total Shops</h3>
          <p className="text-4xl font-black">{metrics.totalShops}</p>
        </div>
        <div className={`glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-amber-500/10 to-black/80 border-l-4 border-l-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.05)] transition-opacity duration-500 ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
          <h3 className="text-amber-400/80 text-sm font-medium mb-2 flex items-center gap-2">⭐ Active Subscriptions</h3>
          <p className="text-4xl font-black text-amber-500">{metrics.activeSubs}</p>
        </div>
        <div className={`glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-zinc-900/80 to-black/80 transition-opacity duration-500 ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
          <h3 className="text-zinc-400 text-sm font-medium mb-2 flex items-center gap-2">📦 Orders Today</h3>
          <p className="text-4xl font-black">{metrics.totalOrders}</p>
        </div>
        <div className={`glass-panel p-6 rounded-2xl border border-white/5 bg-gradient-to-br from-green-500/5 to-black/80 transition-opacity duration-500 ${loading ? 'opacity-50 animate-pulse' : 'opacity-100'}`}>
          <h3 className="text-green-400/80 text-sm font-medium mb-2 flex items-center gap-2">💰 Revenue Today</h3>
          <p className="text-4xl font-black text-green-500">₮{metrics.platformRevenue.toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}
