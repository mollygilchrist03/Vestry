import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { and, desc, eq, ne, sql } from "drizzle-orm";
import { auth } from "@/auth";
import { db } from "@/db";
import { churches, questions, type questionStatusEnum } from "@/db/schema";
import { getBoardAdmin } from "@/lib/board-admin";
import { STATUS_BADGE_VARIANT } from "@/lib/question-status-badge";
import { formatRelativeTime } from "@/lib/format-time";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/ui/badge";
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

  const [boardQuestions, statusCounts] = await Promise.all([
    db.select().from(questions).where(whereClause).orderBy(desc(questions.createdAt)),
    db
      .select({ status: questions.status, count: sql<number>`count(*)::int` })
      .from(questions)
      .where(eq(questions.boardId, boardId))
      .groupBy(questions.status),
  ]);

  const countMap: Partial<Record<string, number>> = {};
  let totalNonDeleted = 0;
  for (const row of statusCounts) {
    countMap[row.status] = row.count;
    if (row.status !== "deleted") totalNonDeleted += row.count;
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-8">
      <h1 className="mb-6 text-2xl font-semibold">{board.name}</h1>

      <div className="mb-8 grid grid-cols-3 gap-3 sm:grid-cols-5">
        {FILTERS.map((f) => {
          const count = f.value === "all" ? totalNonDeleted : (countMap[f.value] ?? 0);
          const isActive = status === f.value;
          return (
            <Link
              key={f.value}
              href={
                f.value === "all"
                  ? `/dashboard/${boardId}`
                  : `/dashboard/${boardId}?status=${f.value}`
              }
              className={cn(
                "rounded-2xl border p-4 transition-all",
                isActive
                  ? "border-primary bg-primary text-primary-foreground shadow-md"
                  : "border-border bg-card hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm",
              )}
            >
              <p className="text-2xl font-semibold">{count}</p>
              <p
                className={cn(
                  "text-xs font-medium tracking-wide uppercase",
                  isActive ? "text-primary-foreground/80" : "text-muted-foreground",
                )}
              >
                {f.label}
              </p>
            </Link>
          );
        })}
      </div>

      {boardQuestions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          No questions here.
        </div>
      ) : (
        <div className="space-y-3">
          {boardQuestions.map((q) => (
            <Link
              key={q.id}
              href={`/dashboard/${boardId}/questions/${q.id}`}
              className="group flex items-start gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
            >
              <Avatar name={q.displayName} />
              <div className="min-w-0 flex-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <span className="truncate text-sm font-medium">
                    {q.displayName?.trim() || "Anonymous"}
                  </span>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {formatRelativeTime(q.createdAt)}
                    </span>
                    <Badge variant={STATUS_BADGE_VARIANT[q.status]}>
                      {q.status}
                    </Badge>
                  </div>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {q.questionText}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
