"use client";

import { MOCK_SHOPS } from '@/lib/mock-data';

export default function PayoutsPage() {
  const generatePDF = (shopName: string) => {
    alert(`📄 Generating PDF Statement for ${shopName}...\nDownloading statement_april_2026.pdf`);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Automated Payouts</h1>
          <p className="text-zinc-400 text-sm">Generate revenue statements for shops</p>
        </div>
        <button className="bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors text-white border border-white/10">
          Generate All PDFs
        </button>
      </div>

      <div className="glass-panel overflow-hidden bg-zinc-900/50 border-white/5">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/5 text-sm text-zinc-400">
              <th className="p-4 font-medium">Shop Name</th>
              <th className="p-4 font-medium">Monthly Revenue</th>
              <th className="p-4 font-medium">Platform Fee (5%)</th>
              <th className="p-4 font-medium">Net Payout</th>
              <th className="p-4 font-medium text-right">Statement</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {MOCK_SHOPS.map((shop, idx) => {
              const mockRevenue = (idx + 1) * 1250000; // Mock revenue math
              const fee = mockRevenue * 0.05;
              const net = mockRevenue - fee;

              return (
                <tr key={shop.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-medium text-amber-500">{shop.name}</td>
                  <td className="p-4">₮{mockRevenue.toLocaleString()}</td>
                  <td className="p-4 text-red-400">-₮{fee.toLocaleString()}</td>
                  <td className="p-4 font-bold text-green-400">₮{net.toLocaleString()}</td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => generatePDF(shop.name)}
                      className="text-sm bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1 rounded transition-colors"
                    >
                      ↓ PDF
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
