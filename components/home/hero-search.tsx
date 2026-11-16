"use client";

import { FormEvent, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { buildFilterHref } from "@/lib/filter-url";
import { PropertyFilters } from "@/types/property";
import FiltersModal from "./filters-modal";

const CATEGORIES = ["All", "House", "Apartment", "Villa", "Penthouse"];

interface HeroSearchProps {
  filters?: PropertyFilters;
}

export default function HeroSearch({ filters = {} }: HeroSearchProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState(filters.q ?? "");
  const [prevFilterQ, setPrevFilterQ] = useState(filters.q ?? "");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const normalizedFilterQ = filters.q ?? "";
  if (normalizedFilterQ !== prevFilterQ) {
    setPrevFilterQ(normalizedFilterQ);
    setSearchQuery(normalizedFilterQ);
  }

  const activeCategory =
    !filters.type || filters.type.toLowerCase() === "all"
      ? "All"
      : filters.type;

  const activeModalFiltersCount =
    (filters.minPrice && filters.minPrice > 0 ? 1 : 0) +
    (filters.maxPrice && filters.maxPrice > 0 ? 1 : 0) +
    (filters.beds && filters.beds > 0 ? 1 : 0) +
    (filters.baths && filters.baths > 0 ? 1 : 0) +
    (filters.amenities ? filters.amenities.length : 0) +
    (filters.type &&
    !CATEGORIES.some(
      (cat) => cat.toLowerCase() === filters.type?.toLowerCase()
    )
      ? 1
      : 0);

  const navigateWithFilters = (nextFilters: PropertyFilters) => {
    const href = buildFilterHref(nextFilters);
    startTransition(() => {
      router.push(href, { scroll: false });
    });
  };

  const handleSearchSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    navigateWithFilters({
      ...filters,
      q: searchQuery.trim() || undefined,
      page: 1,
    });
  };

  const handleCategoryClick = (category: string) => {
    navigateWithFilters({
      ...filters,
      q: searchQuery.trim() || undefined,
      type: category === "All" ? undefined : category,
      page: 1,
    });
  };

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-3xl mx-auto text-center space-y-8">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-light text-[#19322F] leading-tight">
          Find your{" "}
          <span className="relative inline-block">
            <span className="relative z-10 font-medium">sanctuary</span>
            <span className="absolute bottom-2 left-0 w-full h-3 bg-[#006655]/20 -rotate-1 z-0"></span>
          </span>
          .
        </h1>

        {/* Search bar */}
        <form
          onSubmit={handleSearchSubmit}
          className="relative group max-w-2xl mx-auto"
        >
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <span className="material-icons text-[#5C706D] text-2xl group-focus-within:text-[#006655] transition-colors leading-none">
              search
            </span>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by city, neighborhood, or address..."
            className="block w-full pl-12 pr-28 py-4 rounded-xl border-none bg-white text-[#19322F] shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] placeholder-[#5C706D]/60 focus:ring-2 focus:ring-[#006655] focus:bg-white transition-all text-lg outline-none"
          />
          <button
            type="submit"
            disabled={isPending}
            className="absolute inset-y-2 right-2 px-6 bg-[#006655] hover:bg-[#006655]/90 text-white font-medium rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-[#006655]/20 disabled:opacity-70"
          >
            {isPending ? "Searching..." : "Search"}
          </button>
        </form>

        {/* Category filters */}
        <div className="flex items-center justify-center gap-3 overflow-x-auto hide-scroll py-2 px-4 -mx-4">
          {CATEGORIES.map((category) => {
            const isActive =
              activeCategory.toLowerCase() === category.toLowerCase();

            return isActive ? (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="whitespace-nowrap px-5 py-2 rounded-full bg-[#19322F] text-white text-sm font-medium shadow-lg shadow-[#19322F]/10 transition-transform hover:-translate-y-0.5"
              >
                {category}
              </button>
            ) : (
              <button
                key={category}
                type="button"
                onClick={() => handleCategoryClick(category)}
                className="whitespace-nowrap px-5 py-2 rounded-full bg-white border border-[#19322F]/5 text-[#5C706D] hover:text-[#19322F] hover:border-[#006655]/50 text-sm font-medium transition-all hover:bg-[#006655]/5"
              >
                {category}
              </button>
            );
          })}
          <div className="w-px h-6 bg-[#19322F]/10 mx-2" />
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="whitespace-nowrap flex items-center gap-1.5 px-4 py-2 rounded-full text-[#19322F] font-medium text-sm hover:bg-black/5 transition-colors"
          >
            <span className="material-icons text-base leading-none">tune</span>{" "}
            Filters
            {activeModalFiltersCount > 0 && (
              <span className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs font-semibold rounded-full bg-[#006655] text-white">
                {activeModalFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <FiltersModal
          onClose={() => setIsModalOpen(false)}
          initialFilters={{
            ...filters,
            q: searchQuery.trim() || filters.q,
          }}
          onApply={(appliedFilters) => {
            setSearchQuery(appliedFilters.q ?? "");
            navigateWithFilters(appliedFilters);
          }}
        />
      )}
    </section>
  );
}
