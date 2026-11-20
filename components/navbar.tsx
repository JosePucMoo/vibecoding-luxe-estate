import { Suspense } from "react";
import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import NavbarAuth from "./auth/navbar-auth";
import LanguageSwitcher from "./language-switcher";

export default async function Navbar() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const home = localePath(locale, "/");

  return (
    <nav className="sticky top-0 z-50 bg-[#EEF6F6]/95 backdrop-blur-md border-b border-[#006655]/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Brand Logo */}
          <Link
            href={home}
            aria-label={dict.nav.homeAriaLabel}
            className="flex-shrink-0 flex items-center gap-2 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#19322F] group-hover:bg-[#006655] transition-colors flex items-center justify-center">
              <span className="material-icons text-white text-lg leading-none">
                apartment
              </span>
            </div>
            <span className="text-xl font-bold tracking-tight text-[#19322F]">
              LuxeEstate
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-10">
            <Link
              href={home}
              className="relative text-sm font-semibold text-[#19322F] hover:text-[#006655] transition-colors py-2"
            >
              {dict.nav.buy}
              <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#006655]" />
            </Link>
            <Link
              href={home}
              className="text-sm font-semibold text-[#19322F]/70 hover:text-[#006655] transition-colors py-2"
            >
              {dict.nav.rent}
            </Link>
            <Link
              href={home}
              className="text-sm font-semibold text-[#19322F]/70 hover:text-[#006655] transition-colors py-2"
            >
              {dict.nav.sell}
            </Link>
            <Link
              href={home}
              className="text-sm font-semibold text-[#19322F]/70 hover:text-[#006655] transition-colors py-2"
            >
              {dict.nav.saved}
            </Link>
          </div>

          {/* Actions & Profile */}
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <button
              type="button"
              aria-label={dict.nav.search}
              className="p-2 text-[#19322F] hover:text-[#006655] transition-colors"
            >
              <span className="material-icons leading-none">search</span>
            </button>
            <button
              type="button"
              aria-label={dict.nav.notifications}
              className="p-2 text-[#19322F] hover:text-[#006655] transition-colors relative"
            >
              <span className="material-icons leading-none">
                notifications_none
              </span>
              <span className="absolute top-2 right-2 w-2 h-2 bg-[#006655] rounded-full" />
            </button>
            <Suspense
              fallback={
                <div
                  aria-hidden="true"
                  className="ml-2 w-9 h-9 rounded-full bg-[#006655]/10 animate-pulse"
                />
              }
            >
              <NavbarAuth />
            </Suspense>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      <div className="md:hidden border-t border-[#19322F]/5 bg-[#EEF6F6] overflow-hidden h-0 transition-all duration-300">
        <div className="px-4 py-2 space-y-1">
          <Link
            href={home}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#006655] bg-[#006655]/10"
          >
            {dict.nav.buy}
          </Link>
          <Link
            href={home}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            {dict.nav.rent}
          </Link>
          <Link
            href={home}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            {dict.nav.sell}
          </Link>
          <Link
            href={home}
            className="block px-3 py-2 rounded-md text-base font-medium text-[#19322F] hover:bg-black/5"
          >
            {dict.nav.saved}
          </Link>
        </div>
      </div>
    </nav>
  );
}
