"use client";

import { MOCK_SHOPS } from '@/lib/mock-data';

export default function AdminShopsPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Shop Directory</h1>
          <p className="text-zinc-400 text-sm">Manage all coffee shops on the platform</p>
        </div>
        <button className="bg-amber-600 hover:bg-amber-500 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white">
          + Onboard Shop
        </button>
      </div>

      <div className="glass-panel overflow-hidden bg-zinc-900/50 border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-sm text-zinc-400">
              <th className="p-4 font-medium">Shop Name</th>
              <th className="p-4 font-medium">Location</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium">Subscription</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_SHOPS.map((shop) => (
              <tr key={shop.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-amber-500 font-bold">
                    {shop.name.charAt(0)}
                  </div>
                  <span className="font-medium">{shop.name}</span>
                </td>
                <td className="p-4 text-zinc-300 text-sm">{shop.address}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${shop.is_open ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                    {shop.is_open ? 'Operating' : 'Closed'}
                  </span>
                </td>
                <td className="p-4">
                  <span className="text-xs text-amber-400 font-medium px-2 py-1 bg-amber-500/10 rounded border border-amber-500/20">
                    Active Plan
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button className="text-zinc-500 hover:text-white transition-colors text-sm mr-3">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
