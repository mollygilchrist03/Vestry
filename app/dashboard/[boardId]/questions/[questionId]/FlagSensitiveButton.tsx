"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function FlagSensitiveButton({
  questionId,
  flagged,
}: {
  questionId: string;
  flagged: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function toggle() {
    setPending(true);
    const res = await fetch(`/api/questions/${questionId}/flag`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flagged: !flagged }),
    });
    setPending(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <Button size="sm" variant="outline" disabled={pending} onClick={toggle}>
      {flagged ? "Unflag sensitive" : "Flag as sensitive"}
    </Button>
  );
}
