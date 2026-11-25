"use client";

import { useEffect, useId, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { setPropertyActiveStateAction } from "@/app/[lang]/admin/properties/actions";
import { format } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";

interface PropertyActiveToggleButtonProps {
  propertyId: string;
  propertyTitle: string;
  isActive: boolean;
}

export default function PropertyActiveToggleButton({
  propertyId,
  propertyTitle,
  isActive,
}: PropertyActiveToggleButtonProps) {
  const { dict } = useI18n();
  const t = dict.admin.properties;
  const router = useRouter();
  const dialogTitleId = useId();

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!isConfirmOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isPending) {
        setIsConfirmOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isConfirmOpen, isPending]);

  const handleDeactivateConfirm = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await setPropertyActiveStateAction(propertyId, false);
      if (!result.ok) {
        setErrorMsg(
          result.error === "forbidden"
            ? t.errorActionForbidden
            : t.errorActionGeneric
        );
        return;
      }
      setIsConfirmOpen(false);
      router.refresh();
    });
  };

  const handleReactivate = () => {
    setErrorMsg(null);
    startTransition(async () => {
      const result = await setPropertyActiveStateAction(propertyId, true);
      if (!result.ok) {
        setErrorMsg(
          result.error === "forbidden"
            ? t.errorActionForbidden
            : t.errorActionGeneric
        );
        return;
      }
      router.refresh();
    });
  };

  if (!isActive) {
    return (
      <div className="relative inline-flex items-center">
        <button
          type="button"
          onClick={handleReactivate}
          disabled={isPending}
          title={isPending ? t.reactivating : t.reactivateProperty}
          aria-label={t.reactivateProperty}
          className="p-2 rounded-lg text-mosque hover:bg-hint-of-green/50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="material-icons text-xl leading-none">restore</span>
        </button>
        {errorMsg && (
          <span
            role="alert"
            className="sr-only"
          >
            {errorMsg}
          </span>
        )}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => {
          setErrorMsg(null);
          setIsConfirmOpen(true);
        }}
        disabled={isPending}
        title={t.deactivateProperty}
        aria-label={t.deactivateProperty}
        className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className="material-icons text-xl leading-none">
          delete_outline
        </span>
      </button>

      {isConfirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby={dialogTitleId}
        >
          <div
            className="fixed inset-0 bg-nordic/45 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (!isPending) setIsConfirmOpen(false);
            }}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl border border-nordic/10 p-6 text-left">
            <div className="flex items-start gap-4">
              <div className="h-11 w-11 rounded-full bg-red-50 border border-red-100 flex items-center justify-center flex-shrink-0 text-red-600">
                <span className="material-icons text-xl leading-none">
                  visibility_off
                </span>
              </div>

              <div className="min-w-0 flex-1">
                <h2
                  id={dialogTitleId}
                  className="text-lg font-bold text-nordic"
                >
                  {t.deactivateModalTitle}
                </h2>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                  {format(t.deactivateModalBody, { title: propertyTitle })}
                </p>
              </div>
            </div>

            {errorMsg && (
              <div
                role="alert"
                className="mt-4 px-3.5 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2"
              >
                <span className="material-icons text-base leading-none">
                  error_outline
                </span>
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isPending}
                onClick={() => setIsConfirmOpen(false)}
                className="px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-medium text-nordic hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                {t.deactivateCancel}
              </button>
              <button
                type="button"
                disabled={isPending}
                onClick={handleDeactivateConfirm}
                className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-sm font-medium text-white shadow-sm transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <span className="material-icons text-base leading-none">
                  delete_outline
                </span>
                {isPending ? t.deactivating : t.deactivateConfirm}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
