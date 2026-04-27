"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { MOCK_SHOPS, MockMenuItem } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { useState } from 'react';
import { api } from '@/lib/api';

export default function OrderClient({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const shop = MOCK_SHOPS.find(s => s.slug === slug);

  if (!shop) return notFound();

  // Parse cart from URL safely
  let cart: {item: MockMenuItem, qty: number}[] = [];
  try {
    const itemsParam = searchParams.get('items');
    if (itemsParam) cart = JSON.parse(itemsParam);
  } catch (e) {}

  const [status, setStatus] = useState<'review' | 'paying'>('review');
  const [promo, setPromo] = useState('');
  const [discount, setDiscount] = useState(0);

  const subtotal = cart.reduce((acc, curr) => acc + (curr.item.price * curr.qty), 0);
  const totalPrice = subtotal - discount;

  const applyPromo = () => {
    if (promo.toUpperCase() === 'FIRSTCOFFEE50') {
      setDiscount(subtotal * 0.5);
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  const handlePayment = async () => {
    setStatus('paying');
    try {
      // For demonstration of the live tracker, we will duplicate a recent order
      // since the full cart-to-API flow isn't wired up yet.
      const recentOrder = await api.getRecentOrder();
      if (recentOrder && !recentOrder.error) {
        const newOrder = await api.reorder(recentOrder.id);
        router.push(`/orders/tracker?id=${newOrder.id}`);
      } else {
        alert("Failed to find a recent order to duplicate for the demo.");
        setStatus('review');
      }
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
      setStatus('review');
    }
  };

  if (cart.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">Your cart is empty.</p>
        <Link href={`/${shop.slug}`} className="text-coffee-light hover:underline">Go back to menu</Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 md:p-12 min-h-screen">
      <Link href={`/${shop.slug}`} className="text-coffee-light mb-8 inline-flex items-center gap-2 hover:text-white transition-colors">
        ← Back to Menu
      </Link>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="glass-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-4">Order Summary</h2>
        <div className="space-y-4 mb-6">
          {cart.map((cartItem, idx) => (
            <div key={idx} className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-2 py-1 rounded text-sm">{cartItem.qty}x</span>
                <span>{cartItem.item.name}</span>
              </div>
              <span className="text-white/80">₮{(cartItem.item.price * cartItem.qty).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Promo Code (Try: FIRSTCOFFEE50)"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-coffee"
          />
          <button onClick={applyPromo} className="bg-white/10 hover:bg-white/20 px-4 rounded-lg font-medium transition-colors">Apply</button>
        </div>
        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-white/80">Total</span>
          <div className="text-right">
            {discount > 0 && <p className="text-sm text-green-400 mb-1">-₮{discount.toLocaleString()} promo</p>}
            <span className="text-2xl font-bold text-coffee-light">₮{totalPrice.toLocaleString()}</span>
          </div>
        </div>
      </div>
      <button
        onClick={handlePayment}
        disabled={status === 'paying'}
        className="w-full bg-[#0052cc] hover:bg-[#0043a8] text-white py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2"
      >
        {status === 'paying' ? <span className="animate-pulse">Processing via QPay...</span> : 'Pay with QPay'}
      </button>
    </main>
  );
}
