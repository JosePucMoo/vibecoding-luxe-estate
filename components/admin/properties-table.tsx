import Image from "next/image";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { format, label } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type { AdminPage, AdminProperty } from "@/types/admin";
import AdminPagination from "./admin-pagination";
import PropertyActiveToggleButton from "./property-active-toggle-button";

interface PropertiesTableProps {
  page: AdminPage<AdminProperty>;
  params: Record<string, string | undefined>;
}

export default async function PropertiesTable({
  page,
  params,
}: PropertiesTableProps) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.admin.properties;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Table Header */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
        <div className="col-span-6">{t.colDetails}</div>
        <div className="col-span-2">{t.colPrice}</div>
        <div className="col-span-2">{t.colType}</div>
        <div className="col-span-2 text-right">{t.colActions}</div>
      </div>

      {page.items.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-gray-500">
          {t.empty}
        </p>
      ) : (
        page.items.map((property) => {
          const detailHref = localePath(locale, `/properties/${property.slug}`);
          const editHref = localePath(
            locale,
            `/admin/properties/${property.id}/edit`
          );
          const isPubliclyVisible =
            property.isActive && property.status === "published";
          const primaryHref = isPubliclyVisible ? detailHref : editHref;
          const isSale = property.listingType === "FOR SALE";
          return (
            <div
              key={property.id}
              className={`group grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-5 border-b border-gray-100 last:border-b-0 hover:bg-clear-day transition-colors items-center ${
                property.isActive ? "" : "bg-gray-50/40"
              }`}
            >
              {/* Property Details */}
              <div className="col-span-12 md:col-span-6 flex gap-4 items-center">
                <Link
                  href={primaryHref}
                  className={`relative h-20 w-28 flex-shrink-0 rounded-lg overflow-hidden bg-gray-200 block ${
                    property.isActive ? "" : "opacity-60 grayscale-[35%]"
                  }`}
                >
                  <Image
                    src={property.imageUrl}
                    alt={property.imageAlt}
                    fill
                    sizes="112px"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </Link>
                <div className="min-w-0">
                  <Link
                    href={primaryHref}
                    className={`text-lg font-bold group-hover:text-mosque transition-colors truncate block ${
                      property.isActive ? "text-nordic" : "text-nordic/65"
                    }`}
                  >
                    {property.title}
                  </Link>
                  <p className="text-sm text-gray-500 truncate">
                    {property.location}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-gray-400">
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-[14px] leading-none">
                        bed
                      </span>
                      {format(t.beds, { count: property.beds })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span className="flex items-center gap-1">
                      <span className="material-icons text-[14px] leading-none">
                        bathtub
                      </span>
                      {format(t.baths, { count: property.baths })}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{property.area}</span>
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="col-span-6 md:col-span-2">
                <div className="text-base font-semibold text-nordic">
                  {property.price}
                </div>
                {property.estimatedPayment ? (
                  <div className="text-xs text-gray-400">
                    {property.estimatedPayment}
                  </div>
                ) : property.period ? (
                  <div className="text-xs text-gray-400">{property.period}</div>
                ) : null}
              </div>

              {/* Status */}
              <div className="col-span-6 md:col-span-2 flex flex-wrap items-center gap-1.5">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                    isSale
                      ? "bg-hint-of-green text-mosque border-mosque/10"
                      : "bg-orange-100 text-orange-700 border-orange-200"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      isSale ? "bg-mosque" : "bg-orange-500"
                    }`}
                  />
                  {label(dict.listingTypes, property.listingType)}
                </span>
                {!property.isActive && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-red-50 text-red-700 border border-red-200">
                    {t.statusInactive}
                  </span>
                )}
                {property.status === "draft" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-700 border border-amber-200">
                    {t.statusDraft}
                  </span>
                )}
                {property.status === "sold" && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                    {t.statusSold}
                  </span>
                )}
              </div>

              {/* Actions */}
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                {isPubliclyVisible ? (
                  <Link
                    href={detailHref}
                    title={t.viewProperty}
                    aria-label={t.viewProperty}
                    className="p-2 rounded-lg text-gray-400 hover:text-mosque hover:bg-hint-of-green/30 transition-all"
                  >
                    <span className="material-icons text-xl leading-none">
                      visibility
                    </span>
                  </Link>
                ) : (
                  <span
                    title={
                      !property.isActive
                        ? t.statusInactive
                        : property.status === "draft"
                          ? t.statusDraft
                          : t.statusSold
                    }
                    className="p-2 rounded-lg text-gray-300 cursor-not-allowed"
                  >
                    <span className="material-icons text-xl leading-none">
                      visibility_off
                    </span>
                  </span>
                )}
                <Link
                  href={editHref}
                  title={t.editProperty}
                  aria-label={t.editProperty}
                  className="p-2 rounded-lg text-gray-400 hover:text-mosque hover:bg-hint-of-green/30 transition-all"
                >
                  <span className="material-icons text-xl leading-none">
                    edit
                  </span>
                </Link>
                <PropertyActiveToggleButton
                  propertyId={property.id}
                  propertyTitle={property.title}
                  isActive={property.isActive}
                />
              </div>
            </div>
          );
        })
      )}

      {/* Pagination */}
      <div className="border-t border-gray-100 bg-gray-50/50">
        <AdminPagination
          basePath={localePath(locale, "/admin/properties")}
          params={params}
          currentPage={page.currentPage}
          totalPages={page.totalPages}
          total={page.total}
          variant="simple"
        />
      </div>
    </div>
  );
}
