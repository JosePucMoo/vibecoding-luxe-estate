import type { Metadata } from "next";
import { connection } from "next/server";
import PropertiesHeader from "@/components/admin/properties-header";
import PropertiesStats from "@/components/admin/properties-stats";
import PropertiesTable from "@/components/admin/properties-table";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getAdminProperties, getAdminPropertyStats } from "@/lib/admin";
import type { AdminPropertyActivityFilter } from "@/types/admin";
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
  const [, params] = await Promise.all([getLocale(), searchParams]);

  const q = single(params.q)?.trim() || undefined;
  const rawListing = single(params.listingType);
  const listingType: ListingType | undefined =
    rawListing === "FOR SALE" || rawListing === "FOR RENT"
      ? rawListing
      : undefined;
  const rawActivity = single(params.activity);
  const activity: AdminPropertyActivityFilter | undefined =
    rawActivity === "active" || rawActivity === "inactive"
      ? rawActivity
      : undefined;
  const pageNumber = Math.max(
    1,
    parseInt(single(params.page) || "1", 10) || 1
  );

  const [stats, result] = await Promise.all([
    getAdminPropertyStats(),
    getAdminProperties({ q, listingType, activity, page: pageNumber }),
  ]);

  return (
    <>
      <PropertiesHeader q={q} listingType={listingType} activity={activity} />
      <PropertiesStats stats={stats} />
      <PropertiesTable page={result} params={{ q, listingType, activity }} />
    </>
  );
}
