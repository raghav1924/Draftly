"use client";

import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface EditorToolbarProps {
  editor: Editor | null;
}

export function EditorToolbar({ editor }: EditorToolbarProps) {
  if (!editor) return null;

  const buttons = [
    {
      icon: Bold,
      title: "Bold",
      action: () => editor.chain().focus().toggleBold().run(),
      isActive: () => editor.isActive("bold"),
    },
    {
      icon: Italic,
      title: "Italic",
      action: () => editor.chain().focus().toggleItalic().run(),
      isActive: () => editor.isActive("italic"),
    },
    {
      icon: Strikethrough,
      title: "Strike",
      action: () => editor.chain().focus().toggleStrike().run(),
      isActive: () => editor.isActive("strike"),
    },
    {
      icon: Code,
      title: "Inline Code",
      action: () => editor.chain().focus().toggleCode().run(),
      isActive: () => editor.isActive("code"),
    },
    { type: "divider" },
    {
      icon: Heading1,
      title: "Heading 1",
      action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
      isActive: () => editor.isActive("heading", { level: 1 }),
    },
    {
      icon: Heading2,
      title: "Heading 2",
      action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
      isActive: () => editor.isActive("heading", { level: 2 }),
    },
    {
      icon: Heading3,
      title: "Heading 3",
      action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
      isActive: () => editor.isActive("heading", { level: 3 }),
    },
    { type: "divider" },
    {
      icon: List,
      title: "Bullet List",
      action: () => editor.chain().focus().toggleBulletList().run(),
      isActive: () => editor.isActive("bulletList"),
    },
    {
      icon: ListOrdered,
      title: "Ordered List",
      action: () => editor.chain().focus().toggleOrderedList().run(),
      isActive: () => editor.isActive("orderedList"),
    },
    {
      icon: Quote,
      title: "Blockquote",
      action: () => editor.chain().focus().toggleBlockquote().run(),
      isActive: () => editor.isActive("blockquote"),
    },
    { type: "divider" },
    {
      icon: Undo,
      title: "Undo",
      action: () => editor.chain().focus().undo().run(),
      isActive: () => false,
      disabled: () => !editor.can().undo(),
    },
    {
      icon: Redo,
      title: "Redo",
      action: () => editor.chain().focus().redo().run(),
      isActive: () => false,
      disabled: () => !editor.can().redo(),
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-2xl border border-zinc-900 bg-zinc-950/60 backdrop-blur-md sticky top-[73px] z-20">
      {buttons.map((btn, idx) => {
        if (btn.type === "divider") {
          return (
            <div
              key={`divider-${idx}`}
              className="w-[1px] h-5 bg-zinc-900 mx-1 shrink-0"
            />
          );
        }

        const Icon = btn.icon!;
        const active = btn.isActive!();
        const isDisabled = btn.disabled ? btn.disabled() : false;

        return (
          <button
            key={btn.title}
            type="button"
            onClick={btn.action}
            disabled={isDisabled}
            title={btn.title}
            className={cn(
              "h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200 text-zinc-400 hover:text-white hover:bg-zinc-900/50 disabled:opacity-30 disabled:pointer-events-none",
              active && "text-white bg-zinc-900 border border-zinc-800 shadow-inner"
            )}
          >
            <Icon size={15} />
          </button>
        );
      })}
    </div>
  );
}
