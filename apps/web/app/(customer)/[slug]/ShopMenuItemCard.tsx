"use client";

import { MenuItem } from "@coffee/shared/src/types";

export type CartLine = {
  item: MenuItem;
  qty: number;
  temperature: "hot" | "cold";
};

export default function ShopMenuItemCard({
  item,
  line,
  onAdd,
  onToggleTemp,
}: {
  item: MenuItem;
  line?: CartLine;
  onAdd: () => void;
  onToggleTemp: () => void;
}) {
  const showTempToggle =
    line && item.temp_options === "both";

  return (
    <div className="glass-panel p-4 flex gap-4 group">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={
          item.image_url ||
          "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=400"
        }
        alt={item.name}
        className="w-24 h-24 rounded-xl object-cover bg-zinc-800"
      />
      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-lg leading-tight mb-1">{item.name}</h3>
          <p className="text-white/50 text-sm capitalize">{item.category}</p>
          {showTempToggle && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleTemp();
              }}
              className="mt-2 text-xs font-semibold text-coffee-light underline-offset-2 hover:underline"
            >
              {line.temperature === "hot" ? "Hot" : "Cold"} — tap to switch
            </button>
          )}
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="font-semibold text-coffee-light">
            ₮{item.price.toLocaleString()}
          </span>
          <button
            type="button"
            onClick={onAdd}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-coffee border border-white/20 flex items-center justify-center transition-colors"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
