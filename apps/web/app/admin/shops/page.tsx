"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import dynamic from 'next/dynamic';
import Dialog from '@/components/ui/Dialog';

const DynamicMapPicker = dynamic(() => import('@/components/MapLocationPicker'), {
  ssr: false,
  loading: () => <div className="w-full h-64 bg-zinc-900 rounded-lg animate-pulse flex items-center justify-center text-zinc-500">Loading Map...</div>,
});

type Shop = {
  id: string;
  name: string;
  slug: string;
  address: string;
  is_open: boolean;
  subscription_status: string;
};

export default function AdminShopsPage() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Dialog State
  const [dialogState, setDialogState] = useState<{isOpen: boolean, title: string, desc: string, variant: 'default'|'danger'|'success'|'warning'}>({
    isOpen: false, title: '', desc: '', variant: 'default'
  });

  const [newShop, setNewShop] = useState<{
    name: string;
    address: string;
    lat: number | null;
    lng: number | null;
  }>({
    name: '',
    address: '',
    lat: null,
    lng: null,
  });

  const fetchShops = () => {
    api.getShops().then(data => {
      setShops(data);
    }).catch(err => console.error("Failed to fetch shops:", err));
  };

  useEffect(() => {
    fetchShops();
  }, []);

  const handleCreateShop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newShop.lat === null || newShop.lng === null) {
      setDialogState({
        isOpen: true,
        title: "Missing Location",
        desc: "Please mark the shop location on the interactive map before saving.",
        variant: "warning"
      });
      return;
    }
    
    setLoading(true);
    try {
      await api.createShop({
        name: newShop.name,
        address: newShop.address,
        lat: newShop.lat,
        lng: newShop.lng,
      });
      setIsModalOpen(false);
      setNewShop({ name: '', address: '', lat: null, lng: null });
      fetchShops();
      setDialogState({
        isOpen: true,
        title: "Shop Created!",
        desc: "The coffee shop has been successfully onboarded.",
        variant: "success"
      });
    } catch (err) {
      console.error(err);
      setDialogState({
        isOpen: true,
        title: "Creation Failed",
        desc: "Failed to create shop. A shop with a similar name might already exist.",
        variant: "danger"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Dialog 
        isOpen={dialogState.isOpen} 
        onClose={() => setDialogState({...dialogState, isOpen: false})}
        title={dialogState.title}
        description={dialogState.desc}
        variant={dialogState.variant}
      />

      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black mb-1 tracking-tight">Shop Directory</h1>
          <p className="text-zinc-400">Manage and onboard coffee shops</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-amber-500 hover:bg-amber-400 text-black px-6 py-2.5 rounded-xl text-sm font-bold shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all transform hover:scale-105 active:scale-95"
        >
          + Onboard Shop
        </button>
      </div>

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
              <tr><td colSpan={5} className="p-12 text-center text-zinc-500 italic">No shops found. Onboard one to get started.</td></tr>
            ) : shops.map((shop) => (
              <tr key={shop.id} className="hover:bg-white/5 transition-colors group">
                <td className="p-5 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-zinc-800 border border-amber-500/20 flex items-center justify-center text-amber-500 font-bold text-xl uppercase shadow-inner">
                    {shop.name.charAt(0)}
                  </div>
                  <div>
                    <span className="font-bold text-white group-hover:text-amber-400 transition-colors block">{shop.name}</span>
                    <span className="text-xs text-zinc-500 font-mono block">/{shop.slug}</span>
                  </div>
                </td>
                <td className="p-5 text-zinc-400 text-sm">{shop.address}</td>
                <td className="p-5">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold tracking-wide ${shop.is_open ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${shop.is_open ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {shop.is_open ? 'OPERATING' : 'CLOSED'}
                  </span>
                </td>
                <td className="p-5">
                  <span className="text-xs text-amber-400 font-bold px-2.5 py-1 bg-amber-500/10 rounded-md border border-amber-500/20 capitalize tracking-wide">
                    {shop.subscription_status}
                  </span>
                </td>
                <td className="p-5 text-right">
                  <button className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium border border-white/5">Manage</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Onboard Shop Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4 backdrop-blur-md overflow-y-auto">
          <div className="glass-panel w-full max-w-2xl p-8 rounded-2xl border border-white/10 my-auto shadow-2xl animate-in fade-in zoom-in duration-300">
            <h2 className="text-2xl font-black mb-6">Onboard New Coffee Shop</h2>
            
            <form onSubmit={handleCreateShop} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-1.5">Shop Name</label>
                  <input 
                    type="text" required value={newShop.name} onChange={e => setNewShop({...newShop, name: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none" placeholder="e.g. Ulaanbaatar Roasters"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold text-zinc-400 mb-1.5">Address</label>
                  <input 
                    type="text" required value={newShop.address} onChange={e => setNewShop({...newShop, address: e.target.value})}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-3 text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all outline-none" placeholder="e.g. Sukhbaatar District, 1st Khoroo"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-zinc-400 mb-1.5">Map Location</label>
                <div className="rounded-xl overflow-hidden border border-white/10 shadow-inner">
                  <DynamicMapPicker 
                    lat={newShop.lat} lng={newShop.lng} 
                    onChange={(lat, lng) => setNewShop({...newShop, lat, lng})} 
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-white/10">
                <button 
                  type="button" onClick={() => setIsModalOpen(false)}
                  className="px-6 py-2.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
                <button 
                  type="submit" disabled={loading}
                  className="bg-amber-500 hover:bg-amber-400 text-black px-8 py-2.5 rounded-xl font-bold transition-all disabled:opacity-50 disabled:hover:bg-amber-500"
                >
                  {loading ? 'Processing...' : 'Create Shop'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
