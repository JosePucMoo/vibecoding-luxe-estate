"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/i18n-provider";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  uploadPropertyImageClient,
  validateImageFile,
} from "@/lib/storage";
import type { PropertyImage } from "@/types/property";

export interface ManagedGalleryImage extends PropertyImage {
  /** Present when uploaded in the current unsaved session. */
  tempStoragePath?: string;
}

interface GalleryCardProps {
  images: ManagedGalleryImage[];
  slugHint: string;
  fieldError?: string;
  isUploading: boolean;
  onUploadingChange: (uploading: boolean) => void;
  onAddImages: (added: ManagedGalleryImage[]) => void;
  onReplaceImage: (index: number, nextImage: ManagedGalleryImage) => void;
  onUpdateAlt: (index: number, alt: string) => void;
  onSetMainImage: (index: number) => void;
  onRemoveImage: (index: number) => void;
}

export default function GalleryCard({
  images,
  slugHint,
  fieldError,
  isUploading,
  onUploadingChange,
  onAddImages,
  onReplaceImage,
  onUpdateAlt,
  onSetMainImage,
  onRemoveImage,
}: GalleryCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;

  const addInputRef = useRef<HTMLInputElement | null>(null);
  const replaceInputRef = useRef<HTMLInputElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const translateValidationError = (code: string): string => {
    if (code === "invalid_type") return t.errorInvalidFileType;
    if (code === "file_too_large") return t.errorFileTooLarge;
    return t.errorUploadFailed;
  };

  const handleUploadFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setUploadError(null);

    const files = Array.from(fileList);
    for (const file of files) {
      const validation = validateImageFile(file);
      if (validation) {
        setUploadError(translateValidationError(validation));
        return;
      }
    }

    onUploadingChange(true);
    try {
      const uploaded: ManagedGalleryImage[] = [];
      for (const file of files) {
        const { url, path } = await uploadPropertyImageClient(
          file,
          slugHint || "listings"
        );
        const cleanName = file.name
          .replace(/\.[^/.]+$/, "")
          .replace(/[-_]+/g, " ")
          .trim();
        uploaded.push({
          url,
          alt: cleanName || "Property interior",
          tempStoragePath: path,
        });
      }
      onAddImages(uploaded);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setUploadError(translateValidationError(msg));
    } finally {
      onUploadingChange(false);
      if (addInputRef.current) addInputRef.current.value = "";
    }
  };

  const handleReplaceFile = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0 || editingIndex === null) return;
    const file = fileList[0];
    const validation = validateImageFile(file);
    if (validation) {
      setUploadError(translateValidationError(validation));
      return;
    }

    setUploadError(null);
    onUploadingChange(true);
    try {
      const { url, path } = await uploadPropertyImageClient(
        file,
        slugHint || "listings"
      );
      const currentAlt = images[editingIndex]?.alt ?? "";
      onReplaceImage(editingIndex, {
        url,
        alt: currentAlt,
        tempStoragePath: path,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      setUploadError(translateValidationError(msg));
    } finally {
      onUploadingChange(false);
      if (replaceInputRef.current) replaceInputRef.current.value = "";
    }
  };

  const activeEditedImage =
    editingIndex !== null && images[editingIndex] ? images[editingIndex] : null;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-8 py-6 border-b border-hint-green/30 flex justify-between items-center bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
            <span className="material-icons text-lg leading-none">image</span>
          </div>
          <h2 className="text-xl font-bold text-nordic">{t.galleryTitle}</h2>
        </div>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded">
          {t.galleryFormats}
        </span>
      </div>

      <div className="p-8">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            void handleUploadFiles(e.dataTransfer.files);
          }}
          className={`relative border-2 border-dashed rounded-xl p-10 text-center transition-colors cursor-pointer group ${isDragging
            ? "border-mosque bg-hint-green/20"
            : fieldError
              ? "border-red-300 bg-red-50/30"
              : "border-gray-300 bg-gray-50/50 hover:bg-hint-green/10 hover:border-mosque/40"
            }`}
        >
          <input
            ref={addInputRef}
            type="file"
            multiple
            disabled={isUploading}
            accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
            onChange={(e) => void handleUploadFiles(e.target.files)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-wait"
          />
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-mosque group-hover:scale-110 transition-transform duration-300">
              <span className="material-icons text-2xl leading-none">
                {isUploading ? "hourglass_top" : "cloud_upload"}
              </span>
            </div>
            <div className="space-y-1">
              <p className="text-base font-medium text-nordic">
                {isUploading ? t.galleryUploading : t.galleryDropTitle}
              </p>
              <p className="text-xs text-gray-400">{t.galleryDropHint}</p>
            </div>
          </div>
        </div>

        {(uploadError || fieldError) && (
          <div
            role="alert"
            className="mt-4 px-4 py-2.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700 flex items-center gap-2"
          >
            <span className="material-icons text-base leading-none">
              error_outline
            </span>
            <span>{uploadError ?? fieldError}</span>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          {images.map((img, index) => {
            const isMain = index === 0;
            const isEditingThis = editingIndex === index;
            return (
              <div
                key={`${img.url}-${index}`}
                className={`aspect-square rounded-lg overflow-hidden relative group shadow-sm bg-gray-100 ${isEditingThis ? "ring-2 ring-mosque" : ""
                  }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `Property photo ${index + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-nordic/60 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-[2px]">
                  {!isMain && (
                    <button
                      type="button"
                      title={t.gallerySetMain}
                      aria-label={t.gallerySetMain}
                      onClick={() => {
                        setEditingIndex(null);
                        onSetMainImage(index);
                      }}
                      className="w-8 h-8 rounded-full bg-white text-mosque hover:bg-hint-green/40 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <span className="material-icons text-sm leading-none">
                        star
                      </span>
                    </button>
                  )}
                  <button
                    type="button"
                    title={t.galleryEditImage}
                    aria-label={t.galleryEditImage}
                    onClick={() =>
                      setEditingIndex((prev) => (prev === index ? null : index))
                    }
                    className="w-8 h-8 rounded-full bg-white text-nordic hover:bg-gray-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-sm leading-none">
                      edit
                    </span>
                  </button>
                  <button
                    type="button"
                    title={t.galleryDeleteImage}
                    aria-label={t.galleryDeleteImage}
                    onClick={() => {
                      if (editingIndex === index) setEditingIndex(null);
                      else if (editingIndex !== null && editingIndex > index) {
                        setEditingIndex(editingIndex - 1);
                      }
                      onRemoveImage(index);
                    }}
                    className="w-8 h-8 rounded-full bg-white text-red-500 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <span className="material-icons text-sm leading-none">
                      delete
                    </span>
                  </button>
                </div>

                {isMain && (
                  <span className="absolute top-2 left-2 bg-mosque text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm uppercase tracking-wider">
                    {t.galleryMainBadge}
                  </span>
                )}
              </div>
            );
          })}

          <button
            type="button"
            disabled={isUploading}
            onClick={() => addInputRef.current?.click()}
            className="aspect-square rounded-lg border border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:text-mosque hover:border-mosque hover:bg-hint-green/20 transition-all group cursor-pointer disabled:opacity-50"
          >
            <span className="material-icons group-hover:scale-110 transition-transform leading-none">
              add
            </span>
            <span className="text-xs mt-1 font-medium">{t.galleryAddMore}</span>
          </button>
        </div>

        {activeEditedImage && editingIndex !== null && (
          <div className="mt-6 p-4 rounded-xl bg-clear-day border border-mosque/15 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-end gap-3">
              <div className="flex-1">
                <label
                  htmlFor="gallery-image-alt"
                  className="block text-xs font-medium text-nordic mb-1"
                >
                  {t.galleryAltLabel}
                </label>
                <input
                  id="gallery-image-alt"
                  type="text"
                  value={activeEditedImage.alt}
                  onChange={(e) => onUpdateAlt(editingIndex, e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-gray-200 bg-white text-sm text-nordic focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={replaceInputRef}
                  type="file"
                  accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
                  onChange={(e) => void handleReplaceFile(e.target.files)}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isUploading}
                  onClick={() => replaceInputRef.current?.click()}
                  className="px-3.5 py-2 rounded-md border border-mosque/30 bg-white text-mosque hover:bg-hint-green/30 text-xs font-medium inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-icons text-sm leading-none">
                    upload_file
                  </span>
                  {t.galleryReplaceFile}
                </button>
                <button
                  type="button"
                  onClick={() => setEditingIndex(null)}
                  className="px-3.5 py-2 rounded-md bg-mosque text-white hover:bg-nordic text-xs font-medium transition-colors cursor-pointer"
                >
                  {t.galleryDoneEditing}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
