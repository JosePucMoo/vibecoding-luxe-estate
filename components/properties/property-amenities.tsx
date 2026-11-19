import { label } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";

interface PropertyAmenitiesProps {
  amenities: string[];
}

export default async function PropertyAmenities({
  amenities,
}: PropertyAmenitiesProps) {
  const dict = await getDictionary();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-6 text-[#19322F]">
        {dict.property.amenitiesTitle}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {amenities.map((amenity) => (
          <div
            key={amenity}
            className="flex items-center gap-3 text-[#19322F]/70"
          >
            <span className="material-icons text-[#006655]/60 text-sm leading-none">
              check_circle
            </span>
            <span>{label(dict.amenities, amenity)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
