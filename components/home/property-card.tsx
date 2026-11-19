import Image from "next/image";
import Link from "next/link";
import { MarketProperty } from "@/types/property";
import { localePath } from "@/i18n/config";
import { format, label } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

interface PropertyCardProps {
  property: MarketProperty;
}

export default async function PropertyCard({ property }: PropertyCardProps) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const isForSale = property.listingType === "FOR SALE";

  return (
    <article
      className={`relative bg-white rounded-xl overflow-hidden shadow-[0_4px_6px_-1px_rgba(0,0,0,0.02),0_2px_4px_-1px_rgba(0,0,0,0.02)] hover:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] transition-all duration-300 group cursor-pointer h-full flex flex-col ${
        property.visibilityClass || ""
      }`}
    >
      <Link
        href={localePath(locale, `/properties/${property.slug}`)}
        aria-label={format(dict.card.viewDetails, { title: property.title })}
        className="flex flex-col h-full focus:outline-none focus-visible:ring-2 focus-visible:ring-[#006655] rounded-xl"
      >
        {/* Property Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-[#EEF6F6]">
          <Image
            src={property.imageUrl}
            alt={property.imageAlt}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
          {/* Listing Type Badge */}
          <div
            className={`absolute bottom-3 left-3 text-white text-xs font-bold px-2 py-1 rounded ${
              isForSale ? "bg-[#19322F]/90" : "bg-[#006655]/90"
            }`}
          >
            {label(dict.listingTypes, property.listingType)}
          </div>
        </div>

        {/* Property Details */}
        <div className="p-4 flex flex-col flex-grow">
          <div className="flex justify-between items-baseline mb-2">
            <h3 className="font-bold text-lg text-[#19322F]">
              {property.price}
              {property.period && (
                <span className="text-sm font-normal text-[#5C706D]">
                  {property.period}
                </span>
              )}
            </h3>
          </div>
          <h4 className="text-[#19322F] font-medium truncate mb-1 group-hover:text-[#006655] transition-colors">
            {property.title}
          </h4>
          <p className="text-[#5C706D] text-xs mb-4">{property.location}</p>

          {/* Property Features */}
          <div className="mt-auto flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1 text-[#5C706D] text-xs">
              <span className="material-icons text-sm text-[#006655]/80 leading-none">
                king_bed
              </span>{" "}
              {property.beds}
            </div>
            <div className="flex items-center gap-1 text-[#5C706D] text-xs">
              <span className="material-icons text-sm text-[#006655]/80 leading-none">
                bathtub
              </span>{" "}
              {property.baths}
            </div>
            <div className="flex items-center gap-1 text-[#5C706D] text-xs">
              <span className="material-icons text-sm text-[#006655]/80 leading-none">
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
        className="absolute top-3 right-3 z-20 w-10 h-10 bg-white/90 rounded-full hover:bg-[#006655] hover:text-white transition-colors text-[#19322F] shadow-sm flex items-center justify-center"
      >
        <span className="material-icons text-lg leading-none">
          favorite_border
        </span>
      </button>
    </article>
  );
}
