import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, churches } from "@/db/schema";
import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const boards = await db
    .select({
      id: churches.id,
      name: churches.name,
      description: churches.description,
      inviteCode: churches.inviteCode,
    })
    .from(boardAdmins)
    .innerJoin(churches, eq(boardAdmins.boardId, churches.id))
    .where(eq(boardAdmins.userId, session.user.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 md:px-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Boards</h1>
        <Link href="/dashboard/new-board" className={buttonVariants()}>
          + New board
        </Link>
      </div>

      {boards.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>No boards yet</CardTitle>
            <CardDescription>
              Create a board for your church to get an invite link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard/new-board" className={buttonVariants()}>
              Create a board
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {boards.map((board) => (
            <Link key={board.id} href={`/dashboard/${board.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle>{board.name}</CardTitle>
                  {board.description && (
                    <CardDescription>{board.description}</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Invite code:{" "}
                    <span className="font-mono font-medium text-foreground">
                      {board.inviteCode}
                    </span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
