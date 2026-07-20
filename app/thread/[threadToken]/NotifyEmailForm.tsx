"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function NotifyEmailForm({ threadToken }: { threadToken: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch(`/api/questions/thread/${threadToken}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notifyEmail: formData.get("notifyEmail") }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-2">
      <div className="flex gap-2">
        <Input
          name="notifyEmail"
          type="email"
          placeholder="Get emailed when there's a reply (optional)"
          className="flex-1"
        />
        <Button type="submit" variant="outline" disabled={pending}>
          {pending ? "Saving…" : "Notify me"}
        </Button>
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </form>
  );
}
