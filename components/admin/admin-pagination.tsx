import Link from "next/link";
import { format } from "@/i18n/format";
import { getDictionary } from "@/i18n/get-dictionary";
import { ADMIN_PAGE_SIZE } from "@/lib/admin";
import { adminHref } from "./admin-url";

interface AdminPaginationProps {
  basePath: string;
  params: Record<string, string | undefined>;
  currentPage: number;
  totalPages: number;
  total: number;
}

export default async function AdminPagination({
  basePath,
  params,
  currentPage,
  totalPages,
  total,
}: AdminPaginationProps) {
  const dict = await getDictionary();
  const from = total === 0 ? 0 : (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
  const to = Math.min(currentPage * ADMIN_PAGE_SIZE, total);

  const hrefFor = (page: number) =>
    adminHref(basePath, { ...params, page: page > 1 ? page : undefined });

  const buttonBase =
    "px-3 py-1.5 text-sm rounded-md border border-nordic/10 bg-white text-nordic transition-colors";
  const disabled = "opacity-50 pointer-events-none";

  return (
    <nav
      aria-label={dict.admin.pagination.label}
      className="flex items-center justify-between gap-4 px-6 py-4"
    >
      <p className="text-sm text-nordic/60">
        {format(dict.admin.pagination.showing, { from, to, total })}
      </p>
      <div className="flex gap-2">
        <Link
          href={hrefFor(currentPage - 1)}
          aria-disabled={currentPage <= 1}
          className={`${buttonBase} hover:border-mosque hover:text-mosque ${currentPage <= 1 ? disabled : ""}`}
        >
          {dict.admin.pagination.previous}
        </Link>
        <Link
          href={hrefFor(currentPage + 1)}
          aria-disabled={currentPage >= totalPages}
          className={`${buttonBase} hover:border-mosque hover:text-mosque ${currentPage >= totalPages ? disabled : ""}`}
        >
          {dict.admin.pagination.next}
        </Link>
      </div>
    </nav>
  );
}
