"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sidebar } from "./Sidebar";

type Board = { id: string; name: string };

export function DashboardShell({
  userEmail,
  userName,
  boards,
  children,
}: {
  userEmail: string;
  userName: string | null;
  boards: Board[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-muted/40">
      <div className="fixed inset-x-0 top-0 z-30 flex items-center justify-between border-b border-border bg-background px-4 py-3 md:hidden">
        <button
          type="button"
          aria-label="Open menu"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </button>
        <span className="font-semibold">Vestry</span>
        <div className="w-5" />
      </div>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 -translate-x-full border-r border-border transition-transform duration-200 md:static md:z-auto md:w-64 md:shrink-0 md:translate-x-0",
          mobileOpen && "translate-x-0",
        )}
      >
        {mobileOpen && (
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        )}
        <Sidebar
          userEmail={userEmail}
          userName={userName}
          boards={boards}
          onNavigate={() => setMobileOpen(false)}
        />
      </div>

      <main className="min-w-0 flex-1 pt-14 md:pt-0">{children}</main>
    </div>
  );
}
