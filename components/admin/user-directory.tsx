import Link from "next/link";
import { localeMeta, localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import type {
  AdminPage,
  AdminUserProfile,
  RoleCounts,
  UserRole,
} from "@/types/admin";
import AdminPagination from "./admin-pagination";
import { adminHref } from "./admin-url";
import UserRoleCard from "./user-role-card";

interface UserDirectoryProps {
  page: AdminPage<AdminUserProfile>;
  counts: RoleCounts;
  currentUserId: string;
  activeRole?: UserRole;
  q?: string;
}

const TAB_ROLES: UserRole[] = ["agent", "broker", "admin", "viewer"];

export default async function UserDirectory({
  page,
  counts,
  currentUserId,
  activeRole,
  q,
}: UserDirectoryProps) {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const basePath = localePath(locale, "/admin/users");
  const dateFormat = new Intl.DateTimeFormat(localeMeta[locale].intl, {
    dateStyle: "medium",
    timeZone: "UTC",
  });

  const tabs: { key: UserRole | "all"; label: string }[] = [
    { key: "all", label: dict.admin.users.tabAll },
    ...TAB_ROLES.map((role) => ({ key: role, label: dict.admin.roles[role] })),
  ];

  return (
    <>
      <div className="mt-8 mb-6 flex gap-6 border-b border-nordic/10 overflow-x-auto">
        {tabs.map((tab) => {
          const active = (activeRole ?? "all") === tab.key;
          return (
            <Link
              key={tab.key}
              href={adminHref(basePath, {
                q,
                role: tab.key === "all" ? undefined : tab.key,
              })}
              aria-current={active ? "page" : undefined}
              className={`pb-3 text-sm whitespace-nowrap transition-colors ${
                active
                  ? "font-semibold text-mosque border-b-2 border-mosque"
                  : "font-medium text-nordic/60 hover:text-nordic"
              }`}
            >
              {tab.label}{" "}
              <span className="text-xs opacity-60">({counts[tab.key]})</span>
            </Link>
          );
        })}
      </div>

      <div className="space-y-4">
        <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-xs font-semibold uppercase tracking-wider text-nordic/50 mb-2">
          <div className="col-span-4">{dict.admin.users.colUser}</div>
          <div className="col-span-3">{dict.admin.users.colRole}</div>
          <div className="col-span-3">{dict.admin.users.colActivity}</div>
          <div className="col-span-2 text-right">
            {dict.admin.users.colActions}
          </div>
        </div>

        {page.items.length === 0 ? (
          <p className="py-12 text-center text-sm text-nordic/60">
            {dict.admin.users.empty}
          </p>
        ) : (
          page.items.map((user) => (
            <UserRoleCard
              key={user.id}
              user={user}
              isSelf={user.id === currentUserId}
              lastLoginLabel={
                user.lastSignInAt
                  ? dateFormat.format(new Date(user.lastSignInAt))
                  : null
              }
            />
          ))
        )}
      </div>

      <AdminPagination
        basePath={basePath}
        params={{ q, role: activeRole }}
        currentPage={page.currentPage}
        totalPages={page.totalPages}
        total={page.total}
        variant="numbered"
        entity="users"
      />
    </>
  );
}
