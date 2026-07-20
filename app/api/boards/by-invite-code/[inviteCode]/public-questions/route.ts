import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { churches } from "@/db/schema";
import { getPublicQuestions } from "@/lib/public-questions";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ inviteCode: string }> },
) {
  const { inviteCode } = await params;

  const [board] = await db
    .select({ id: churches.id })
    .from(churches)
    .where(eq(churches.inviteCode, inviteCode))
    .limit(1);
  if (!board) {
    return NextResponse.json({ error: "Board not found" }, { status: 404 });
  }

  const questions = await getPublicQuestions(board.id);
  return NextResponse.json({ questions });
}
