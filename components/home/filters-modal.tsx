"use client";

import { useEffect, useRef, useState } from "react";
import { countMatchingProperties } from "@/lib/properties";
import { ListingType, PropertyFilters } from "@/types/property";

const MAX_SLIDER_PRICE = 6500000;
const PRICE_STEP = 50000;

const PROPERTY_TYPE_OPTIONS = [
  "Any Type",
  "House",
  "Apartment",
  "Villa",
  "Penthouse",
  "Condo",
  "Townhouse",
];

const AMENITY_OPTIONS = [
  { label: "Swimming Pool", icon: "pool" },
  { label: "Gym", icon: "fitness_center" },
  { label: "Parking", icon: "local_parking" },
  { label: "Air Conditioning", icon: "ac_unit" },
  { label: "High-speed Wifi", icon: "wifi" },
  { label: "Patio / Terrace", icon: "deck" },
];

interface FiltersModalProps {
  onClose: () => void;
  initialFilters: PropertyFilters;
  onApply: (filters: PropertyFilters) => void;
}

function formatNumberWithCommas(value: number): string {
  return value.toLocaleString("en-US");
}

function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const formatted = Number.isInteger(millions)
      ? millions.toString()
      : millions.toFixed(1).replace(/\.0$/, "");
    return `$${formatted}M`;
  }
  if (value >= 1_000) {
    return `$${Math.round(value / 1_000)}K`;
  }
  return `$${value}`;
}

function parsePriceInput(raw: string): number {
  const digits = raw.replace(/[^0-9]/g, "");
  if (!digits) return 0;
  return parseInt(digits, 10) || 0;
}

export default function FiltersModal({
  onClose,
  initialFilters,
  onApply,
}: FiltersModalProps) {
  const [location, setLocation] = useState(initialFilters.q ?? "");
  const [minPrice, setMinPrice] = useState<number>(
    initialFilters.minPrice ?? 0
  );
  const [maxPrice, setMaxPrice] = useState<number>(
    initialFilters.maxPrice ?? MAX_SLIDER_PRICE
  );
  const [minPriceText, setMinPriceText] = useState<string>(
    formatNumberWithCommas(initialFilters.minPrice ?? 0)
  );
  const [maxPriceText, setMaxPriceText] = useState<string>(
    formatNumberWithCommas(initialFilters.maxPrice ?? MAX_SLIDER_PRICE)
  );
  const [propertyType, setPropertyType] = useState<string>(() => {
    if (!initialFilters.type || initialFilters.type.toLowerCase() === "all") {
      return "Any Type";
    }
    const matched = PROPERTY_TYPE_OPTIONS.find(
      (opt) => opt.toLowerCase() === initialFilters.type?.toLowerCase()
    );
    return matched ?? "Any Type";
  });
  const [beds, setBeds] = useState<number>(initialFilters.beds ?? 0);
  const [baths, setBaths] = useState<number>(initialFilters.baths ?? 0);
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>(
    initialFilters.amenities ?? []
  );
  const [matchingCount, setMatchingCount] = useState<number | null>(null);

  const trackRef = useRef<HTMLDivElement>(null);
  const activeThumbRef = useRef<"min" | "max" | null>(null);

  // Lock body scroll and listen for Escape key when open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  // Live count of matching homes in Supabase
  useEffect(() => {
    let cancelled = false;

    const timer = setTimeout(async () => {
      const effectiveFilters: PropertyFilters = {
        q: location.trim() || undefined,
        type: propertyType !== "Any Type" ? propertyType : undefined,
        listingType: initialFilters.listingType as ListingType | undefined,
        minPrice: minPrice > 0 ? minPrice : undefined,
        maxPrice: maxPrice < MAX_SLIDER_PRICE ? maxPrice : undefined,
        beds: beds > 0 ? beds : undefined,
        baths: baths > 0 ? baths : undefined,
        amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      };

      const count = await countMatchingProperties(effectiveFilters);
      if (!cancelled) {
        setMatchingCount(count);
      }
    }, 150);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    location,
    propertyType,
    minPrice,
    maxPrice,
    beds,
    baths,
    selectedAmenities,
    initialFilters.listingType,
  ]);

  // Pointer drag handling for the custom dual range slider
  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (!activeThumbRef.current || !trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const ratio = Math.min(
        1,
        Math.max(0, (event.clientX - rect.left) / rect.width)
      );
      const steppedValue =
        Math.round((ratio * MAX_SLIDER_PRICE) / PRICE_STEP) * PRICE_STEP;

      if (activeThumbRef.current === "min") {
        const clampedMin = Math.min(steppedValue, maxPrice - PRICE_STEP);
        const validMin = Math.max(0, clampedMin);
        setMinPrice(validMin);
        setMinPriceText(formatNumberWithCommas(validMin));
      } else {
        const clampedMax = Math.max(steppedValue, minPrice + PRICE_STEP);
        const validMax = Math.min(MAX_SLIDER_PRICE, clampedMax);
        setMaxPrice(validMax);
        setMaxPriceText(formatNumberWithCommas(validMax));
      }
    };

    const handlePointerUp = () => {
      activeThumbRef.current = null;
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [minPrice, maxPrice]);

  const minPercent = Math.min(
    100,
    Math.max(0, (minPrice / MAX_SLIDER_PRICE) * 100)
  );
  const maxPercent = Math.min(
    100,
    Math.max(minPercent, (maxPrice / MAX_SLIDER_PRICE) * 100)
  );

  const handleMinInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePriceInput(e.target.value);
    const clamped = Math.min(parsed, maxPrice);
    setMinPrice(clamped);
    setMinPriceText(
      parsed === 0 && e.target.value === ""
        ? ""
        : formatNumberWithCommas(clamped)
    );
  };

  const handleMaxInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parsePriceInput(e.target.value);
    setMaxPrice(parsed);
    setMaxPriceText(
      parsed === 0 && e.target.value === ""
        ? ""
        : formatNumberWithCommas(parsed)
    );
  };

  const handleMinInputBlur = () => {
    setMinPriceText(formatNumberWithCommas(minPrice));
  };

  const handleMaxInputBlur = () => {
    const validMax = Math.max(minPrice, maxPrice || MAX_SLIDER_PRICE);
    setMaxPrice(validMax);
    setMaxPriceText(formatNumberWithCommas(validMax));
  };

  const toggleAmenity = (amenityLabel: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenityLabel)
        ? prev.filter((item) => item !== amenityLabel)
        : [...prev, amenityLabel]
    );
  };

  const handleClearAll = () => {
    setLocation("");
    setMinPrice(0);
    setMaxPrice(MAX_SLIDER_PRICE);
    setMinPriceText(formatNumberWithCommas(0));
    setMaxPriceText(formatNumberWithCommas(MAX_SLIDER_PRICE));
    setPropertyType("Any Type");
    setBeds(0);
    setBaths(0);
    setSelectedAmenities([]);
  };

  const handleApply = () => {
    onApply({
      q: location.trim() || undefined,
      type: propertyType !== "Any Type" ? propertyType : undefined,
      listingType: initialFilters.listingType,
      minPrice: minPrice > 0 ? minPrice : undefined,
      maxPrice: maxPrice < MAX_SLIDER_PRICE ? maxPrice : undefined,
      beds: beds > 0 ? beds : undefined,
      baths: baths > 0 ? baths : undefined,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
      page: 1,
    });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="filters-modal-title"
    >
      {/* Modal Overlay using Nordic (#19322F) backdrop */}
      <div
        className="fixed inset-0 bg-[#19322F]/45 backdrop-blur-sm z-10 transition-opacity"
        onClick={onClose}
      />

      {/* Main Modal Container */}
      <div className="relative z-20 w-full max-w-2xl bg-white rounded-2xl shadow-[0_25px_70px_-15px_rgba(25,50,47,0.25)] border border-[#19322F]/10 overflow-hidden flex flex-col max-h-[90vh] text-left">
        {/* Header */}
        <header className="px-8 py-6 border-b border-[#19322F]/10 flex justify-between items-center bg-white sticky top-0 z-30">
          <h2
            id="filters-modal-title"
            className="text-2xl font-semibold tracking-tight text-[#19322F]"
          >
            Filters
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close filters modal"
            className="p-2 rounded-full hover:bg-[#EEF6F6] transition-colors text-[#5C706D] hover:text-[#19322F] flex items-center justify-center"
          >
            <span className="material-icons">close</span>
          </button>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto hide-scroll p-8 space-y-10">
          {/* Section 1: Location */}
          <section>
            <label
              htmlFor="filter-location-input"
              className="block text-xs font-semibold text-[#5C706D] uppercase tracking-wider mb-3"
            >
              Location
            </label>
            <div className="relative group">
              <span className="material-icons absolute left-4 top-3.5 text-[#5C706D]/70 group-focus-within:text-[#006655] transition-colors">
                location_on
              </span>
              <input
                id="filter-location-input"
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="City, neighborhood, or address"
                className="w-full pl-12 pr-4 py-3 bg-[#EEF6F6] border border-transparent rounded-lg text-[#19322F] placeholder-[#5C706D]/60 focus:ring-2 focus:ring-[#006655] focus:border-[#006655]/30 focus:bg-white transition-all shadow-sm outline-none"
              />
            </div>
          </section>

          {/* Section 2: Price Range */}
          <section>
            <div className="flex justify-between items-end mb-4">
              <label className="block text-xs font-semibold text-[#5C706D] uppercase tracking-wider">
                Price Range
              </label>
              <span className="text-sm font-semibold text-[#006655]">
                {formatCompactCurrency(minPrice)} –{" "}
                {maxPrice >= MAX_SLIDER_PRICE
                  ? `${formatCompactCurrency(MAX_SLIDER_PRICE)}+`
                  : formatCompactCurrency(maxPrice)}
              </span>
            </div>

            <div className="relative h-12 flex items-center mb-6 px-2 select-none">
              <div
                ref={trackRef}
                className="relative w-full h-1 bg-[#19322F]/10 rounded-full"
              >
                <div
                  className="absolute h-full bg-[#006655] rounded-full"
                  style={{
                    left: `${minPercent}%`,
                    width: `${Math.max(0, maxPercent - minPercent)}%`,
                  }}
                />

                {/* Min Handle */}
                <button
                  type="button"
                  aria-label="Minimum price handle"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    activeThumbRef.current = "min";
                  }}
                  style={{ left: `${minPercent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[#006655] rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10 focus:outline-none focus:ring-2 focus:ring-[#006655]/40"
                />

                {/* Max Handle */}
                <button
                  type="button"
                  aria-label="Maximum price handle"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    activeThumbRef.current = "max";
                  }}
                  style={{ left: `${maxPercent}%` }}
                  className="absolute top-1/2 -translate-y-1/2 w-6 h-6 bg-white border-2 border-[#006655] rounded-full shadow-md cursor-pointer hover:scale-110 transition-transform -ml-3 z-10 focus:outline-none focus:ring-2 focus:ring-[#006655]/40"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#EEF6F6] p-3 rounded-lg border border-transparent focus-within:border-[#006655]/40 focus-within:bg-white transition-all">
                <label
                  htmlFor="filter-min-price"
                  className="block text-[10px] text-[#5C706D] uppercase font-semibold mb-1"
                >
                  Min Price
                </label>
                <div className="flex items-center">
                  <span className="text-[#5C706D] mr-1">$</span>
                  <input
                    id="filter-min-price"
                    type="text"
                    inputMode="numeric"
                    value={minPriceText}
                    onChange={handleMinInputChange}
                    onBlur={handleMinInputBlur}
                    className="w-full bg-transparent border-0 p-0 text-[#19322F] font-medium focus:ring-0 focus:outline-none text-sm"
                  />
                </div>
              </div>

              <div className="bg-[#EEF6F6] p-3 rounded-lg border border-transparent focus-within:border-[#006655]/40 focus-within:bg-white transition-all">
                <label
                  htmlFor="filter-max-price"
                  className="block text-[10px] text-[#5C706D] uppercase font-semibold mb-1"
                >
                  Max Price
                </label>
                <div className="flex items-center">
                  <span className="text-[#5C706D] mr-1">$</span>
                  <input
                    id="filter-max-price"
                    type="text"
                    inputMode="numeric"
                    value={maxPriceText}
                    onChange={handleMaxInputChange}
                    onBlur={handleMaxInputBlur}
                    className="w-full bg-transparent border-0 p-0 text-[#19322F] font-medium focus:ring-0 focus:outline-none text-sm"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 3: Property Details */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Property Type */}
            <div className="space-y-3">
              <label
                htmlFor="filter-property-type"
                className="block text-xs font-semibold text-[#5C706D] uppercase tracking-wider"
              >
                Property Type
              </label>
              <div className="relative">
                <select
                  id="filter-property-type"
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full bg-[#EEF6F6] border border-transparent rounded-lg py-3 pl-4 pr-10 text-[#19322F] appearance-none focus:ring-2 focus:ring-[#006655] focus:border-[#006655]/30 focus:bg-white focus:outline-none cursor-pointer transition-all"
                >
                  {PROPERTY_TYPE_OPTIONS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
                <span className="material-icons absolute right-3 top-3 text-[#5C706D] pointer-events-none">
                  expand_more
                </span>
              </div>
            </div>

            {/* Rooms */}
            <div className="space-y-4">
              {/* Beds */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#19322F]">
                  Bedrooms
                </span>
                <div className="flex items-center space-x-3 bg-[#EEF6F6] border border-[#19322F]/5 rounded-full p-1">
                  <button
                    type="button"
                    aria-label="Decrease bedrooms"
                    disabled={beds <= 0}
                    onClick={() => setBeds((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#5C706D] hover:text-[#006655] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-7 text-center text-[#19322F]">
                    {beds > 0 ? `${beds}+` : "Any"}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase bedrooms"
                    onClick={() => setBeds((prev) => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#006655] hover:bg-[#006655] hover:text-white transition-colors"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>

              {/* Baths */}
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-[#19322F]">
                  Bathrooms
                </span>
                <div className="flex items-center space-x-3 bg-[#EEF6F6] border border-[#19322F]/5 rounded-full p-1">
                  <button
                    type="button"
                    aria-label="Decrease bathrooms"
                    disabled={baths <= 0}
                    onClick={() => setBaths((prev) => Math.max(0, prev - 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#5C706D] hover:text-[#006655] disabled:opacity-40 transition-colors"
                  >
                    <span className="material-icons text-base">remove</span>
                  </button>
                  <span className="text-sm font-semibold w-7 text-center text-[#19322F]">
                    {baths > 0 ? `${baths}+` : "Any"}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase bathrooms"
                    onClick={() => setBaths((prev) => Math.min(6, prev + 1))}
                    className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-[#006655] hover:bg-[#006655] hover:text-white transition-colors"
                  >
                    <span className="material-icons text-base">add</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Amenities */}
          <section>
            <label className="block text-xs font-semibold text-[#5C706D] uppercase tracking-wider mb-4">
              Amenities &amp; Features
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {AMENITY_OPTIONS.map((amenity) => {
                const isSelected = selectedAmenities.includes(amenity.label);

                return (
                  <label
                    key={amenity.label}
                    className="cursor-pointer group relative"
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleAmenity(amenity.label)}
                      className="peer sr-only"
                    />
                    <div
                      className={
                        isSelected
                          ? "h-full px-4 py-3 rounded-lg border border-[#006655] bg-[#D9ECC8]/45 text-[#006655] font-medium text-sm flex items-center justify-center gap-2 transition-all hover:bg-[#D9ECC8]/65"
                          : "h-full px-4 py-3 rounded-lg border border-[#19322F]/10 bg-white text-[#5C706D] text-sm flex items-center justify-center gap-2 transition-all hover:border-[#006655]/40 hover:text-[#19322F] hover:bg-[#EEF6F6]/60"
                      }
                    >
                      <span
                        className={`material-icons text-lg transition-colors ${
                          isSelected
                            ? "text-[#006655]"
                            : "text-[#5C706D]/70 group-hover:text-[#006655]"
                        }`}
                      >
                        {amenity.icon}
                      </span>
                      {amenity.label}
                    </div>
                    {isSelected && (
                      <div className="absolute top-2 right-2 w-2 h-2 bg-[#006655] rounded-full opacity-100 transition-opacity" />
                    )}
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="bg-white border-t border-[#19322F]/10 px-8 py-6 sticky bottom-0 z-30 flex items-center justify-between">
          <button
            type="button"
            onClick={handleClearAll}
            className="text-sm font-medium text-[#5C706D] hover:text-[#19322F] transition-colors underline decoration-[#5C706D]/40 hover:decoration-[#19322F] underline-offset-4"
          >
            Clear all filters
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="bg-[#006655] hover:bg-[#19322F] text-white px-8 py-3 rounded-lg font-medium shadow-lg shadow-[#006655]/25 hover:shadow-[#19322F]/25 transition-all flex items-center gap-2 transform active:scale-95"
          >
            {matchingCount === null
              ? "Show Homes"
              : `Show ${matchingCount} ${
                  matchingCount === 1 ? "Home" : "Homes"
                }`}
            <span className="material-icons text-sm">arrow_forward</span>
          </button>
        </footer>
      </div>
    </div>
  );
}
