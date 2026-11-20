import type { Metadata } from "next";
import { connection } from "next/server";
import AdminSearch from "@/components/admin/admin-search";
import { adminHref } from "@/components/admin/admin-url";
import PropertiesStats from "@/components/admin/properties-stats";
import PropertiesTable from "@/components/admin/properties-table";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { label } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getAdminProperties, getAdminPropertyStats } from "@/lib/admin";
import type { ListingType } from "@/types/property";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.admin.properties.title} | LuxeEstate` };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminPropertiesPage({ searchParams }: PageProps) {
  await connection();
  const [locale, dict, params] = await Promise.all([
    getLocale(),
    getDictionary(),
    searchParams,
  ]);

  const q = single(params.q)?.trim() || undefined;
  const rawListing = single(params.listingType);
  const listingType: ListingType | undefined =
    rawListing === "FOR SALE" || rawListing === "FOR RENT" ? rawListing : undefined;
  const pageNumber = Math.max(1, parseInt(single(params.page) || "1", 10) || 1);

  const [stats, result] = await Promise.all([
    getAdminPropertyStats(),
    getAdminProperties({ q, listingType, page: pageNumber }),
  ]);

  const basePath = localePath(locale, "/admin");
  const filters: { value?: ListingType; text: string }[] = [
    { value: undefined, text: dict.admin.properties.filterAll },
    { value: "FOR SALE", text: label(dict.listingTypes, "FOR SALE") },
    { value: "FOR RENT", text: label(dict.listingTypes, "FOR RENT") },
  ];

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic">
            {dict.admin.properties.title}
          </h1>
          <p className="text-nordic/60 mt-1 text-sm">{dict.admin.properties.subtitle}</p>
        </div>
        <AdminSearch
          action={basePath}
          q={q}
          placeholder={dict.admin.properties.searchPlaceholder}
          hidden={{ listingType }}
        />
      </div>

      <PropertiesStats stats={stats} />

      <div className="mb-4 flex gap-2">
        {filters.map((filter) => {
          const active = listingType === filter.value;
          return (
            <Link
              key={filter.text}
              href={adminHref(basePath, { q, listingType: filter.value })}
              aria-current={active ? "true" : undefined}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active
                  ? "bg-mosque text-white shadow-md shadow-mosque/20"
                  : "bg-white text-nordic border border-nordic/10 hover:border-mosque hover:text-mosque"
              }`}
            >
              {filter.text}
            </Link>
          );
        })}
      </div>

      <PropertiesTable page={result} params={{ q, listingType }} />
    </>
  );
}
