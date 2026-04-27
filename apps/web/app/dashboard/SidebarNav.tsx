"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { href: '/dashboard', label: 'Overview' },
    { href: '/dashboard/orders', label: 'Live Orders' },
    { href: '/dashboard/menu', label: 'Menu Management' },
    { href: '/dashboard/settings', label: 'Shop Settings' },
  ];

  return (
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group ${
              isActive 
                ? 'bg-coffee/20 text-coffee-light font-medium' 
                : 'text-white/70 hover:text-white'
            }`}
          >
            {/* Sliding hover effect for non-active links */}
            {!isActive && (
              <div className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0"></div>
            )}
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
