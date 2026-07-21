import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { nanoid } from "nanoid";
import * as schema from "../db/schema";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });
const { users, churches, boardAdmins, questions, replies } = schema;

const PASTOR_EMAIL = "pastor@vestrydemo.com";
const MODERATOR_EMAIL = "moderator@vestrydemo.com";
const DEMO_PASSWORD = "VestryDemo2026!";
const INVITE_CODE = "GRACEDEMO";

function daysAgo(n: number, hour = 12) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding Vestry demo data...\n");

  // --- Clean up any existing demo data so this script is safely re-runnable ---
  const [existingBoard] = await db
    .select({ id: churches.id })
    .from(churches)
    .where(eq(churches.inviteCode, INVITE_CODE))
    .limit(1);

  if (existingBoard) {
    const boardQuestions = await db
      .select({ id: questions.id })
      .from(questions)
      .where(eq(questions.boardId, existingBoard.id));
    const questionIds = boardQuestions.map((q) => q.id);

    if (questionIds.length > 0) {
      await db.delete(replies).where(inArray(replies.questionId, questionIds));
      await db.delete(questions).where(eq(questions.boardId, existingBoard.id));
    }
    await db.delete(boardAdmins).where(eq(boardAdmins.boardId, existingBoard.id));
    await db.delete(churches).where(eq(churches.id, existingBoard.id));
    console.log("Removed previous demo board and its data.");
  }

  const existingUsers = await db
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(inArray(users.email, [PASTOR_EMAIL, MODERATOR_EMAIL]));
  if (existingUsers.length > 0) {
    await db.delete(boardAdmins).where(
      inArray(
        boardAdmins.userId,
        existingUsers.map((u) => u.id),
      ),
    );
    await db.delete(users).where(
      inArray(users.email, [PASTOR_EMAIL, MODERATOR_EMAIL]),
    );
    console.log("Removed previous demo users.");
  }

  // --- Create demo pastor + moderator accounts ---
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  const [pastor] = await db
    .insert(users)
    .values({
      email: PASTOR_EMAIL,
      name: "Pastor Michael Reyes",
      passwordHash,
      createdAt: daysAgo(60),
    })
    .returning();

  const [moderator] = await db
    .insert(users)
    .values({
      email: MODERATOR_EMAIL,
      name: "Associate Pastor Dana Kim",
      passwordHash,
      createdAt: daysAgo(45),
    })
    .returning();

  console.log(`Created pastor account: ${PASTOR_EMAIL}`);
  console.log(`Created moderator account: ${MODERATOR_EMAIL}`);

  // --- Create the church board ---
  const [board] = await db
    .insert(churches)
    .values({
      name: "Grace Community Church",
      description:
        "A warm, growing congregation in the heart of the city. Ask us anything - Bible questions, doubts, or something on your heart.",
      inviteCode: INVITE_CODE,
      allowAnonymous: true,
      publicBoardEnabled: true,
      createdBy: pastor.id,
      createdAt: daysAgo(60),
    })
    .returning();

  const [ownerAdmin] = await db
    .insert(boardAdmins)
    .values({ boardId: board.id, userId: pastor.id, role: "owner" })
    .returning();

  const [modAdmin] = await db
    .insert(boardAdmins)
    .values({ boardId: board.id, userId: moderator.id, role: "moderator" })
    .returning();

  console.log(`Created board "${board.name}" (invite code: ${board.inviteCode})\n`);

  // --- Seed questions covering every feature ---

  // 1. Named, answered publicly - the classic "living FAQ" case
  const [q1] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: "Sarah M.",
      questionText:
        "How do we reconcile grace and works? James 2 says faith without works is dead, but Ephesians 2 says we're saved by grace, not works. I get confused explaining this to my kids.",
      threadToken: nanoid(),
      isPublic: true,
      status: "answered",
      createdAt: daysAgo(9, 10),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q1.id,
    boardAdminId: ownerAdmin.id,
    replyText:
      "Great question, and a really common one! Ephesians 2:8-9 is about how we're saved - grace through faith, not earned by our effort. James 2 is about what genuine faith looks like once it's there - it naturally produces action. Think of it this way: grace is the root, works are the fruit. We're not saved BY works, but real faith always shows up as works. Hope that helps explain it to your kids!",
    visibility: "public",
    createdAt: daysAgo(8, 14),
  });

  // 2. Anonymous, answered publicly
  const [q2] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: null,
      questionText:
        "Is it okay to still have doubts about my faith after so many years? Sometimes I feel guilty for even asking questions.",
      threadToken: nanoid(),
      isPublic: true,
      status: "answered",
      createdAt: daysAgo(6, 21),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q2.id,
    boardAdminId: modAdmin.id,
    replyText:
      "Doubt isn't the opposite of faith - indifference is. Some of the most faithful people in Scripture wrestled openly with God (Job, the Psalms, even John the Baptist from prison). Bringing your questions here instead of burying them is actually a sign of real faith, not a lack of it. You're welcome here, always.",
    visibility: "public",
    createdAt: daysAgo(6, 9),
  });

  // 3. Named, answered privately - shows the public/private split
  const [q3] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: "James T.",
      questionText:
        "My wife and I have been arguing a lot lately about finances and it's putting a strain on things. Could we grab coffee sometime to talk it through? Didn't want to put this on the public board.",
      threadToken: nanoid(),
      isPublic: false,
      status: "answered",
      createdAt: daysAgo(4, 19),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q3.id,
    boardAdminId: ownerAdmin.id,
    replyText:
      "Of course, James. This kind of thing is exactly what I'm here for. I have some time Thursday afternoon or Saturday morning - whichever works better, I'll bring the coffee. Let's talk it through together.",
    visibility: "private",
    createdAt: daysAgo(4, 20),
  });

  // 4. Anonymous, flagged sensitive, contact revealed - shows the sensitive-topic flow
  const [q4] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: null,
      questionText:
        "I don't really know how to say this here, but my marriage has been really hard lately and I feel like I'm carrying it alone. I don't want to make a scene asking for help.",
      threadToken: nanoid(),
      isPublic: false,
      status: "answered",
      flaggedSensitive: true,
      optionalContact: "reach me at 555-0148, evenings are best",
      createdAt: daysAgo(3, 8),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q4.id,
    boardAdminId: ownerAdmin.id,
    replyText:
      "Thank you for trusting us with this - that took courage. You are not alone in this, and there's no shame in asking for support. I'll give you a call this evening so we can talk properly and figure out next steps together.",
    visibility: "private",
    createdAt: daysAgo(2, 18),
  });

  // 5. Anonymous, pending, notify-email opted in - shows the "waiting" + notify state
  await db.insert(questions).values({
    boardId: board.id,
    displayName: null,
    questionText:
      "What does the church actually believe about what happens after we die? I've heard different things from different people and want a straight answer.",
    threadToken: nanoid(),
    isPublic: false,
    status: "pending",
    notifyEmail: "curious.visitor@example.com",
    createdAt: daysAgo(1, 15),
  });

  // 6. Named, pending, no reply yet - a normal queue item
  await db.insert(questions).values({
    boardId: board.id,
    displayName: "The Thursday Youth Group",
    questionText:
      "We're doing a series on the book of Daniel this month - any recommended resources for teens that go a bit deeper than the Sunday school version?",
    threadToken: nanoid(),
    isPublic: false,
    status: "pending",
    createdAt: daysAgo(0, 10),
  });

  // 7. Hidden - moderation demo
  const [q7] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: "Test Account",
      questionText: "just testing if this thing works lol",
      threadToken: nanoid(),
      isPublic: false,
      status: "hidden",
      createdAt: daysAgo(11, 16),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q7.id,
    boardAdminId: modAdmin.id,
    replyText: "Looks like it does! Hiding this one since it's not a real question.",
    visibility: "private",
    createdAt: daysAgo(11, 17),
  });

  // 8. Deleted - moderation demo
  await db.insert(questions).values({
    boardId: board.id,
    displayName: null,
    questionText: "[removed spam content]",
    threadToken: nanoid(),
    isPublic: false,
    status: "deleted",
    createdAt: daysAgo(14, 12),
  });

  // 9. Named, answered publicly - a second FAQ-style entry for a fuller public feed
  const [q9] = await db
    .insert(questions)
    .values({
      boardId: board.id,
      displayName: "Marcus O.",
      questionText:
        "Why does the church calendar follow Advent, Lent, etc.? What's the point of the liturgical seasons if the Bible doesn't lay them out explicitly?",
      threadToken: nanoid(),
      isPublic: true,
      status: "answered",
      createdAt: daysAgo(16, 11),
    })
    .returning();
  await db.insert(replies).values({
    questionId: q9.id,
    boardAdminId: ownerAdmin.id,
    replyText:
      "You're right that it's not commanded in Scripture - it's a tradition the church developed to walk through the story of the gospel together each year: waiting (Advent), repentance (Lent), resurrection (Easter), and so on. It's less a rule and more a rhythm to help us live the story, not just read it. Totally fine to hold it loosely!",
    visibility: "public",
    createdAt: daysAgo(15, 13),
  });

  console.log("Seeded 9 questions covering every board state:");
  console.log("  - public Q&A feed (2 answered-public entries)");
  console.log("  - private reply (asker-only)");
  console.log("  - sensitive flag + revealed contact info");
  console.log("  - pending + email notification opt-in");
  console.log("  - plain pending queue item");
  console.log("  - hidden (moderation)");
  console.log("  - deleted (moderation)");

  console.log("\n--- Demo credentials ---");
  console.log(`Pastor login:     ${PASTOR_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Moderator login:  ${MODERATOR_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`Board invite code: ${board.inviteCode}`);
  console.log(`Public board URL:  /board/${board.inviteCode}`);
}

main()
  .then(() => {
    console.log("\nDone.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
