"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function ShopSettingsPage() {
  const [shop, setShop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchShop = () => {
    const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
    api.getShop(shopId)
      .then(setShop)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchShop();
  }, []);

  const handleUpdate = async (updates: any) => {
    setSaving(true);
    try {
      const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
      await api.updateShop(shopId, updates);
      fetchShop();
    } catch (err) {
      console.error(err);
      alert("Failed to update settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="animate-pulse flex items-center justify-center p-12 text-zinc-500">Loading settings...</div>;
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
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2 flex justify-between">
            Operating Status
            {saving && <span className="text-xs text-amber-500 animate-pulse">Saving...</span>}
          </h2>
          
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="font-medium text-white">Currently Accepting Orders</p>
              <p className="text-sm text-white/50">Turn off if you are overwhelmed or closed.</p>
            </div>
            <button 
              onClick={() => handleUpdate({ is_open: !shop.is_open })}
              className={`w-14 h-7 rounded-full relative transition-colors ${shop.is_open ? 'bg-green-500' : 'bg-zinc-600'}`}
            >
              <span className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${shop.is_open ? 'right-1' : 'left-1'}`}></span>
            </button>
          </div>

          <div>
            <label className="block font-medium mb-1 text-white">Current Prep Time (Minutes)</label>
            <p className="text-sm text-white/50 mb-2">Adjust this so customers know when to arrive.</p>
            <div className="flex gap-2 max-w-xs">
              <input 
                type="number" 
                value={shop.prep_time_mins} 
                onChange={(e) => setShop({...shop, prep_time_mins: parseInt(e.target.value)})}
                className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full focus:outline-none focus:border-coffee" 
              />
              <button 
                onClick={() => handleUpdate({ prep_time_mins: shop.prep_time_mins })}
                disabled={saving}
                className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors font-medium text-sm disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Profile */}
        <div className="glass-panel p-6">
          <h2 className="text-lg font-semibold mb-4 border-b border-white/10 pb-2">Shop Profile</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-white/60 mb-1">Shop Name</label>
              <input 
                type="text" 
                value={shop.name} 
                onChange={(e) => setShop({...shop, name: e.target.value})}
                className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full" 
              />
            </div>
            <div>
              <label className="block text-sm text-white/60 mb-1">Address</label>
              <input 
                type="text" 
                value={shop.address} 
                onChange={(e) => setShop({...shop, address: e.target.value})}
                className="bg-black/50 border border-white/20 rounded-lg p-2 text-white w-full" 
              />
            </div>
            <button 
              onClick={() => handleUpdate({ name: shop.name, address: shop.address })}
              disabled={saving}
              className="bg-coffee hover:bg-coffee-light px-6 py-2.5 rounded-lg text-sm font-medium transition-colors mt-2 disabled:opacity-50"
            >
              Update Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
