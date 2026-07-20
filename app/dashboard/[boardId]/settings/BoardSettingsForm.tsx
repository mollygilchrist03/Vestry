"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function BoardSettingsForm({
  boardId,
  allowAnonymous: initialAllowAnonymous,
  publicBoardEnabled: initialPublicBoardEnabled,
}: {
  boardId: string;
  allowAnonymous: boolean;
  publicBoardEnabled: boolean;
}) {
  const router = useRouter();
  const [allowAnonymous, setAllowAnonymous] = useState(initialAllowAnonymous);
  const [publicBoardEnabled, setPublicBoardEnabled] = useState(
    initialPublicBoardEnabled,
  );
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setSaved(false);

    const res = await fetch(`/api/boards/${boardId}/settings`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ allowAnonymous, publicBoardEnabled }),
    });

    setPending(false);
    if (res.ok) {
      setSaved(true);
      router.refresh();
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={allowAnonymous}
          onChange={(e) => setAllowAnonymous(e.target.checked)}
        />
        <span>
          <span className="font-medium">Allow anonymous posting</span>
          <br />
          <span className="text-muted-foreground">
            If off, askers must give a name with their question.
          </span>
        </span>
      </label>

      <label className="flex items-start gap-3 text-sm">
        <input
          type="checkbox"
          className="mt-1"
          checked={publicBoardEnabled}
          onChange={(e) => setPublicBoardEnabled(e.target.checked)}
        />
        <span>
          <span className="font-medium">Show public Q&amp;A feed</span>
          <br />
          <span className="text-muted-foreground">
            If off, the board page only shows the ask form (DM-only).
          </span>
        </span>
      </label>

      <div className="flex items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Saving…" : "Save settings"}
        </Button>
        {saved && (
          <span className="text-sm text-muted-foreground">Saved</span>
        )}
      </div>
    </form>
  );
}
