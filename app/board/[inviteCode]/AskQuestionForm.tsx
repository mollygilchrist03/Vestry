"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function AskQuestionForm({ inviteCode }: { inviteCode: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setPending(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        inviteCode,
        displayName: formData.get("displayName"),
        questionText: formData.get("questionText"),
      }),
    });

    setPending(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Something went wrong");
      return;
    }

    const data = await res.json();
    router.push(`/thread/${data.threadToken}`);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="displayName">Your name (optional)</Label>
        <Input
          id="displayName"
          name="displayName"
          placeholder="Leave blank to stay anonymous"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="questionText">Your question</Label>
        <Textarea id="questionText" name="questionText" required rows={5} />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Submitting…" : "Submit question"}
      </Button>
      <p className="text-xs text-muted-foreground">
        If this is urgent or you&apos;re in crisis, please contact your local
        emergency services. In the US, call or text 988 (Suicide &amp;
        Crisis Lifeline). Outside the US, or for a full list of hotlines by
        country, visit{" "}
        <a
          href="https://findahelpline.com"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          findahelpline.com
        </a>
        .
      </p>
    </form>
  );
}
