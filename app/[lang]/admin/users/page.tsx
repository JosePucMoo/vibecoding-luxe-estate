import type { Metadata } from "next";
import AdminSearch from "@/components/admin/admin-search";
import UserDirectory from "@/components/admin/user-directory";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { getAdminUsers, getRoleCounts } from "@/lib/admin";
import { getCurrentUser } from "@/lib/auth";
import { isUserRole } from "@/types/admin";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: `${dict.admin.users.title} | LuxeEstate` };
}

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const [locale, dict, params, current] = await Promise.all([
    getLocale(),
    getDictionary(),
    searchParams,
    getCurrentUser(),
  ]);

  const q = single(params.q)?.trim() || undefined;
  const rawRole = single(params.role);
  const role = isUserRole(rawRole) ? rawRole : undefined;
  const pageNumber = Math.max(1, parseInt(single(params.page) || "1", 10) || 1);

  const [result, counts] = await Promise.all([
    getAdminUsers({ q, role, page: pageNumber }),
    getRoleCounts(),
  ]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic">
            {dict.admin.users.title}
          </h1>
          <p className="text-nordic/60 mt-1 text-sm">{dict.admin.users.subtitle}</p>
        </div>
        <AdminSearch
          action={localePath(locale, "/admin/users")}
          q={q}
          placeholder={dict.admin.users.searchPlaceholder}
          hidden={{ role }}
        />
      </div>

      <UserDirectory
        page={result}
        counts={counts}
        currentUserId={current?.id ?? ""}
        activeRole={role}
        q={q}
      />
    </>
  );
}
