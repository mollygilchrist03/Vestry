"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function ModerationControls({
  questionId,
  status,
}: {
  questionId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function moderate(action: "hide" | "unhide" | "delete") {
    if (
      action === "delete" &&
      !window.confirm(
        "Delete this question? It will be removed from the dashboard and public feed, and there's no undo button for it.",
      )
    ) {
      return;
    }

    setPending(true);
    const res = await fetch(`/api/questions/${questionId}/moderate`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setPending(false);
    if (res.ok) {
      router.refresh();
    }
  }

  if (status === "deleted") {
    return null;
  }

  return (
    <div className="flex gap-2">
      {status === "hidden" ? (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => moderate("unhide")}
        >
          Unhide
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          disabled={pending}
          onClick={() => moderate("hide")}
        >
          Hide
        </Button>
      )}
      <Button
        size="sm"
        variant="destructive"
        disabled={pending}
        onClick={() => moderate("delete")}
      >
        Delete
      </Button>
    </div>
  );
}
