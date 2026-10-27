import Navbar from "@/components/navbar";
import HeroSearch from "@/components/home/hero-search";
import FeaturedSection from "@/components/home/featured-section";
import MarketSection from "@/components/home/market-section";
import { FEATURED_PROPERTIES, MARKET_PROPERTIES } from "@/data/properties";

export default function Home() {
  return (
        <div className="min-h-screen bg-clear-day flex flex-col">
          <Navbar />
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 flex-grow w-full">
            <HeroSearch />
            <FeaturedSection properties={FEATURED_PROPERTIES} />
            <MarketSection properties={MARKET_PROPERTIES} />
          </main>
        </div>
        );
}