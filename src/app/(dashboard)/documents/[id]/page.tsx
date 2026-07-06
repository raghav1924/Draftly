import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Share2, Save, FileEdit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getDocument } from "@/lib/actions/documents";
import { getCurrentProfile } from "@/lib/actions/auth";

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

  const isOwner = document.owner_id === profile.id;

  return (
    <div className="min-h-screen flex flex-col bg-zinc-950 text-zinc-100 selection:bg-zinc-800">
      {/* Editor Navbar */}
      <header className="w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-xl sticky top-0 z-30 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            href="/dashboard"
            className="h-9 w-9 rounded-xl border border-zinc-800 hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-all shrink-0"
            title="Back to Dashboard"
          >
            <ChevronLeft size={18} />
          </Link>
          
          <div className="min-w-0">
            <h1 className="text-sm font-semibold text-white truncate max-w-[200px] sm:max-w-md">
              {document.title}
            </h1>
            <p className="text-[10px] text-zinc-500">
              {isOwner ? "Owner" : "Shared Document"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled
            className="border-zinc-900 text-zinc-400 hover:text-zinc-400 bg-zinc-900/30"
          >
            <Share2 size={14} className="mr-1.5" />
            Share
          </Button>
          <Button
            size="sm"
            disabled
            className="bg-indigo-600/30 text-indigo-400 border border-indigo-900/50 hover:bg-indigo-600/30"
          >
            <Save size={14} className="mr-1.5" />
            Saved
          </Button>
        </div>
      </header>

      {/* Editor Canvas Placeholder */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-6 md:p-12 flex flex-col">
        <div className="flex-1 flex flex-col border border-zinc-900 bg-zinc-900/10 rounded-3xl p-8 md:p-12 min-h-[500px] shadow-2xl relative overflow-hidden group">
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500" />
          
          {/* Document Header */}
          <div className="border-b border-zinc-900 pb-6 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90">
              {document.title}
            </h2>
            <div className="mt-2 text-xs text-zinc-500 flex items-center gap-2">
              <span>Created {new Date(document.created_at).toLocaleDateString()}</span>
              <span>•</span>
              <span>Last updated {new Date(document.updated_at).toLocaleDateString()}</span>
            </div>
          </div>

          {/* Canvas loading state representing TipTap setup */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4">
            <div className="h-10 w-10 rounded-xl bg-indigo-950/20 border border-indigo-900/50 text-indigo-400 flex items-center justify-center animate-pulse">
              <FileEdit size={20} />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-zinc-200">Editor Engine Standby</h3>
              <p className="text-xs text-zinc-500 max-w-sm">
                The document is loaded. TipTap editor with markdown support, autosave, and collaborative toolbars will initialize in Phase 3.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
