CREATE TYPE "public"."board_role" AS ENUM('owner', 'moderator');--> statement-breakpoint
CREATE TYPE "public"."question_status" AS ENUM('pending', 'answered', 'hidden', 'deleted');--> statement-breakpoint
CREATE TYPE "public"."reply_visibility" AS ENUM('public', 'private');--> statement-breakpoint
CREATE TABLE "board_admins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" "board_role" DEFAULT 'moderator' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "churches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"invite_code" text NOT NULL,
	"allow_anonymous" boolean DEFAULT true NOT NULL,
	"public_board_enabled" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "churches_invite_code_unique" UNIQUE("invite_code")
);
--> statement-breakpoint
CREATE TABLE "questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"board_id" uuid NOT NULL,
	"display_name" text,
	"question_text" text NOT NULL,
	"thread_token" text NOT NULL,
	"is_public" boolean DEFAULT false NOT NULL,
	"status" "question_status" DEFAULT 'pending' NOT NULL,
	"flagged_sensitive" boolean DEFAULT false NOT NULL,
	"optional_contact" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "questions_thread_token_unique" UNIQUE("thread_token")
);
--> statement-breakpoint
CREATE TABLE "replies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"board_admin_id" uuid NOT NULL,
	"reply_text" text NOT NULL,
	"visibility" "reply_visibility" DEFAULT 'public' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "board_admins" ADD CONSTRAINT "board_admins_board_id_churches_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "board_admins" ADD CONSTRAINT "board_admins_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "churches" ADD CONSTRAINT "churches_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "questions" ADD CONSTRAINT "questions_board_id_churches_id_fk" FOREIGN KEY ("board_id") REFERENCES "public"."churches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_question_id_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."questions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "replies" ADD CONSTRAINT "replies_board_admin_id_board_admins_id_fk" FOREIGN KEY ("board_admin_id") REFERENCES "public"."board_admins"("id") ON DELETE no action ON UPDATE no action;