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

  const inputBase =
    "w-full text-base px-4 py-2.5 rounded-md border bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all";

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg leading-none">info</span>
        </div>
        <h2 className="text-xl font-bold text-nordic">{t.basicInfoTitle}</h2>
      </div>

      <div className="p-8 space-y-6">
        <div className="group">
          <label
            htmlFor="property-title"
            className="block text-sm font-medium text-nordic mb-1.5"
          >
            {t.propertyTitle} <span className="text-red-500">*</span>
          </label>
          <input
            id="property-title"
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={t.propertyTitlePlaceholder}
            className={`${inputBase} ${fieldErrors.title ? "border-red-400" : "border-gray-200"
              }`}
          />
          {fieldErrors.title && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.title}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label
              htmlFor="property-price"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.priceLabel} <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                $
              </span>
              <input
                id="property-price"
                type="number"
                min="0"
                step="any"
                value={priceValue}
                onChange={(e) => onPriceChange(e.target.value)}
                placeholder={t.pricePlaceholder}
                className={`w-full pl-7 pr-4 py-2.5 rounded-md border bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-base font-medium ${fieldErrors.priceValue ? "border-red-400" : "border-gray-200"
                  }`}
              />
            </div>
            {fieldErrors.priceValue && (
              <p className="mt-1 text-xs text-red-600">
                {fieldErrors.priceValue}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="property-listing-type"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.listingTypeLabel}
            </label>
            <select
              id="property-listing-type"
              value={listingType}
              onChange={(e) =>
                onListingTypeChange(e.target.value as ListingType)
              }
              className={`${inputBase} border-gray-200 cursor-pointer`}
            >
              <option value="FOR SALE">{t.listingForSale}</option>
              <option value="FOR RENT">{t.listingForRent}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="property-type"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.propertyTypeLabel}
            </label>
            <select
              id="property-type"
              value={propertyType}
              onChange={(e) =>
                onPropertyTypeChange(e.target.value as PropertyType)
              }
              className={`${inputBase} border-gray-200 cursor-pointer`}
            >
              {PROPERTY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {label(dict.propertyTypes, type)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-gray-100">
          <div>
            <label
              htmlFor="property-slug"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.slugLabel} <span className="text-red-500">*</span>
            </label>
            <input
              id="property-slug"
              type="text"
              value={slug}
              onChange={(e) => onSlugChange(e.target.value)}
              placeholder={t.slugPlaceholder}
              className={`w-full text-sm px-4 py-2.5 rounded-md border bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all ${fieldErrors.slug ? "border-red-400" : "border-gray-200"
                }`}
            />
            {fieldErrors.slug ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.slug}</p>
            ) : (
              <p className="mt-1 text-xs text-gray-400 truncate">
                {format(t.slugHint, { slug: slug || "..." })}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="property-status"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.statusLabel}
            </label>
            <select
              id="property-status"
              value={status}
              onChange={(e) => onStatusChange(e.target.value as PropertyStatus)}
              className="w-full px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm cursor-pointer"
            >
              <option value="published">{t.statusPublished}</option>
              <option value="draft">{t.statusDraft}</option>
              <option value="sold">{t.statusSold}</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="property-estimated-payment"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.estimatedPaymentLabel}
            </label>
            <input
              id="property-estimated-payment"
              type="text"
              value={estimatedPayment}
              onChange={(e) => onEstimatedPaymentChange(e.target.value)}
              placeholder={t.estimatedPaymentPlaceholder}
              className="w-full text-sm px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label
              htmlFor="property-badges"
              className="block text-sm font-medium text-nordic mb-1.5"
            >
              {t.badgesLabel}
            </label>
            <input
              id="property-badges"
              type="text"
              value={badgesText}
              onChange={(e) => onBadgesChange(e.target.value)}
              placeholder={t.badgesPlaceholder}
              className="w-full text-sm px-4 py-2.5 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all"
            />
          </div>

          <div className="space-y-3 pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer group pt-6">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => onIsFeaturedChange(e.target.checked)}
                className="w-4 h-4 accent-mosque text-mosque border-gray-300 rounded focus:ring-mosque cursor-pointer"
              />
              <span className="text-sm font-medium text-nordic group-hover:text-mosque transition-colors">
                {t.isFeaturedLabel}
              </span>
            </label>

            {isFeatured && (
              <div>
                <label
                  htmlFor="property-featured-badge"
                  className="block text-xs font-medium text-gray-500 mb-1"
                >
                  {t.featuredBadgeLabel}
                </label>
                <input
                  id="property-featured-badge"
                  type="text"
                  value={featuredBadge}
                  onChange={(e) => onFeaturedBadgeChange(e.target.value)}
                  placeholder={t.featuredBadgePlaceholder}
                  className="w-full text-sm px-3.5 py-2 rounded-md border border-gray-200 bg-white text-nordic placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
