"use client";

import { useState } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { MOCK_SHOPS, MOCK_MENU, MockMenuItem } from '@/lib/mock-data';

export default function ShopMenuPage({ params }: { params: { slug: string } }) {
  const shop = MOCK_SHOPS.find(s => s.slug === params.slug);
  
  if (!shop) return notFound();
  
  const menu = MOCK_MENU.filter(m => m.shop_id === shop.id);
  const [cart, setCart] = useState<{item: MockMenuItem, qty: number}[]>([]);

  const addToCart = (item: MockMenuItem) => {
    setCart(prev => {
      const existing = prev.find(i => i.item.id === item.id);
      if (existing) {
        return prev.map(i => i.item.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const totalItems = cart.reduce((acc, curr) => acc + curr.qty, 0);
  const totalPrice = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);

  return (
    <main className="max-w-4xl mx-auto min-h-screen pb-32">
      {/* Hero */}
      <div className="h-64 relative w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={shop.image_url} alt={shop.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-8">
          <Link href="/" className="text-coffee-light mb-4 flex items-center gap-2 hover:text-white transition-colors">
            ← Back to Shops
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{shop.name}</h1>
          <p className="text-white/70 flex items-center gap-4">
            <span>📍 {shop.address}</span>
            <span>⏱️ ~{shop.prep_time_mins} mins prep</span>
          </p>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coffee-light"></span>
          Menu
        </h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {menu.map((item) => (
            <div key={item.id} className="glass-panel p-4 flex gap-4 group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image_url} alt={item.name} className="w-24 h-24 rounded-xl object-cover" />
              
              <div className="flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
                  <p className="text-white/50 text-sm capitalize">{item.category}</p>
                </div>
                
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold text-coffee-light">₮{item.price.toLocaleString()}</span>
                  <button 
                    onClick={() => addToCart(item)}
                    className="w-8 h-8 rounded-full bg-white/10 hover:bg-coffee border border-white/20 flex items-center justify-center transition-colors"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Cart Bar */}
      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto glass-panel border-coffee/50 bg-black/80 backdrop-blur-xl p-4 flex justify-between items-center shadow-2xl shadow-coffee/20">
            <div>
              <p className="text-white/70 text-sm">Your Order</p>
              <p className="font-bold text-xl">{totalItems} items • ₮{totalPrice.toLocaleString()}</p>
            </div>
            
            {/* Pass the cart data via query params for this mock demo */}
            <Link 
              href={`/${shop.slug}/order?items=${encodeURIComponent(JSON.stringify(cart))}`}
              className="bg-coffee hover:bg-coffee-light text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Checkout →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
