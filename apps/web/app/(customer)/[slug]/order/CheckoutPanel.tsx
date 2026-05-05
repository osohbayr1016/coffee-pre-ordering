"use client";

import Link from "next/link";
import { MenuItem } from "@coffee/shared/src/types";

export type DisplayLine = {
  menu_item_id: string;
  quantity: number;
  temperature?: string;
  item: MenuItem;
};

export default function CheckoutPanel({
  shopSlug,
  lines,
  promo,
  setPromo,
  discount,
  totalPrice,
  onApplyPromo,
  onPay,
  status,
}: {
  shopSlug: string;
  lines: DisplayLine[];
  promo: string;
  setPromo: (v: string) => void;
  discount: number;
  totalPrice: number;
  onApplyPromo: () => void;
  onPay: () => void;
  status: "review" | "paying";
}) {
  return (
    <>
      <Link
        href={`/${shopSlug}/`}
        className="text-coffee-light mb-8 inline-flex items-center gap-2 hover:text-white transition-colors"
      >
        ← Back to Menu
      </Link>
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="glass-panel p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 border-b border-white/10 pb-4">
          Order Summary
        </h2>
        <div className="space-y-4 mb-6">
          {lines.map((row) => (
            <div
              key={`${row.menu_item_id}-${row.temperature ?? "x"}`}
              className="flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                <span className="bg-white/10 px-2 py-1 rounded text-sm">
                  {row.quantity}x
                </span>
                <span>
                  {row.item.name}{" "}
                  <span className="text-white/40 text-sm capitalize">
                    ({row.temperature ?? "hot"})
                  </span>
                </span>
              </div>
              <span className="text-white/80">
                ₮{(row.item.price * row.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            placeholder="Promo Code (Try: FIRSTCOFFEE50)"
            value={promo}
            onChange={(e) => setPromo(e.target.value)}
            className="flex-1 bg-black/50 border border-white/20 rounded-lg p-2 text-white focus:outline-none focus:border-coffee"
          />
          <button
            type="button"
            onClick={onApplyPromo}
            className="bg-white/10 hover:bg-white/20 px-4 rounded-lg font-medium transition-colors"
          >
            Apply
          </button>
        </div>
        <div className="border-t border-white/10 pt-4 flex justify-between items-center">
          <span className="text-lg font-bold text-white/80">Total</span>
          <div className="text-right">
            {discount > 0 && (
              <p className="text-sm text-green-400 mb-1">
                -₮{discount.toLocaleString()} promo
              </p>
            )}
            <span className="text-2xl font-bold text-coffee-light">
              ₮{totalPrice.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={onPay}
        disabled={status === "paying"}
        className="w-full bg-[#0052cc] hover:bg-[#0043a8] text-white py-4 rounded-xl font-bold text-lg transition-colors flex justify-center items-center gap-2"
      >
        {status === "paying" ? (
          <span className="animate-pulse">Processing via QPay...</span>
        ) : (
          "Pay with QPay"
        )}
      </button>
    </>
  );
}
