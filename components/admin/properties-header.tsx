"use client";

import { useState } from "react";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";
import type { ListingType } from "@/types/property";
import { adminHref } from "./admin-url";

interface PropertiesHeaderProps {
  q?: string;
  listingType?: ListingType;
}

export default function PropertiesHeader({
  q,
  listingType,
}: PropertiesHeaderProps) {
  const { locale, dict } = useI18n();
  const t = dict.admin.properties;
  const hasActiveFilter = Boolean(q || listingType);
  const [showFilters, setShowFilters] = useState(hasActiveFilter);

  const basePath = localePath(locale, "/admin/properties");
  const filters: { value?: ListingType; text: string }[] = [
    { value: undefined, text: t.filterAll },
    { value: "FOR SALE", text: t.filterSale },
    { value: "FOR RENT", text: t.filterRent },
  ];

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-nordic tracking-tight">
            {t.title}
          </h1>
          <p className="text-gray-500 mt-1">{t.subtitle}</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowFilters((prev) => !prev)}
            aria-expanded={showFilters}
            className={`border px-4 py-2.5 rounded-lg text-sm font-medium transition-colors shadow-sm inline-flex items-center gap-2 cursor-pointer ${
              showFilters || hasActiveFilter
                ? "bg-hint-of-green border-mosque/20 text-mosque"
                : "bg-white border-gray-200 text-nordic hover:bg-gray-50"
            }`}
          >
            <span className="material-icons text-base leading-none">
              filter_list
            </span>
            {t.filter}
          </button>

          <button
            type="button"
            disabled
            title={dict.admin.comingSoon}
            className="bg-mosque text-white px-5 py-2.5 rounded-lg text-sm font-medium shadow-md shadow-mosque/20 inline-flex items-center gap-2 opacity-90 cursor-not-allowed"
          >
            <span className="material-icons text-base leading-none">add</span>
            {t.addProperty}
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mt-5 p-4 bg-white rounded-xl border border-mosque/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <form
            action={basePath}
            method="get"
            role="search"
            className="relative flex-1 max-w-md"
          >
            {listingType && (
              <input type="hidden" name="listingType" value={listingType} />
            )}
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="material-icons text-xl leading-none text-nordic/40">
                search
              </span>
            </div>
            <input
              type="search"
              name="q"
              defaultValue={q}
              placeholder={t.searchPlaceholder}
              aria-label={dict.admin.search}
              className="block w-full pl-10 pr-3 py-2 rounded-lg bg-clear-day border border-gray-200 text-sm text-nordic placeholder:text-nordic/40 focus:outline-none focus:ring-2 focus:ring-mosque focus:bg-white transition-all"
            />
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center bg-clear-day p-1 rounded-lg border border-mosque/10">
              {filters.map((filter) => {
                const active = listingType === filter.value;
                return (
                  <Link
                    key={filter.text}
                    href={adminHref(basePath, { q, listingType: filter.value })}
                    aria-current={active ? "true" : undefined}
                    className={`inline-flex items-center justify-center px-4 py-1.5 rounded-md text-sm font-medium whitespace-nowrap transition-colors ${
                      active
                        ? "bg-mosque text-white shadow-sm"
                        : "text-nordic/70 hover:text-nordic hover:bg-white/70"
                    }`}
                  >
                    {filter.text}
                  </Link>
                );
              })}
            </div>
            {hasActiveFilter && (
              <Link
                href={basePath}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium text-gray-500 hover:text-nordic hover:bg-clear-day transition-colors"
              >
                {t.clearFilters}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
