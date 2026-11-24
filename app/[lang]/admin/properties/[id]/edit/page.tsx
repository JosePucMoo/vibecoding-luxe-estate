import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import PropertyForm from "@/components/admin/property-form/property-form";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getAdminPropertyById } from "@/lib/admin";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

interface EditAdminPropertyPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: `${dict.admin.propertyForm.editTitle} | LuxeEstate`,
  };
}

export default async function EditAdminPropertyPage({
  params,
}: EditAdminPropertyPageProps) {
  await connection();
  const [{ id }, locale] = await Promise.all([params, getLocale()]);
  await requireAdmin(locale);

  const property = await getAdminPropertyById(id);
  if (!property) {
    notFound();
  }

  return <PropertyForm mode="edit" initialData={property} />;
}
