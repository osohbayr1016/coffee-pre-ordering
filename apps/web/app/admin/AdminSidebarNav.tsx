"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/admin', label: 'Platform Metrics', icon: '📊' },
    { href: '/admin/shops', label: 'Shop Directory', icon: '🏪' },
    { href: '/admin/marketing', label: 'Marketing & Promos', icon: '🎯' },
    { href: '/admin/heatmaps', label: 'Demand Heatmaps', icon: '🔥' },
    { href: '/admin/payouts', label: 'Payout Reports', icon: '💸' },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden group flex items-center gap-3 ${
              isActive 
                ? 'bg-amber-500/10 text-amber-500 font-bold border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.1)]' 
                : 'text-zinc-400 hover:text-white border border-transparent'
            }`}
          >
            {/* Sliding hover effect for non-active links */}
            {!isActive && (
              <div className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0 rounded-xl"></div>
            )}
            <span className="relative z-10 text-lg opacity-80">{link.icon}</span>
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
