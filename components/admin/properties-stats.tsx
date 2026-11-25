import { formatNumber } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { AdminPropertyStats } from "@/types/admin";

export default async function PropertiesStats({
  stats,
}: {
  stats: AdminPropertyStats;
}) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  const items = [
    {
      label: dict.admin.properties.statTotal,
      value: stats.total,
      icon: "apartment",
      tone: "bg-mosque/10 text-mosque",
    },
    {
      label: dict.admin.properties.statSale,
      value: stats.active,
      icon: "check_circle",
      tone: "bg-hint-of-green text-mosque",
    },
    {
      label: dict.admin.properties.statRent,
      value: stats.forRent,
      icon: "pending",
      tone: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-white p-5 rounded-xl border border-mosque/10 shadow-sm flex items-center justify-between"
        >
          <div>
            <p className="text-sm font-medium text-gray-500">{item.label}</p>
            <p className="text-2xl font-bold text-nordic mt-1">
              {formatNumber(item.value, locale)}
            </p>
          </div>
          <div
            className={`h-10 w-10 rounded-full flex items-center justify-center ${item.tone}`}
          >
            <span className="material-icons leading-none">{item.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
