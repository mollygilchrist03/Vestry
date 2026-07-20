import Link from "next/link";
import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { boardAdmins, churches } from "@/db/schema";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { logout } from "./actions";

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
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Your boards</h1>
          <p className="text-sm text-muted-foreground">
            Signed in as {session.user.email}
          </p>
        </div>
        <form action={logout}>
          <Button type="submit" variant="outline">
            Log out
          </Button>
        </form>
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
        <div className="space-y-4">
          {boards.map((board) => (
            <Card key={board.id}>
              <CardHeader>
                <CardTitle>
                  <Link
                    href={`/dashboard/${board.id}`}
                    className="underline-offset-4 hover:underline"
                  >
                    {board.name}
                  </Link>
                </CardTitle>
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
          ))}
          <Link
            href="/dashboard/new-board"
            className={buttonVariants({ variant: "outline" })}
          >
            Create another board
          </Link>
        </div>
      )}
    </div>
  );
}
