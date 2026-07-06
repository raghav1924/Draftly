"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ChevronLeft, Share2, CloudLightning, CheckCircle2, AlertCircle } from "lucide-react";
import { useEditor, EditorContent, type JSONContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";

import { Button } from "@/components/ui/button";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { ShareDialog } from "@/components/editor/share-dialog";
import { updateDocumentContentAction } from "@/lib/actions/documents";
import type { Document } from "@/types/database";
import { cn } from "@/lib/utils/cn";

interface TipTapEditorProps {
  document: Document;
  userEmail: string;
  isEditable: boolean;
  isOwner: boolean;
}

type SaveStatus = "saved" | "saving" | "idle" | "error";

export function TipTapEditor({
  document: initialDoc,
  userEmail,
  isEditable,
  isOwner,
}: TipTapEditorProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [isShareOpen, setIsShareOpen] = useState(false);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: "Start writing your document here...",
      }),
    ],
    content: (initialDoc.content as unknown as JSONContent) || {
      type: "doc",
      content: [{ type: "paragraph" }],
    },
    editable: isEditable,
    onUpdate: ({ editor: activeEditor }) => {
      if (!isEditable) return;

      // Set saving state
      setSaveStatus("saving");

      // Clear existing timeout
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }

      // Schedule autosave after 1.5 seconds of inactivity
      saveTimeoutRef.current = setTimeout(async () => {
        try {
          const jsonContent = activeEditor.getJSON();
          const res = await updateDocumentContentAction(initialDoc.id, jsonContent);
          if (res.success) {
            setSaveStatus("saved");
            // Set back to idle after a few seconds
            setTimeout(() => {
              setSaveStatus((current) => (current === "saved" ? "idle" : current));
            }, 3000);
          } else {
            setSaveStatus("error");
          }
        } catch {
          setSaveStatus("error");
        }
      }, 1500);
    },
    editorProps: {
      attributes: {
        class: "focus:outline-none min-h-[450px] w-full text-zinc-200",
      },
    },
  });

  // Warn user before leaving page if changes are currently saving
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === "saving") {
        e.preventDefault();
        return (e.returnValue = "Changes you made may not be saved.");
      }
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [saveStatus]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, []);

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
              {initialDoc.title}
            </h1>
            <p className="text-[10px] text-zinc-500">
              {isEditable ? "Editor Mode" : "Viewer Mode (Read-Only)"}
            </p>
          </div>
        </div>

        {/* Sync Indicator & Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Sync Status Badge */}
          {isEditable && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-900 bg-zinc-950 text-xs">
              {saveStatus === "idle" && (
                <>
                  <CheckCircle2 size={13} className="text-zinc-500" />
                  <span className="text-zinc-500">Synced to cloud</span>
                </>
              )}
              {saveStatus === "saving" && (
                <>
                  <CloudLightning size={13} className="text-indigo-400 animate-pulse" />
                  <span className="text-zinc-400">Saving changes...</span>
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <CheckCircle2 size={13} className="text-emerald-400" />
                  <span className="text-emerald-400">All changes saved</span>
                </>
              )}
              {saveStatus === "error" && (
                <>
                  <AlertCircle size={13} className="text-rose-400" />
                  <span className="text-rose-400">Auto-save error</span>
                </>
              )}
            </div>
          )}

          {!isEditable && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize border border-zinc-800 bg-zinc-900/50 text-zinc-400 shrink-0">
              Read Only
            </span>
          )}

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={!isOwner}
              onClick={() => setIsShareOpen(true)}
              className={cn(
                "border-zinc-900 text-zinc-400 bg-zinc-900/30",
                isOwner && "hover:bg-zinc-800 hover:text-white border-zinc-800 cursor-pointer text-zinc-300"
              )}
            >
              <Share2 size={14} className="mr-1.5" />
              Share
            </Button>
          </div>
        </div>
      </header>

      {/* Toolbar & Canvas */}
      <main className="flex-grow max-w-4xl w-full mx-auto p-4 md:p-8 flex flex-col space-y-4">
        {/* Render Toolbar only if editable */}
        {isEditable && <EditorToolbar editor={editor} />}

        {/* Editor Container */}
        <div className="flex-1 flex flex-col border border-zinc-900 bg-zinc-900/10 rounded-3xl p-8 md:p-12 min-h-[500px] shadow-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-3xl -z-10 group-hover:bg-indigo-500/10 transition-colors duration-500" />

          {/* Title Area */}
          <div className="border-b border-zinc-900 pb-4 mb-6">
            <h2 className="text-3xl font-bold tracking-tight text-white/90">
              {initialDoc.title}
            </h2>
            <div className="mt-1.5 text-[10px] text-zinc-500 flex items-center gap-2">
              <span>Owner: {initialDoc.owner_id === userEmail ? "Me" : initialDoc.owner_id}</span>
              <span>•</span>
              <span>Updated {new Date(initialDoc.updated_at).toLocaleString()}</span>
            </div>
          </div>

          {/* Actual TipTap Editor Content */}
          <div className="flex-grow prose prose-invert max-w-none">
            <EditorContent editor={editor} />
          </div>
        </div>
      </main>

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        documentId={initialDoc.id}
        documentTitle={initialDoc.title}
      />
    </div>
  );
}
