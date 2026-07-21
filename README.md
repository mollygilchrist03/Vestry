# Vestry

**Faithful conversations. Stronger together.**

Vestry is a Q&A platform for churches. Pastors create a private board for their congregation; members ask Bible, theology, or personal faith questions — anonymously or by name, no account required — and pastors or staff reply publicly (building a living FAQ) or privately (a 1:1 conversation).

The core design constraint is trust: anonymity is enforced structurally in the data model, not just hidden in the UI. There is no account, session, or device fingerprint tying an anonymous question back to a person — the only way an asker returns to check for a reply is a unique, unguessable link generated at submission time.

**Live demo:** [vestry-tau.vercel.app](https://vestry-tau.vercel.app)

---

## Try it yourself

The live site is seeded with a full demo board so you can explore every feature without setting anything up.

**As a pastor** — log in at [/login](https://vestry-tau.vercel.app/login):

| | |
| - | - |
| Email | `pastor@vestrydemo.com` |
| Password | `VestryDemo2026!` |

(There's also a moderator account — `moderator@vestrydemo.com` / same password — to see the staff/permissions model.)

Once logged in you'll land on **Grace Community Church**, a board pre-loaded with nine questions covering every state the app supports: answered questions on the public feed, a private 1:1 reply, a sensitive-topic flag with revealed contact info, a pending question with an email-notification opt-in, and hidden/deleted moderation examples.

**As a congregation member** — no account needed, just visit the board directly:

[vestry-tau.vercel.app/board/GRACEDEMO](https://vestry-tau.vercel.app/board/GRACEDEMO)

Submit a question (named or anonymous) and you'll get redirected to a private thread link — bookmark it, since that link is the only way back.

Want your own copy of this demo data locally? See [Seeding demo data](#seeding-demo-data) below.

---

## Features

### For pastors and moderators

- Sign in with Google, or email + password
- Create a board for your church and get a shareable invite link/code
- Dashboard listing every question — filter by pending / answered / hidden / deleted
- Reply **publicly** (posts to the church's public Q&A feed) or **privately** (visible only to the asker)
- Moderate: hide (reversible) or delete a question
- Flag a thread as sensitive, prompting the asker to optionally share contact info for a personal follow-up
- Invite staff as moderators, scoped to one board
- Board settings: require names instead of allowing anonymous posts, toggle the public feed on/off (DM-only mode), regenerate the invite code
- Optional per-thread email notification when an asker wants to be pinged on reply (via Resend)

### For the congregation (no account, ever)

- Visit a board via invite link or code
- Browse the public Q&A feed — a running FAQ that grows over time
- Ask a question, named or left anonymous, and get a unique private thread link
- Return via that link to check for a reply — public replies also show on the main board, private ones only appear here
- Reveal a name or contact info later, entirely optional, and only within your own thread

### Platform-wide

- Multi-tenant: every board is fully isolated, enforced by explicit `board_id` checks in every query — there's no ORM-level or database-level row security doing this automatically
- Mobile-first responsive layout, including a sticky "Ask a question" button on the public board
- Crisis-resource text near every submission form, linking to [findahelpline.com](https://findahelpline.com) for international hotlines rather than assuming a US audience

---

## Why this data model

```text
churches (boards)          questions
- invite_code               - display_name   (nullable, free text — not a user reference)
- allow_anonymous           - thread_token    (unique, unguessable — the entire anonymous-access model)
- public_board_enabled       - is_public
                             - status (pending | answered | hidden | deleted)
users (pastors only)        - flagged_sensitive
- email, password_hash      - optional_contact (nullable, asker-controlled)
                             - notify_email    (nullable, asker-controlled)
board_admins
- role (owner | moderator)  replies
                             - visibility (public | private)
```

**There is no `user_id` or session/device fingerprint anywhere on `questions`.** That's intentional — it's the actual enforcement mechanism for the anonymity promise, not a policy documented somewhere and hoped for. A name is a free-text string on one row, never linked to an identity.

`thread_token` is a 21-character nanoid — cryptographically random, never sequential — and it's the *entire* security model for anonymous access back into a thread. Every route that touches `questions`, `replies`, or `board_admins` explicitly scopes its query by `board_id`, `thread_token`, or a `board_admins` membership check; there's no Postgres row-level security or ORM middleware doing this invisibly, which was a deliberate choice to keep the authorization logic visible and hand-written rather than delegated to a vendor feature.

---

## Tech stack

| Layer | Choice |
| - | - |
| Framework | Next.js 16 (App Router) + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Database | Postgres via [Neon](https://neon.tech) |
| ORM | [Drizzle](https://orm.drizzle.team) |
| Auth | [NextAuth](https://authjs.dev) — Google OAuth + email/password fallback |
| Hosting | [Vercel](https://vercel.com) |
| Email | [Resend](https://resend.com) (optional — reply notifications no-op gracefully without a key) |
| Validation | [Zod](https://zod.dev) |
| ID generation | [nanoid](https://github.com/ai/nanoid) |

---

## Local development

```bash
git clone https://github.com/mollygilchrist03/Vestry.git
cd Vestry
npm install
```

Create a `.env.local` (see `.env.example`) with:

```text
DATABASE_URL=            # a Neon (or any Postgres) connection string
AUTH_SECRET=              # random string — `openssl rand -base64 32`
AUTH_GOOGLE_ID=           # optional, for Google sign-in
AUTH_GOOGLE_SECRET=       # optional, for Google sign-in
RESEND_API_KEY=           # optional, for real reply-notification emails
```

Then:

```bash
npm run db:migrate   # apply the schema
npm run dev           # http://localhost:3000
```

Email/password sign-up works with no further setup. For Google sign-in, create an OAuth client in [Google Cloud Console](https://console.cloud.google.com) with a redirect URI of `http://localhost:3000/api/auth/callback/google`.

### Seeding demo data

```bash
npm run db:seed
```

Creates the same pastor/moderator accounts and "Grace Community Church" board described above, against whatever `DATABASE_URL` your `.env.local` points to. Safe to re-run — it cleans up any previous demo data first.

---

## Project structure

```text
app/
  (auth)/            Login, signup
  board/[inviteCode]/ Public board page (no auth)
  thread/[threadToken]/ Asker's private thread view (no auth)
  dashboard/          Pastor-facing app shell (sidebar, board list,
                      per-board questions/staff/settings)
  api/                Route handlers — every one enforces its own
                      board_id/thread_token/board_admins check
db/
  schema.ts           Drizzle schema (source of truth for the data model)
lib/
  board-admin.ts      getBoardAdmin() — the one access-control helper
                      every board-scoped route calls
  public-questions.ts Shared query for the public Q&A feed
scripts/
  seed.ts             Demo data script described above
```

---

## Status

All MVP and phase-two features from the original spec are built and deployed: pastor auth, board creation, public submission flow, reply (public/private), the public Q&A feed, moderation, a responsive pass, staff invites, sensitive-topic flagging, board settings, and email notifications.
