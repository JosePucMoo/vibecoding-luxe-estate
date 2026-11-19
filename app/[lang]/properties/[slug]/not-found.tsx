import Link from "next/link";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

export default async function PropertyNotFound() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] flex flex-col">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex-grow flex items-center justify-center w-full">
        <div className="bg-white p-10 rounded-xl shadow-sm border border-[#006655]/10 max-w-lg w-full text-center space-y-6">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#006655]/10 text-[#006655] flex items-center justify-center">
            <span className="material-icons text-3xl leading-none">
              home_work
            </span>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold text-[#19322F]">
              {dict.notFound.title}
            </h1>
            <p className="text-sm text-[#19322F]/60">
              {dict.notFound.description}
            </p>
          </div>
          <Link
            href={localePath(locale, "/")}
            className="inline-flex items-center justify-center gap-2 bg-[#006655] hover:bg-[#005544] text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            <span className="material-icons text-lg leading-none">
              arrow_back
            </span>
            {dict.notFound.backHome}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
