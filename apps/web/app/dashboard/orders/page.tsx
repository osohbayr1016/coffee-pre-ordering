"use client";

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

type OrderStatus = 'paid' | 'preparing' | 'ready' | 'picked_up';

export type LiveOrder = {
  id: string;
  shop_id: string;
  status: OrderStatus;
  total_amount: number;
  scheduled_pickup_at: string;
  created_at: string;
  pickup_code?: string;
  customer_name: string;
  allergy_profile?: string;
  items?: { name: string; qty: number; temp: string }[];
};

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = () => {
    const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
    api.getOrders(shopId).then(data => {
      // Mock items for now since we don't have a JOIN yet for items, or we can assume it's coming from API
      // The API currently returns basic order details.
      const enrichedData = data.map((o: any) => ({
        ...o,
        items: o.items || [{ name: "Coffee", qty: 1, temp: "hot" }]
      }));
      setOrders(enrichedData);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrders();
    const interval = setInterval(fetchOrders, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const updateStatus = async (id: string, newStatus: OrderStatus) => {
    setUpdatingId(id);
    try {
      await api.updateOrderStatus(id, newStatus);
      fetchOrders();
    } catch (err) {
      console.error(err);
      alert("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const columns: { title: string, status: OrderStatus, color: string }[] = [
    { title: "New (Paid)", status: "paid", color: "border-blue-500/50" },
    { title: "Preparing", status: "preparing", color: "border-yellow-500/50" },
    { title: "Ready for Pickup", status: "ready", color: "border-green-500/50" },
  ];

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Orders</h1>
          <p className="text-white/60 text-sm">Manage incoming orders in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={fetchOrders} className="bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded text-sm transition-colors">
            🔄 Refresh
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">Accepting Orders</span>
          </div>
        </div>
      </div>

      {loading && orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center text-zinc-500 animate-pulse">Loading Live Orders...</div>
      ) : (
        <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 overflow-hidden">
          {columns.map((col) => {
            const colOrders = orders.filter(o => o.status === col.status);
            
            return (
              <div key={col.status} className={`glass-panel border-t-4 ${col.color} p-4 flex flex-col h-full overflow-hidden bg-black/40`}>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">{col.title}</h3>
                  <span className="bg-white/10 px-2 py-0.5 rounded-full text-xs">{colOrders.length}</span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                  {colOrders.length === 0 ? (
                    <p className="text-white/30 text-sm text-center py-8 border border-dashed border-white/10 rounded-lg">No orders</p>
                  ) : (
                    colOrders.map(order => (
                      <div key={order.id} className={`bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors ${updatingId === order.id ? 'opacity-50 pointer-events-none' : ''}`}>
                        <div className="flex justify-between items-start mb-3 border-b border-white/5 pb-3">
                          <div>
                            <span className="font-bold">{order.customer_name}</span>
                            <p className="text-xs text-white/40">{new Date(order.scheduled_pickup_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                          </div>
                          {order.pickup_code && (
                            <div className="bg-amber-500/20 text-amber-300 font-bold px-2 py-1 rounded text-xs">
                              {order.pickup_code}
                            </div>
                          )}
                        </div>
                        
                        {order.allergy_profile && (
                          <div className="mb-3 bg-red-500/20 border border-red-500/50 rounded-lg p-2 animate-pulse">
                            <div className="flex items-center gap-2 text-red-400 font-bold text-xs mb-1">
                              <span>⚠️</span> ALLERGY / TASTE PROFILE
                            </div>
                            <p className="text-white text-xs leading-tight">{order.allergy_profile}</p>
                          </div>
                        )}
                        
                        <div className="mb-3">
                          <ul className="text-sm text-white/70 mt-1 space-y-1">
                            {order.items?.map((item, idx) => (
                              <li key={idx}>• {item.qty}x {item.name} ({item.temp})</li>
                            ))}
                          </ul>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="pt-3 border-t border-white/10 flex gap-2">
                          {order.status === 'paid' && (
                            <button onClick={() => updateStatus(order.id, 'preparing')} disabled={updatingId === order.id} className="flex-1 bg-coffee hover:bg-coffee-light text-white text-xs py-2 rounded-lg transition-colors font-medium">
                              {updatingId === order.id ? 'Updating...' : 'Start Preparing'}
                            </button>
                          )}
                          {order.status === 'preparing' && (
                            <button onClick={() => updateStatus(order.id, 'ready')} disabled={updatingId === order.id} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-2 rounded-lg transition-colors font-medium">
                              {updatingId === order.id ? 'Updating...' : 'Mark Ready'}
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button onClick={() => updateStatus(order.id, 'picked_up')} disabled={updatingId === order.id} className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-lg transition-colors font-medium">
                              {updatingId === order.id ? 'Updating...' : 'Picked Up'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
