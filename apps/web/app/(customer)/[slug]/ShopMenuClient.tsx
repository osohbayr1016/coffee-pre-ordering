"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MenuItem } from "@coffee/shared/src/types";
import { api, ensureCustomerSession } from "@/lib/api";
import ShopMenuHero from "./ShopMenuHero";
import ShopMenuItemCard, { CartLine } from "./ShopMenuItemCard";

type CoffeeShopRow = {
  id: string;
  slug: string;
  name: string;
  address: string;
  prep_time_mins: number;
  image_url?: string;
};

function normalizeMenuItem(row: Record<string, unknown>): MenuItem {
  return {
    ...(row as unknown as MenuItem),
    price: Number(row.price),
    is_available: Boolean(row.is_available),
  };
}

export default function ShopMenuClient({ slug }: { slug: string }) {
  const [shop, setShop] = useState<CoffeeShopRow | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [gone, setGone] = useState(false);
  const [cart, setCart] = useState<CartLine[]>([]);

  useEffect(() => {
    ensureCustomerSession().catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = (await api.getShopBySlug(slug)) as CoffeeShopRow;
        const rawMenu = await api.getMenu(s.id);
        if (!alive) return;
        setShop(s);
        setMenu((rawMenu as Record<string, unknown>[]).map(normalizeMenuItem));
      } catch {
        if (alive) setGone(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const defaultTemp = (item: MenuItem): "hot" | "cold" =>
    item.temp_options === "cold" ? "cold" : "hot";

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const i = prev.findIndex((x) => x.item.id === item.id);
      if (i >= 0) {
        return prev.map((x, idx) =>
          idx === i ? { ...x, qty: x.qty + 1 } : x
        );
      }
      return [...prev, { item, qty: 1, temperature: defaultTemp(item) }];
    });
  };

  const toggleDrinkTemp = (itemId: string) => {
    setCart((prev) =>
      prev.map((line) =>
        line.item.id === itemId && line.item.temp_options === "both"
          ? {
              ...line,
              temperature: line.temperature === "hot" ? "cold" : "hot",
            }
          : line
      )
    );
  };

  if (gone) return notFound();

  if (!shop) {
    return (
      <main className="max-w-4xl mx-auto min-h-screen flex items-center justify-center text-white/50">
        Loading menu…
      </main>
    );
  }

  const visible = menu.filter((m) => m.is_available);
  const heroImg =
    shop.image_url ||
    "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=800";
  const cartPayload = cart.map((c) => ({
    menu_item_id: c.item.id,
    quantity: c.qty,
    temperature: c.temperature,
  }));
  const totalItems = cart.reduce((a, c) => a + c.qty, 0);
  const totalPrice = cart.reduce((a, c) => a + c.item.price * c.qty, 0);

  return (
    <main className="max-w-4xl mx-auto min-h-screen pb-32">
      <ShopMenuHero
        name={shop.name}
        address={shop.address}
        prepMins={shop.prep_time_mins}
        imageUrl={heroImg}
      />

      <div className="p-6 md:p-8">
        <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-coffee-light" />
          Menu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {visible.map((item) => (
            <ShopMenuItemCard
              key={item.id}
              item={item}
              line={cart.find((c) => c.item.id === item.id)}
              onAdd={() => addToCart(item)}
              onToggleTemp={() => toggleDrinkTemp(item.id)}
            />
          ))}
        </div>
      </div>

      {totalItems > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-50 animate-in slide-in-from-bottom-10">
          <div className="max-w-4xl mx-auto glass-panel border-coffee/50 bg-black/80 backdrop-blur-xl p-4 flex justify-between items-center shadow-2xl shadow-coffee/20">
            <div>
              <p className="text-white/70 text-sm">Your Order</p>
              <p className="font-bold text-xl">
                {totalItems} items • ₮{totalPrice.toLocaleString()}
              </p>
            </div>
            <Link
              href={`/${shop.slug}/order/?items=${encodeURIComponent(JSON.stringify(cartPayload))}`}
              className="bg-coffee hover:bg-coffee-light text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Checkout →
            </Link>
          </div>
        </div>
      )}
    </main>
  );
}
