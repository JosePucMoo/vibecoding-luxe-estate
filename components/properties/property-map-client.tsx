"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface PropertyMapClientProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export default function PropertyMapClient({
  latitude,
  longitude,
  title,
  location,
}: PropertyMapClientProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container) return;

    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }

    const map = L.map(container, {
      center: [latitude, longitude],
      zoom: 14,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    mapInstanceRef.current = map;

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    const customHomeIcon = L.divIcon({
      className: "bg-transparent border-0",
      html: `<div class="w-8 h-8 bg-[#006655] rounded-full border-4 border-white shadow-lg animate-bounce flex items-center justify-center"><span class="material-icons text-white text-sm leading-none" style="font-size:14px">home</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([latitude, longitude], {
      icon: customHomeIcon,
      title,
    }).addTo(map);

    marker.bindPopup(
      `<div style="font-family: sans-serif; color: #19322F;"><strong>${title}</strong><br/><span style="font-size: 12px; color: #5C706D;">${location}</span></div>`
    );

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [latitude, longitude, title, location]);

  const externalMapUrl = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=16/${latitude}/${longitude}`;

  return (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 isolate">
      <div
        ref={mapContainerRef}
        aria-label={`Map showing location of ${title} at ${location}`}
        className="w-full h-full z-0"
      />
      <a
        href={externalMapUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute bottom-2 right-2 z-[400] bg-white/90 text-xs font-medium px-2 py-1 rounded shadow-sm text-[#19322F] hover:text-[#006655] transition-colors"
      >
        View on Map
      </a>
    </div>
  );
}
