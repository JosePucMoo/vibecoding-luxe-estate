import type { Metadata } from "next";
import { redirect } from "next/navigation";
import SocialLoginCard from "@/components/auth/social-login-card";
import { getCurrentUser } from "@/lib/auth";
import { localePath } from "@/i18n/config";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.auth.pageTitle };
}

interface LoginPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

function single(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const [locale, dict, params] = await Promise.all([
    getLocale(),
    getDictionary(),
    searchParams,
  ]);

  const home = localePath(locale, "/");

  if (await getCurrentUser()) redirect(home);

  const rawNext = single(params.next);
  const next =
    rawNext && rawNext.startsWith("/") && !rawNext.startsWith("//")
      ? rawNext
      : home;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#D9ECC8]/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-[#006655]/10 rounded-full blur-3xl" />
      </div>

      <main className="w-full max-w-md z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-[#006655] rounded-xl mb-6 shadow-[0_4px_20px_-2px_rgba(25,50,47,0.05)] text-white">
            <span className="material-symbols-rounded text-3xl">
              real_estate_agent
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-[#19322F] mb-2">
            {dict.auth.welcomeTitle}
          </h1>
          <p className="text-[#19322F]/60">{dict.auth.welcomeSubtitle}</p>
        </div>

        <div className="bg-white rounded-2xl shadow-[0_4px_20px_-2px_rgba(25,50,47,0.05)] p-8 sm:p-10 border border-white/50 backdrop-blur-sm">
          <SocialLoginCard
            next={next}
            hasCallbackError={single(params.error) === "callback"}
          />
        </div>

        <div className="mt-8 text-center">
          <nav className="flex justify-center gap-6 text-xs text-[#19322F]/50">
            <a className="hover:text-[#19322F] transition-colors" href="#">
              {dict.auth.privacyPolicy}
            </a>
            <a className="hover:text-[#19322F] transition-colors" href="#">
              {dict.auth.termsOfService}
            </a>
            <a className="hover:text-[#19322F] transition-colors" href="#">
              {dict.auth.helpCenter}
            </a>
          </nav>
        </div>
      </main>
    </div>
  );
}
