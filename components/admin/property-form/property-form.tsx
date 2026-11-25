"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  createPropertyAction,
  updatePropertyAction,
} from "@/app/[lang]/admin/properties/actions";
import { localePath } from "@/i18n/config";
import { useI18n } from "@/i18n/i18n-provider";
import {
  extractStoragePathFromPublicUrl,
  removePropertyImagesClient,
} from "@/lib/storage";
import type {
  AdminPropertyRecord,
  PropertyFieldErrorKey,
  PropertyFormPayload,
} from "@/types/admin";
import type {
  ListingType,
  PropertyStatus,
  PropertyType,
} from "@/types/property";
import AgentCard from "./agent-card";
import BasicInfoCard from "./basic-info-card";
import DescriptionCard from "./description-card";
import DetailsCard from "./details-card";
import GalleryCard, { type ManagedGalleryImage } from "./gallery-card";
import LocationCard from "./location-card";

const DEFAULT_AGENT_AVATAR =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuD4TxUmdQRb2VMjuaNxLEwLorv_dgHzoET2_wL5toSvew6nhtziaR3DX-U69DBN7J74yO6oKokpw8tqEFutJf13MeXghCy7FwZuAxnoJel6FYcKeCRUVinpZtrNnkZvXd-MY5_2MAtRD7JP5BieHixfCaeAPW04jm-y-nvF3HIrwcZ_HRDk_MrNP5WiPV3u9zNrEgM-SQoWGh4xLVSV444aZAbVl03mjjsW5WBpIeodCyqJxprTDp6Q157D06VxcdUSCf-l9UKQT-w";

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

interface DefaultAgentInfo {
  name: string;
  role: string;
  imageUrl: string;
}

interface PropertyFormProps {
  mode: "create" | "edit";
  initialData?: AdminPropertyRecord;
  defaultAgent?: DefaultAgentInfo;
}

export default function PropertyForm({
  mode,
  initialData,
  defaultAgent,
}: PropertyFormProps) {
  const { locale, dict } = useI18n();
  const router = useRouter();
  const t = dict.admin.propertyForm;
  const isEdit = mode === "edit" && Boolean(initialData);
  const propertiesHref = localePath(locale, "/admin/properties");

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(initialData?.slug));
  const [priceValue, setPriceValue] = useState(
    initialData ? String(initialData.priceValue) : ""
  );
  const [listingType, setListingType] = useState<ListingType>(
    initialData?.listingType ?? "FOR SALE"
  );
  const [propertyType, setPropertyType] = useState<PropertyType>(
    initialData?.propertyType ?? "Apartment"
  );
  const [status, setStatus] = useState<PropertyStatus>(
    initialData?.status ?? "published"
  );
  const [isActive, setIsActive] = useState<boolean>(
    initialData?.isActive ?? true
  );
  const [estimatedPayment, setEstimatedPayment] = useState(
    initialData?.estimatedPayment ?? ""
  );
  const [badgesText, setBadgesText] = useState(
    initialData?.badges?.join(", ") ?? ""
  );
  const [isFeatured, setIsFeatured] = useState(
    initialData?.isFeatured ?? false
  );
  const [featuredBadge, setFeaturedBadge] = useState(
    initialData?.featuredBadge ?? ""
  );
  const [description, setDescription] = useState(
    initialData?.description?.join("\n\n") ?? ""
  );
  const [images, setImages] = useState<ManagedGalleryImage[]>(
    initialData?.images ?? []
  );
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [latitude, setLatitude] = useState(
    initialData ? String(initialData.latitude) : "37.4419"
  );
  const [longitude, setLongitude] = useState(
    initialData ? String(initialData.longitude) : "-122.1430"
  );
  const [area, setArea] = useState(
    initialData ? String(initialData.area) : ""
  );
  const [yearBuilt, setYearBuilt] = useState(
    initialData?.yearBuilt ? String(initialData.yearBuilt) : ""
  );
  const [beds, setBeds] = useState(initialData?.beds ?? 3);
  const [baths, setBaths] = useState(initialData?.baths ?? 2);
  const [garage, setGarage] = useState(initialData?.garage ?? 1);
  const [amenities, setAmenities] = useState<string[]>(
    initialData?.amenities ?? ["Air Conditioning"]
  );
  const [agentName, setAgentName] = useState(
    initialData?.agentName ?? defaultAgent?.name ?? "Elena Fisher"
  );
  const [agentRole, setAgentRole] = useState(
    initialData?.agentRole ?? defaultAgent?.role ?? "Senior Luxury Advisor"
  );
  const [agentImage, setAgentImage] = useState(
    initialData?.agentImage ?? defaultAgent?.imageUrl ?? DEFAULT_AGENT_AVATAR
  );

  // Track storage paths uploaded during this session vs. existing paths removed on edit
  const [sessionUploadedPaths, setSessionUploadedPaths] = useState<string[]>(
    []
  );
  const [removedPersistedPaths, setRemovedPersistedPaths] = useState<string[]>(
    []
  );

  const [isUploading, setIsUploading] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [bannerError, setBannerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<PropertyFieldErrorKey, string>>
  >({});

  const localizeFieldErrors = (
    raw?: Partial<Record<PropertyFieldErrorKey, string>>
  ): Partial<Record<PropertyFieldErrorKey, string>> => {
    if (!raw) return {};
    const mapped: Partial<Record<PropertyFieldErrorKey, string>> = {};
    if (raw.title) mapped.title = t.errorTitle;
    if (raw.slug) {
      mapped.slug = raw.slug === "slug_taken" ? t.errorSlugTaken : t.errorSlug;
    }
    if (raw.priceValue) mapped.priceValue = t.errorPrice;
    if (raw.location) mapped.location = t.errorLocation;
    if (raw.latitude) mapped.latitude = t.errorCoordinates;
    if (raw.longitude) mapped.longitude = t.errorCoordinates;
    if (raw.area) mapped.area = t.errorArea;
    if (raw.yearBuilt) mapped.yearBuilt = t.errorYearBuilt;
    if (raw.images) mapped.images = t.errorImages;
    if (raw.agentName) mapped.agentName = t.errorAgent;
    if (raw.agentRole) mapped.agentRole = t.errorAgent;
    if (raw.agentImage) mapped.agentImage = t.errorAgent;
    return mapped;
  };

  const handleTitleChange = (nextTitle: string) => {
    setTitle(nextTitle);
    if (!slugTouched) {
      setSlug(slugify(nextTitle));
    }
  };

  const handleSlugChange = (nextSlug: string) => {
    setSlugTouched(true);
    setSlug(
      nextSlug
        .toLowerCase()
        .replace(/[^a-z0-9-]+/g, "-")
        .replace(/-{2,}/g, "-")
    );
  };

  const handleAddImages = (added: ManagedGalleryImage[]) => {
    const newPaths = added
      .map((item) => item.tempStoragePath)
      .filter((p): p is string => Boolean(p));
    if (newPaths.length > 0) {
      setSessionUploadedPaths((prev) => [...prev, ...newPaths]);
    }
    setImages((prev) => [...prev, ...added]);
    setFieldErrors((prev) => ({ ...prev, images: undefined }));
  };

  const scheduleOrDeleteRemovedUrl = (url: string, tempPath?: string) => {
    if (tempPath) {
      void removePropertyImagesClient([tempPath]);
      setSessionUploadedPaths((prev) => prev.filter((p) => p !== tempPath));
      return;
    }
    const existingPath = extractStoragePathFromPublicUrl(url);
    if (existingPath) {
      setRemovedPersistedPaths((prev) =>
        prev.includes(existingPath) ? prev : [...prev, existingPath]
      );
    }
  };

  const handleReplaceImage = (
    index: number,
    nextImage: ManagedGalleryImage
  ) => {
    const previous = images[index];
    if (previous) {
      scheduleOrDeleteRemovedUrl(previous.url, previous.tempStoragePath);
    }
    if (nextImage.tempStoragePath) {
      setSessionUploadedPaths((prev) => [
        ...prev,
        nextImage.tempStoragePath as string,
      ]);
    }
    setImages((prev) =>
      prev.map((item, idx) => (idx === index ? nextImage : item))
    );
  };

  const handleRemoveImage = (index: number) => {
    const target = images[index];
    if (target) {
      scheduleOrDeleteRemovedUrl(target.url, target.tempStoragePath);
    }
    setImages((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSetMainImage = (index: number) => {
    if (index <= 0 || index >= images.length) return;
    setImages((prev) => {
      const copy = [...prev];
      const [picked] = copy.splice(index, 1);
      return [picked, ...copy];
    });
  };

  const handleUpdateAlt = (index: number, alt: string) => {
    setImages((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, alt } : item))
    );
  };

  const handleAgentImageChange = (nextUrl: string, uploadedPath?: string) => {
    if (uploadedPath) {
      setSessionUploadedPaths((prev) => [...prev, uploadedPath]);
    }
    setAgentImage(nextUrl);
  };

  const handleToggleAmenity = (amenity: string) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleCancel = () => {
    if (sessionUploadedPaths.length > 0) {
      void removePropertyImagesClient(sessionUploadedPaths);
    }
    router.push(propertiesHref);
  };

  const submitWithStatus = (overrideStatus?: PropertyStatus) => {
    const effectiveStatus = overrideStatus ?? status;
    setBannerError(null);
    setFieldErrors({});

    const payload: PropertyFormPayload = {
      title,
      slug: slug || slugify(title),
      priceValue: priceValue.trim() === "" ? 0 : Number(priceValue),
      listingType,
      propertyType,
      status: effectiveStatus,
      isActive,
      description,
      images: images.map(({ url, alt }) => ({ url, alt })),
      location,
      latitude: Number(latitude),
      longitude: Number(longitude),
      area: area.trim() === "" ? 0 : Number(area),
      yearBuilt: yearBuilt.trim() === "" ? null : Number(yearBuilt),
      beds,
      baths,
      garage,
      amenities,
      badges: badgesText
        .split(",")
        .map((b) => b.trim())
        .filter(Boolean),
      isFeatured,
      featuredBadge: featuredBadge.trim() || undefined,
      estimatedPayment: estimatedPayment.trim() || undefined,
      agentName,
      agentRole,
      agentImage,
    };

    startTransition(async () => {
      const result =
        isEdit && initialData
          ? await updatePropertyAction(
            initialData.id,
            payload,
            removedPersistedPaths
          )
          : await createPropertyAction(payload);

      if (!result.ok) {
        const localized = localizeFieldErrors(result.fieldErrors);
        setFieldErrors(localized);
        if (result.error === "slug_taken") {
          setBannerError(t.errorSlugTaken);
        } else if (result.error === "forbidden") {
          setBannerError(t.errorForbidden);
        } else {
          setBannerError(t.errorGeneric);
        }
        return;
      }

      router.push(propertiesHref);
      router.refresh();
    });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    submitWithStatus();
  };

  return (
    <div>
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-gray-200 pb-8">
        <div className="space-y-4">
          <nav aria-label="Breadcrumb" className="flex">
            <ol className="flex items-center space-x-2 text-sm text-gray-500 font-medium">
              <li>
                <Link
                  href={propertiesHref}
                  className="hover:text-mosque transition-colors"
                >
                  {t.breadcrumbProperties}
                </Link>
              </li>
              <li>
                <span className="material-icons text-xs text-gray-400 leading-none">
                  chevron_right
                </span>
              </li>
              <li aria-current="page" className="text-nordic">
                {isEdit ? t.breadcrumbEdit : t.breadcrumbNew}
              </li>
            </ol>
          </nav>

          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-nordic tracking-tight mb-2">
              {isEdit ? t.editTitle : t.createTitle}
            </h1>
            <p className="text-base text-gray-500 max-w-2xl font-normal">
              {isEdit ? t.editSubtitle : t.createSubtitle}
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3">
          <button
            type="button"
            disabled={isPending || isUploading}
            onClick={handleCancel}
            className="px-4 py-2.5 rounded-lg text-gray-500 hover:text-nordic hover:bg-white/70 transition-colors font-medium text-sm cursor-pointer disabled:opacity-60"
          >
            {t.cancel}
          </button>
          <button
            type="button"
            disabled={isPending || isUploading}
            onClick={() => submitWithStatus("draft")}
            className="px-5 py-2.5 rounded-lg border border-gray-300 bg-white text-nordic hover:bg-gray-50 transition-colors font-medium text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {t.saveDraft}
          </button>
          <button
            type="submit"
            form="admin-property-form"
            disabled={isPending || isUploading}
            className="px-5 py-2.5 rounded-lg bg-mosque hover:bg-nordic text-white font-medium shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 text-sm cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span className="material-icons text-sm leading-none">save</span>
            {isPending
              ? t.saving
              : isEdit
                ? t.updateProperty
                : t.saveProperty}
          </button>
        </div>
      </header>

      {isEdit && initialData && !initialData.isActive && (
        <div
          role="status"
          className={`mb-6 px-5 py-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
            isActive
              ? "bg-hint-of-green/40 border-mosque/20 text-nordic"
              : "bg-amber-50/90 border-amber-200 text-amber-950"
          }`}
        >
          <div className="flex items-start gap-3">
            <span
              className={`material-icons text-xl leading-none mt-0.5 ${
                isActive ? "text-mosque" : "text-amber-600"
              }`}
            >
              {isActive ? "check_circle" : "visibility_off"}
            </span>
            <div>
              {isActive ? (
                <p className="text-sm font-medium text-nordic">
                  {t.pendingReactivateBanner}
                </p>
              ) : (
                <>
                  <p className="text-sm font-semibold">{t.inactiveBannerTitle}</p>
                  <p className="text-xs text-amber-800/90 mt-0.5">
                    {t.inactiveBannerBody}
                  </p>
                </>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={isPending || isUploading}
            onClick={() => setIsActive((prev) => !prev)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer disabled:opacity-60 ${
              isActive
                ? "bg-white border border-gray-200 text-nordic hover:bg-gray-50"
                : "bg-mosque hover:bg-nordic text-white shadow-sm"
            }`}
          >
            {isActive ? t.keepInactiveButton : t.reactivateButton}
          </button>
        </div>
      )}

      {bannerError && (
        <div
          role="alert"
          className="mb-6 px-5 py-3.5 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700 flex items-center gap-2.5"
        >
          <span className="material-icons text-lg leading-none">
            error_outline
          </span>
          <span>{bannerError}</span>
        </div>
      )}

      <form
        id="admin-property-form"
        onSubmit={handleFormSubmit}
        noValidate
        className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start pb-20 md:pb-0"
      >
        <div className="xl:col-span-8 space-y-8">
          <BasicInfoCard
            title={title}
            slug={slug}
            priceValue={priceValue}
            listingType={listingType}
            propertyType={propertyType}
            status={status}
            estimatedPayment={estimatedPayment}
            badgesText={badgesText}
            isFeatured={isFeatured}
            featuredBadge={featuredBadge}
            fieldErrors={fieldErrors}
            onTitleChange={handleTitleChange}
            onSlugChange={handleSlugChange}
            onPriceChange={setPriceValue}
            onListingTypeChange={setListingType}
            onPropertyTypeChange={setPropertyType}
            onStatusChange={setStatus}
            onEstimatedPaymentChange={setEstimatedPayment}
            onBadgesChange={setBadgesText}
            onIsFeaturedChange={setIsFeatured}
            onFeaturedBadgeChange={setFeaturedBadge}
          />

          <DescriptionCard
            description={description}
            onChange={setDescription}
          />

          <GalleryCard
            images={images}
            slugHint={slug || title}
            fieldError={fieldErrors.images}
            isUploading={isUploading}
            onUploadingChange={setIsUploading}
            onAddImages={handleAddImages}
            onReplaceImage={handleReplaceImage}
            onUpdateAlt={handleUpdateAlt}
            onSetMainImage={handleSetMainImage}
            onRemoveImage={handleRemoveImage}
          />
        </div>

        <div className="xl:col-span-4 space-y-8">
          <LocationCard
            location={location}
            latitude={latitude}
            longitude={longitude}
            fieldErrors={fieldErrors}
            onLocationChange={setLocation}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            onCoordinatesPick={(lat, lng) => {
              setLatitude(String(lat));
              setLongitude(String(lng));
            }}
          />

          <AgentCard
            agentName={agentName}
            agentRole={agentRole}
            agentImage={agentImage}
            fieldErrors={fieldErrors}
            onAgentNameChange={setAgentName}
            onAgentRoleChange={setAgentRole}
            onAgentImageChange={handleAgentImageChange}
          />

          <DetailsCard
            area={area}
            yearBuilt={yearBuilt}
            beds={beds}
            baths={baths}
            garage={garage}
            amenities={amenities}
            fieldErrors={fieldErrors}
            onAreaChange={setArea}
            onYearBuiltChange={setYearBuilt}
            onBedsChange={setBeds}
            onBathsChange={setBaths}
            onGarageChange={setGarage}
            onToggleAmenity={handleToggleAmenity}
          />
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-xl md:hidden z-40 flex gap-3">
          <button
            type="button"
            disabled={isPending}
            onClick={handleCancel}
            className="flex-1 py-3 rounded-lg border border-gray-300 bg-white text-nordic font-medium"
          >
            {t.cancel}
          </button>
          <button
            type="submit"
            disabled={isPending || isUploading}
            className="flex-1 py-3 rounded-lg bg-mosque text-white font-medium flex justify-center items-center gap-2 disabled:opacity-60"
          >
            {isPending ? t.saving : t.saveMobile}
          </button>
        </div>
      </form>
    </div>
  );
}
