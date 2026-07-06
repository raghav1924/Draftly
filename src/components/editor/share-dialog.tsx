"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { X, UserPlus, Trash2, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  getDocumentShares,
  shareDocumentAction,
  updateSharePermissionAction,
  removeShareAction,
  type DocumentShareDetails,
} from "@/lib/actions/shares";
import type { SharePermission } from "@/types/database";

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentTitle: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  documentId,
  documentTitle,
}: ShareDialogProps) {
  const [email, setEmail] = useState("");
  const [permission, setPermission] = useState<SharePermission>("viewer");
  const [shares, setShares] = useState<DocumentShareDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadShares = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getDocumentShares(documentId);
      setShares(data);
    } catch {
      toast.error("Failed to load collaborators");
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    if (isOpen) {
      loadShares();
      setEmail("");
      setPermission("viewer");
    }
  }, [isOpen, loadShares]);

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

  const handleShareSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) return;

    startTransition(async () => {
      const res = await shareDocumentAction(documentId, cleanEmail, permission);
      if (res.success) {
        toast.success("Document shared successfully");
        setEmail("");
        loadShares(); // Refresh the list
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleUpdatePermission = (shareId: string, newPermission: SharePermission) => {
    startTransition(async () => {
      const res = await updateSharePermissionAction(shareId, newPermission, documentId);
      if (res.success) {
        toast.success("Permission updated");
        loadShares();
      } else {
        toast.error(res.error);
      }
    });
  };

  const handleRemoveShare = (shareId: string) => {
    if (!confirm("Are you sure you want to revoke access for this user?")) {
      return;
    }

    startTransition(async () => {
      const res = await removeShareAction(shareId, documentId);
      if (res.success) {
        toast.success("Access revoked");
        loadShares();
      } else {
        toast.error(res.error);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
      {/* Backdrop click close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-lg p-6 rounded-2xl border border-zinc-800 bg-zinc-900/90 text-zinc-100 shadow-2xl space-y-6 z-10 scale-95 animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/50 pb-4 shrink-0">
          <div className="space-y-1.5">
            <h3 className="text-lg font-bold leading-none tracking-tight">Share &quot;{documentTitle}&quot;</h3>
            <p className="text-xs text-zinc-400">Invite collaborators and manage access permissions.</p>
          </div>
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Invite Form */}
        <form onSubmit={handleShareSubmit} className="space-y-4 shrink-0">
          <div className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 space-y-2 w-full">
              <Label htmlFor="share-email" className="text-zinc-300 text-xs">Email Address</Label>
              <Input
                id="share-email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isPending}
                required
                className="border-zinc-800 bg-zinc-950/50 text-zinc-100 focus-visible:ring-indigo-500 text-sm h-10"
              />
            </div>
            
            <div className="space-y-2 w-full sm:w-32 shrink-0">
              <Label htmlFor="share-permission" className="text-zinc-300 text-xs">Role</Label>
              <select
                id="share-permission"
                value={permission}
                onChange={(e) => setPermission(e.target.value as SharePermission)}
                disabled={isPending}
                className="w-full border border-zinc-800 bg-zinc-950/50 rounded-md text-zinc-100 h-10 px-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
            </div>

            <Button
              type="submit"
              disabled={isPending || !email.trim()}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-medium h-10 px-4 rounded-xl shrink-0"
            >
              <UserPlus size={16} className="mr-2" />
              Invite
            </Button>
          </div>
        </form>

        {/* Collaborators List */}
        <div className="flex-1 overflow-y-auto space-y-3 min-h-[150px] pr-1">
          <h4 className="text-xs font-semibold text-zinc-400 tracking-wider uppercase">Active Access</h4>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-zinc-500 gap-2">
              <Loader2 size={24} className="animate-spin text-indigo-400" />
              <span className="text-xs">Loading collaborators...</span>
            </div>
          ) : shares.length > 0 ? (
            <div className="space-y-2">
              {shares.map((share) => (
                <div
                  key={share.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-800/50 bg-zinc-950/20"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 shrink-0">
                      <User size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-zinc-200 truncate">
                        {share.profiles?.name || "Pending User"}
                      </p>
                      <p className="text-[10px] text-zinc-500 truncate">{share.profiles?.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      value={share.permission}
                      onChange={(e) =>
                        handleUpdatePermission(share.id, e.target.value as SharePermission)
                      }
                      disabled={isPending}
                      className="border border-zinc-800 bg-transparent rounded-lg text-zinc-300 h-8 px-2 text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveShare(share.id)}
                      disabled={isPending}
                      className="h-8 w-8 rounded-lg hover:bg-red-950/10 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all"
                      title="Revoke access"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 border border-dashed border-zinc-800/50 rounded-xl p-4 text-xs text-zinc-500">
              This document hasn&apos;t been shared with anyone yet.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
