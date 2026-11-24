import type { Metadata } from "next";
import { connection } from "next/server";
import PropertyForm from "@/components/admin/property-form/property-form";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { requireAdmin } from "@/lib/auth";

export const instant = false;

const FALLBACK_AGENT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: `${dict.admin.propertyForm.createTitle} | LuxeEstate`,
  };
}

export default async function NewAdminPropertyPage() {
  await connection();
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  const user = await requireAdmin(locale);

  const defaultAgentName =
    user.fullName ||
    (user.email ? user.email.split("@")[0] : null) ||
    "Elena Fisher";

  return (
    <PropertyForm
      mode="create"
      defaultAgent={{
        name: defaultAgentName,
        role: dict.admin.roles[user.role] || "Senior Luxury Advisor",
        imageUrl: user.avatarUrl || FALLBACK_AGENT_AVATAR,
      }}
    />
  );
}
