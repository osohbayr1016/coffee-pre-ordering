"use client";

import dynamic from 'next/dynamic';

// Dynamically import the Map component with SSR disabled
// Leaflet requires the window object which isn't available during server-side rendering
const DynamicMap = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-screen bg-zinc-950 flex flex-col items-center justify-center animate-pulse">
      <div className="w-12 h-12 rounded-full border-4 border-coffee-light border-t-transparent animate-spin mb-4"></div>
      <p className="text-coffee-light font-medium tracking-widest uppercase text-sm">Loading Map...</p>
    </div>
  ),
});

export default function CustomerHome() {
  return (
    <main className="w-full h-screen relative bg-zinc-950">
      {/* Floating Header */}
      <header className="absolute top-0 left-0 right-0 z-10 p-6 pointer-events-none">
        <div className="max-w-md mx-auto flex flex-col items-center">
          <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl pointer-events-auto border-white/20">
            <span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.6)] animate-pulse"></span>
            <h1 className="font-bold tracking-widest bg-gradient-to-r from-coffee-light to-amber-500 bg-clip-text text-transparent">
              ULAANBAATAR
            </h1>
          </div>
          <p className="mt-2 text-xs font-medium text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm pointer-events-auto">
            Select a shop to pre-order
          </p>
        </div>
      </header>

      {/* Full-screen Map */}
      <DynamicMap />
      
      {/* Floating Action Button (Profile/Login) */}
      <div className="absolute bottom-6 right-6 z-10 pointer-events-auto flex flex-col gap-4">
        <button 
          onClick={() => window.location.href = '/api/auth/signin'}
          className="w-14 h-14 bg-zinc-900 border border-white/10 rounded-full shadow-2xl flex items-center justify-center hover:bg-zinc-800 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </button>
      </div>
    </main>
  );
}
