"use client";

import { useState, useTransition } from "react";
import { Folder, Share2, LogOut, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils/cn";

interface SidebarProps {
  userEmail: string;
  userName?: string;
  activeTab: "owned" | "shared";
  setActiveTab: (tab: "owned" | "shared") => void;
  onCreateDocument: () => void;
  isCreating: boolean;
}

export function Sidebar({
  userEmail,
  userName,
  activeTab,
  setActiveTab,
  onCreateDocument,
  isCreating,
}: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      await logoutAction();
    });
  };

  const nameInitial = userName
    ? userName[0]?.toUpperCase()
    : userEmail[0]?.toUpperCase();

  return (
    <aside
      className={cn(
        "relative flex flex-col border-r border-zinc-900 bg-zinc-950/80 backdrop-blur-xl text-zinc-400 transition-all duration-300 ease-in-out z-10",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 h-6 w-6 rounded-full border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-md"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Header */}
      <div className={cn("p-6 flex items-center gap-3 border-b border-zinc-900/50", isCollapsed ? "justify-center" : "justify-start")}>
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20 shrink-0">
          D
        </div>
        {!isCollapsed && (
          <span className="text-lg font-semibold tracking-tight text-white bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
            Draftly
          </span>
        )}
      </div>

      {/* Action Button */}
      <div className="p-4">
        <Button
          onClick={onCreateDocument}
          disabled={isCreating}
          className={cn(
            "w-full bg-gradient-to-r from-indigo-500 to-emerald-500 hover:from-indigo-600 hover:to-emerald-600 text-white font-medium shadow-lg shadow-indigo-500/10 transition-all duration-300",
            isCollapsed ? "h-9 w-9 p-0 rounded-xl" : "h-10 px-4 rounded-xl"
          )}
        >
          <Plus size={18} className={cn(!isCollapsed && "mr-2")} />
          {!isCollapsed && (isCreating ? "Creating..." : "New Document")}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-1.5 pt-2">
        <button
          onClick={() => setActiveTab("owned")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
            activeTab === "owned"
              ? "bg-zinc-900 text-white shadow-inner"
              : "hover:bg-zinc-900/30 hover:text-zinc-200"
          )}
        >
          <Folder size={18} className={activeTab === "owned" ? "text-indigo-400" : ""} />
          {!isCollapsed && <span>My Documents</span>}
        </button>

        <button
          onClick={() => setActiveTab("shared")}
          className={cn(
            "flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300",
            activeTab === "shared"
              ? "bg-zinc-900 text-white shadow-inner"
              : "hover:bg-zinc-900/30 hover:text-zinc-200"
          )}
        >
          <Share2 size={18} className={activeTab === "shared" ? "text-emerald-400" : ""} />
          {!isCollapsed && <span>Shared with me</span>}
        </button>
      </nav>

      {/* Profile/Footer Section */}
      <div className="p-4 border-t border-zinc-900/50 mt-auto bg-zinc-950/40">
        <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "justify-start")}>
          <div className="h-9 w-9 rounded-xl bg-zinc-900 flex items-center justify-center font-bold text-zinc-300 border border-zinc-800 shrink-0 select-none">
            {nameInitial}
          </div>
          {!isCollapsed && (
            <div className="flex-grow min-w-0">
              <p className="text-xs font-semibold text-zinc-200 truncate">
                {userName || "User"}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{userEmail}</p>
            </div>
          )}
          {!isCollapsed && (
            <button
              onClick={handleLogout}
              disabled={isPending}
              className="text-zinc-500 hover:text-red-400 p-1.5 rounded-lg hover:bg-zinc-900/50 transition-colors shrink-0"
              title="Sign Out"
            >
              <LogOut size={16} />
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
