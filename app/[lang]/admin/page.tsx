import { redirect } from "next/navigation";
import { localePath } from "@/i18n/config";
import { getLocale } from "@/i18n/get-dictionary";

export const instant = false;

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function AdminIndexPage({ searchParams }: PageProps) {
  const [locale, params] = await Promise.all([getLocale(), searchParams]);
  const qs = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const single = Array.isArray(value) ? value[0] : value;
    if (single) qs.set(key, single);
  }
  const suffix = qs.toString() ? `?${qs.toString()}` : "";
  redirect(`${localePath(locale, "/admin/properties")}${suffix}`);
}
