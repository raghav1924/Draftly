"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { FileText, MoreVertical, Edit2, Trash2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { deleteDocumentAction } from "@/lib/actions/documents";
import type { Document } from "@/types/database";
import { cn } from "@/lib/utils/cn";

interface DocumentCardProps {
  document: Document;
  isOwned: boolean;
  permission?: "viewer" | "editor";
  onRename: (id: string, currentTitle: string) => void;
}

export function DocumentCard({
  document,
  isOwned,
  permission,
  onRename,
}: DocumentCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isDeleting, startDeleteTransition] = useTransition();

  const handleCardClick = () => {
    router.push(`/documents/${document.id}`);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    window.document.addEventListener("mousedown", handleClickOutside);
    return () => window.document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);

    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    startDeleteTransition(async () => {
      const res = await deleteDocumentAction(document.id);
      if (res.success) {
        toast.success("Document deleted successfully");
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRenameClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setMenuOpen(false);
    onRename(document.id, document.title);
  };

  const formattedDate = new Date(document.updated_at).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div
      className={cn(
        "group relative flex flex-col justify-between p-5 rounded-2xl border border-zinc-900 bg-zinc-900/30 hover:bg-zinc-900/50 hover:border-zinc-800 hover:shadow-xl hover:shadow-indigo-500/[0.02] transition-all duration-300 min-h-[160px]",
        isDeleting && "opacity-40 pointer-events-none"
      )}
    >
      <div 
        onClick={handleCardClick} 
        className="flex-1 flex flex-col justify-between cursor-pointer"
      >
        <div>
          {/* Header & Icon */}
          <div className="flex items-start justify-between">
            <div className="h-10 w-10 rounded-xl bg-zinc-950 flex items-center justify-center text-zinc-400 group-hover:text-indigo-400 group-hover:bg-indigo-950/15 border border-zinc-900 transition-all">
              <FileText size={20} />
            </div>

            {/* Actions Menu Trigger */}
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  setMenuOpen(!menuOpen);
                }}
                className="h-8 w-8 rounded-lg hover:bg-zinc-900 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <MoreVertical size={16} />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-1 w-40 rounded-xl border border-zinc-800 bg-zinc-950/95 backdrop-blur-xl py-1 shadow-2xl z-20 animate-in fade-in slide-in-from-top-2 duration-150">
                  <Link
                    href={`/documents/${document.id}`}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/55 transition-colors"
                  >
                    <ExternalLink size={14} />
                    Open
                  </Link>

                  {(isOwned || permission === "editor") && (
                    <button
                      type="button"
                      onClick={handleRenameClick}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-zinc-300 hover:text-white hover:bg-zinc-900/55 transition-colors"
                    >
                      <Edit2 size={14} />
                      Rename
                    </button>
                  )}

                  {isOwned && (
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-2 w-full text-left px-3 py-2 text-xs font-medium text-red-400 hover:text-red-300 hover:bg-red-950/10 transition-colors border-t border-zinc-900 mt-1"
                    >
                      <Trash2 size={14} />
                      Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Title */}
          <h4 className="mt-4 font-semibold text-zinc-100 line-clamp-1 group-hover:text-white transition-colors">
            {document.title}
          </h4>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
          <span>Edited {formattedDate}</span>
          
          {/* Badge for Shared */}
          {!isOwned && permission && (
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide capitalize border shrink-0",
              permission === "editor" 
                ? "bg-emerald-950/20 text-emerald-400 border-emerald-900/50" 
                : "bg-indigo-950/20 text-indigo-400 border-indigo-900/50"
            )}>
              {permission}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
