import { Avatar } from "@/components/Avatar";
import { formatRelativeTime } from "@/lib/format-time";

type FeedReply = {
  id: string;
  replyText: string;
  createdAt: Date | string;
};

export function FeedPost({
  displayName,
  questionText,
  createdAt,
  replies,
  statusLabel,
}: {
  displayName: string | null;
  questionText: string;
  createdAt: Date | string;
  replies: FeedReply[];
  statusLabel?: string;
}) {
  const name = displayName?.trim() || "Anonymous";

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex gap-3">
        <Avatar name={displayName} />
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="font-medium">{name}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(createdAt)}
            </span>
            {statusLabel && (
              <span className="text-xs text-muted-foreground">
                · {statusLabel}
              </span>
            )}
          </div>
          <p className="mt-1 whitespace-pre-wrap text-sm leading-relaxed">
            {questionText}
          </p>
        </div>
      </div>

      {replies.length > 0 && (
        <div className="mt-4 space-y-3 border-l-2 border-accent/40 pl-4">
          {replies.map((reply) => (
            <div key={reply.id} className="flex gap-3">
              <Avatar name="Pastor" size="sm" />
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-medium">Pastor</span>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(reply.createdAt)}
                  </span>
                </div>
                <p className="mt-0.5 whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
                  {reply.replyText}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </article>
  );
}
