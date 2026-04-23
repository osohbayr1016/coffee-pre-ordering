"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8787/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token in cookie (for middleware) and localStorage (for client API calls)
      document.cookie = `bonum_token=${data.token}; path=/; max-age=${60 * 60 * 24 * 7}`;
      localStorage.setItem('bonum_token', data.token);
      localStorage.setItem('bonum_shop_id', data.user.shopId);

      router.push('/dashboard/orders');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError(String(err));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md glass-panel p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-widest text-coffee-light mb-2">BONUM</h1>
          <p className="text-zinc-400">Shop Owner Portal</p>
        </div>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-200 p-3 rounded-lg mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-coffee-light focus:ring-1 focus:ring-coffee-light transition-all"
              placeholder="owner@gobicoffee.mn"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-coffee-light focus:ring-1 focus:ring-coffee-light transition-all"
              placeholder="••••••••"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-coffee hover:bg-coffee-light text-white font-bold py-3 rounded-lg transition-colors flex justify-center items-center"
          >
            {loading ? <span className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></span> : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-zinc-500">
          <p>Local Dev Credentials:</p>
          <p>owner@gobicoffee.mn / password123</p>
        </div>
      </div>
    </div>
  );
}
