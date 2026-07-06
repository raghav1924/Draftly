import Link from "next/link";
import { redirect } from "next/navigation";
import { FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocument } from "@/lib/actions/documents";
import { getCurrentProfile } from "@/lib/actions/auth";
import { createClient } from "@/lib/supabase/server";
import { TipTapEditor } from "@/components/editor/tiptap-editor";
import type { SharePermission } from "@/types/database";

interface DocumentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DocumentPage({ params }: DocumentPageProps) {
  const { id } = await params;
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const document = await getDocument(id);

  if (!document) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 text-zinc-100 p-6">
        <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-xl text-center space-y-6">
          <div className="mx-auto h-12 w-12 rounded-2xl bg-red-950/20 border border-red-900/50 flex items-center justify-center text-red-400">
            <FileEdit size={24} />
          </div>
          <div className="space-y-1">
            <h1 className="text-xl font-bold tracking-tight text-white">Document Not Found</h1>
            <p className="text-sm text-zinc-400">
              The document you are looking for does not exist or you do not have permission to view it.
            </p>
          </div>
          <Button asChild className="w-full border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800" variant="outline">
            <Link href="/dashboard">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Determine permission (Owner vs Editor vs Viewer)
  let isEditable = false;
  if (document.owner_id === profile.id) {
    isEditable = true;
  } else {
    const supabase = await createClient();
    const { data: share } = (await supabase
      .from("document_shares")
      .select("permission")
      .eq("document_id", id)
      .eq("user_id", profile.id)
      .single()) as unknown as { data: { permission: SharePermission } | null };

    if (share && share.permission === "editor") {
      isEditable = true;
    }
  }

  return (
    <TipTapEditor
      document={document}
      userEmail={profile.email}
      isEditable={isEditable}
    />
  );
}
