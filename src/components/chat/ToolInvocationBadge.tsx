"use client";

import { Loader2, FilePlus, FilePen, FileSearch, FolderPlus, Trash2, FileMinus } from "lucide-react";

interface ToolInvocationBadgeProps {
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "partial-call" | "result";
}

function getLabel(toolName: string, args: Record<string, unknown>): { icon: React.ReactNode; text: string } {
  const path = typeof args.path === "string" ? args.path : "";
  const filename = path.split("/").filter(Boolean).pop() ?? path;

  if (toolName === "str_replace_editor") {
    switch (args.command) {
      case "create":
        return { icon: <FilePlus className="w-3 h-3" />, text: `Creating ${filename}` };
      case "str_replace":
      case "insert":
        return { icon: <FilePen className="w-3 h-3" />, text: `Editing ${filename}` };
      case "view":
        return { icon: <FileSearch className="w-3 h-3" />, text: `Reading ${filename}` };
    }
  }

  if (toolName === "file_manager") {
    switch (args.command) {
      case "rename":
        return { icon: <FilePen className="w-3 h-3" />, text: `Renaming ${filename}` };
      case "delete":
        return { icon: <Trash2 className="w-3 h-3" />, text: `Deleting ${filename}` };
    }
  }

  return { icon: <FileMinus className="w-3 h-3" />, text: toolName };
}

export function ToolInvocationBadge({ toolName, args, state }: ToolInvocationBadgeProps) {
  const done = state === "result";
  const { icon, text } = getLabel(toolName, args);

  return (
    <div className="inline-flex items-center gap-2 mt-2 px-3 py-1.5 bg-neutral-50 rounded-lg text-xs border border-neutral-200">
      {done ? (
        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
      ) : (
        <Loader2 className="w-3 h-3 animate-spin text-blue-600 shrink-0" />
      )}
      <span className="text-neutral-600">{icon}</span>
      <span className="text-neutral-700">{text}</span>
    </div>
  );
}
