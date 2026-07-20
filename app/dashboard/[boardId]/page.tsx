import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq, ne } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { churches, questions, type questionStatusEnum } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";
import { STATUS_BADGE_VARIANT } from "@/lib/question-status-badge";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatusFilter = (typeof questionStatusEnum.enumValues)[number] | "all";

const FILTERS: { label: string; value: StatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Answered", value: "answered" },
  { label: "Hidden", value: "hidden" },
  { label: "Deleted", value: "deleted" },
];

export default async function BoardQuestionsPage({
  params,
  searchParams,
}: {
  params: Promise<{ boardId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { boardId } = await params;
  const admin = await getBoardAdmin(session.user.id, boardId);
  if (!admin) {
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

  const { status: statusParam } = await searchParams;
  const status: StatusFilter = (FILTERS.find((f) => f.value === statusParam)
    ?.value ?? "all") as StatusFilter;

  const whereClause =
    status === "all"
      ? and(eq(questions.boardId, boardId), ne(questions.status, "deleted"))
      : and(eq(questions.boardId, boardId), eq(questions.status, status));

  const boardQuestions = await db
    .select()
    .from(questions)
    .where(whereClause)
    .orderBy(desc(questions.createdAt));

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex items-start justify-between gap-3">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-muted-foreground underline underline-offset-4"
          >
            ← All boards
          </Link>
          <h1 className="mt-2 text-2xl font-semibold">{board.name}</h1>
        </div>
        <Link
          href={`/dashboard/${boardId}/staff`}
          className="text-sm text-muted-foreground underline underline-offset-4"
        >
          Staff
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <Link
            key={f.value}
            href={
              f.value === "all"
                ? `/dashboard/${boardId}`
                : `/dashboard/${boardId}?status=${f.value}`
            }
            className={cn(
              buttonVariants({
                variant: status === f.value ? "default" : "outline",
                size: "sm",
              }),
              "shrink-0",
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {boardQuestions.length === 0 ? (
        <p className="text-sm text-muted-foreground">No questions here.</p>
      ) : (
        <div className="space-y-3">
          {boardQuestions.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/${boardId}/questions/${q.id}`}
              className="block rounded-lg border border-border p-4 hover:bg-muted/50"
            >
              <div className="mb-1 flex items-center justify-between gap-2">
                <span className="text-sm font-medium">
                  {q.displayName?.trim() || "Anonymous"}
                </span>
                <Badge variant={STATUS_BADGE_VARIANT[q.status]}>
                  {q.status}
                </Badge>
              </div>
              <p className="line-clamp-2 text-sm text-muted-foreground">
                {q.questionText}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
