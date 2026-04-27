"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup } from "react-leaflet";
import { api } from "@/lib/api";

export default function AdminHeatMap() {
  const [isMounted, setIsMounted] = useState(false);
  const [heatmapData, setHeatmapData] = useState<any[]>([]);
  
  const position: [number, number] = [47.9184, 106.9170];

  useEffect(() => {
    setIsMounted(true);
    api.getAdminHeatmap()
      .then(setHeatmapData)
      .catch(err => console.error("Failed to load heatmap data", err));
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-500">Loading Map Engine...</div>;

  const getColor = (count: number) => {
    if (count > 500) return "#ef4444"; // red-500
    if (count > 100) return "#f97316"; // orange-500
    if (count > 0) return "#eab308"; // yellow-500
    return "#3f3f46"; // zinc-700
  };

  const getRadius = (count: number) => {
    if (count > 500) return 40;
    if (count > 100) return 25;
    if (count > 0) return 15;
    return 8;
  };

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; CARTO'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {heatmapData.map((shop) => (
          <CircleMarker 
            key={shop.id}
            center={[shop.lat, shop.lng]}
            radius={getRadius(shop.order_count)}
            pathOptions={{
              fillColor: getColor(shop.order_count),
              fillOpacity: 0.6,
              color: getColor(shop.order_count),
              weight: 2,
            }}
          >
            <Popup className="custom-popup">
              <div className="p-3 bg-zinc-900 rounded-xl border border-white/10 text-white min-w-[150px]">
                <h3 className="font-bold mb-1">{shop.name}</h3>
                <p className="text-sm text-zinc-400">Total Orders: <span className="font-bold text-white">{shop.order_count}</span></p>
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx global>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
      `}</style>
    </div>
  );
}
