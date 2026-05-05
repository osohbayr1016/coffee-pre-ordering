"use client";

import Link from "next/link";
import { api } from "@/lib/api";

export default function DashboardSignOut() {
  return (
    <Link
      href="/"
      onClick={() => api.shopPortalLogout()}
      className="block px-4 py-2 text-sm text-red-400 hover:text-red-300 transition-colors"
    >
      Sign Out
    </Link>
  );
}
