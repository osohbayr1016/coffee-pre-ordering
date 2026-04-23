"use client";

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { MOCK_SHOPS, MockMenuItem } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { use } from 'react';
import { useState, useEffect } from 'react';

export async function generateStaticParams() {
  return MOCK_SHOPS.map((shop) => ({ slug: shop.slug }));
}

export default function CheckoutPage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const shop = MOCK_SHOPS.find(s => s.slug === resolvedParams.slug);
  
  if (!shop) return notFound();

  // Parse cart from URL safely
  let cart: {item: MockMenuItem, qty: number}[] = [];
  try {
    const itemsParam = searchParams.get('items');
    if (itemsParam) cart = JSON.parse(itemsParam);
  } catch (e) {}

  const [status, setStatus] = useState<'review' | 'paying' | 'paid' | 'preparing' | 'ready'>('review');
  const [pickupCode, setPickupCode] = useState('');
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

  const handlePayment = () => {
    setStatus('paying');
    setTimeout(() => {
      // Generate a random 4-character pickup code
      const code = '#' + Math.random().toString(36).substring(2, 6).toUpperCase();
      setPickupCode(code);
      setStatus('paid');
    }, 1500);
  };

  // Simulate real-time progress updates
  useEffect(() => {
    if (status === 'paid') {
      const t1 = setTimeout(() => setStatus('preparing'), 3000);
      const t2 = setTimeout(() => setStatus('ready'), 8000);
      return () => { clearTimeout(t1); clearTimeout(t2); };
    }
  }, [status]);

  if (cart.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">Your cart is empty.</p>
        <Link href={`/${shop.slug}`} className="text-coffee-light hover:underline">Go back to menu</Link>
      </main>
    );
  }

  // Live Tracker State
  if (['paid', 'preparing', 'ready'].includes(status)) {
    return (
      <main className="max-w-md mx-auto p-6 md:p-12 text-center min-h-screen flex flex-col justify-center">
        <div className="glass-panel p-8 relative overflow-hidden">
          {/* Pulsing background effect when ready */}
          {status === 'ready' && <div className="absolute inset-0 bg-green-500/20 animate-pulse"></div>}
          
          <h1 className="text-3xl font-bold mb-4 relative z-10">Live Tracker</h1>
          
          {pickupCode && (
            <div className="mb-8 relative z-10 bg-white/5 border border-white/10 rounded-xl p-4 inline-block">
              <p className="text-sm text-white/60 mb-1 uppercase tracking-widest">Your Order Code</p>
              <p className="text-5xl font-black text-amber-500 tracking-wider">{pickupCode}</p>
              <p className="text-xs text-white/40 mt-2">Show this to the barista</p>
            </div>
          )}
          
          <div className="space-y-6 relative z-10 text-left">
            <div className={`flex items-center gap-4 ${status === 'paid' ? 'text-amber-400 opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'paid' ? 'bg-amber-500 text-black' : 'bg-white/20'}`}>1</div>
              <span className="font-bold text-lg">Order Sent</span>
            </div>
            
            <div className={`flex items-center gap-4 ${status === 'preparing' ? 'text-blue-400 opacity-100' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'preparing' ? 'bg-blue-500 text-black' : 'bg-white/20'}`}>2</div>
              <span className="font-bold text-lg">Barista is Preparing</span>
            </div>

            <div className={`flex items-center gap-4 ${status === 'ready' ? 'text-green-400 opacity-100 scale-110 origin-left transition-transform' : 'opacity-50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${status === 'ready' ? 'bg-green-500 text-black' : 'bg-white/20'}`}>3</div>
              <span className="font-bold text-lg">Ready for Pickup!</span>
            </div>
          </div>
        </div>

        {status === 'ready' && (
          <a 
            href={`https://www.google.com/maps/dir/?api=1&destination=${shop.lat},${shop.lng}`}
            target="_blank" rel="noreferrer"
            className="mt-6 bg-blue-600 hover:bg-blue-500 py-4 rounded-xl font-bold flex justify-center items-center gap-2 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            Get Directions
          </a>
        )}

        <Link href="/" className="mt-6 text-white/50 hover:text-white underline">Back to Map</Link>
      </main>
    );
  }

  // Checkout State
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
        
        {/* Promo Code Input */}
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
