"use client";

import { useState, useTransition } from "react";
import { Search, FileText } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { DocumentCard } from "@/components/dashboard/document-card";
import { RenameDialog } from "@/components/dashboard/rename-dialog";
import { createDocumentAction } from "@/lib/actions/documents";
import { toast } from "sonner";
import type { Document, SharePermission } from "@/types/database";

interface DashboardClientProps {
  userEmail: string;
  userName?: string;
  initialOwned: Document[];
  initialShared: (Document & { permission: SharePermission })[];
}

export function DashboardClient({
  userEmail,
  userName,
  initialOwned,
  initialShared,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"owned" | "shared">("owned");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, startCreateTransition] = useTransition();

  // Rename Dialog State
  const [renameState, setRenameState] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
  }>({
    isOpen: false,
    id: "",
    title: "",
  });

  const handleCreateDocument = () => {
    startCreateTransition(async () => {
      const res = await createDocumentAction();
      if (res && !res.success) {
        toast.error(res.error);
      }
    });
  };

  const handleOpenRename = (id: string, currentTitle: string) => {
    setRenameState({
      isOpen: true,
      id,
      title: currentTitle,
    });
  };

  const activeDocuments = activeTab === "owned" ? initialOwned : initialShared;
  const filteredDocs = activeDocuments.filter((doc) =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-zinc-950 overflow-hidden text-zinc-100">
      {/* Collapsible Sidebar */}
      <Sidebar
        userEmail={userEmail}
        userName={userName ?? undefined}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onCreateDocument={handleCreateDocument}
        isCreating={isCreating}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-zinc-950 overflow-y-auto">
        <header className="flex items-center justify-between p-6 border-b border-zinc-900/50 bg-zinc-950/40">
          <h1 className="text-xl font-bold tracking-tight text-white capitalize">
            {activeTab === "owned" ? "My Documents" : "Shared with me"}
          </h1>

          {/* Search bar */}
          <div className="relative w-64">
            <span className="absolute inset-y-0 left-3 flex items-center text-zinc-500">
              <Search size={16} />
            </span>
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-xl border border-zinc-800 bg-zinc-900/30 text-zinc-100 placeholder:text-zinc-600 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all"
            />
          </div>
        </header>

        {/* Document Grid */}
        <div className="p-8 flex-1">
          {filteredDocs.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredDocs.map((doc) => (
                <DocumentCard
                  key={doc.id}
                  document={doc}
                  isOwned={activeTab === "owned"}
                  permission={"permission" in doc ? (doc as { permission: SharePermission }).permission : undefined}
                  onRename={handleOpenRename}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-zinc-900 rounded-3xl p-6 bg-zinc-950/20 max-w-xl mx-auto mt-12 space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-900 flex items-center justify-center text-zinc-500 border border-zinc-800">
                <FileText size={24} />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-semibold text-zinc-200">No documents found</h3>
                <p className="text-xs text-zinc-500">
                  {searchQuery
                    ? "Try adjusting your search criteria"
                    : activeTab === "owned"
                    ? "Get started by creating your first document"
                    : "No documents have been shared with you yet"}
                </p>
              </div>
              {!searchQuery && activeTab === "owned" && (
                <button
                  onClick={handleCreateDocument}
                  disabled={isCreating}
                  className="h-9 px-4 rounded-xl bg-zinc-100 text-zinc-950 text-xs font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {isCreating ? "Creating..." : "Create Document"}
                </button>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Rename Dialog */}
      <RenameDialog
        isOpen={renameState.isOpen}
        onClose={() => setRenameState({ ...renameState, isOpen: false })}
        documentId={renameState.id}
        currentTitle={renameState.title}
      />
    </div>
  );
}
