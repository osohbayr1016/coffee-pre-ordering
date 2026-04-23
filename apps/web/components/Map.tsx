"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { MOCK_SHOPS, MockShop } from "@/lib/mock-data";
import Link from "next/link";

// Custom icon using simple HTML so we don't worry about missing Leaflet assets
const createCustomIcon = (isOpen: boolean) => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="w-8 h-8 rounded-full border-4 shadow-lg flex items-center justify-center 
            ${isOpen ? 'bg-coffee-light border-white' : 'bg-zinc-600 border-zinc-400 opacity-70'}">
            ☕
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Ulaanbaatar center coordinates
  const position: [number, number] = [47.9184, 106.9170];

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-500">Loading Map...</div>;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        {/* Sleek Dark Mode CartoDB Map Tiles */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {MOCK_SHOPS.map((shop) => (
          <Marker 
            key={shop.id} 
            position={[shop.lat, shop.lng]}
            icon={createCustomIcon(shop.is_open)}
          >
            <Popup className="custom-popup">
              <div className="p-0 m-0 w-48 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 text-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={shop.image_url} alt={shop.name} className="w-full h-24 object-cover" />
                <div className="p-3">
                  <h3 className="font-bold text-lg leading-tight mb-1">{shop.name}</h3>
                  <p className="text-xs text-zinc-400 mb-3 truncate">{shop.address}</p>
                  
                  {shop.is_open ? (
                    <Link 
                      href={`/${shop.slug}`}
                      className="block w-full text-center bg-coffee hover:bg-coffee-light transition-colors py-2 rounded-lg text-sm font-bold shadow-md"
                    >
                      Order Now
                    </Link>
                  ) : (
                    <div className="block w-full text-center bg-zinc-800 text-zinc-500 py-2 rounded-lg text-sm font-bold">
                      Closed
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* 1-Tap Reorder "The Usual" Button */}
      <div className="absolute top-24 right-6 z-10 pointer-events-auto">
        <Link 
          href={`/gobi-coffee/order?items=${encodeURIComponent(JSON.stringify([{item: MOCK_SHOPS[0], qty: 1}]))}&promo=none`}
          className="glass-panel flex flex-col items-center p-3 hover:scale-105 transition-transform bg-amber-500/20 border-amber-500/40 shadow-xl shadow-amber-500/20"
        >
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center text-xl mb-1 shadow-inner">
            ☕
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">The Usual</span>
        </Link>
      </div>
      
      {/* Custom styles for Leaflet Popup to override their default white styles */}
      <style jsx global>{`
        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
          background: transparent !important;
          box-shadow: none !important;
        }
        .leaflet-popup-content {
          margin: 0 !important;
        }
        .leaflet-container a.leaflet-popup-close-button {
          color: white !important;
          padding: 8px !important;
          text-shadow: 0 1px 2px black !important;
        }
      `}</style>
    </div>
  );
}
