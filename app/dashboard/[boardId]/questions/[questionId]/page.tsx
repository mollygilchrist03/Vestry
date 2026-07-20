import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { STATUS_BADGE_VARIANT } from "@/lib/question-status-badge";
import { ReplyForm } from "./ReplyForm";
import { ModerationControls } from "./ModerationControls";

export default async function QuestionDetailPage({
  params,
}: {
  params: Promise<{ boardId: string; questionId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { boardId, questionId } = await params;
  const admin = await getBoardAdmin(session.user.id, boardId);
  if (!admin) {
    notFound();
  }

  const [question] = await db
    .select()
    .from(questions)
    .where(and(eq(questions.id, questionId), eq(questions.boardId, boardId)))
    .limit(1);
  if (!question) {
    notFound();
  }

  const questionReplies = await db
    .select()
    .from(replies)
    .where(eq(replies.questionId, question.id))
    .orderBy(replies.createdAt);

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/dashboard/${boardId}`}
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to questions
      </Link>

      <Card className="my-6">
        <CardHeader>
          <CardTitle>{question.displayName?.trim() || "Anonymous"}</CardTitle>
          <CardDescription>
            <Badge variant={STATUS_BADGE_VARIANT[question.status]}>
              {question.status}
            </Badge>
          </CardDescription>
          <CardAction>
            <ModerationControls
              questionId={question.id}
              status={question.status}
            />
          </CardAction>
        </CardHeader>
        <CardContent>
          <p className="whitespace-pre-wrap">{question.questionText}</p>
        </CardContent>
      </Card>

      {questionReplies.length > 0 && (
        <div className="mb-6 space-y-3">
          {questionReplies.map((reply) => (
            <Card key={reply.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  Reply
                  <Badge variant={reply.visibility === "public" ? "default" : "outline"}>
                    {reply.visibility}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{reply.replyText}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Reply</CardTitle>
        </CardHeader>
        <CardContent>
          <ReplyForm questionId={question.id} />
        </CardContent>
      </Card>
    </div>
  );
}
