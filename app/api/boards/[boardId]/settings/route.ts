import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { churches } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

const settingsSchema = z.object({
  allowAnonymous: z.boolean().optional(),
  publicBoardEnabled: z.boolean().optional(),
});

export async function PATCH(
  request: Request,
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

  const body = await request.json().catch(() => null);
  const parsed = settingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const [board] = await db
    .update(churches)
    .set(parsed.data)
    .where(eq(churches.id, boardId))
    .returning();

  return NextResponse.json({ board });
}
