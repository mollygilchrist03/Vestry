import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { churches } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AskQuestionForm } from "./AskQuestionForm";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ inviteCode: string }>;
}) {
  const { inviteCode } = await params;

  const [board] = await db
    .select({
      id: churches.id,
      name: churches.name,
      description: churches.description,
    })
    .from(churches)
    .where(eq(churches.inviteCode, inviteCode))
    .limit(1);

  if (!board) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        {board.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {board.description}
          </p>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Ask a question</CardTitle>
          <CardDescription>
            You&apos;ll get a private link to check for a reply. No account
            needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AskQuestionForm inviteCode={inviteCode} />
        </CardContent>
      </Card>
    </div>
  );
}
