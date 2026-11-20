import AdminNavbar from "@/components/admin/admin-navbar";
import { getLocale } from "@/i18n/get-dictionary";
import { requireAdmin } from "@/lib/auth";

// Reads the session at request time (Cache Components).
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  // Second layer after proxy.ts: never render admin UI without an active admin.
  const user = await requireAdmin(locale);

  return (
    <div className="min-h-screen flex flex-col bg-clear-day">
      <AdminNavbar user={user} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
    </div>
  );
}
