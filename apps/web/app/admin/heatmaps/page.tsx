"use client";

import dynamic from 'next/dynamic';

const DynamicAdminMap = dynamic(() => import('@/components/Map'), { ssr: false });

export default function HeatmapsPage() {
  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Demand Heatmap</h1>
        <p className="text-zinc-400 text-sm">Visualize order volume across Ulaanbaatar</p>
      </div>

      <div className="flex-1 rounded-xl overflow-hidden border border-white/10 relative">
        <div className="absolute inset-0 z-0">
          <DynamicAdminMap />
        </div>
        
        {/* Mock Heatmap Overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-red-500/20 via-transparent to-transparent opacity-80" style={{ backgroundSize: '150% 150%', backgroundPosition: 'center' }}></div>
        <div className="absolute inset-0 z-10 pointer-events-none bg-[radial-gradient(circle_at_30%_40%,_var(--tw-gradient-stops))] from-orange-500/30 via-transparent to-transparent opacity-60"></div>
        
        <div className="absolute top-4 right-4 z-20 glass-panel bg-zinc-900/90 border-white/10 p-4 rounded-xl shadow-2xl">
          <h3 className="font-bold text-sm mb-2 border-b border-white/10 pb-2">Order Density</h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
              <span>Very High (&gt;500 orders)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-orange-500/50"></div>
              <span>High (100-500 orders)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
              <span>Moderate (&lt;100 orders)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
