"use client";

import Link from "next/link";

export default function ShopMenuHero({
  name,
  address,
  prepMins,
  imageUrl,
}: {
  name: string;
  address: string;
  prepMins: number;
  imageUrl: string;
}) {
  return (
    <div className="h-64 relative w-full">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col justify-end p-8">
        <Link
          href="/"
          className="text-coffee-light mb-4 flex items-center gap-2 hover:text-white transition-colors"
        >
          ← Back to Shops
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{name}</h1>
        <p className="text-white/70 flex flex-wrap items-center gap-4">
          <span>📍 {address}</span>
          <span>⏱️ ~{prepMins} mins prep</span>
        </p>
      </div>
    </div>
  );
}
