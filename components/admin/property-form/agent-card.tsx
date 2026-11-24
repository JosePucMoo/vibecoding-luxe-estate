"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useI18n } from "@/i18n/i18n-provider";
import {
  ALLOWED_IMAGE_MIME_TYPES,
  uploadPropertyImageClient,
  validateImageFile,
} from "@/lib/storage";
import type { PropertyFieldErrorKey } from "@/types/admin";

interface AgentCardProps {
  agentName: string;
  agentRole: string;
  agentImage: string;
  fieldErrors: Partial<Record<PropertyFieldErrorKey, string>>;
  onAgentNameChange: (value: string) => void;
  onAgentRoleChange: (value: string) => void;
  onAgentImageChange: (value: string, uploadedPath?: string) => void;
}

export default function AgentCard({
  agentName,
  agentRole,
  agentImage,
  fieldErrors,
  onAgentNameChange,
  onAgentRoleChange,
  onAgentImageChange,
}: AgentCardProps) {
  const { dict } = useI18n();
  const t = dict.admin.propertyForm;
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleAvatarUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const validation = validateImageFile(file);
    if (validation) {
      setUploadError(
        validation === "invalid_type"
          ? t.errorInvalidFileType
          : t.errorFileTooLarge
      );
      return;
    }

    setUploadError(null);
    setUploading(true);
    try {
      const { url, path } = await uploadPropertyImageClient(file, "agents");
      onAgentImageChange(url, path);
    } catch {
      setUploadError(t.errorUploadFailed);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const hasValidPreview =
    agentImage.startsWith("https://") || agentImage.startsWith("http://");

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="px-6 py-4 border-b border-hint-green/30 flex items-center gap-3 bg-gradient-to-r from-hint-green/10 to-transparent">
        <div className="w-8 h-8 rounded-full bg-hint-green flex items-center justify-center text-nordic">
          <span className="material-icons text-lg leading-none">person</span>
        </div>
        <h2 className="text-lg font-bold text-nordic">{t.agentTitle}</h2>
      </div>

      <div className="p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded-full overflow-hidden bg-clear-day border border-gray-200 flex-shrink-0 flex items-center justify-center">
            {hasValidPreview ? (
              <Image
                src={agentImage}
                alt={agentName || "Agent"}
                fill
                sizes="48px"
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="material-icons text-gray-400">person</span>
            )}
          </div>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
              onChange={(e) => void handleAvatarUpload(e.target.files)}
              className="hidden"
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 rounded-md border border-gray-200 bg-gray-50 hover:bg-hint-green/20 hover:border-mosque/30 text-xs font-medium text-nordic inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <span className="material-icons text-sm leading-none text-mosque">
                cloud_upload
              </span>
              {uploading ? t.saving : t.agentUploadPhoto}
            </button>
          </div>
        </div>

        {uploadError && (
          <p className="text-xs text-red-600">{uploadError}</p>
        )}

        <div>
          <label
            htmlFor="agent-name"
            className="block text-xs text-gray-500 font-medium mb-1"
          >
            {t.agentNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="agent-name"
            type="text"
            value={agentName}
            onChange={(e) => onAgentNameChange(e.target.value)}
            placeholder={t.agentNamePlaceholder}
            className={`w-full px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.agentName ? "border-red-400" : "border-gray-200"
              }`}
          />
          {fieldErrors.agentName && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.agentName}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="agent-role"
            className="block text-xs text-gray-500 font-medium mb-1"
          >
            {t.agentRoleLabel} <span className="text-red-500">*</span>
          </label>
          <input
            id="agent-role"
            type="text"
            value={agentRole}
            onChange={(e) => onAgentRoleChange(e.target.value)}
            placeholder={t.agentRolePlaceholder}
            className={`w-full px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-sm ${fieldErrors.agentRole ? "border-red-400" : "border-gray-200"
              }`}
          />
          {fieldErrors.agentRole && (
            <p className="mt-1 text-xs text-red-600">{fieldErrors.agentRole}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="agent-image"
            className="block text-xs text-gray-500 font-medium mb-1"
          >
            {t.agentImageLabel}
          </label>
          <input
            id="agent-image"
            type="url"
            value={agentImage}
            onChange={(e) => onAgentImageChange(e.target.value)}
            className={`w-full px-3 py-2 rounded border bg-gray-50 text-nordic focus:bg-white focus:outline-none focus:ring-1 focus:ring-mosque focus:border-mosque transition-all text-xs ${fieldErrors.agentImage ? "border-red-400" : "border-gray-200"
              }`}
          />
          {fieldErrors.agentImage && (
            <p className="mt-1 text-xs text-red-600">
              {fieldErrors.agentImage}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
