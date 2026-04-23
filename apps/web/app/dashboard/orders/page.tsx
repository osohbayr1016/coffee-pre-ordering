"use client";

import { useState, useEffect } from 'react';
import { MOCK_ORDERS, MockOrder, OrderStatus } from '@/lib/mock-data';
import { api } from '@/lib/api';

export type LiveOrder = {
  id: string;
  shop_id: string;
  status: OrderStatus;
  total_amount: number;
  scheduled_pickup_at: string;
  created_at: string;
  pickup_code?: string;
  customer_name: string;
  items: { name: string; qty: number; temp: string }[];
};

export default function LiveOrdersPage() {
  const [orders, setOrders] = useState<LiveOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
    api.getOrders(shopId).then(data => {
      setOrders(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  const updateStatus = (id: string, newStatus: OrderStatus) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: newStatus } : o));
  };

  const columns: { title: string, status: OrderStatus, color: string }[] = [
    { title: "New (Paid)", status: "paid", color: "border-blue-500/50" },
    { title: "Preparing", status: "preparing", color: "border-yellow-500/50" },
    { title: "Ready for Pickup", status: "ready", color: "border-green-500/50" },
  ];

  // --- Premium Features ---
  const playChime = () => {
    // We use a base64 encoded short beep so we don't need external assets
    const beep = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU";
    try {
      // In a real app we'd use a real sound file, here we'll just simulate the action
      console.log("DING! Playing audio chime...");
      // let audio = new Audio('/chime.mp3'); audio.play();
    } catch(e) {}
  };

  const simulateNewOrder = () => {
    playChime();
    setOrders([{
      id: `ord-mock-${Math.floor(Math.random()*1000)}`, shop_id: 'shop-1',
      customer_name: "Test Customer", status: "paid", total_amount: 5000,
      items: [{ name: "Test Espresso", qty: 1, temp: "hot" }],
      scheduled_pickup_at: new Date(Date.now() + 5*60000).toISOString(),
      created_at: new Date().toISOString(),
      pickup_code: '#' + Math.random().toString(36).substring(2, 6).toUpperCase()
    }, ...orders]);
  };

  const simulatePrint = (orderId: string) => {
    alert(`🖨️ Printing receipt for order ${orderId} to local thermal printer...`);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Live Orders</h1>
          <p className="text-white/60 text-sm">Manage incoming orders in real-time</p>
        </div>
        <div className="flex items-center gap-4">
          <button onClick={simulateNewOrder} className="bg-blue-600 hover:bg-blue-500 px-3 py-1.5 rounded text-sm transition-colors">
            🔔 Test New Order
          </button>
          <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded">
            <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-sm font-medium">Accepting Orders</span>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
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
                    <div key={order.id} className="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors">
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
                      
                      <div className="mb-3">
                        <ul className="text-sm text-white/70 mt-1 space-y-1">
                          {order.items.map((item, idx) => (
                            <li key={idx}>• {item.qty}x {item.name} ({item.temp})</li>
                          ))}
                        </ul>
                      </div>
                      
                      {/* Action Buttons */}
                      <div className="pt-3 border-t border-white/10 flex gap-2">
                        {order.status === 'paid' && (
                          <button onClick={() => updateStatus(order.id, 'preparing')} className="flex-1 bg-coffee hover:bg-coffee-light text-white text-xs py-2 rounded-lg transition-colors">
                            Start Preparing
                          </button>
                        )}
                        {order.status === 'preparing' && (
                          <button onClick={() => updateStatus(order.id, 'ready')} className="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs py-2 rounded-lg transition-colors">
                            Mark Ready
                          </button>
                        )}
                        {order.status === 'ready' && (
                          <button onClick={() => updateStatus(order.id, 'picked_up')} className="flex-1 bg-white/20 hover:bg-white/30 text-white text-xs py-2 rounded-lg transition-colors">
                            Picked Up
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
    </div>
  );
}
