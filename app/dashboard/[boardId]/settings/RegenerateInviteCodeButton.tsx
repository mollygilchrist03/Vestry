"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RegenerateInviteCodeButton({ boardId }: { boardId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRegenerate() {
    if (
      !window.confirm(
        "Regenerate the invite code? The old link and code will stop working immediately.",
      )
    ) {
      return;
    }

    setPending(true);
    const res = await fetch(`/api/boards/${boardId}/regenerate-invite-code`, {
      method: "POST",
    });
    setPending(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={handleRegenerate}
    >
      {pending ? "Regenerating…" : "Regenerate invite code"}
    </Button>
  );
}
