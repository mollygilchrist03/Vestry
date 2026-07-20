import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { churches } from "@/db/schema";
import { getPublicQuestions } from "@/lib/public-questions";
import { buttonVariants } from "@/components/ui/button";
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
      publicBoardEnabled: churches.publicBoardEnabled,
    })
    .from(churches)
    .where(eq(churches.inviteCode, inviteCode))
    .limit(1);

  if (!board) {
    notFound();
  }

  const publicQuestions = board.publicBoardEnabled
    ? await getPublicQuestions(board.id)
    : [];

  return (
    <div className="mx-auto max-w-xl px-4 py-10 pb-24 md:pb-10">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold">{board.name}</h1>
        {board.description && (
          <p className="mt-2 text-sm text-muted-foreground">
            {board.description}
          </p>
        )}
      </div>

      <Card id="ask-a-question">
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

      {board.publicBoardEnabled && (
        <div className="mt-10">
          <h2 className="mb-4 text-lg font-semibold">Public Q&amp;A</h2>
          {publicQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No public questions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {publicQuestions.map((q) => (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {q.displayName?.trim() || "Anonymous"} asked
                    </CardTitle>
                    <CardDescription>{q.questionText}</CardDescription>
                  </CardHeader>
                  {q.replies.length > 0 && (
                    <CardContent className="space-y-3">
                      {q.replies.map((reply) => (
                        <p key={reply.id} className="whitespace-pre-wrap text-sm">
                          {reply.replyText}
                        </p>
                      ))}
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background p-4 md:hidden">
        <a
          href="#ask-a-question"
          className={buttonVariants({ className: "w-full" })}
        >
          Ask a question
        </a>
      </div>
    </div>
  );
}
