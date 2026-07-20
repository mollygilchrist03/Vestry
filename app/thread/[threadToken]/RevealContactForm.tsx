"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export function RevealContactForm({ threadToken }: { threadToken: string }) {
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
      body: JSON.stringify({ contact: formData.get("contact") }),
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
    <Card className="mb-6 border-accent">
      <CardHeader>
        <CardTitle>Want us to reach out directly?</CardTitle>
        <CardDescription>
          This question was flagged for a closer follow-up. If you&apos;d
          like, share an email or phone number and we&apos;ll contact you
          directly — this is entirely optional and only visible to your
          pastor.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            name="contact"
            placeholder="Email or phone number"
            required
            className="flex-1"
          />
          <Button type="submit" disabled={pending}>
            {pending ? "Sharing…" : "Share"}
          </Button>
        </form>
        {error && (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        )}
      </CardContent>
    </Card>
  );
}
