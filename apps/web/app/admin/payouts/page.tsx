"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Dialog from '@/components/ui/Dialog';

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedShop, setSelectedShop] = useState<any>(null);

  useEffect(() => {
    api.getAdminPayouts()
      .then(setPayouts)
      .catch(err => console.error("Failed to load payouts:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <Dialog 
        isOpen={!!selectedShop} 
        onClose={() => setSelectedShop(null)}
        title="Payout Statement"
        description={`Statement for ${selectedShop?.name}`}
        variant="default"
      >
        {selectedShop && (
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-400">Total Revenue</span>
              <span className="font-bold">₮{(selectedShop.total_revenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-white/5">
              <span className="text-zinc-400">Platform Fee (5%)</span>
              <span className="text-red-400 font-bold">-₮{((selectedShop.total_revenue || 0) * 0.05).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center py-4 bg-white/5 px-4 rounded-xl mt-4">
              <span className="font-bold text-white">Net Payout</span>
              <span className="text-green-400 font-black text-xl">₮{((selectedShop.total_revenue || 0) * 0.95).toLocaleString()}</span>
            </div>
            <p className="text-xs text-zinc-500 text-center mt-4 italic">Funds will be automatically transferred to the shop's registered QPay account within 2-3 business days.</p>
          </div>
        )}
      </Dialog>

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Automated Payouts</h1>
          <p className="text-zinc-400">Manage and view shop revenue statements</p>
        </div>
      </div>

      <div className="glass-panel overflow-hidden bg-zinc-900/40 border border-white/5 shadow-2xl rounded-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-sm text-zinc-400">
              <th className="p-5 font-medium">Shop Name</th>
              <th className="p-5 font-medium">Total Revenue</th>
              <th className="p-5 font-medium">Platform Fee (5%)</th>
              <th className="p-5 font-medium">Net Payout</th>
              <th className="p-5 font-medium text-right">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr><td colSpan={5} className="p-12 text-center text-zinc-500 italic">Calculating payouts...</td></tr>
            ) : payouts.length === 0 ? (
              <tr><td colSpan={5} className="p-12 text-center text-zinc-500 italic">No payouts available.</td></tr>
            ) : payouts.map((shop) => {
              const revenue = shop.total_revenue || 0;
              const fee = revenue * 0.05;
              const net = revenue - fee;

              return (
                <tr key={shop.id} className="hover:bg-white/5 transition-colors group">
                  <td className="p-5 font-bold text-amber-500 group-hover:text-amber-400 transition-colors">{shop.name}</td>
                  <td className="p-5 font-medium">₮{revenue.toLocaleString()}</td>
                  <td className="p-5 text-red-400 font-medium">-₮{fee.toLocaleString()}</td>
                  <td className="p-5 font-black text-green-400 tracking-wide">₮{net.toLocaleString()}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => setSelectedShop(shop)}
                      className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg transition-colors font-bold text-white shadow-sm"
                    >
                      View Report
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
