"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function RemoveStaffButton({ boardAdminId }: { boardAdminId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function handleRemove() {
    if (!window.confirm("Remove this moderator from the board?")) return;

    setPending(true);
    const res = await fetch(`/api/board-admins/${boardAdminId}`, {
      method: "DELETE",
    });
    setPending(false);
    if (res.ok) {
      router.refresh();
    }
  }

  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={handleRemove}
    >
      Remove
    </Button>
  );
}
