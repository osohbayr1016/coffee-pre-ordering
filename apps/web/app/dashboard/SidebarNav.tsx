"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

function normalizePath(s: string) {
  const t = s.replace(/\/+$/, "");
  return t === "" ? "/" : t;
}

const ALL_LINKS = [
  { href: "/dashboard/", label: "Overview" },
  { href: "/dashboard/orders/", label: "Live Orders" },
  { href: "/dashboard/menu/", label: "Menu Management" },
  { href: "/dashboard/settings/", label: "Shop Settings" },
];

export default function SidebarNav() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(
      typeof window !== "undefined"
        ? localStorage.getItem("bonum_dashboard_role")
        : null
    );
  }, []);

  const links = useMemo(() => {
    if (!role || role === "shop_owner") return ALL_LINKS;
    if (role === "orders_manager") {
      return ALL_LINKS.filter((l) =>
        ["/dashboard/", "/dashboard/orders/"].includes(l.href)
      );
    }
    if (role === "menu_manager") {
      return ALL_LINKS.filter((l) =>
        ["/dashboard/", "/dashboard/menu/"].includes(l.href)
      );
    }
    return ALL_LINKS;
  }, [role]);

  return (
    <nav className="flex-1 p-4 space-y-2">
      {links.map((link) => {
        const pn = normalizePath(pathname);
        const hn = normalizePath(link.href);
        const isActive =
          pn === hn || (hn !== "/dashboard" && pn.startsWith(`${hn}/`));
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-4 py-2 rounded-lg transition-all duration-300 relative overflow-hidden group ${
              isActive
                ? "bg-coffee/20 text-coffee-light font-medium"
                : "text-white/70 hover:text-white"
            }`}
          >
            {!isActive && (
              <div className="absolute inset-0 bg-white/5 transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out z-0" />
            )}
            <span className="relative z-10">{link.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
