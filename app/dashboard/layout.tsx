import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, churches } from "@/db/schema";
import { DashboardShell } from "./DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const boards = await db
    .select({ id: churches.id, name: churches.name })
    .from(boardAdmins)
    .innerJoin(churches, eq(boardAdmins.boardId, churches.id))
    .where(eq(boardAdmins.userId, session.user.id));

  return (
    <DashboardShell
      userEmail={session.user.email ?? ""}
      userName={session.user.name ?? null}
      boards={boards}
    >
      {children}
    </DashboardShell>
  );
}
