"use client";

import { label, format } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";
import {
  PROPERTY_TYPES,
  type ListingType,
  type PropertyStatus,
  type PropertyType,
} from "@/types/property";
import type { PropertyFieldErrorKey } from "@/types/admin";

interface BasicInfoCardProps {
  title: string;
  slug: string;
  priceValue: string;
  listingType: ListingType;
  propertyType: PropertyType;
  status: PropertyStatus;
  estimatedPayment: string;
  badgesText: string;
  isFeatured: boolean;
  featuredBadge: string;
  fieldErrors: Partial<Record<PropertyFieldErrorKey, string>>;
  onTitleChange: (value: string) => void;
  onSlugChange: (value: string) => void;
  onPriceChange: (value: string) => void;
  onListingTypeChange: (value: ListingType) => void;
  onPropertyTypeChange: (value: PropertyType) => void;
  onStatusChange: (value: PropertyStatus) => void;
  onEstimatedPaymentChange: (value: string) => void;
  onBadgesChange: (value: string) => void;
  onIsFeaturedChange: (checked: boolean) => void;
  onFeaturedBadgeChange: (value: string) => void;
}

function ChevronDownIcon() {
  return (
    <span
      aria-hidden="true"
      className="material-icons pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 z-10 text-gray-500 leading-none select-none"
      style={{ fontSize: "20px" }}
    >
      expand_more
    </span>
  );
}

export default function BasicInfoCard({
  title,
  slug,
  priceValue,
  listingType,
  propertyType,
  status,
  estimatedPayment,
  badgesText,
  isFeatured,
  featuredBadge,
  fieldErrors,
  onTitleChange,
  onSlugChange,
  onPriceChange,
  onListingTypeChange,
  onPropertyTypeChange,
  onStatusChange,
  onEstimatedPaymentChange,
  onBadgesChange,
  onIsFeaturedChange,
  onFeaturedBadgeChange,
}: BasicInfoCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;

  const labelClass = "block text-sm font-medium text-nordic mb-1.5";
  const fieldBase =
    "block w-full h-11 rounded-md border bg-white text-base font-normal text-nordic placeholder:text-gray-400 focus:outline-none focus:border-mosque focus:ring-1 focus:ring-mosque transition-all";
  const inputClass = `${fieldBase} px-4 py-2.5`;
  const selectClass = `${fieldBase} appearance-none pl-4 pr-10 py-2.5 border-gray-200 cursor-pointer`;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span
            className="material-icons text-lg leading-none"
            style={{ fontFamily: "'Material Icons'" }}
          >
            info
          </span>
        </div>
        <h2 className="text-xl font-bold text-nordic">{t.basicInfoTitle}</h2>
      </div>

      <div className="p-8 space-y-6">
        {/* Row 1: Property Title */}
        <div>
          <label htmlFor="property-title" className={labelClass}>
            {t.propertyTitle} <span className="text-red-500">*</span>
          </label>
          <input
            id="property-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t.propertyTitlePlaceholder}
            className={`${inputClass} ${
              fieldErrors.title ? "border-red-400" : "border-gray-200"
            }`}
          />
          {fieldErrors.title && (
            <p className="mt-1.5 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        {/* Row 2: Price, Listing Type, Property Type */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label htmlFor="property-price" className={labelClass}>
              {t.priceLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                id="property-price"
                type="number"
                min="0"
                step="any"
                value={priceValue}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder={t.pricePlaceholder}
                className={`${fieldBase} no-spinner pl-8 pr-4 py-2.5 ${
                  fieldErrors.priceValue ? "border-red-400" : "border-gray-200"
                }`}
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 z-10 text-gray-500 text-sm font-medium leading-none select-none"
              >
                $
              </span>
            </div>
            {fieldErrors.priceValue && (
              <p className="mt-1.5 text-xs text-red-600">
                {fieldErrors.priceValue}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="property-listing-type" className={labelClass}>
              {t.listingTypeLabel}
            </label>
            <div className="relative">
              <select
                id="property-listing-type"
                value={listingType}
                onChange={(e) =>
                  onListingTypeChange(e.target.value as ListingType)
                }
                className={selectClass}
              >
                <option value="FOR SALE">{t.listingForSale}</option>
                <option value="FOR RENT">{t.listingForRent}</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div>
            <label htmlFor="property-type" className={labelClass}>
              {t.propertyTypeLabel}
            </label>
            <div className="relative">
              <select
                id="property-type"
                value={propertyType}
                onChange={(e) =>
                  onPropertyTypeChange(e.target.value as PropertyType)
                }
                className={selectClass}
              >
                {PROPERTY_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {label(dict.propertyTypes, type)}
                  </option>
                ))}
              </select>
              <ChevronDownIcon />
            </div>
          </div>
        </div>

        {/* Row 3: URL Slug, Status, Estimated Payment */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100">
          <div>
            <label htmlFor="property-slug" className={labelClass}>
              {t.slugLabel} <span className="text-red-500">*</span>
            </label>
            <input
              id="property-slug"
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder={t.slugPlaceholder}
              className={`${inputClass} ${
                fieldErrors.slug ? "border-red-400" : "border-gray-200"
              }`}
            />
            {fieldErrors.slug ? (
              <p className="mt-1.5 text-xs text-red-600">{fieldErrors.slug}</p>
            ) : (
              <p className="mt-1.5 text-xs text-gray-400 truncate">
                {format(t.slugHint, { slug: slug || "..." })}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="property-status" className={labelClass}>
              {t.statusLabel}
            </label>
            <div className="relative">
              <select
                id="property-status"
                value={status}
                onChange={(e) =>
                  onStatusChange(e.target.value as PropertyStatus)
                }
                className={selectClass}
              >
                <option value="published">{t.statusPublished}</option>
                <option value="draft">{t.statusDraft}</option>
                <option value="sold">{t.statusSold}</option>
              </select>
              <ChevronDownIcon />
            </div>
          </div>

          <div>
            <label htmlFor="property-estimated-payment" className={labelClass}>
              {t.estimatedPaymentLabel}
            </label>
            <input
              id="property-estimated-payment"
              type="text"
              value={estimatedPayment}
              onChange={(e) => onEstimatedPaymentChange(e.target.value)}
              placeholder={t.estimatedPaymentPlaceholder}
              className={`${inputClass} border-gray-200`}
            />
          </div>
        </div>

        {/* Row 4: Badges & Featured Collection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label htmlFor="property-badges" className={labelClass}>
              {t.badgesLabel}
            </label>
            <input
              id="property-badges"
              type="text"
              value={badgesText}
              onChange={(e) => onBadgesChange(e.target.value)}
              placeholder={t.badgesPlaceholder}
              className={`${inputClass} border-gray-200`}
            />
          </div>

          <div>
            <span className={labelClass}>{t.featuredBadgeLabel}</span>
            <label className="w-full h-11 px-4 rounded-md border border-gray-200 bg-white hover:border-mosque/50 flex items-center gap-3 cursor-pointer transition-all select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => onIsFeaturedChange(e.target.checked)}
                className="w-4 h-4 accent-mosque text-mosque border-gray-300 rounded focus:ring-mosque cursor-pointer"
              />
              <span className="text-base font-normal text-nordic truncate">
                {t.isFeaturedLabel}
              </span>
            </label>

            {isFeatured && (
              <div className="mt-3">
                <input
                  id="property-featured-badge"
                  type="text"
                  value={featuredBadge}
                  onChange={(e) => onFeaturedBadgeChange(e.target.value)}
                  placeholder={t.featuredBadgePlaceholder}
                  className={`${inputClass} border-gray-200`}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
