"use client";

import dynamic from 'next/dynamic';

const DynamicAdminMap = dynamic(() => import('@/components/AdminHeatMap'), { ssr: false });

export default function HeatmapsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-3xl font-black mb-1 tracking-tight">Demand Heatmap</h1>
        <p className="text-zinc-400">Visualize real order volume across Ulaanbaatar</p>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden border border-white/5 shadow-2xl relative">
        <div className="absolute inset-0 z-0">
          <DynamicAdminMap />
        </div>
        
        <div className="absolute top-6 right-6 z-20 glass-panel bg-black/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)]">
          <h3 className="font-bold text-sm mb-3 border-b border-white/10 pb-3 tracking-wider uppercase text-zinc-400">Order Density Legend</h3>
          <div className="space-y-3 text-sm font-medium">
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-red-500/60 border border-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <span className="text-white">Very High (&gt;500 orders)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-orange-500/60 border border-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]"></div>
              <span className="text-white">High (100-500 orders)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-yellow-500/60 border border-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.5)]"></div>
              <span className="text-white">Moderate (&lt;100 orders)</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 rounded-full bg-zinc-700 border border-zinc-500"></div>
              <span className="text-white">No Orders (0)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
