import { MarketProperty } from "@/types/property";
import PropertyCard from "./property-card";

interface MarketSectionProps {
  properties: MarketProperty[];
}

export default function MarketSection({ properties }: MarketSectionProps) {
  return (
    <section>
      {/* Section Header */}
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">New in Market</h2>
          <p className="text-[#5C706D] mt-1 text-sm">Fresh opportunities added this week.</p>
        </div>
        <div className="hidden md:flex bg-white p-1 rounded-lg border border-[#19322F]/5 shadow-sm">
          <button
            type="button"
            className="px-4 py-1.5 rounded-md text-sm font-medium bg-[#19322F] text-white shadow-sm"
          >
            All
          </button>
          <button
            type="button"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-[#5C706D] hover:text-[#19322F] transition-colors"
          >
            Buy
          </button>
          <button
            type="button"
            className="px-4 py-1.5 rounded-md text-sm font-medium text-[#5C706D] hover:text-[#19322F] transition-colors"
          >
            Rent
          </button>
        </div>
      </div>

      {/* Properties Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>

      {/* Load More Button */}
      <div className="mt-12 text-center">
        <button
          type="button"
          className="px-8 py-3 bg-white border border-[#19322F]/10 hover:border-[#006655] hover:text-[#006655] text-[#19322F] font-medium rounded-lg transition-all hover:shadow-md"
        >
          Load more properties
        </button>
      </div>
    </section>
  );
}

