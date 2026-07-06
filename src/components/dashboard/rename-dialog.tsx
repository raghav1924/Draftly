"use client";

import { useEffect, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { renameDocumentAction } from "@/lib/actions/documents";

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  currentTitle: string;
}

export function RenameDialog({
  isOpen,
  onClose,
  documentId,
  currentTitle,
}: RenameDialogProps) {
  const [title, setTitle] = useState(currentTitle);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanTitle = title.trim();
    if (!cleanTitle) {
      toast.error("Title cannot be empty");
      return;
    }
    if (cleanTitle.length > 100) {
      toast.error("Title must be 100 characters or less");
      return;
    }

    startTransition(async () => {
      const res = await renameDocumentAction(documentId, cleanTitle);
      if (res.success) {
        toast.success("Document renamed successfully");
        onClose();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-md p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-2xl space-y-4 z-10 scale-95 animate-in fade-in zoom-in-95 duration-200">
        <div className="space-y-1.5">
          <h3 className="text-lg font-bold leading-none tracking-tight">Rename Document</h3>
          <p className="text-sm text-zinc-400">Enter a new title for your document.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rename-title" className="text-zinc-300">Title</Label>
            <Input
              id="rename-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter new title..."
              disabled={isPending}
              required
              className="border-zinc-800 bg-zinc-950/50 text-zinc-100 focus-visible:ring-indigo-500"
              autoFocus
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isPending}
              className="border-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-800"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-indigo-500/10"
            >
              {isPending ? "Renaming..." : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
