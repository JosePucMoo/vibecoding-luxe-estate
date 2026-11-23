import Link from "next/link";
import { getDictionary } from "@/i18n/get-dictionary";
import { ADMIN_PAGE_SIZE } from "@/lib/admin";
import { adminHref } from "./admin-url";

interface AdminPaginationProps {
  basePath: string;
  params: Record<string, string | undefined>;
  currentPage: number;
  totalPages: number;
  total: number;
  variant?: "simple" | "numbered";
  entity?: "results" | "users";
}

function buildPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 5) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const pages: (number | "ellipsis")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);

  if (start > 2) pages.push("ellipsis");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < total - 1) pages.push("ellipsis");
  pages.push(total);
  return pages;
}

export default async function AdminPagination({
  basePath,
  params,
  currentPage,
  totalPages,
  total,
  variant = "simple",
  entity = "results",
}: AdminPaginationProps) {
  const dict = await getDictionary();
  const p = dict.admin.pagination;
  const from = total === 0 ? 0 : (currentPage - 1) * ADMIN_PAGE_SIZE + 1;
  const to = Math.min(currentPage * ADMIN_PAGE_SIZE, total);

  const hrefFor = (page: number) =>
    adminHref(basePath, { ...params, page: page > 1 ? page : undefined });

  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const template = entity === "users" ? p.showingUsers : p.showing;
  const parts = template.split(/(\{from\}|\{to\}|\{total\})/g);

  const summary = (
    <span className="text-sm text-nordic/60">
      {parts.map((part, idx) => {
        if (part === "{from}") {
          return (
            <span key={idx} className="font-medium text-nordic">
              {from}
            </span>
          );
        }
        if (part === "{to}") {
          return (
            <span key={idx} className="font-medium text-nordic">
              {to}
            </span>
          );
        }
        if (part === "{total}") {
          return (
            <span key={idx} className="font-medium text-nordic">
              {total}
            </span>
          );
        }
        return <span key={idx}>{part}</span>;
      })}
    </span>
  );

  if (variant === "numbered") {
    const pages = buildPageNumbers(currentPage, totalPages);
    return (
      <div className="border-t border-nordic/5 pt-6 mt-8">
        <div className="hidden sm:flex items-center justify-between">
          <div>{summary}</div>
          <nav
            aria-label={p.label}
            className="relative z-0 inline-flex items-center rounded-md -space-x-px"
          >
            <Link
              href={hrefFor(currentPage - 1)}
              aria-disabled={!hasPrev}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium text-nordic/50 hover:text-mosque transition-colors ${
                !hasPrev ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <span className="sr-only">{p.previous}</span>
              <span className="material-icons text-xl leading-none">
                chevron_left
              </span>
            </Link>

            {pages.map((item, idx) =>
              item === "ellipsis" ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-nordic/40"
                >
                  ...
                </span>
              ) : (
                <Link
                  key={item}
                  href={hrefFor(item)}
                  aria-current={item === currentPage ? "page" : undefined}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md mx-1 transition-colors ${
                    item === currentPage
                      ? "z-10 bg-mosque text-white shadow-sm"
                      : "bg-transparent text-nordic/70 hover:bg-white hover:text-mosque"
                  }`}
                >
                  {item}
                </Link>
              )
            )}

            <Link
              href={hrefFor(currentPage + 1)}
              aria-disabled={!hasNext}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium text-nordic/50 hover:text-mosque transition-colors ${
                !hasNext ? "opacity-40 pointer-events-none" : ""
              }`}
            >
              <span className="sr-only">{p.next}</span>
              <span className="material-icons text-xl leading-none">
                chevron_right
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between w-full sm:hidden">
          <Link
            href={hrefFor(currentPage - 1)}
            aria-disabled={!hasPrev}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic bg-white border border-gray-300 hover:bg-gray-50 ${
              !hasPrev ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {p.previous}
          </Link>
          <Link
            href={hrefFor(currentPage + 1)}
            aria-disabled={!hasNext}
            className={`ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-nordic bg-white border border-gray-300 hover:bg-gray-50 ${
              !hasNext ? "opacity-50 pointer-events-none" : ""
            }`}
          >
            {p.next}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <nav
      aria-label={p.label}
      className="px-6 py-4 flex items-center justify-between gap-4"
    >
      <div>{summary}</div>
      <div className="flex gap-2">
        <Link
          href={hrefFor(currentPage - 1)}
          aria-disabled={!hasPrev}
          className={`px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white transition-colors ${
            !hasPrev ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {p.previous}
        </Link>
        <Link
          href={hrefFor(currentPage + 1)}
          aria-disabled={!hasNext}
          className={`px-3 py-1 text-sm border border-gray-200 rounded-md text-gray-600 hover:bg-white transition-colors ${
            !hasNext ? "opacity-50 pointer-events-none" : ""
          }`}
        >
          {p.next}
        </Link>
      </div>
    </nav>
  );
}
