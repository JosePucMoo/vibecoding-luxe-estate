"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/i18n/i18n-provider";
import type { PropertyFieldErrorKey } from "@/types/admin";

const LocationMapPicker = dynamic(() => import("./location-map-picker"), {
  ssr: false,
  loading: () => (
    <div className="relative h-48 w-full rounded-lg overflow-hidden bg-gray-100 border border-gray-200 animate-pulse flex items-center justify-center">
      <span className="material-icons text-mosque/60 text-2xl leading-none">
        map
      </span>
    </div>
  ),
});

interface LocationCardProps {
  location: string;
  latitude: string;
  longitude: string;
  fieldErrors: Partial<Record<PropertyFieldErrorKey, string>>;
  onLocationChange: (value: string) => void;
  onLatitudeChange: (value: string) => void;
  onLongitudeChange: (value: string) => void;
  onCoordinatesPick: (lat: number, lng: number) => void;
}

export default function LocationCard({
  location,
  latitude,
  longitude,
  fieldErrors,
  onLocationChange,
  onLatitudeChange,
  onLongitudeChange,
  onCoordinatesPick,
}: LocationCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;

  const parsedLat = parseFloat(latitude);
  const parsedLng = parseFloat(longitude);
  const coordError = fieldErrors.latitude ?? fieldErrors.longitude;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg leading-none">place</span>
        </div>
        <h2 className="text-lg font-bold text-nordic">{t.locationTitle}</h2>
      </div>

      <div className="p-6 space-y-4">
        <div>
          <label
            htmlFor="property-location"
            className="block text-sm font-medium text-nordic mb-1.5"
          >
            {t.addressLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="property-location"
            type="text"
            value={location}
            onChange={(e) => onLocationChange(e.target.value)}
            placeholder={t.addressPlaceholder}
            className={`w-full px-4 py-2.5 rounded-md border bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.location ? "border-red-400" : "border-gray-200"
              }`}
          />
          {fieldErrors.location && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.location}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label
              htmlFor="property-latitude"
              className="block text-xs text-gray-500 font-medium mb-1"
            >
              {t.latitudeLabel}
            </label>
            <input
              id="property-latitude"
              type="number"
              step="any"
              value={latitude}
              onChange={(e) => onLatitudeChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.latitude ? "border-red-400" : "border-gray-200"
                }`}
            />
          </div>
          <div>
            <label
              htmlFor="property-longitude"
              className="block text-xs text-gray-500 font-medium mb-1"
            >
              {t.longitudeLabel}
            </label>
            <input
              id="property-longitude"
              type="number"
              step="any"
              value={longitude}
              onChange={(e) => onLongitudeChange(e.target.value)}
              className={`w-full px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.longitude ? "border-red-400" : "border-gray-200"
                }`}
            />
          </div>
        </div>
        {coordError && (
          <p className="text-xs text-red-600">{coordError}</p>
        )}

        <LocationMapPicker
          latitude={Number.isFinite(parsedLat) ? parsedLat : 37.4419}
          longitude={Number.isFinite(parsedLng) ? parsedLng : -122.143}
          previewLabel={t.mapPreviewBadge}
          onSelectCoordinates={onCoordinatesPick}
        />
        <p className="text-[11px] text-gray-400">{t.mapClickHint}</p>
      </div>
    </div>
  );
}
