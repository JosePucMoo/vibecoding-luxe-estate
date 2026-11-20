"use server";

import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import {
  isUserRole,
  isUserStatus,
  type UpdateUserResult,
  type UserRole,
  type UserStatus,
} from "@/types/admin";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function updateProfile(
  targetId: string,
  patch: { role: UserRole } | { status: UserStatus }
): Promise<UpdateUserResult> {
  // Always re-validate on the server: never trust the client.
  const admin = await getCurrentUser();
  if (!admin || admin.role !== "admin" || admin.status !== "active") {
    return { ok: false, error: "forbidden" };
  }
  if (typeof targetId !== "string" || !UUID.test(targetId)) {
    return { ok: false, error: "invalid" };
  }
  if (admin.id === targetId) return { ok: false, error: "self" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("user_profiles")
    .update(patch)
    .eq("id", targetId)
    .select("id");

  if (error) return { ok: false, error: "generic" };
  // RLS filters rows silently: 0 rows means nothing was updated.
  if (!data || data.length === 0) return { ok: false, error: "forbidden" };
  return { ok: true };
}

export async function updateUserRoleAction(
  targetId: string,
  role: UserRole
): Promise<UpdateUserResult> {
  if (!isUserRole(role)) return { ok: false, error: "invalid" };
  return updateProfile(targetId, { role });
}

export async function updateUserStatusAction(
  targetId: string,
  status: UserStatus
): Promise<UpdateUserResult> {
  if (!isUserStatus(status)) return { ok: false, error: "invalid" };
  return updateProfile(targetId, { status });
}
