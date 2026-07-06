"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { SharePermission, Profile } from "@/types/database";
import type { ActionResult } from "@/lib/actions/auth";

export interface DocumentShareDetails {
  id: string;
  permission: SharePermission;
  created_at: string;
  user_id: string;
  profiles: Profile | null;
}

export async function getDocumentShares(
  documentId: string,
): Promise<DocumentShareDetails[]> {
  const supabase = await createClient();

  // Cast the query because supabase client types do not automatically resolve the join mapping
  const { data } = (await supabase
    .from("document_shares")
    .select("id, permission, created_at, user_id, profiles(*)")
    .eq("document_id", documentId)) as unknown as {
    data: DocumentShareDetails[] | null;
  };

  return data || [];
}

export async function shareDocumentAction(
  documentId: string,
  email: string,
  permission: SharePermission,
): Promise<ActionResult> {
  const supabase = await createClient();
  const targetEmail = email.trim().toLowerCase();

  // Find user by email
  const { data: targetUser, error: userError } = await supabase
    .from("profiles")
    .select("*")
    .eq("email", targetEmail)
    .single();

  if (userError || !targetUser) {
    return { success: false, error: "User not found with this email address" };
  }

  // Check if they are the document owner
  const { data: doc } = (await supabase
    .from("documents")
    .select("owner_id")
    .eq("id", documentId)
    .single()) as unknown as { data: { owner_id: string } | null };

  if (doc && doc.owner_id === targetUser.id) {
    return { success: false, error: "You cannot share the document with the owner" };
  }

  // Create share record
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("document_shares") as any).insert({
    document_id: documentId,
    user_id: targetUser.id,
    permission,
  });

  if (error) {
    if (error.code === "23505") { // Postgres unique constraint code
      return { success: false, error: "This document is already shared with this user" };
    }
    return { success: false, error: error.message };
  }

  revalidatePath(`/documents/${documentId}`);
  return { success: true, data: undefined };
}

export async function updateSharePermissionAction(
  shareId: string,
  permission: SharePermission,
  documentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("document_shares") as any)
    .update({ permission })
    .eq("id", shareId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/documents/${documentId}`);
  return { success: true, data: undefined };
}

export async function removeShareAction(
  shareId: string,
  documentId: string,
): Promise<ActionResult> {
  const supabase = await createClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("document_shares") as any)
    .delete()
    .eq("id", shareId);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath(`/documents/${documentId}`);
  return { success: true, data: undefined };
}
