"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { logout } from "./actions";

type Board = { id: string; name: string };

export function Sidebar({
  userEmail,
  userName,
  boards,
  onNavigate,
}: {
  userEmail: string;
  userName: string | null;
  boards: Board[];
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const boardIdMatch = pathname.match(/^\/dashboard\/([^/]+)/);
  const currentBoardId =
    boardIdMatch && boardIdMatch[1] !== "new-board" ? boardIdMatch[1] : null;
  const remainder = currentBoardId
    ? pathname.slice(`/dashboard/${currentBoardId}`.length)
    : "";
  const section = remainder.startsWith("/staff")
    ? "staff"
    : remainder.startsWith("/settings")
      ? "settings"
      : "questions";

  const displayName = userName || userEmail;

  return (
    <div className="flex h-full flex-col bg-background">
      <Link
        href="/dashboard"
        onClick={onNavigate}
        className="flex items-center gap-2 border-b border-border px-5 py-4 font-semibold"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Vestry.svg" alt="" className="h-6 w-6" />
        Vestry
      </Link>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Boards
        </p>
        <div className="space-y-1">
          {boards.map((board) => {
            const isCurrent = board.id === currentBoardId;
            return (
              <div key={board.id}>
                <Link
                  href={`/dashboard/${board.id}`}
                  onClick={onNavigate}
                  className={cn(
                    "block truncate rounded-md px-2 py-1.5 text-sm",
                    isCurrent
                      ? "bg-accent/15 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {board.name}
                </Link>
                {isCurrent && (
                  <div className="mt-1 ml-3 space-y-0.5 border-l border-border pl-3">
                    <Link
                      href={`/dashboard/${board.id}`}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded px-2 py-1 text-sm",
                        section === "questions"
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Questions
                    </Link>
                    <Link
                      href={`/dashboard/${board.id}/staff`}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded px-2 py-1 text-sm",
                        section === "staff"
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Staff
                    </Link>
                    <Link
                      href={`/dashboard/${board.id}/settings`}
                      onClick={onNavigate}
                      className={cn(
                        "block rounded px-2 py-1 text-sm",
                        section === "settings"
                          ? "font-medium text-foreground"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                    >
                      Settings
                    </Link>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <Link
          href="/dashboard/new-board"
          onClick={onNavigate}
          className="mt-4 block rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          + New board
        </Link>
      </nav>

      <div className="border-t border-border p-4">
        <div className="mb-3 flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <p className="min-w-0 truncate text-sm font-medium">
            {displayName}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline" size="sm" className="w-full">
            Log out
          </Button>
        </form>
      </div>
    </div>
  );
}
