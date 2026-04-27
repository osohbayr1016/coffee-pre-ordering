"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const createCustomIcon = () => {
  return L.divIcon({
    className: "custom-leaflet-icon",
    html: `<div class="w-8 h-8 rounded-full border-4 shadow-lg flex items-center justify-center bg-coffee-light border-white">
            📍
          </div>`,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });
};

function LocationMarker({ position, setPosition }: { position: L.LatLng | null, setPosition: (p: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={createCustomIcon()} />
  );
}

export default function MapLocationPicker({ 
  lat, lng, onChange 
}: { 
  lat: number | null, lng: number | null, onChange: (lat: number, lng: number) => void 
}) {
  const [isMounted, setIsMounted] = useState(false);
  const defaultPosition: [number, number] = [47.9184, 106.9170]; // Ulaanbaatar center

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="w-full h-48 bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-500 rounded-lg">Loading Map...</div>;

  return (
    <div className="w-full h-64 relative z-0 rounded-lg overflow-hidden border border-white/20">
      <MapContainer 
        center={lat && lng ? [lat, lng] : defaultPosition} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        <LocationMarker 
          position={lat && lng ? new L.LatLng(lat, lng) : null} 
          setPosition={(p) => onChange(p.lat, p.lng)} 
        />
      </MapContainer>
      
      <div className="absolute top-2 left-2 z-[1000] bg-black/60 backdrop-blur text-xs font-medium px-2 py-1 rounded text-white border border-white/10 pointer-events-none">
        Click to set location
      </div>
    </div>
  );
}
