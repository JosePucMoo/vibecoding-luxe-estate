"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n/i18n-provider";
import { updateUserRoleAction, updateUserStatusAction } from "@/app/[lang]/admin/users/actions";
import {
  USER_ROLES,
  type AdminUserProfile,
  type UpdateUserResult,
  type UserRole,
} from "@/types/admin";

const ROLE_ICONS: Record<UserRole, string> = {
  admin: "shield",
  broker: "business_center",
  agent: "support_agent",
  viewer: "visibility",
};

const ROLE_BADGES: Record<UserRole, string> = {
  admin: "bg-nordic text-white",
  broker: "bg-mosque/10 text-mosque",
  agent: "bg-gray-100 text-gray-600",
  viewer: "bg-gray-100 text-gray-500",
};

function initials(user: AdminUserProfile) {
  const parts = (user.fullName ?? user.email).split(/[\s@._-]+/).filter(Boolean);
  return parts.slice(0, 2).map((p) => p[0]).join("").toUpperCase() || "?";
}

interface UserRoleCardProps {
  user: AdminUserProfile;
  isSelf: boolean;
  /** Preformatted on the server to avoid hydration mismatches. */
  lastLoginLabel: string | null;
}

export default function UserRoleCard({ user, isSelf, lastLoginLabel }: UserRoleCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.users;
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [feedback, setFeedback] = useState<{ kind: "ok" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setIsOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [isOpen]);

  const run = (action: () => Promise<UpdateUserResult>) => {
    setIsOpen(false);
    setFeedback(null);
    startTransition(async () => {
      const result = await action();
      if (result.ok) {
        setFeedback({ kind: "ok", text: t.updated });
        router.refresh();
      } else {
        const text =
          result.error === "self"
            ? t.errorSelf
            : result.error === "forbidden"
              ? t.errorForbidden
              : t.errorGeneric;
        setFeedback({ kind: "error", text });
      }
    });
  };

  const suspended = user.status === "suspended";
  const showImage = user.avatarUrl && !imageFailed;
  const name = user.fullName ?? user.email;

  return (
    <div
      className={`relative rounded-xl p-5 shadow-sm border flex flex-col md:grid md:grid-cols-12 gap-4 items-center transition-colors ${
        isSelf
          ? "bg-hint-of-green border-transparent"
          : "bg-white border-gray-100 hover:bg-hint-of-green"
      } ${isOpen ? "z-20" : ""}`}
    >
      <div className="col-span-12 md:col-span-4 flex items-center w-full min-w-0">
        <div className={`relative shrink-0 h-12 w-12 rounded-full overflow-hidden bg-mosque/10 border-2 border-white flex items-center justify-center text-sm font-semibold text-mosque ${suspended ? "grayscale" : ""}`}>
          {showImage ? (
            <Image
              src={user.avatarUrl!}
              alt={name}
              width={48}
              height={48}
              onError={() => setImageFailed(true)}
              className="h-full w-full object-cover"
            />
          ) : (
            initials(user)
          )}
        </div>
        <div className="ml-4 min-w-0">
          <div className="text-sm font-bold text-nordic truncate">
            {name}
            {isSelf && <span className="ml-2 text-xs font-medium text-mosque">({t.you})</span>}
          </div>
          <div className="text-xs text-nordic/70 truncate">{user.email}</div>
          <div className="mt-1 text-[10px] px-2 py-0.5 inline-block bg-white/60 rounded text-nordic/60">
            ID: #USR-{user.id.slice(0, 4).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-3 w-full flex items-center justify-between md:justify-start gap-4">
        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${ROLE_BADGES[user.role]}`}>
          {dict.admin.roles[user.role]}
        </span>
        <span className="flex items-center text-xs text-nordic/60">
          <span className={`material-icons text-sm mr-1 ${suspended ? "text-red-500" : "text-mosque"}`}>
            {suspended ? "block" : "check_circle"}
          </span>
          {suspended ? t.suspended : t.active}
        </span>
      </div>

      <div className="col-span-12 md:col-span-3 w-full grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-nordic/50">{t.provider}</div>
          <div className="text-sm font-semibold text-nordic capitalize">{user.provider ?? "-"}</div>
        </div>
        <div>
          <div className="text-[10px] uppercase tracking-wider text-nordic/50">{t.lastLogin}</div>
          <div className="text-sm font-semibold text-nordic">{lastLoginLabel ?? t.never}</div>
        </div>
      </div>

      <div ref={containerRef} className="col-span-12 md:col-span-2 w-full flex flex-col items-end relative">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          disabled={isPending || isSelf}
          aria-haspopup="menu"
          aria-expanded={isOpen}
          title={isSelf ? t.errorSelf : undefined}
          className={`inline-flex items-center justify-center w-full md:w-auto px-4 py-2 text-xs font-medium rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
            isOpen
              ? "bg-mosque text-white"
              : "bg-white border border-nordic/10 text-nordic hover:bg-nordic hover:text-white"
          }`}
        >
          {isPending ? t.saving : t.changeRole}
          <span className="material-icons text-base ml-2">
            {isOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {isOpen && (
          <div
            role="menu"
            className="absolute top-full right-0 mt-2 w-48 rounded-lg shadow-dropdown bg-mosque overflow-hidden z-50"
          >
            <div className="py-1">
              {USER_ROLES.map((role) => (
                <button
                  key={role}
                  type="button"
                  role="menuitem"
                  onClick={() => run(() => updateUserRoleAction(user.id, role))}
                  className={`w-full flex items-center px-4 py-3 text-xs text-left transition-colors cursor-pointer ${
                    role === user.role
                      ? "bg-white/10 text-white font-medium"
                      : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <span className="material-icons text-sm mr-3">{ROLE_ICONS[role]}</span>
                  {dict.admin.roles[role]}
                </button>
              ))}
              <div className="border-t border-white/10 my-1" />
              <button
                type="button"
                role="menuitem"
                onClick={() =>
                  run(() => updateUserStatusAction(user.id, suspended ? "active" : "suspended"))
                }
                className="w-full flex items-center px-4 py-3 text-xs text-left text-red-100 hover:bg-red-500/20 transition-colors cursor-pointer"
              >
                <span className="material-icons text-sm mr-3">
                  {suspended ? "check_circle" : "block"}
                </span>
                {suspended ? t.reactivateUser : t.suspendUser}
              </button>
            </div>
          </div>
        )}

        {feedback && (
          <p
            role="status"
            className={`mt-2 text-xs ${feedback.kind === "ok" ? "text-mosque" : "text-red-600"}`}
          >
            {feedback.text}
          </p>
        )}
      </div>
    </div>
  );
}
