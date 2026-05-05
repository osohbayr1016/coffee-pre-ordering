"use client";

import dynamic from "next/dynamic";

const DynamicMapPicker = dynamic(() => import("@/components/MapLocationPicker"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-64 bg-zinc-900 rounded-lg animate-pulse flex items-center justify-center text-zinc-500">
      Loading Map...
    </div>
  ),
});

export default function AdminOnboardMapSection({
  lat,
  lng,
  onChange,
}: {
  lat: number | null;
  lng: number | null;
  onChange: (lat: number, lng: number) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-bold text-zinc-500 uppercase mb-1">
        Map location
      </label>
      <div className="rounded-xl overflow-hidden border border-white/10">
        <DynamicMapPicker lat={lat} lng={lng} onChange={onChange} />
      </div>
    </div>
  );
}
