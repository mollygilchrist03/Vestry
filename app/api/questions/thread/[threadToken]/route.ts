import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ threadToken: string }> },
) {
  const { threadToken } = await params;

  const [question] = await db
    .select()
    .from(questions)
    .where(
      and(eq(questions.threadToken, threadToken), ne(questions.status, "deleted")),
    )
    .limit(1);

  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const threadReplies = await db
    .select()
    .from(replies)
    .where(eq(replies.questionId, question.id));

  return NextResponse.json({ question, replies: threadReplies });
}
