import Link from 'next/link';

import SidebarNav from './SidebarNav';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#0a0a0a]">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/10 bg-black/50 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h2 className="text-xl font-bold text-coffee-light">Shop Owner</h2>
          <p className="text-xs text-white/50 mt-1">Gobi Coffee</p>
        </div>
        
        <SidebarNav />
        
        <div className="p-4 border-t border-white/10">
          <Link href="/" className="block px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors">
            Sign Out
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden p-4 border-b border-white/10 flex justify-between items-center bg-black/50">
          <h2 className="font-bold text-coffee-light">Shop Owner</h2>
          <button className="p-2 bg-white/5 rounded">☰</button>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
