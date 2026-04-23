"use client";

import { MOCK_SHOPS } from '@/lib/mock-data';

export default function ShopSettingsPage() {
  const shop = MOCK_SHOPS.find(s => s.id === 'shop-1');

  if (!shop) return null;

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Shop Settings</h1>
        <p className="text-white/60 text-sm">Manage your shop profile and operating status</p>
      </div>

      <div className="space-y-6">
        {/* Operating Status */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Operating Status</h2>
          
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="font-medium">Currently Accepting Orders</p>
              <p className="text-sm text-white/50">Turn off if you are overwhelmed or closed.</p>
            </div>
            <button className="w-12 h-6 bg-green-500 rounded-full relative transition-colors">
              <span className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></span>
            </button>
          </div>

          <div>
            <label className="block font-medium mb-1">Current Prep Time (Minutes)</label>
            <p className="text-sm text-white/50 mb-2">Adjust this so customers know when to arrive.</p>
            <div className="flex gap-2 max-w-xs">
              <input type="number" defaultValue={shop.prep_time_mins} className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full focus:outline-none focus:border-coffee" />
              <button className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">Save</button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Shop Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Shop Name</label>
              <input type="text" defaultValue={shop.name} className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full" />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Address</label>
              <input type="text" defaultValue={shop.address} className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full" />
            </div>
            <button className="bg-coffee hover:bg-coffee-light px-6 py-2 rounded-lg text-sm font-medium transition-colors mt-2">
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
