import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, churches, users } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InviteStaffForm } from "./InviteStaffForm";
import { RemoveStaffButton } from "./RemoveStaffButton";

export default async function StaffPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { boardId } = await params;
  const requester = await getBoardAdmin(session.user.id, boardId);
  if (!requester) {
    notFound();
  }

  const [board] = await db
    .select({ id: churches.id, name: churches.name })
    .from(churches)
    .where(eq(churches.id, boardId))
    .limit(1);
  if (!board) {
    notFound();
  }

  const staff = await db
    .select({
      id: boardAdmins.id,
      role: boardAdmins.role,
      name: users.name,
      email: users.email,
    })
    .from(boardAdmins)
    .innerJoin(users, eq(boardAdmins.userId, users.id))
    .where(eq(boardAdmins.boardId, boardId));

  const isOwner = requester.role === "owner";

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/dashboard/${boardId}`}
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to questions
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        {board.name} — Staff
      </h1>

      <div className="mb-6 space-y-3">
        {staff.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="flex items-center justify-between gap-3 py-2">
              <div>
                <p className="text-sm font-medium">
                  {admin.name || admin.email}
                </p>
                <p className="text-xs text-muted-foreground">{admin.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={admin.role === "owner" ? "default" : "secondary"}>
                  {admin.role}
                </Badge>
                {isOwner && admin.role !== "owner" && (
                  <RemoveStaffButton boardAdminId={admin.id} />
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isOwner && (
        <Card>
          <CardHeader>
            <CardTitle>Add a moderator</CardTitle>
            <CardDescription>
              Moderators can reply and moderate, scoped to this board only.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <InviteStaffForm boardId={boardId} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
