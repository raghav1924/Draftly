"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import type { Document, SharePermission } from "@/types/database";
import type { ActionResult } from "@/lib/actions/auth";

export async function getOwnedDocuments(): Promise<Document[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("owner_id", user.id)
    .order("updated_at", { ascending: false });

  return (data as Document[]) || [];
}

export async function getSharedDocuments(): Promise<(Document & { permission: SharePermission })[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data: shares } = (await supabase
    .from("document_shares")
    .select("permission, documents(*)")
    .eq("user_id", user.id)) as unknown as {
    data: { permission: SharePermission; documents: Document | null }[] | null;
  };

  if (!shares) {
    return [];
  }

  return shares
    .filter((share) => share.documents !== null)
    .map((share) => ({
      ...(share.documents as Document),
      permission: share.permission,
    }));
}

export async function getDocument(id: string): Promise<Document | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("documents")
    .select("*")
    .eq("id", id)
    .single();

  return (data as unknown as Document) || null;
}

export async function createDocumentAction(
  title?: string,
): Promise<ActionResult<string>> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase.from("documents") as any)
    .insert({
      owner_id: user.id,
      title: title?.trim() || "Untitled Document",
      content: { type: "doc", content: [{ type: "paragraph" }] },
    })
    .select()
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  redirect(`/documents/${data.id}`);
}

export async function renameDocumentAction(
  id: string,
  title: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  const cleanedTitle = title.trim();
  if (!cleanedTitle || cleanedTitle.length > 100) {
    return { success: false, error: "Title must be between 1 and 100 characters" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("documents") as any)
    .update({ title: cleanedTitle })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/documents/${id}`);
  return { success: true, data: undefined };
}

export async function deleteDocumentAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Unauthorized" };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("documents") as any)
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/dashboard");
  return { success: true, data: undefined };
}
