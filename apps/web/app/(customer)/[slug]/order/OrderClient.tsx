"use client";

import Link from "next/link";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { api, ensureCustomerSession } from "@/lib/api";
import CheckoutPanel from "./CheckoutPanel";
import { useOrderCheckout } from "./useOrderCheckout";

export default function OrderClient({ slug }: { slug: string }) {
  const router = useRouter();
  const { shop, loading, gone, cartLines, displayLines } = useOrderCheckout(slug);

  const [status, setStatus] = useState<"review" | "paying">("review");
  const [promo, setPromo] = useState("");
  const [discount, setDiscount] = useState(0);

  const subtotal = displayLines.reduce(
    (acc, row) => acc + row.item.price * row.quantity,
    0
  );
  const totalPrice = Math.max(0, subtotal - discount);

  const applyPromo = () => {
    if (promo.trim().toUpperCase() === "FIRSTCOFFEE50") {
      setDiscount(Math.floor(subtotal * 0.5));
    } else {
      alert("Invalid promo code");
      setDiscount(0);
    }
  };

  const handlePayment = async () => {
    if (!shop || displayLines.length === 0) return;
    setStatus("paying");
    try {
      await ensureCustomerSession();
      const order = await api.createOrder({
        shop_id: shop.id,
        items: displayLines.map((r) => ({
          menu_item_id: r.menu_item_id,
          quantity: r.quantity,
          temperature: r.temperature,
        })),
        promo_code: discount > 0 ? promo.trim().toUpperCase() : undefined,
      });
      router.push(`/orders/tracker/?id=${order.id}`);
    } catch (err) {
      console.error(err);
      alert("Payment failed.");
      setStatus("review");
    }
  };

  if (gone) return notFound();

  if (loading || !shop) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center text-white/50">
        Loading checkout…
      </main>
    );
  }

  if (cartLines.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">Your cart is empty.</p>
        <Link
          href={`/${shop.slug}/`}
          className="text-coffee-light hover:underline"
        >
          Go back to menu
        </Link>
      </main>
    );
  }

  if (displayLines.length === 0) {
    return (
      <main className="max-w-xl mx-auto p-8 text-center min-h-screen flex flex-col items-center justify-center">
        <p className="text-white/60 mb-4">
          Cart items are unavailable or invalid.
        </p>
        <Link
          href={`/${shop.slug}/`}
          className="text-coffee-light hover:underline"
        >
          Back to menu
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-2xl mx-auto p-6 md:p-12 min-h-screen">
      <CheckoutPanel
        shopSlug={shop.slug}
        lines={displayLines}
        promo={promo}
        setPromo={setPromo}
        discount={discount}
        totalPrice={totalPrice}
        onApplyPromo={applyPromo}
        onPay={handlePayment}
        status={status}
      />
    </main>
  );
}
