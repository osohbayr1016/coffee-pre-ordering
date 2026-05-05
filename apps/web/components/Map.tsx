"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import { api, ensureCustomerSession } from "@/lib/api";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Haversine distance formula (returns distance in km)
function getDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

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

const createUserIcon = () => {
  return L.divIcon({
    className: "custom-user-icon",
    html: `<div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-[0_0_15px_rgba(59,130,246,0.8)] animate-pulse"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

// Component to dynamically update map center
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.flyTo(center, 15, { duration: 1.5 });
  }, [center, map]);
  return null;
}

export default function Map() {
  const [isMounted, setIsMounted] = useState(false);
  const [shops, setShops] = useState<any[]>([]);
  const [userPos, setUserPos] = useState<[number, number] | null>(null);
  
  // 1-Click Reorder State
  const [recentOrder, setRecentOrder] = useState<any>(null);
  const [isReordering, setIsReordering] = useState(false);
  const router = useRouter();

  // Ulaanbaatar center coordinates (default)
  const defaultPosition: [number, number] = [47.9184, 106.9170];

  useEffect(() => {
    setIsMounted(true);

    void (async () => {
      await ensureCustomerSession().catch(() => {});

      api
        .getShops()
        .then((data) => {
          setShops(data);
        })
        .catch((err) => console.error("Failed to load map shops:", err));

      api
        .getRecentOrder()
        .then((order) => {
          if (order && !order.error) {
            setRecentOrder(order);
          }
        })
        .catch(() => console.log("No recent order found"));
    })();

    // Request Geolocation
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserPos([position.coords.latitude, position.coords.longitude]);
        },
        (error) => {
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  }, []);

  const handleReorder = async () => {
    if (!recentOrder) return;
    setIsReordering(true);
    try {
      const newOrder = await api.reorder(recentOrder.id);
      router.push(`/orders/tracker/?id=${newOrder.id}`); 
    } catch (err) {
      console.error(err);
      alert("Failed to place 1-click order.");
    } finally {
      setIsReordering(false);
    }
  };

  // Sort shops by distance if we have user position
  const sortedShops = [...shops].map(shop => {
    if (!shop.lat || !shop.lng || !userPos) return { ...shop, distance: Infinity };
    return { ...shop, distance: getDistance(userPos[0], userPos[1], shop.lat, shop.lng) };
  }).sort((a, b) => a.distance - b.distance);

  const closestShops = userPos ? sortedShops.filter(s => s.distance < Infinity).slice(0, 5) : [];

  // Profile State
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [allergyText, setAllergyText] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    void ensureCustomerSession()
      .then(() => api.getProfile())
      .then((user) => {
        if (user && user.allergy_profile) {
          setAllergyText(user.allergy_profile);
        }
      })
      .catch((err) => console.log("Failed to load profile", err));
  }, []);

  const handleSaveProfile = async () => {
    setIsSavingProfile(true);
    try {
      await api.updateProfile({ allergy_profile: allergyText });
      alert("✅ Profile saved! Shops will see your preferences.");
      setIsProfileOpen(false);
    } catch (err) {
      console.error(err);
      alert("Failed to save profile");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (!isMounted) return <div className="w-full h-full bg-zinc-900 animate-pulse flex items-center justify-center text-zinc-500">Loading Map...</div>;

  return (
    <div className="w-full h-full relative z-0">
      <MapContainer 
        center={defaultPosition} 
        zoom={14} 
        scrollWheelZoom={true} 
        className="w-full h-full"
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        
        {userPos && <MapUpdater center={userPos} />}
        {userPos && <Marker position={userPos} icon={createUserIcon()} />}

        {shops.map((shop) => (
          shop.lat && shop.lng ? (
            <Marker 
              key={shop.id} 
              position={[shop.lat, shop.lng]}
              icon={createCustomIcon(shop.is_open)}
            >
              <Popup className="custom-popup">
                <div className="p-0 m-0 w-48 overflow-hidden rounded-xl bg-zinc-900 border border-white/10 text-white shadow-2xl">
                  <div className="w-full h-24 bg-zinc-800 flex items-center justify-center text-3xl">☕</div>
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
          ) : null
        ))}
      </MapContainer>
      
      {/* 1-Tap Reorder "The Usual" Widget */}
      {recentOrder && (
        <div className="absolute top-24 right-6 z-[1000] pointer-events-auto max-w-[200px]">
          <div className="glass-panel p-4 border border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.15)] relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-400 to-orange-500"></div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-amber-500 mb-1">Your Routine</p>
            <p className="text-sm font-bold text-white leading-tight mb-1 truncate">
              {recentOrder.items?.[0]?.name || "Your last order"}
            </p>
            <p className="text-xs text-white/50 mb-3 truncate">@ {recentOrder.shop_name}</p>
            <button 
              onClick={handleReorder}
              disabled={isReordering}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black py-2 rounded font-bold text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isReordering ? 'Ordering...' : '1-Tap Reorder'}
              {!isReordering && <span>⚡</span>}
            </button>
          </div>
        </div>
      )}

      {/* Closest Shops Drawer */}
      {userPos && closestShops.length > 0 && (
        <div className="absolute bottom-24 left-0 right-0 z-[1000] pointer-events-none px-6">
          <div className="max-w-md mx-auto pointer-events-auto">
            <h3 className="text-sm font-bold tracking-widest text-white/80 uppercase mb-3 shadow-black drop-shadow-md">
              Closest to you
            </h3>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x hide-scrollbar">
              {closestShops.map(shop => (
                <Link 
                  key={shop.id} 
                  href={`/${shop.slug}`}
                  className="snap-center shrink-0 w-64 glass-panel p-4 border border-white/10 hover:border-coffee-light/50 transition-colors bg-black/80 backdrop-blur-md rounded-2xl"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-white truncate pr-2">{shop.name}</h4>
                    <span className="bg-white/10 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap">
                      {shop.distance < 1 ? `${(shop.distance * 1000).toFixed(0)}m` : `${shop.distance.toFixed(1)}km`}
                    </span>
                  </div>
                  <p className="text-xs text-white/50 truncate mb-3">{shop.address}</p>
                  <div className="flex items-center gap-2 text-xs font-medium">
                    <span className={`w-2 h-2 rounded-full ${shop.is_open ? 'bg-green-500' : 'bg-red-500'}`}></span>
                    {shop.is_open ? <span className="text-green-400">Open now</span> : <span className="text-red-400">Closed</span>}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Profile Button */}
      <div className="absolute top-24 left-6 z-[1000] pointer-events-auto">
        <button 
          onClick={() => setIsProfileOpen(true)}
          className="w-12 h-12 bg-black/50 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-xl shadow-lg hover:bg-black/70 transition-colors"
        >
          🛡️
        </button>
      </div>

      {/* Profile/Allergy Modal */}
      {isProfileOpen && (
        <div className="absolute inset-0 z-[2000] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 pointer-events-auto">
          <div className="glass-panel max-w-md w-full p-6 relative">
            <button 
              onClick={() => setIsProfileOpen(false)}
              className="absolute top-4 right-4 text-white/50 hover:text-white"
            >
              ✕
            </button>
            <h2 className="text-2xl font-bold mb-2">Taste & Allergy Profile</h2>
            <p className="text-sm text-white/60 mb-6">
              Add any severe allergies, dietary restrictions, or specific taste preferences. Shops will see this prominently when you order.
            </p>
            <textarea 
              className="w-full bg-black/50 border border-white/20 rounded-xl p-4 text-white placeholder-white/30 min-h-[120px] focus:outline-none focus:border-coffee-light resize-none mb-6"
              placeholder="e.g., Severe peanut allergy. Please ensure clean pitchers. Lactose intolerant, oat milk only."
              value={allergyText}
              onChange={(e) => setAllergyText(e.target.value)}
            />
            <button 
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {isSavingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </div>
      )}
      
      {/* Custom styles */}
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
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
