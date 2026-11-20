"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { NavUser } from "@/lib/auth";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";

function getInitials(user: NavUser): string {
  const source = user.fullName ?? user.email ?? "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);
  return (
    parts
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase() || "?"
  );
}

export default function NavbarUserMenu({ user }: { user: NavUser | null }) {
  const { locale, dict } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  if (!user) {
    return (
      <Link
        href={localePath(locale, "/login")}
        className="ml-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#006655] hover:bg-[#005544] text-white text-sm font-semibold transition-colors"
      >
        {dict.nav.signIn}
      </Link>
    );
  }

  const showImage = user.avatarUrl && !imageFailed;

  return (
    <div ref={containerRef} className="relative ml-2">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label={dict.nav.accountMenu}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-[#006655]/5 transition-colors cursor-pointer"
      >
        <div className="w-9 h-9 rounded-full bg-[#006655]/10 overflow-hidden border border-[#006655]/20 relative flex items-center justify-center text-sm font-semibold text-[#006655]">
          {showImage ? (
            <Image
              src={user.avatarUrl!}
              alt={dict.nav.profileImageAlt}
              width={36}
              height={36}
              onError={() => setImageFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            getInitials(user)
          )}
        </div>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-56 py-2 bg-white rounded-lg border border-[#19322F]/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.15)] z-50"
        >
          <div className="px-4 py-2 border-b border-[#19322F]/5">
            <p className="text-xs text-[#19322F]/60">{dict.nav.signedInAs}</p>
            {user.fullName && (
              <p className="text-sm font-semibold text-[#19322F] truncate">
                {user.fullName}
              </p>
            )}
            {user.email && (
              <p className="text-xs text-[#19322F]/70 truncate">{user.email}</p>
            )}
          </div>
          {user.role === "admin" && user.status === "active" && (
            <Link
              href={localePath(locale, "/admin")}
              role="menuitem"
              onClick={() => setIsOpen(false)}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-[#19322F] hover:bg-[#EEF6F6] transition-colors"
            >
              <span className="material-icons text-base leading-none">
                admin_panel_settings
              </span>
              {dict.nav.adminDashboard}
            </Link>
          )}
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              role="menuitem"
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left text-[#19322F] hover:bg-[#EEF6F6] transition-colors cursor-pointer"
            >
              <span className="material-icons text-base leading-none">
                logout
              </span>
              {dict.nav.signOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
