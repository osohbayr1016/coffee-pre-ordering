"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { MenuItem } from '@coffee/shared/src/types';

export default function MenuManagementPage() {
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [modifiers, setModifiers] = useState<any[]>([]);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [isModifierModalOpen, setIsModifierModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [menuLoading, setMenuLoading] = useState(true);
  
  const [newItem, setNewItem] = useState({
    name: '', category: 'coffee', price: '', prep_time_mins: 3, temp_options: 'both', image_url: ''
  });

  const [newModifier, setNewModifier] = useState({
    name: '', extra_price: ''
  });

  const fetchData = () => {
    const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
    Promise.all([
      api.getMenu(shopId).catch(err => { console.error(err); return []; }),
      api.getModifiers(shopId).catch(err => { console.error(err); return []; })
    ]).then(([menuData, modifiersData]) => {
      setMenu(menuData);
      setModifiers(modifiersData);
      setMenuLoading(false);
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
      await api.createMenuItem(shopId, {
        ...newItem,
        price: parseInt(newItem.price),
        temp_options: newItem.temp_options as 'both' | 'hot' | 'cold',
      });
      setIsItemModalOpen(false);
      setNewItem({ name: '', category: 'coffee', price: '', prep_time_mins: 3, temp_options: 'both', image_url: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create item.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddModifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
      await api.createModifier(shopId, {
        name: newModifier.name,
        extra_price: parseInt(newModifier.extra_price || '0')
      });
      setIsModifierModalOpen(false);
      setNewModifier({ name: '', extra_price: '' });
      fetchData();
    } catch (err) {
      console.error(err);
      alert("Failed to create modifier.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMenuItem = async (id: string, currentStatus: number | boolean) => {
    try {
      const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
      await api.toggleMenuItem(shopId, id, !currentStatus);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleModifier = async (id: string, currentStatus: number | boolean) => {
    try {
      const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
      await api.toggleModifier(shopId, id, !currentStatus);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Menu Management</h1>
          <p className="text-white/60 text-sm">Update prices, availability, and specific prep times</p>
        </div>
        <button 
          onClick={() => setIsItemModalOpen(true)}
          className="bg-coffee hover:bg-coffee-light px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          + Add Item
        </button>
      </div>

      {/* Global Modifiers */}
      <div className="glass-panel p-6 mb-8 border border-white/10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Global Modifiers</h2>
          <button 
            onClick={() => setIsModifierModalOpen(true)}
            className="text-xs bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            + Add Modifier
          </button>
        </div>
        
        {modifiers.length === 0 ? (
          <p className="text-white/40 text-sm italic">No global modifiers configured.</p>
        ) : (
          <div className="flex flex-wrap gap-4">
            {modifiers.map(mod => (
              <div key={mod.id} className={`flex items-center gap-4 bg-white/5 p-3 rounded-lg flex-1 min-w-[200px] justify-between transition-opacity ${mod.is_available ? 'opacity-100' : 'opacity-50'}`}>
                <div>
                  <span className="block font-medium">{mod.name}</span>
                  {mod.extra_price > 0 && <span className="text-xs text-coffee-light">+₮{mod.extra_price.toLocaleString()}</span>}
                </div>
                <button 
                  onClick={() => toggleModifier(mod.id, mod.is_available)}
                  className={`w-10 h-5 rounded-full relative transition-colors ${mod.is_available ? 'bg-green-500' : 'bg-zinc-600'}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${mod.is_available ? 'right-1' : 'left-1'}`}></span>
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="text-xs text-white/40 mt-4">Toggling these off will immediately hide them from all customer menus globally.</p>
      </div>

      <div className="glass-panel overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-sm text-white/60">
              <th className="p-4 font-medium">Item</th>
              <th className="p-4 font-medium">Category</th>
              <th className="p-4 font-medium">Price</th>
              <th className="p-4 font-medium">Prep Time</th>
              <th className="p-4 font-medium">Status</th>
              <th className="p-4 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/10">
            {menuLoading ? (
               <tr><td colSpan={6} className="p-8 text-center text-zinc-500 animate-pulse">Loading menu...</td></tr>
            ) : menu.length === 0 ? (
               <tr><td colSpan={6} className="p-8 text-center text-zinc-500 italic">No menu items found.</td></tr>
            ) : menu.map((item) => (
              <tr key={item.id} className={`hover:bg-white/5 transition-colors group ${!item.is_available ? 'opacity-60' : ''}`}>
                <td className="p-4 flex items-center gap-3">
                  {item.image_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded bg-white/10 flex items-center justify-center">☕</div>
                  )}
                  <span className="font-medium">{item.name}</span>
                </td>
                <td className="p-4 capitalize text-white/80">{item.category}</td>
                <td className="p-4 text-coffee-light font-medium">₮{item.price.toLocaleString()}</td>
                <td className="p-4 text-white/80">{item.prep_time_mins || 3} mins</td>
                <td className="p-4">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${item.is_available ? 'bg-green-500/20 text-green-300' : 'bg-red-500/20 text-red-300'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${item.is_available ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {item.is_available ? 'Available' : 'Hidden'}
                  </span>
                </td>
                <td className="p-4 text-right">
                  <button 
                    onClick={() => toggleMenuItem(item.id!, item.is_available)}
                    className={`${item.is_available ? 'text-red-400 hover:text-red-300' : 'text-green-400 hover:text-green-300'} transition-colors text-sm font-medium`}
                  >
                    {item.is_available ? 'Hide Item' : 'Show Item'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Item Modal */}
      {isItemModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md p-6 border border-white/20">
            <h2 className="text-xl font-bold mb-6">Create New Menu Item</h2>
            <form onSubmit={handleAddItem} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Item Name</label>
                <input 
                  type="text" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white" placeholder="e.g. Vanilla Latte"
                />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-1">Category</label>
                  <select 
                    value={newItem.category} onChange={e => setNewItem({...newItem, category: e.target.value})}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  >
                    <option value="coffee">Coffee</option>
                    <option value="tea">Tea</option>
                    <option value="food">Food & Pastries</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-1">Price (₮)</label>
                  <input 
                    type="number" required min="0" value={newItem.price} onChange={e => setNewItem({...newItem, price: e.target.value})}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white" placeholder="7500"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-1">Prep Time (mins)</label>
                  <input 
                    type="number" required min="1" value={newItem.prep_time_mins} onChange={e => setNewItem({...newItem, prep_time_mins: parseInt(e.target.value)})}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-white/60 mb-1">Temperature</label>
                  <select 
                    value={newItem.temp_options} onChange={e => setNewItem({...newItem, temp_options: e.target.value as 'hot' | 'cold' | 'both'})}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white"
                  >
                    <option value="both">Hot & Cold</option>
                    <option value="hot">Hot Only</option>
                    <option value="cold">Cold Only</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Image Upload (Cloudflare R2)</label>
                <div className="flex items-center gap-4">
                  <input 
                    type="file" accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      try {
                        setLoading(true);
                        const { url } = await api.uploadImage(file);
                        setNewItem({...newItem, image_url: url});
                      } catch (err) {
                        alert("Failed to upload image.");
                      } finally {
                        setLoading(false);
                      }
                    }}
                    className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-coffee file:text-white hover:file:bg-coffee-light"
                  />
                  {newItem.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={newItem.image_url} alt="Preview" className="w-12 h-12 object-cover rounded-lg border border-white/20" />
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsItemModalOpen(false)} className="px-4 py-2 text-white/60 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-coffee hover:bg-coffee-light px-6 py-2 rounded-lg font-medium text-white transition-colors">{loading ? 'Saving...' : 'Save Item'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Modifier Modal */}
      {isModifierModalOpen && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm p-6 border border-white/20">
            <h2 className="text-xl font-bold mb-6">Create New Modifier</h2>
            <form onSubmit={handleAddModifier} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Modifier Name</label>
                <input 
                  type="text" required value={newModifier.name} onChange={e => setNewModifier({...newModifier, name: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white" placeholder="e.g. Oat Milk"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/60 mb-1">Extra Price (₮)</label>
                <input 
                  type="number" min="0" value={newModifier.extra_price} onChange={e => setNewModifier({...newModifier, extra_price: e.target.value})}
                  className="w-full bg-black/50 border border-white/20 rounded-lg p-2 text-white" placeholder="1000 (Optional)"
                />
                <p className="text-[10px] text-white/40 mt-1">Leave empty if free.</p>
              </div>
              <div className="flex justify-end gap-3 mt-8">
                <button type="button" onClick={() => setIsModifierModalOpen(false)} className="px-4 py-2 text-white/60 hover:text-white transition-colors">Cancel</button>
                <button type="submit" disabled={loading} className="bg-coffee hover:bg-coffee-light px-6 py-2 rounded-lg font-medium text-white transition-colors">{loading ? 'Saving...' : 'Add Modifier'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
