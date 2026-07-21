import { notFound } from "next/navigation";
import { Fraunces } from "next/font/google";
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
import { FeedPost } from "@/components/FeedPost";
import { AskQuestionForm } from "./AskQuestionForm";

const fraunces = Fraunces({
  variable: "--font-fraunces-board",
  subsets: ["latin"],
  weight: ["500", "600"],
});

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
    <div className={`${fraunces.variable} mx-auto max-w-xl px-4 py-10 pb-24 md:pb-10`}>
      <div className="mb-8 text-center">
        <h1 className="font-[family-name:var(--font-fraunces-board)] text-3xl font-semibold text-foreground">
          {board.name}
        </h1>
        <div className="mx-auto mt-3 flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-accent" />
          <span className="h-1.5 w-1.5 rounded-full bg-accent" />
          <span className="h-px w-8 bg-accent" />
        </div>
        {board.description && (
          <p className="mt-3 text-sm text-muted-foreground">
            {board.description}
          </p>
        )}
      </div>

      <Card id="ask-a-question" className="rounded-3xl shadow-sm">
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
          <h2 className="mb-4 font-[family-name:var(--font-fraunces-board)] text-lg font-semibold text-foreground">
            Public Q&amp;A
          </h2>
          {publicQuestions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No public questions yet.
            </p>
          ) : (
            <div className="space-y-4">
              {publicQuestions.map((q) => (
                <FeedPost
                  key={q.id}
                  displayName={q.displayName}
                  questionText={q.questionText}
                  createdAt={q.createdAt}
                  replies={q.replies}
                />
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
