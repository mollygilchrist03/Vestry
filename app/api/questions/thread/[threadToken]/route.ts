import { NextResponse } from "next/server";
import { eq, and, ne } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";

const revealContactSchema = z.object({
  contact: z.string().trim().min(1).max(200),
});

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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadToken: string }> },
) {
  const { threadToken } = await params;

  const body = await request.json().catch(() => null);
  const parsed = revealContactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const [question] = await db
    .select({ id: questions.id })
    .from(questions)
    .where(
      and(eq(questions.threadToken, threadToken), ne(questions.status, "deleted")),
    )
    .limit(1);
  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await db
    .update(questions)
    .set({ optionalContact: parsed.data.contact })
    .where(eq(questions.id, question.id));

  return NextResponse.json({ success: true });
}
