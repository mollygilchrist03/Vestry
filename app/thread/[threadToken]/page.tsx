import { and, eq, ne } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RevealContactForm } from "./RevealContactForm";
import { NotifyEmailForm } from "./NotifyEmailForm";

export default async function ThreadPage({
  params,
}: {
  params: Promise<{ threadToken: string }>;
}) {
  const { threadToken } = await params;

  const [question] = await db
    .select()
    .from(questions)
    .where(
      and(eq(questions.threadToken, threadToken), ne(questions.status, "deleted")),
    )
    .limit(1);

  if (!question) {
    notFound();
  }

  const threadReplies = await db
    .select()
    .from(replies)
    .where(eq(replies.questionId, question.id))
    .orderBy(replies.createdAt);

  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="mb-4 rounded-md border border-dashed border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground">
        Bookmark this page — it&apos;s the only way to check for a reply to
        your question.
      </p>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {question.displayName?.trim() || "Anonymous"} asked
          </CardTitle>
          <CardDescription>
            {question.status === "pending"
              ? "Waiting for a reply"
              : "Answered"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{question.questionText}</p>
        </CardContent>
      </Card>

      {question.status === "pending" && !question.notifyEmail && (
        <NotifyEmailForm threadToken={threadToken} />
      )}
      {question.status === "pending" && question.notifyEmail && (
        <p className="mb-6 text-sm text-muted-foreground">
          We&apos;ll email {question.notifyEmail} when there&apos;s a reply.
        </p>
      )}

      {question.flaggedSensitive && !question.optionalContact && (
        <RevealContactForm threadToken={threadToken} />
      )}
      {question.flaggedSensitive && question.optionalContact && (
        <p className="mb-6 rounded-md bg-muted px-4 py-3 text-sm text-muted-foreground">
          Thanks for sharing your contact info — your pastor will be in
          touch.
        </p>
      )}

      {threadReplies.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">
          No reply yet. Check back later.
        </p>
      ) : (
        <div className="space-y-4">
          {threadReplies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader>
                <CardTitle className="text-base">Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.replyText}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
