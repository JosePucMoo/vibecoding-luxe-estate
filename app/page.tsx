import Navbar from "@/components/navbar";
import HeroSearch from "@/components/home/hero-search";
import FeaturedSection from "@/components/home/featured-section";
import MarketSection from "@/components/home/market-section";
import { getFeaturedProperties, getMarketProperties } from "@/lib/properties";

// In Next.js with cacheComponents enabled, `instant = false` tells Next.js
// that this route is a dynamic server-rendered page that reads searchParams at request time.
export const instant = false;

interface HomeProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const resolvedParams = await searchParams;
  const rawPage = resolvedParams.page;
  const pageParam = Array.isArray(rawPage) ? rawPage[0] : rawPage;
  const pageNumber = Math.max(1, parseInt(pageParam || "1", 10) || 1);

  const [featuredProperties, paginatedMarket] = await Promise.all([
    getFeaturedProperties(),
    getMarketProperties(pageNumber),
  ]);

  return (
    <div className="min-h-screen bg-clear-day flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-grow w-full">
        <HeroSearch />
        <FeaturedSection properties={featuredProperties} />
        <MarketSection
          properties={paginatedMarket.properties}
          currentPage={paginatedMarket.currentPage}
          totalPages={paginatedMarket.totalPages}
          total={paginatedMarket.total}
        />
      </main>
    </div>
  );
}
