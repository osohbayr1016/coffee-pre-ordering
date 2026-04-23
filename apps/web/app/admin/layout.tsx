import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-zinc-950">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-zinc-900/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xl font-bold tracking-widest text-amber-500">BONUM</h2>
          <p className="text-xs text-zinc-500 mt-1">Platform Admin</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            Platform Metrics
          </Link>
          <Link href="/admin/shops" className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            Shop Directory
          </Link>
          <Link href="/admin/subscriptions" className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            Subscriptions
          </Link>
          <Link href="/admin/marketing" className="block px-4 py-2 rounded-lg text-amber-500 bg-amber-500/10 transition-colors">
            Marketing & Promos
          </Link>
          <Link href="/admin/heatmaps" className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            Demand Heatmaps
          </Link>
          <Link href="/admin/payouts" className="block px-4 py-2 rounded-lg text-zinc-400 hover:bg-white/5 hover:text-white transition-colors">
            Payout Reports
          </Link>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <Link href="/" className="block px-4 py-2 text-sm text-red-500/70 hover:text-red-400 transition-colors">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-white/5 flex justify-between items-center bg-zinc-900/50">
          <h2 className="font-bold tracking-widest text-amber-500">BONUM</h2>
          <button className="p-2 bg-white/5 rounded">☰</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
