import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

const replySchema = z.object({
  replyText: z.string().trim().min(1, "Reply is required").max(4000),
  visibility: z.enum(["public", "private"]),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = replySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { replyText, visibility } = parsed.data;

  const { questionId } = await params;
  const [question] = await db
    .select()
    .from(questions)
    .where(eq(questions.id, questionId))
    .limit(1);
  if (!question) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const admin = await getBoardAdmin(session.user.id, question.boardId);
  if (!admin) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [reply] = await db
    .insert(replies)
    .values({
      questionId: question.id,
      boardAdminId: admin.id,
      replyText,
      visibility,
    })
    .returning();

  await db
    .update(questions)
    .set({
      status: "answered",
      isPublic: visibility === "public" ? true : question.isPublic,
    })
    .where(eq(questions.id, question.id));

  return NextResponse.json({ reply }, { status: 201 });
}
