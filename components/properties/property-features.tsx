import { getDictionary } from "@/i18n/get-dictionary";

interface PropertyFeaturesProps {
  area: string;
  beds: number;
  baths: number | string;
  garage: number;
}

export default async function PropertyFeatures({
  area,
  beds,
  baths,
  garage,
}: PropertyFeaturesProps) {
  const dict = await getDictionary();
  const numericArea = area.replace(/\s*m²/i, "").trim();

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-[#006655]/5">
      <h2 className="text-lg font-semibold mb-6 text-[#19322F]">
        {dict.property.featuresTitle}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2 leading-none">
            square_foot
          </span>
          <span className="text-xl font-bold text-[#19322F]">
            {numericArea}
          </span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50 text-center">
            {dict.property.squareMeters}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2 leading-none">
            bed
          </span>
          <span className="text-xl font-bold text-[#19322F]">{beds}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50 text-center">
            {dict.property.bedrooms}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2 leading-none">
            shower
          </span>
          <span className="text-xl font-bold text-[#19322F]">{baths}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50 text-center">
            {dict.property.bathrooms}
          </span>
        </div>

        <div className="flex flex-col items-center justify-center p-4 bg-[#006655]/5 rounded-lg border border-[#006655]/10">
          <span className="material-icons text-[#006655] text-2xl mb-2 leading-none">
            directions_car
          </span>
          <span className="text-xl font-bold text-[#19322F]">{garage}</span>
          <span className="text-xs uppercase tracking-wider text-[#19322F]/50 text-center">
            {dict.property.garage}
          </span>
        </div>
      </div>
    </div>
  );
}
