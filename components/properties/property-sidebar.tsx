import Image from "next/image";
import { PropertyAgent } from "@/types/property";
import { format } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import PropertyMap from "./property-map";

interface PropertySidebarProps {
  title: string;
  price: string;
  period?: string;
  location: string;
  agent: PropertyAgent;
  latitude: number;
  longitude: number;
}

export default async function PropertySidebar({
  title,
  price,
  period,
  location,
  agent,
  latitude,
  longitude,
}: PropertySidebarProps) {
  const dict = await getDictionary();

  return (
    <div className="sticky top-28 space-y-6">
      {/* Main Pricing & Agent Card */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-[#006655]/5">
        <div className="mb-4">
          <h1 className="text-4xl font-display font-light text-[#19322F] mb-2">
            {price}
            {period && (
              <span className="text-lg font-normal text-[#19322F]/60 ml-1">
                {period}
              </span>
            )}
          </h1>
          <p className="text-[#19322F]/60 font-medium flex items-center gap-1">
            <span className="material-icons text-[#006655] text-sm leading-none">
              location_on
            </span>
            {location}
          </p>
        </div>

        <div className="h-px bg-slate-100 my-6" />

        {/* Agent Profile */}
        <div className="flex items-center gap-4 mb-6">
          <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-white shadow-sm flex-shrink-0 bg-[#EEF6F6]">
            <Image
              src={agent.imageUrl}
              alt={agent.name}
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div>
            <h3 className="font-semibold text-[#19322F]">{agent.name}</h3>
            <div className="flex items-center gap-1 text-xs text-[#006655] font-medium">
              <span className="material-icons text-[14px] leading-none">
                star
              </span>
              <span>{agent.role}</span>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              aria-label={format(dict.property.chatWith, { name: agent.name })}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <span className="material-icons text-[20px] leading-none">chat</span>
            </button>
            <button
              type="button"
              aria-label={format(dict.property.call, { name: agent.name })}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-[#006655]/10 text-[#006655] hover:bg-[#006655] hover:text-white transition-colors cursor-pointer flex-shrink-0"
            >
              <span className="material-icons text-[20px] leading-none">call</span>
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            type="button"
            className="w-full bg-[#006655] hover:bg-[#005544] text-white py-4 px-6 rounded-lg font-medium transition-all shadow-lg shadow-[#006655]/20 flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span className="material-icons text-xl leading-none group-hover:scale-110 transition-transform">
              calendar_today
            </span>
            {dict.property.scheduleVisit}
          </button>
          <button
            type="button"
            className="w-full bg-transparent border border-[#19322F]/10 hover:border-[#006655] text-[#19322F]/80 hover:text-[#006655] py-4 px-6 rounded-lg font-medium transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span className="material-icons text-xl leading-none">
              mail_outline
            </span>
            {dict.property.contactAgent}
          </button>
        </div>
      </div>

      {/* Interactive Leaflet Map Card */}
      <div className="bg-white p-2 rounded-xl shadow-sm border border-[#006655]/5">
        <PropertyMap
          latitude={latitude}
          longitude={longitude}
          title={title}
          location={location}
        />
      </div>
    </div>
  );
}
