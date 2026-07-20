import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, users } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";

const addStaffSchema = z.object({
  boardId: z.string().uuid(),
  email: z.string().trim().email(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = addStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { boardId, email } = parsed.data;

  const requester = await getBoardAdmin(session.user.id, boardId);
  if (!requester || requester.role !== "owner") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [invitee] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  if (!invitee) {
    return NextResponse.json(
      {
        error:
          "No Vestry account found for that email. They'll need to sign in once first.",
      },
      { status: 404 },
    );
  }

  const [existing] = await db
    .select({ id: boardAdmins.id })
    .from(boardAdmins)
    .where(
      and(eq(boardAdmins.boardId, boardId), eq(boardAdmins.userId, invitee.id)),
    )
    .limit(1);
  if (existing) {
    return NextResponse.json(
      { error: "That person is already staff on this board" },
      { status: 400 },
    );
  }

  const [admin] = await db
    .insert(boardAdmins)
    .values({ boardId, userId: invitee.id, role: "moderator" })
    .returning();

  return NextResponse.json({ admin }, { status: 201 });
}
