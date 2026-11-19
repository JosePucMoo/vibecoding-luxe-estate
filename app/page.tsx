import Navbar from "@/components/navbar";
import HeroSearch from "@/components/home/hero-search";
import FeaturedSection from "@/components/home/featured-section";
import MarketSection from "@/components/home/market-section";
import {
  FEATURED_PROPERTIES_LIMIT,
  getFeaturedProperties,
  getMarketProperties,
  hasActiveFilters,
} from "@/lib/properties";
import { ListingType, PropertyFilters } from "@/types/property";

// In Next.js with cacheComponents enabled, `instant = false` tells Next.js
// that this route is a dynamic server-rendered page that reads searchParams at request time.
export const instant = false;

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function getSingleParam(
  value: string | string[] | undefined
): string | undefined {
  if (Array.isArray(value)) return value[0];
  return value;
}

function parsePositiveNumber(
  value: string | string[] | undefined
): number | undefined {
  const raw = getSingleParam(value);
  if (!raw) return undefined;
  const parsed = Number(raw);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;

  const pageNumber = Math.max(
    1,
    parseInt(getSingleParam(resolvedParams.page) || "1", 10) || 1
  );

  const rawListingType = getSingleParam(resolvedParams.listingType);
  const listingType: ListingType | undefined =
    rawListingType === "FOR SALE" || rawListingType === "FOR RENT"
      ? rawListingType
      : undefined;

  const rawAmenities = getSingleParam(resolvedParams.amenities);
  const amenities = rawAmenities
    ? rawAmenities
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : undefined;

  const filters: PropertyFilters = {
    q: getSingleParam(resolvedParams.q)?.trim() || undefined,
    type: getSingleParam(resolvedParams.type)?.trim() || undefined,
    listingType,
    minPrice: parsePositiveNumber(resolvedParams.minPrice),
    maxPrice: parsePositiveNumber(resolvedParams.maxPrice),
    beds: parsePositiveNumber(resolvedParams.beds),
    baths: parsePositiveNumber(resolvedParams.baths),
    amenities: amenities && amenities.length > 0 ? amenities : undefined,
    page: pageNumber,
  };

  const isFiltering = hasActiveFilters(filters);

  const [featuredProperties, paginatedMarket] = await Promise.all([
    isFiltering ? Promise.resolve([]) : getFeaturedProperties(),
    getMarketProperties(filters),
  ]);

  return (
    <div className="min-h-screen bg-clear-day flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-grow w-full">
        <HeroSearch filters={filters} />
        {!isFiltering && featuredProperties.length > 0 && (
          <FeaturedSection
            properties={featuredProperties.slice(0, FEATURED_PROPERTIES_LIMIT)}
          />
        )}
        <MarketSection
          properties={paginatedMarket.properties}
          currentPage={paginatedMarket.currentPage}
          totalPages={paginatedMarket.totalPages}
          total={paginatedMarket.total}
          filters={filters}
        />
      </main>
    </div>
  );
}
