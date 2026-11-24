"use client";

import { label } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import { CANONICAL_AMENITIES } from "@/types/property";
import type { PropertyFieldErrorKey } from "@/types/admin";

interface DetailsCardProps {
  area: string;
  yearBuilt: string;
  beds: number;
  baths: number;
  garage: number;
  amenities: string[];
  fieldErrors: Partial<Record<PropertyFieldErrorKey, string>>;
  onAreaChange: (value: string) => void;
  onYearBuiltChange: (value: string) => void;
  onBedsChange: (value: number) => void;
  onBathsChange: (value: number) => void;
  onGarageChange: (value: number) => void;
  onToggleAmenity: (amenity: string) => void;
}

export default function DetailsCard({
  area,
  yearBuilt,
  beds,
  baths,
  garage,
  amenities,
  fieldErrors,
  onAreaChange,
  onYearBuiltChange,
  onBedsChange,
  onBathsChange,
  onGarageChange,
  onToggleAmenity,
}: DetailsCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;

  const allAmenityOptions = Array.from(
    new Set([...CANONICAL_AMENITIES, ...amenities])
  );

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden sticky top-24">
      <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg leading-none">
            straighten
          </span>
        </div>
        <h2 className="text-lg font-bold text-nordic">{t.detailsTitle}</h2>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="group">
            <label
              htmlFor="property-area"
              className="text-xs text-gray-500 font-medium mb-1 block"
            >
              {t.areaLabel} <span className="text-red-500">*</span>
            </label>
            <input
              id="property-area"
              type="number"
              min="0"
              step="any"
              value={area}
              onChange={(e) => onAreaChange(e.target.value)}
              placeholder="0"
              className={`w-full text-left px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.area ? "border-red-400" : "border-gray-200"
                }`}
            />
            {fieldErrors.area && (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.area}</p>
            )}
          </div>

          <div className="group">
            <label
              htmlFor="property-year-built"
              className="text-xs text-gray-500 font-medium mb-1 block"
            >
              {t.yearBuiltLabel}
            </label>
            <input
              id="property-year-built"
              type="number"
              min="1800"
              max="2100"
              value={yearBuilt}
              onChange={(e) => onYearBuiltChange(e.target.value)}
              placeholder={t.yearBuiltPlaceholder}
              className={`w-full text-left px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.yearBuilt ? "border-red-400" : "border-gray-200"
                }`}
            />
            {fieldErrors.yearBuilt && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.yearBuilt}
              </p>
            )}
          </div>
        </div>

        <hr className="border-gray-100" />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-nordic flex items-center gap-2">
              <span className="material-icons text-gray-400 text-sm leading-none">
                bed
              </span>
              {t.bedroomsLabel}
            </label>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={() => onBedsChange(Math.max(0, beds - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={beds}
                aria-label={t.bedroomsLabel}
                className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => onBedsChange(Math.min(50, beds + 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-nordic flex items-center gap-2">
              <span className="material-icons text-gray-400 text-sm leading-none">
                shower
              </span>
              {t.bathroomsLabel}
            </label>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={() =>
                  onBathsChange(Math.max(0, Math.round((baths - 0.5) * 2) / 2))
                }
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={baths}
                aria-label={t.bathroomsLabel}
                className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() =>
                  onBathsChange(Math.min(50, Math.round((baths + 0.5) * 2) / 2))
                }
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-nordic flex items-center gap-2">
              <span className="material-icons text-gray-400 text-sm leading-none">
                directions_car
              </span>
              {t.parkingLabel}
            </label>
            <div className="flex items-center border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm">
              <button
                type="button"
                onClick={() => onGarageChange(Math.max(0, garage - 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-r border-gray-100 cursor-pointer"
              >
                -
              </button>
              <input
                type="text"
                readOnly
                value={garage}
                aria-label={t.parkingLabel}
                className="w-10 text-center border-none bg-transparent text-nordic p-0 focus:outline-none text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => onGarageChange(Math.min(50, garage + 1))}
                className="w-8 h-8 flex items-center justify-center hover:bg-gray-50 text-gray-600 transition-colors border-l border-gray-100 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <hr className="border-gray-100" />

        <div>
          <h3 className="font-bold mb-3 uppercase tracking-wider text-xs text-gray-500">
            {t.amenitiesHeading}
          </h3>
          <div className="space-y-2">
            {allAmenityOptions.map((amenity) => {
              const checked = amenities.includes(amenity);
              return (
                <label
                  key={amenity}
                  className="flex items-center gap-2.5 cursor-pointer group"
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleAmenity(amenity)}
                    className="w-4 h-4 accent-mosque text-mosque border-gray-300 rounded focus:ring-mosque cursor-pointer"
                  />
                  <span className="text-sm text-gray-700 group-hover:text-nordic transition-colors">
                    {label(dict.amenities, amenity)}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
