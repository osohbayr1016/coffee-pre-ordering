"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MenuItem } from "@coffee/shared/src/types";
import { api } from "@/lib/api";
import type { DisplayLine } from "./CheckoutPanel";

export type CoffeeShopRow = { id: string; slug: string; name: string };

type UrlCartRow = {
  menu_item_id?: string;
  quantity?: number;
  qty?: number;
  temperature?: string;
  item?: { id: string };
};

function parseCartParam(itemsParam: string | null): UrlCartRow[] {
  if (!itemsParam) return [];
  try {
    const raw = JSON.parse(itemsParam) as unknown;
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

export function useOrderCheckout(slug: string) {
  const searchParams = useSearchParams();
  const [shop, setShop] = useState<CoffeeShopRow | null>(null);
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [gone, setGone] = useState(false);
  const [loading, setLoading] = useState(true);

  const cartLines = useMemo(() => {
    const rows = parseCartParam(searchParams.get("items"));
    return rows
      .map((row) => {
        const id = row.menu_item_id ?? row.item?.id;
        const quantity = Number(row.quantity ?? row.qty ?? 1) || 1;
        if (!id) return null;
        return {
          menu_item_id: id,
          quantity: Math.min(99, Math.max(1, quantity)),
          temperature: row.temperature,
        };
      })
      .filter(Boolean) as {
      menu_item_id: string;
      quantity: number;
      temperature?: string;
    }[];
  }, [searchParams]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = (await api.getShopBySlug(slug)) as CoffeeShopRow;
        const rawMenu = await api.getMenu(s.id);
        if (!alive) return;
        setShop(s);
        setMenu(
          (rawMenu as Record<string, unknown>[]).map((row) => ({
            ...(row as unknown as MenuItem),
            price: Number(row.price),
            is_available: Boolean(row.is_available),
          }))
        );
      } catch {
        if (alive) setGone(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [slug]);

  const menuById = useMemo(() => {
    const m = new Map<string, MenuItem>();
    menu.forEach((it) => m.set(it.id, it));
    return m;
  }, [menu]);

  const displayLines: DisplayLine[] = useMemo(() => {
    return cartLines
      .map((line) => {
        const item = menuById.get(line.menu_item_id);
        return item && item.is_available ? { ...line, item } : null;
      })
      .filter(Boolean) as DisplayLine[];
  }, [cartLines, menuById]);

  return { shop, loading, gone, cartLines, displayLines };
}
