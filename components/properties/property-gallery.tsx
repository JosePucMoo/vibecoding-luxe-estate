"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { PropertyImage } from "@/types/property";
import { format } from "@/i18n/format";
import { useI18n } from "@/i18n/i18n-provider";

interface PropertyGalleryProps {
  images: PropertyImage[];
  badges: string[];
  title: string;
}

export default function PropertyGallery({
  images,
  badges,
  title,
}: PropertyGalleryProps) {
  const { dict } = useI18n();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const safeImages =
    images.length > 0
      ? images
      : [
          {
            url: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjNDU9iE4zwPuWeg-CjIrLI-87GF24_LgOggcXT0vmUYfMx2q1dJAheiqWqVN-39uiwyLKEfP18FsG1vtUyAPX902OhGEfM4clcQiDsJW7MBbc_BoMtZXtqIeFKIfkHnkIPwmFbQg8Eaan6ULV99T8AUVUuKsro0HoTMrIaxw5pp1uSuQlF8X5Dait4US1W4vmyZnVioXbFnCoaOOZ0LPorb0rVGAIQd9reWcpqq27C0oO4ltnsCTHIcjIm0xp-2qVbRJSIZzWPv0",
            alt: title,
          },
        ];

  const activeImage = safeImages[selectedIndex] ?? safeImages[0];

  const handlePrev = useCallback(() => {
    setSelectedIndex((prev) => (prev === 0 ? safeImages.length - 1 : prev - 1));
  }, [safeImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIndex((prev) => (prev === safeImages.length - 1 ? 0 : prev + 1));
  }, [safeImages.length]);

  useEffect(() => {
    if (!isLightboxOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setIsLightboxOpen(false);
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, handlePrev, handleNext]);

  return (
    <div className="space-y-4">
      {/* Main Hero Image */}
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl shadow-sm group bg-[#D9ECC8]/30">
        <Image
          src={activeImage.url}
          alt={activeImage.alt || title}
          fill
          priority={selectedIndex === 0}
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Top Left Badges */}
        {badges.length > 0 && (
          <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
            {badges.map((badge, index) =>
              index === 0 ? (
                <span
                  key={badge}
                  className="bg-[#006655] text-white text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm"
                >
                  {badge}
                </span>
              ) : (
                <span
                  key={badge}
                  className="bg-white/90 backdrop-blur text-[#19322F] text-xs font-medium px-3 py-1.5 rounded-full uppercase tracking-wider shadow-sm"
                >
                  {badge}
                </span>
              )
            )}
          </div>
        )}

        {/* View All Photos Button */}
        <button
          type="button"
          onClick={() => setIsLightboxOpen(true)}
          className="absolute bottom-4 right-4 z-10 bg-white/90 hover:bg-white text-[#19322F] px-4 py-2 rounded-lg text-sm font-medium shadow-lg backdrop-blur transition-all flex items-center gap-2 cursor-pointer"
        >
          <span className="material-icons text-sm leading-none">grid_view</span>
          {dict.gallery.viewAllPhotos}
        </button>
      </div>

      {/* Thumbnail Strip (1..n images) */}
      <div className="flex gap-4 overflow-x-auto hide-scroll px-1 pt-1 pb-2 snap-x">
        {safeImages.map((image, index) => {
          const isSelected = index === selectedIndex;

          return (
            <button
              key={`${image.url}-${index}`}
              type="button"
              onClick={() => setSelectedIndex(index)}
              aria-label={format(dict.gallery.viewPhoto, {
                index: index + 1,
                alt: image.alt,
              })}
              aria-current={isSelected ? "true" : undefined}
              className={`relative flex-none w-48 aspect-[4/3] rounded-lg overflow-hidden cursor-pointer snap-start bg-[#D9ECC8]/30 focus:outline-none ${
                isSelected
                  ? "ring-2 ring-[#006655] ring-offset-2 ring-offset-[#EEF6F6]"
                  : "opacity-70 hover:opacity-100 transition-opacity"
              }`}
            >
              <Image
                src={image.url}
                alt={image.alt || `${title} thumbnail ${index + 1}`}
                fill
                sizes="192px"
                className="object-cover"
              />
            </button>
          );
        })}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={format(dict.gallery.photoGallery, { title })}
          className="fixed inset-0 z-50 bg-[#19322F]/95 backdrop-blur-md flex flex-col items-center justify-center p-4 sm:p-8"
        >
          <div className="w-full max-w-6xl flex items-center justify-between text-white mb-4">
            <span className="text-sm font-medium text-white/80">
              {selectedIndex + 1} / {safeImages.length} — {activeImage.alt || title}
            </span>
            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              aria-label={dict.gallery.close}
              className="w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
            >
              <span className="material-icons leading-none">close</span>
            </button>
          </div>

          <div className="relative w-full max-w-5xl aspect-[16/10] rounded-xl overflow-hidden bg-black/40">
            <Image
              src={activeImage.url}
              alt={activeImage.alt || title}
              fill
              sizes="90vw"
              className="object-contain"
            />

            {safeImages.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label={dict.gallery.previous}
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#19322F] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <span className="material-icons leading-none">
                    chevron_left
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  aria-label={dict.gallery.next}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/90 hover:bg-white text-[#19322F] flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                >
                  <span className="material-icons leading-none">
                    chevron_right
                  </span>
                </button>
              </>
            )}
          </div>

          <div className="flex gap-3 overflow-x-auto hide-scroll max-w-5xl mt-6 py-2 px-2">
            {safeImages.map((image, index) => (
              <button
                key={`lightbox-${image.url}-${index}`}
                type="button"
                onClick={() => setSelectedIndex(index)}
                className={`relative flex-none w-24 aspect-[4/3] rounded-md overflow-hidden cursor-pointer transition-all ${
                  index === selectedIndex
                    ? "ring-2 ring-[#006655] opacity-100 scale-105"
                    : "opacity-50 hover:opacity-90"
                }`}
              >
                <Image
                  src={image.url}
                  alt={image.alt || `${title} photo ${index + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
