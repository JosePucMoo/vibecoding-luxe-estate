import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { format, label } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { AdminPage, AdminProperty } from "@/types/admin";
import AdminPagination from "./admin-pagination";

interface PropertiesTableProps {
  page: AdminPage<AdminProperty>;
  params: Record<string, string | undefined>;
}

export default async function PropertiesTable({ page, params }: PropertiesTableProps) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.admin.properties;

  return (
    <div className="bg-white rounded-xl shadow-card border border-nordic/10 overflow-hidden">
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-clear-day/60 border-b border-nordic/10 text-xs font-semibold text-nordic/60 uppercase tracking-wider">
        <div className="col-span-6">{t.colDetails}</div>
        <div className="col-span-2">{t.colPrice}</div>
        <div className="col-span-2">{t.colType}</div>
        <div className="col-span-2 text-right">{t.colActions}</div>
      </div>

      {page.items.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-nordic/60">{t.empty}</p>
      ) : (
        page.items.map((property) => {
          const detailHref = localePath(locale, `/properties/${property.slug}`);
          const isSale = property.listingType === "FOR SALE";
          return (
            <div
              key={property.id}
              className="group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-nordic/10 last:border-b-0 hover:bg-clear-day/60 transition-colors items-center"
            >
              <div className="md:col-span-6 flex gap-4 items-center">
                <div className="relative h-20 w-28 shrink-0 rounded-lg overflow-hidden bg-nordic/10">
                  <Image
                    src={property.imageUrl}
                    alt={property.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="min-w-0">
                  <Link
                    href={detailHref}
                    className="text-lg font-bold text-nordic hover:text-mosque transition-colors truncate block"
                  >
                    {property.title}
                  </Link>
                  <p className="text-sm text-nordic/60 truncate">{property.location}</p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-nordic/50">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm">bed</span>
                      {format(t.beds, { count: property.beds })}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-sm">bathtub</span>
                      {format(t.baths, { count: property.baths })}
                    </span>
                    <span>{property.area}</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <div className="text-base font-semibold text-nordic">
                  {property.price}
                  {property.period ? (
                    <span className="text-xs font-normal text-nordic/50"> {property.period}</span>
                  ) : null}
                </div>
                {property.estimatedPayment ? (
                  <div className="text-xs text-nordic/50">{property.estimatedPayment}</div>
                ) : null}
              </div>

              <div className="md:col-span-2 flex flex-wrap gap-2">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isSale
                      ? "bg-hint-of-green text-mosque border-mosque/10"
                      : "bg-amber-100 text-amber-700 border-amber-200"
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isSale ? "bg-mosque" : "bg-amber-500"}`} />
                  {label(dict.listingTypes, property.listingType)}
                </span>
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-nordic/5 text-nordic/70">
                  {label(dict.propertyTypes, property.propertyType)}
                </span>
                {property.isFeatured && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-nordic text-white">
                    <span className="material-icons text-xs">star</span>
                    {t.featured}
                  </span>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end">
                <Link
                  href={detailHref}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs font-medium text-nordic/70 hover:text-mosque hover:bg-hint-of-green/40 transition-colors"
                >
                  <span className="material-icons text-base">visibility</span>
                  {t.viewProperty}
                </Link>
              </div>
            </div>
          );
        })
      )}

      <div className="border-t border-nordic/10 bg-clear-day/40">
        <AdminPagination
          basePath={localePath(locale, "/admin")}
          params={params}
          currentPage={page.currentPage}
          totalPages={page.totalPages}
          total={page.total}
        />
      </div>
    </div>
  );
}
