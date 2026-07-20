import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/auth";
import { db } from "@/db";
import { churches } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ boardId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardId } = await params;
  const admin = await getBoardAdmin(session.user.id, boardId);
  if (!admin || admin.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [board] = await db
    .update(churches)
    .set({ inviteCode: nanoid(8) })
    .where(eq(churches.id, boardId))
    .returning();

  return NextResponse.json({ board });
}
