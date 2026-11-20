import { getDictionary } from "@/i18n/get-dictionary";
import { formatNumber } from "@/i18n/format";
import { getLocale } from "@/i18n/get-dictionary";
import type { AdminPropertyStats } from "@/types/admin";

export default async function PropertiesStats({
  stats,
}: {
  stats: AdminPropertyStats;
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  const items = [
    { label: dict.admin.properties.statTotal, value: stats.total, icon: "apartment", tone: "bg-mosque/10 text-mosque" },
    { label: dict.admin.properties.statSale, value: stats.forSale, icon: "sell", tone: "bg-hint-of-green text-mosque" },
    { label: dict.admin.properties.statRent, value: stats.forRent, icon: "key", tone: "bg-amber-100 text-amber-700" },
    { label: dict.admin.properties.statFeatured, value: stats.featured, icon: "star", tone: "bg-nordic/10 text-nordic" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white p-5 rounded-xl border border-mosque/10 shadow-card flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-nordic/60">{item.label}</p>
            <p className="text-2xl font-bold text-nordic mt-1">
              {formatNumber(item.value, locale)}
            </p>
          </div>
          <div className={`h-10 w-10 rounded-full flex items-center justify-center ${item.tone}`}>
            <span className="material-icons">{item.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
