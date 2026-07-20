import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { churches, questions } from "@/db/schema";

const submitQuestionSchema = z.object({
  inviteCode: z.string().trim().min(1),
  displayName: z.string().trim().max(120).optional(),
  questionText: z.string().trim().min(1, "Question is required").max(4000),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = submitQuestionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { inviteCode, displayName, questionText } = parsed.data;

  const [board] = await db
    .select({
      id: churches.id,
      allowAnonymous: churches.allowAnonymous,
    })
    .from(churches)
    .where(eq(churches.inviteCode, inviteCode))
    .limit(1);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }
  if (!board.allowAnonymous && !displayName) {
    return NextResponse.json(
      { error: "This board requires a name with each question" },
      { status: 400 },
    );
  }

  const [question] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: displayName || null,
      questionText,
      threadToken: nanoid(),
    })
    .returning({ threadToken: questions.threadToken });

  return NextResponse.json(
    { threadToken: question.threadToken },
    { status: 201 },
  );
}
