import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { boardAdmins } from "@/db/schema";

export async function getBoardAdmin(userId: string, boardId: string) {
  const [admin] = await db
    .select()
    .from(boardAdmins)
    .where(and(eq(boardAdmins.userId, userId), eq(boardAdmins.boardId, boardId)))
    .limit(1);
  return admin ?? null;
}
