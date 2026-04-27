"use client";

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

type TrackerOrder = {
  id: string;
  shop_name: string;
  shop_lat: number;
  shop_lng: number;
  status: 'pending_payment' | 'paid' | 'preparing' | 'ready' | 'picked_up' | 'cancelled';
  pickup_code?: string;
  total_amount: number;
  items: any[];
};

export default function OrderTrackerClient() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id');

  const [order, setOrder] = useState<TrackerOrder | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchOrder = () => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    api.getOrder(orderId).then(data => {
      if (!data.error) setOrder(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-zinc-500 animate-pulse">Loading Tracker...</div>;
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-white/60">
        <p className="mb-4">Order not found.</p>
        <Link href="/" className="text-coffee-light hover:underline">Return Home</Link>
      </div>
    );
  }

  // UberEats style progress bar
  const getProgressWidth = () => {
    switch (order.status) {
      case 'paid': return '33%';
      case 'preparing': return '66%';
      case 'ready': return '100%';
      case 'picked_up': return '100%';
      default: return '10%';
    }
  };

  return (
    <main className="max-w-md mx-auto p-6 min-h-screen flex flex-col relative overflow-hidden">
      {/* Background glow effects */}
      {order.status === 'ready' && <div className="absolute top-0 left-0 w-full h-full bg-green-500/10 pointer-events-none animate-pulse"></div>}
      
      <div className="mt-8 mb-6 relative z-10">
        <h1 className="text-2xl font-bold tracking-tight">Live Tracker</h1>
        <p className="text-white/60">Order #{order.id.slice(0, 8)}</p>
      </div>

      <div className="glass-panel p-6 mb-8 relative z-10">
        {order.status === 'ready' ? (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-green-400 mb-2 drop-shadow-[0_0_10px_rgba(74,222,128,0.5)]">
              Ready for Pickup!
            </h2>
            <p className="text-white/60 mb-4">Show this code to the barista at {order.shop_name}</p>
            {order.pickup_code && (
              <div className="inline-block bg-white/5 border-2 border-green-500/50 rounded-2xl px-8 py-4 shadow-[0_0_20px_rgba(74,222,128,0.2)]">
                <span className="text-5xl font-black tracking-widest text-white">{order.pickup_code}</span>
              </div>
            )}
          </div>
        ) : order.status === 'picked_up' ? (
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white mb-2">Enjoy your coffee!</h2>
            <p className="text-white/60">This order has been picked up.</p>
          </div>
        ) : (
          <div className="mb-8">
            <h2 className="text-xl font-bold mb-1">
              {order.status === 'paid' ? 'Order received' : order.status === 'preparing' ? 'Barista is preparing' : 'Processing...'}
            </h2>
            <p className="text-white/60 text-sm">from {order.shop_name}</p>
          </div>
        )}

        {/* Progress Bar UI */}
        {order.status !== 'picked_up' && (
          <div className="relative mb-8">
            <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-in-out ${order.status === 'ready' ? 'bg-green-500' : 'bg-coffee-light'}`}
                style={{ width: getProgressWidth() }}
              ></div>
            </div>
            
            <div className="flex justify-between mt-4">
              <div className={`flex flex-col items-center ${['paid', 'preparing', 'ready'].includes(order.status) ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${order.status === 'paid' ? 'bg-coffee-light text-black ring-4 ring-coffee-light/30' : 'bg-white/10'}`}>1</div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">Sent</span>
              </div>
              <div className={`flex flex-col items-center ${['preparing', 'ready'].includes(order.status) ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${order.status === 'preparing' ? 'bg-coffee-light text-black ring-4 ring-coffee-light/30' : 'bg-white/10'}`}>2</div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-white/60">Preparing</span>
              </div>
              <div className={`flex flex-col items-center ${order.status === 'ready' ? 'opacity-100' : 'opacity-40'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold mb-1 ${order.status === 'ready' ? 'bg-green-500 text-black ring-4 ring-green-500/30 shadow-[0_0_15px_rgba(74,222,128,0.5)]' : 'bg-white/10'}`}>3</div>
                <span className="text-[10px] font-medium uppercase tracking-wider text-green-400">Ready</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="glass-panel p-6 mb-6 relative z-10">
        <h3 className="font-semibold mb-3 border-b border-white/10 pb-3">Order Details</h3>
        <div className="space-y-3 mb-4">
          {order.items.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center text-sm">
              <div className="flex items-center gap-3">
                <span className="bg-white/10 text-white/60 px-2 py-0.5 rounded text-xs font-bold">{item.quantity}x</span>
                <span>{item.name} <span className="text-white/40 capitalize">({item.temperature})</span></span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-between items-center pt-3 border-t border-white/10 font-bold">
          <span>Total</span>
          <span className="text-coffee-light">₮{order.total_amount.toLocaleString()}</span>
        </div>
      </div>

      {order.shop_lat && order.shop_lng && (
        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${order.shop_lat},${order.shop_lng}`}
          target="_blank" rel="noreferrer"
          className="w-full bg-[#202124] hover:bg-[#303134] border border-white/10 text-white py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors relative z-10 shadow-lg"
        >
          📍 Get Directions
        </a>
      )}

      <Link href="/" className="mt-8 text-center text-white/40 hover:text-white underline text-sm transition-colors relative z-10">
        Back to Map
      </Link>
    </main>
  );
}
