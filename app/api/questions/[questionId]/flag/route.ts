import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { questions } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

const flagSchema = z.object({
  flagged: z.boolean(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = flagSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

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

  const [updated] = await db
    .update(questions)
    .set({ flaggedSensitive: parsed.data.flagged })
    .where(eq(questions.id, question.id))
    .returning();

  return NextResponse.json({ question: updated });
}
