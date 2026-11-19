import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import PropertyGallery from "@/components/properties/property-gallery";
import PropertySidebar from "@/components/properties/property-sidebar";
import PropertyFeatures from "@/components/properties/property-features";
import PropertyAbout from "@/components/properties/property-about";
import PropertyAmenities from "@/components/properties/property-amenities";
import PropertyMortgageBanner from "@/components/properties/property-mortgage-banner";
import { getPropertyBySlug } from "@/lib/properties";
import { locales, localePath } from "@/i18n/config";
import { format } from "@/i18n/format";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export const instant = false;

interface PropertyDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PropertyDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [locale, dict, property] = await Promise.all([
    getLocale(),
    getDictionary(),
    getPropertyBySlug(slug),
  ]);

  if (!property) {
    return {
      title: dict.meta.propertyNotFoundTitle,
      description: dict.meta.propertyNotFoundDescription,
    };
  }

  const primaryImage = property.images[0];
  const vars = {
    title: property.title,
    location: property.location,
    beds: property.beds,
    baths: property.baths,
    area: property.area,
    price: property.price,
  };
  const title = format(dict.meta.propertyTitle, vars);
  const description =
    property.description[0] || format(dict.meta.propertyDescription, vars);
  const pagePath = localePath(locale, `/properties/${property.slug}`);

  return {
    title,
    description,
    alternates: {
      canonical: pagePath,
      languages: Object.fromEntries(
        locales.map((l) => [l, localePath(l, `/properties/${property.slug}`)])
      ),
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: pagePath,
      images: primaryImage
        ? [
            {
              url: primaryImage.url,
              alt: primaryImage.alt || property.title,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: primaryImage ? [primaryImage.url] : [],
    },
  };
}

export default async function PropertyDetailPage({
  params,
}: PropertyDetailPageProps) {
  const { slug } = await params;
  const [locale, property] = await Promise.all([
    getLocale(),
    getPropertyBySlug(slug),
  ]);

  if (!property) {
    notFound();
  }

  const numericPrice = Number(property.price.replace(/[^0-9.]/g, "")) || 0;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: property.title,
    description: property.description.join(" "),
    url: localePath(locale, `/properties/${property.slug}`),
    inLanguage: locale,
    image: property.images.map((img) => img.url),
    offers: {
      "@type": "Offer",
      price: numericPrice,
      priceCurrency: "USD",
      availability: "https://schema.org/InStock",
    },
    mainEntity: {
      "@type": "SingleFamilyResidence",
      name: property.title,
      address: {
        "@type": "PostalAddress",
        streetAddress: property.location,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: property.latitude,
        longitude: property.longitude,
      },
      numberOfRooms: property.beds,
      numberOfBathroomsTotal: Number(property.baths) || property.baths,
      floorSize: {
        "@type": "QuantitativeValue",
        value: property.area,
        unitCode: "MTK",
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#EEF6F6] text-[#19322F] flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          {/* Left Column: Image Gallery */}
          <div className="lg:col-span-8">
            <PropertyGallery
              images={property.images}
              badges={property.badges}
              title={property.title}
            />
          </div>

          {/* Right Column: Sticky Sidebar (Pricing, Agent & Leaflet Map) */}
          <div className="lg:col-span-4 relative">
            <PropertySidebar
              title={property.title}
              price={property.price}
              period={property.period}
              location={property.location}
              agent={property.agent}
              latitude={property.latitude}
              longitude={property.longitude}
            />
          </div>

          {/* Left Column Row 2: Features, Description, Amenities & Mortgage */}
          <div className="lg:col-span-8 lg:row-start-2 lg:-mt-8 space-y-8">
            <PropertyFeatures
              area={property.area}
              beds={property.beds}
              baths={property.baths}
              garage={property.garage}
            />

            <PropertyAbout description={property.description} />

            <PropertyAmenities amenities={property.amenities} />

            <PropertyMortgageBanner
              estimatedPayment={property.estimatedPayment}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
