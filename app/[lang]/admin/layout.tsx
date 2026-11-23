import AdminNavbar from "@/components/admin/admin-navbar";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { requireAdmin } from "@/lib/auth";

// Reads the session at request time (Cache Components).
export const instant = false;

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  // Second layer after proxy.ts: never render admin UI without an active admin.
  const user = await requireAdmin(locale);

  return (
    <div className="min-h-screen flex flex-col bg-clear-day text-nordic font-display antialiased">
      <AdminNavbar user={user} />
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {children}
      </main>
      <footer className="mt-auto border-t border-gray-200 bg-white">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-400">
            {dict.admin.footerRights}
          </p>
        </div>
      </footer>
    </div>
  );
}
