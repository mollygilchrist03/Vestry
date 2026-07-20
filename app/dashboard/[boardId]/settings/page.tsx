import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { churches } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { BoardSettingsForm } from "./BoardSettingsForm";
import { RegenerateInviteCodeButton } from "./RegenerateInviteCodeButton";

export default async function BoardSettingsPage({
  params,
}: {
  params: Promise<{ boardId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { boardId } = await params;
  const admin = await getBoardAdmin(session.user.id, boardId);
  if (!admin || admin.role !== "owner") {
    notFound();
  }

  const [board] = await db
    .select()
    .from(churches)
    .where(eq(churches.id, boardId))
    .limit(1);
  if (!board) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link
        href={`/dashboard/${boardId}`}
        className="text-sm text-muted-foreground underline underline-offset-4"
      >
        ← Back to questions
      </Link>
      <h1 className="mt-2 mb-6 text-2xl font-semibold">
        {board.name} — Settings
      </h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Board options</CardTitle>
        </CardHeader>
        <CardContent>
          <BoardSettingsForm
            boardId={boardId}
            allowAnonymous={board.allowAnonymous}
            publicBoardEnabled={board.publicBoardEnabled}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Invite code</CardTitle>
          <CardDescription>
            Current code:{" "}
            <span className="font-mono font-medium text-foreground">
              {board.inviteCode}
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RegenerateInviteCodeButton boardId={boardId} />
        </CardContent>
      </Card>
    </div>
  );
}
