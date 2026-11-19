import Link from "next/link";
import { FeaturedProperty } from "@/types/property";
import { getDictionary } from "@/i18n/get-dictionary";
import FeaturedCard from "./featured-card";

interface FeaturedSectionProps {
  properties: FeaturedProperty[];
}

export default async function FeaturedSection({
  properties,
}: FeaturedSectionProps) {
  const dict = await getDictionary();

  return (
    <section className="mb-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-light text-[#19322F]">
            {dict.featured.title}
          </h2>
          <p className="text-[#5C706D] mt-1 text-sm">
            {dict.featured.subtitle}
          </p>
        </div>
        <Link
          href="#"
          className="hidden sm:flex items-center gap-1 text-sm font-medium text-[#006655] hover:opacity-70 transition-opacity"
        >
          {dict.featured.viewAll}{" "}
          <span className="material-icons text-sm leading-none">arrow_forward</span>
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

