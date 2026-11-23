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
  const pageNumber = Math.max(
    1,
    parseInt(single(params.page) || "1", 10) || 1
  );

  const [result, counts] = await Promise.all([
    getAdminUsers({ q, role, page: pageNumber }),
    getRoleCounts(),
  ]);

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-nordic">
            {dict.admin.users.title}
          </h1>
          <p className="text-nordic/60 mt-1 text-sm">
            {dict.admin.users.subtitle}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <AdminSearch
            action={localePath(locale, "/admin/users")}
            q={q}
            placeholder={dict.admin.users.searchPlaceholder}
            hidden={{ role }}
          />
          <button
            type="button"
            disabled
            title={dict.admin.comingSoon}
            className="inline-flex items-center justify-center px-4 py-2.5 border border-mosque text-sm font-medium rounded-lg text-mosque bg-transparent opacity-80 cursor-not-allowed whitespace-nowrap"
          >
            <span className="material-icons text-lg mr-2 leading-none">add</span>
            {dict.admin.users.addUser}
          </button>
        </div>
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
