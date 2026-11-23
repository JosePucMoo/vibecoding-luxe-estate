"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { NavUser } from "@/lib/auth";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";
import NavbarUserMenu from "@/components/auth/navbar-user-menu";
import LanguageSwitcher from "@/components/language-switcher";

export default function AdminNavbar({ user }: { user: NavUser }) {
  const { locale, dict } = useI18n();
  const pathname = usePathname();

  const propertiesHref = localePath(locale, "/admin/properties");
  const usersHref = localePath(locale, "/admin/users");
  const onUsers = pathname.startsWith(usersHref);

  const tabs = [
    { href: propertiesHref, label: dict.admin.nav.properties, active: !onUsers },
    { href: usersHref, label: dict.admin.nav.users, active: onUsers },
  ];

  const displayName = user.fullName ?? user.email ?? "Admin";

  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-mosque/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Primary Nav */}
          <div className="flex">
            <Link
              href={propertiesHref}
              className="flex-shrink-0 flex items-center gap-2 cursor-pointer"
            >
              <div className="w-8 h-8 rounded bg-mosque flex items-center justify-center text-white">
                <span className="material-icons text-lg leading-none">
                  apartment
                </span>
              </div>
              <span className="font-bold text-xl tracking-tight text-nordic">
                LuxeEstate
              </span>
            </Link>
            <div className="ml-6 sm:ml-10 flex space-x-6 sm:space-x-8">
              {tabs.map((tab) => (
                <Link
                  key={tab.href}
                  href={tab.href}
                  aria-current={tab.active ? "page" : undefined}
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-colors ${
                    tab.active
                      ? "border-mosque text-nordic"
                      : "border-transparent text-gray-500 hover:text-mosque hover:border-mosque/30"
                  }`}
                >
                  {tab.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Secondary Nav & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href={localePath(locale, "/")}
              className="hidden md:inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-gray-500 hover:text-mosque transition-colors"
            >
              <span className="material-icons text-base leading-none">
                open_in_new
              </span>
              {dict.admin.nav.viewSite}
            </Link>
            <LanguageSwitcher />
            <div className="flex items-center gap-2 pl-3 sm:pl-4 border-l border-gray-200">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-nordic leading-tight">
                  {displayName}
                </span>
                <span className="text-xs text-gray-500">
                  {dict.admin.roles[user.role]}
                </span>
              </div>
              <NavbarUserMenu user={user} />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
