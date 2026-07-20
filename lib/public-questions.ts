import { and, desc, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { questions, replies } from "@/db/schema";

export async function getPublicQuestions(boardId: string) {
  const publicQuestions = await db
    .select()
    .from(questions)
    .where(
      and(
        eq(questions.boardId, boardId),
        eq(questions.isPublic, true),
        ne(questions.status, "hidden"),
        ne(questions.status, "deleted"),
      ),
    )
    .orderBy(desc(questions.createdAt));

  const questionIds = publicQuestions.map((q) => q.id);
  const publicReplies = questionIds.length
    ? await db
        .select()
        .from(replies)
        .where(
          and(
            inArray(replies.questionId, questionIds),
            eq(replies.visibility, "public"),
          ),
        )
        .orderBy(replies.createdAt)
    : [];

  const repliesByQuestion = new Map<string, typeof publicReplies>();
  for (const reply of publicReplies) {
    const list = repliesByQuestion.get(reply.questionId) ?? [];
    list.push(reply);
    repliesByQuestion.set(reply.questionId, list);
  }

  return publicQuestions.map((q) => ({
    ...q,
    replies: repliesByQuestion.get(q.id) ?? [],
  }));
}
