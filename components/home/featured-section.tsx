import Link from "next/link";
import { FeaturedProperty } from "@/types/property";
import FeaturedCard from "./featured-card";

interface FeaturedSectionProps {
  properties: FeaturedProperty[];
}

export default function FeaturedSection({ properties }: FeaturedSectionProps) {
  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">Featured Collections</h2>
          <p className="text-[#5C706D] mt-1 text-sm">Curated properties for the discerning eye.</p>
        </div>
        <Link
          href="#"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#006655] hover:opacity-70 transition-opacity"
        >
          View all <span className="material-icons text-sm leading-none">arrow_forward</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {properties.map((property) => (
          <FeaturedCard key={property.id} property={property} />
        ))}
      </div>
    </section>
  );
}

