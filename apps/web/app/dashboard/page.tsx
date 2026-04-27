"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function DashboardOverview() {
  const [metrics, setMetrics] = useState({
    is_open: false,
    completed_orders: 0,
    today_revenue: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const shopId = localStorage.getItem('bonum_shop_id') || 'shop-1';
    api.getShopMetrics(shopId)
      .then(setMetrics)
      .catch(err => console.error("Failed to load metrics:", err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className={`glass-panel p-6 border-l-4 border-coffee-light transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-white/60 text-sm font-medium mb-1">Today's Revenue</h3>
          <p className="text-3xl font-bold">₮{metrics.today_revenue.toLocaleString()}</p>
        </div>
        <div className={`glass-panel p-6 border-l-4 border-blue-500 transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-white/60 text-sm font-medium mb-1">Completed Orders</h3>
          <p className="text-3xl font-bold">{metrics.completed_orders}</p>
        </div>
        <div className={`glass-panel p-6 border-l-4 ${metrics.is_open ? 'border-green-500' : 'border-red-500'} transition-opacity duration-500 ${loading ? 'opacity-50' : 'opacity-100'}`}>
          <h3 className="text-white/60 text-sm font-medium mb-1">Shop Status</h3>
          <p className={`text-2xl font-bold ${metrics.is_open ? 'text-green-400' : 'text-red-400'}`}>
            {metrics.is_open ? 'Open' : 'Closed'}
          </p>
        </div>
      </div>
    </div>
  );
}
