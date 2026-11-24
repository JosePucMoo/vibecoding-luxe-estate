"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface LocationMapPickerProps {
  latitude: number;
  longitude: number;
  previewLabel: string;
  onSelectCoordinates: (lat: number, lng: number) => void;
}

export default function LocationMapPicker({
  latitude,
  longitude,
  previewLabel,
  onSelectCoordinates,
}: LocationMapPickerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const callbackRef = useRef(onSelectCoordinates);

  useEffect(() => {
    callbackRef.current = onSelectCoordinates;
  }, [onSelectCoordinates]);

  const safeLat =
    Number.isFinite(latitude) && latitude >= -90 && latitude <= 90
      ? latitude
      : 37.4419;
  const safeLng =
    Number.isFinite(longitude) && longitude >= -180 && longitude <= 180
      ? longitude
      : -122.143;

  useEffect(() => {
    const container = containerRef.current;
    if (!container || mapRef.current) return;

    const map = L.map(container, {
      center: [safeLat, safeLng],
      zoom: 13,
      zoomControl: false,
      attributionControl: false,
      scrollWheelZoom: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
      {
        maxZoom: 19,
        subdomains: "abcd",
      }
    ).addTo(map);

    const pinIcon = L.divIcon({
      className: "bg-transparent border-0",
      html: `<div class="w-8 h-8 bg-[#006655] rounded-full border-4 border-white shadow-lg flex items-center justify-center"><span class="material-icons text-white text-sm leading-none" style="font-size:14px">place</span></div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const marker = L.marker([safeLat, safeLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const pos = marker.getLatLng();
      callbackRef.current(
        Number(pos.lat.toFixed(6)),
        Number(pos.lng.toFixed(6))
      );
    });

    map.on("click", (e: L.LeafletMouseEvent) => {
      marker.setLatLng(e.latlng);
      callbackRef.current(
        Number(e.latlng.lat.toFixed(6)),
        Number(e.latlng.lng.toFixed(6))
      );
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // Initial mount only; coordinate prop updates are synced in the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!mapRef.current || !markerRef.current) return;
    const current = markerRef.current.getLatLng();
    if (
      Math.abs(current.lat - safeLat) > 0.00001 ||
      Math.abs(current.lng - safeLng) > 0.00001
    ) {
      markerRef.current.setLatLng([safeLat, safeLng]);
      mapRef.current.panTo([safeLat, safeLng], { animate: true });
    }
  }, [safeLat, safeLng]);

  return (
    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 group isolate">
      <div ref={containerRef} className="w-full h-full z-0 cursor-crosshair" />
      <div className="absolute top-2.5 right-2.5 z-[400] pointer-events-none">
        <span className="bg-white/90 text-nordic px-3 py-1.5 rounded shadow-sm backdrop-blur-sm text-xs font-bold flex items-center gap-1">
          <span className="material-icons text-sm text-mosque leading-none">
            map
          </span>
          {previewLabel}
        </span>
      </div>
    </div>
  );
}
