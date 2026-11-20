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

  const propertiesHref = localePath(locale, "/admin");
  const usersHref = localePath(locale, "/admin/users");
  const onUsers = pathname.startsWith(usersHref);

  const tabs = [
    { href: propertiesHref, label: dict.admin.nav.properties, active: !onUsers },
    { href: usersHref, label: dict.admin.nav.users, active: onUsers },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-nordic/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center gap-4 sm:gap-12">
          <Link
            href={propertiesHref}
            className="flex items-center gap-2 shrink-0"
          >
            <span className="material-icons text-mosque text-2xl">apartment</span>
            <span className="font-bold text-lg text-nordic tracking-tight">
              LuxeEstate
            </span>
          </Link>
          <div className="flex gap-6">
            {tabs.map((tab) => (
              <Link
                key={tab.href}
                href={tab.href}
                aria-current={tab.active ? "page" : undefined}
                className={`px-1 py-5 text-sm font-medium border-b-2 transition-colors ${
                  tab.active
                    ? "text-mosque border-mosque"
                    : "text-nordic/60 border-transparent hover:text-mosque"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={localePath(locale, "/")}
            className="hidden sm:inline-flex items-center gap-1 px-2 py-2 text-sm font-medium text-nordic/60 hover:text-mosque transition-colors"
          >
            <span className="material-icons text-base leading-none">open_in_new</span>
            {dict.admin.nav.viewSite}
          </Link>
          <LanguageSwitcher />
          <NavbarUserMenu user={user} />
        </div>
      </div>
    </nav>
  );
}
