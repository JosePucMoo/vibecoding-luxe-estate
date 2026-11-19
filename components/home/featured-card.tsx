import Image from "next/image";
import Link from "next/link";
import { FeaturedProperty } from "@/types/property";
import { localePath } from "@/i18n/config";
import { format } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

interface FeaturedCardProps {
  property: FeaturedProperty;
}

export default async function FeaturedCard({ property }: FeaturedCardProps) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <article className="group relative rounded-xl overflow-hidden shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] bg-white cursor-pointer transition-all duration-300">
      <Link
        href={localePath(locale, `/properties/${property.slug}`)}
        aria-label={format(dict.card.viewDetails, { title: property.title })}
        className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006655] rounded-xl"
      >
        {/* Property Image Container */}
        <div className="aspect-[4/3] w-full overflow-hidden relative bg-[#EEF6F6]">
          <Image
            src={property.imageUrl}
            alt={property.imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          {/* Badge */}
          <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider text-[#19322F]">
            {property.badge || dict.featured.defaultBadge}
          </div>
          {/* Gradient shadow */}
          <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent opacity-60 pointer-events-none" />
        </div>

        {/* Property Details */}
        <div className="p-6 relative">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h3 className="text-xl font-medium text-[#19322F] group-hover:text-[#006655] transition-colors">
                {property.title}
              </h3>
              <p className="text-[#5C706D] text-sm flex items-center gap-1 mt-1">
                <span className="material-icons text-sm leading-none">place</span>{" "}
                {property.location}
              </p>
            </div>
            <span className="text-xl font-semibold text-[#006655]">
              {property.price}
            </span>
          </div>

          {/* Property Features */}
          <div className="flex items-center gap-6 mt-6 pt-6 border-t border-[#19322F]/10">
            <div className="flex items-center gap-2 text-[#5C706D] text-sm">
              <span className="material-icons text-lg leading-none">king_bed</span>{" "}
              {format(dict.featured.beds, { count: property.beds })}
            </div>
            <div className="flex items-center gap-2 text-[#5C706D] text-sm">
              <span className="material-icons text-lg leading-none">bathtub</span>{" "}
              {format(dict.featured.baths, { count: property.baths })}
            </div>
            <div className="flex items-center gap-2 text-[#5C706D] text-sm">
              <span className="material-icons text-lg leading-none">
                square_foot
              </span>{" "}
              {property.area}
            </div>
          </div>
        </div>
      </Link>

      {/* Favorite Button */}
      <button
        type="button"
        aria-label={dict.card.saveProperty}
        className="absolute top-4 right-4 z-20 w-11 h-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-[#19322F] hover:bg-[#006655] hover:text-white transition-all shadow-sm"
      >
        <span className="material-icons text-xl leading-none">
          favorite_border
        </span>
      </button>
    </article>
  );
}
