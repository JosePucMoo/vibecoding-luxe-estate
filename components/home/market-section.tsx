import Link from "next/link";
import { buildFilterHref } from "@/lib/filter-url";
import { hasActiveFilters } from "@/lib/properties";
import { ListingType, MarketProperty, PropertyFilters } from "@/types/property";
import PropertyCard from "./property-card";

interface MarketSectionProps {
  properties: MarketProperty[];
  currentPage: number;
  totalPages: number;
  total: number;
  filters?: PropertyFilters;
}

const LISTING_TABS: { label: string; value?: ListingType }[] = [
  { label: "All", value: undefined },
  { label: "Buy", value: "FOR SALE" },
  { label: "Rent", value: "FOR RENT" },
];

export default function MarketSection({
  properties,
  currentPage,
  totalPages,
  total,
  filters = {},
}: MarketSectionProps) {
  const filteringActive = hasActiveFilters(filters);

  return (
    <section>
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">
            {filteringActive ? "Search Results" : "New in Market"}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <p className="text-[#5C706D] text-sm">
              {filteringActive
                ? `Found ${total} ${total === 1 ? "property" : "properties"} matching your criteria.`
                : "Fresh opportunities added this week."}
            </p>
            {filteringActive && (
              <Link
                href="/"
                scroll={false}
                className="text-xs font-medium text-[#006655] hover:underline"
              >
                Clear all filters
              </Link>
            )}
          </div>
        </div>

        <div className="flex self-start sm:self-auto bg-white p-1 rounded-lg border border-[#19322F]/5 shadow-sm">
          {LISTING_TABS.map((tab) => {
            const isActive = filters.listingType === tab.value;
            const href = buildFilterHref({
              ...filters,
              listingType: tab.value,
              page: 1,
            });

            return (
              <Link
                key={tab.label}
                href={href}
                scroll={false}
                className={
                  isActive
                    ? "px-4 py-1.5 rounded-md text-sm font-medium bg-[#19322F] text-white shadow-sm"
                    : "px-4 py-1.5 rounded-md text-sm font-medium text-[#5C706D] hover:text-[#19322F] transition-colors"
                }
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#19322F]/5">
          <p className="text-[#5C706D] text-lg font-light">
            {filteringActive
              ? "No properties match your current filters."
              : "No properties found for this page."}
          </p>
          <Link
            href="/"
            scroll={false}
            className="inline-block mt-4 px-6 py-2 bg-[#19322F] text-white rounded-lg text-sm hover:bg-[#006655] transition-colors"
          >
            {filteringActive ? "Clear all filters" : "Return to first page"}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {properties.map((property) => (
            <PropertyCard key={property.id} property={property} />
          ))}
        </div>
      )}

      {/* Server-Side Pagination */}
      {totalPages > 1 && (
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-[#19322F]/10">
          <p className="text-sm text-[#5C706D]">
            Showing page{" "}
            <span className="font-semibold text-[#19322F]">{currentPage}</span>{" "}
            of{" "}
            <span className="font-semibold text-[#19322F]">{totalPages}</span>{" "}
            <span className="text-[#5C706D]/80">({total} total)</span>
          </p>

          <nav
            aria-label="Market properties pagination"
            className="flex items-center gap-2"
          >
            {/* Previous Page Link */}
            {currentPage > 1 ? (
              <Link
                href={buildFilterHref({
                  ...filters,
                  page: currentPage - 1,
                })}
                scroll={false}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#19322F] bg-white border border-[#19322F]/15 rounded-lg hover:border-[#006655] hover:text-[#006655] hover:shadow-sm transition-all"
              >
                <span className="material-icons text-base leading-none">
                  chevron_left
                </span>
                Previous
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#5C706D]/40 bg-white/50 border border-[#19322F]/5 rounded-lg cursor-not-allowed select-none"
              >
                <span className="material-icons text-base leading-none">
                  chevron_left
                </span>
                Previous
              </span>
            )}

            {/* Page Number Buttons */}
            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => {
                  const isActive = pageNumber === currentPage;
                  const pageHref = buildFilterHref({
                    ...filters,
                    page: pageNumber,
                  });

                  return isActive ? (
                    <span
                      key={pageNumber}
                      aria-current="page"
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-semibold bg-[#19322F] text-white shadow-sm"
                    >
                      {pageNumber}
                    </span>
                  ) : (
                    <Link
                      key={pageNumber}
                      href={pageHref}
                      scroll={false}
                      className="w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium text-[#19322F] bg-white border border-[#19322F]/15 hover:border-[#006655] hover:text-[#006655] hover:shadow-sm transition-all"
                    >
                      {pageNumber}
                    </Link>
                  );
                }
              )}
            </div>

            {/* Next Page Link */}
            {currentPage < totalPages ? (
              <Link
                href={buildFilterHref({
                  ...filters,
                  page: currentPage + 1,
                })}
                scroll={false}
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#19322F] bg-white border border-[#19322F]/15 rounded-lg hover:border-[#006655] hover:text-[#006655] hover:shadow-sm transition-all"
              >
                Next
                <span className="material-icons text-base leading-none">
                  chevron_right
                </span>
              </Link>
            ) : (
              <span
                aria-disabled="true"
                className="inline-flex items-center gap-1 px-4 py-2 text-sm font-medium text-[#5C706D]/40 bg-white/50 border border-[#19322F]/5 rounded-lg cursor-not-allowed select-none"
              >
                Next
                <span className="material-icons text-base leading-none">
                  chevron_right
                </span>
              </span>
            )}
          </nav>
        </div>
      )}
    </section>
  );
}
