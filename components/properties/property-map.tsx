"use client";

import dynamic from "next/dynamic";

const PropertyMapClient = dynamic(() => import("./property-map-client"), {
  ssr: false,
  loading: () => (
    <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-slate-100 animate-pulse flex items-center justify-center">
      <div className="w-8 h-8 bg-[#006655]/80 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
        <span className="material-icons text-white text-sm leading-none">
          home
        </span>
      </div>
    </div>
  ),
});

interface PropertyMapProps {
  latitude: number;
  longitude: number;
  title: string;
  location: string;
}

export default function PropertyMap(props: PropertyMapProps) {
  return <PropertyMapClient {...props} />;
}
