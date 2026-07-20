import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import { z } from "zod";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, churches } from "@/db/schema";

const createBoardSchema = z.object({
  name: z.string().trim().min(1, "Church name is required"),
  description: z.string().trim().optional(),
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = createBoardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }
  const { name, description } = parsed.data;

  const [church] = await db
    .insert(churches)
    .values({
      name,
      description: description || null,
      inviteCode: nanoid(8),
      createdBy: session.user.id,
    })
    .returning();

  await db.insert(boardAdmins).values({
    boardId: church.id,
    userId: session.user.id,
    role: "owner",
  });

  return NextResponse.json({ board: church }, { status: 201 });
}
