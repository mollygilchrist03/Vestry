import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ boardAdminId: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { boardAdminId } = await params;
  const [target] = await db
    .select()
    .from(boardAdmins)
    .where(eq(boardAdmins.id, boardAdminId))
    .limit(1);
  if (!target) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const requester = await getBoardAdmin(session.user.id, target.boardId);
  if (!requester || requester.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (target.role === "owner") {
    return NextResponse.json(
      { error: "Can't remove the board owner" },
      { status: 400 },
    );
  }

  await db.delete(boardAdmins).where(eq(boardAdmins.id, boardAdminId));

  return NextResponse.json({ success: true });
}
