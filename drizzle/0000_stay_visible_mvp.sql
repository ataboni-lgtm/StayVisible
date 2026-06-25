CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TYPE "client_status" AS ENUM ('Onboarding Needed', 'Active', 'Paused');
CREATE TYPE "post_status" AS ENUM ('Idea', 'Draft', 'Generated', 'Sent for Approval', 'Changes Requested', 'Approved', 'Posted', 'Rejected');
CREATE TYPE "notification_method" AS ENUM ('Email', 'Text', 'Both');

CREATE TABLE "admins" (
  "id" uuid PRIMARY KEY NOT NULL,
  "full_name" text NOT NULL,
  "email" text NOT NULL UNIQUE,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "clients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "admin_id" uuid NOT NULL REFERENCES "admins"("id") ON DELETE cascade,
  "first_name" text NOT NULL,
  "last_name" text NOT NULL,
  "email" text NOT NULL,
  "phone" text,
  "company" text,
  "job_title" text,
  "industry" text,
  "location" text,
  "linkedin_profile_url" text,
  "target_audience" text,
  "topics" text[] DEFAULT '{}' NOT NULL,
  "topics_to_avoid" text[] DEFAULT '{}' NOT NULL,
  "preferred_notification_method" "notification_method" DEFAULT 'Email' NOT NULL,
  "status" "client_status" DEFAULT 'Onboarding Needed' NOT NULL,
  "recent_activity_notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "voice_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "tone_summary" text,
  "sentence_style" text,
  "vocabulary_style" text,
  "post_length_preference" text,
  "common_phrases" text[] DEFAULT '{}' NOT NULL,
  "words_to_avoid" text[] DEFAULT '{}' NOT NULL,
  "emoji_rules" text,
  "hashtag_rules" text,
  "first_person_preference" text,
  "personal_professional_balance" text,
  "example_post" text,
  "dos" text[] DEFAULT '{}' NOT NULL,
  "donts" text[] DEFAULT '{}' NOT NULL,
  "learning_notes" text[] DEFAULT '{}' NOT NULL,
  "source_answers" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "post_opportunities" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "post_type" text NOT NULL,
  "topic_name" text NOT NULL,
  "event_date" date,
  "location" text,
  "people_companies_to_mention" text[] DEFAULT '{}' NOT NULL,
  "main_takeaway" text,
  "notes" text,
  "desired_tone" text,
  "call_to_action" text,
  "status" "post_status" DEFAULT 'Idea' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "photos" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "post_opportunity_id" uuid REFERENCES "post_opportunities"("id") ON DELETE cascade,
  "storage_path" text NOT NULL,
  "alt_text" text,
  "context" text,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "posts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "post_opportunity_id" uuid REFERENCES "post_opportunities"("id") ON DELETE set null,
  "variant_label" text,
  "caption" text DEFAULT '' NOT NULL,
  "hashtags" text[] DEFAULT '{}' NOT NULL,
  "selected" boolean DEFAULT false NOT NULL,
  "status" "post_status" DEFAULT 'Draft' NOT NULL,
  "approved_at" timestamp with time zone,
  "posted_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "approvals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "approval_token" text DEFAULT encode(gen_random_bytes(32), 'hex') NOT NULL UNIQUE,
  "action" text,
  "feedback" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "expires_at" timestamp with time zone DEFAULT (now() + interval '14 days') NOT NULL,
  "responded_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "notifications" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "post_id" uuid REFERENCES "posts"("id") ON DELETE cascade,
  "approval_id" uuid REFERENCES "approvals"("id") ON DELETE set null,
  "channel" text NOT NULL,
  "recipient" text NOT NULL,
  "provider_message_id" text,
  "status" text DEFAULT 'queued' NOT NULL,
  "error_message" text,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "social_accounts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "provider" text DEFAULT 'linkedin' NOT NULL,
  "provider_account_id" text,
  "access_token_encrypted" text,
  "refresh_token_encrypted" text,
  "token_expires_at" timestamp with time zone,
  "scopes" text[] DEFAULT '{}' NOT NULL,
  "status" text DEFAULT 'disconnected' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE("client_id", "provider")
);

CREATE TABLE "edit_feedback" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "post_id" uuid NOT NULL REFERENCES "posts"("id") ON DELETE cascade,
  "original_caption" text,
  "final_caption" text,
  "feedback" text,
  "feedback_type" text,
  "extracted_learning" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE "weekly_ideas" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL REFERENCES "clients"("id") ON DELETE cascade,
  "week_of" date NOT NULL,
  "suggested_topic" text NOT NULL,
  "why_it_works" text,
  "suggested_angle" text,
  "source_context" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" "post_status" DEFAULT 'Idea' NOT NULL,
  "post_opportunity_id" uuid REFERENCES "post_opportunities"("id") ON DELETE set null,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE INDEX "clients_admin_id_idx" ON "clients" ("admin_id");
CREATE INDEX "clients_status_idx" ON "clients" ("status");
CREATE UNIQUE INDEX "voice_profiles_client_id_idx" ON "voice_profiles" ("client_id");
CREATE INDEX "opportunities_client_id_idx" ON "post_opportunities" ("client_id");
CREATE INDEX "opportunities_status_idx" ON "post_opportunities" ("status");
CREATE INDEX "photos_client_id_idx" ON "photos" ("client_id");
CREATE INDEX "posts_client_id_idx" ON "posts" ("client_id");
CREATE INDEX "posts_status_idx" ON "posts" ("status");
CREATE INDEX "approvals_post_id_idx" ON "approvals" ("post_id");
CREATE INDEX "approvals_client_id_idx" ON "approvals" ("client_id");
CREATE INDEX "approvals_token_idx" ON "approvals" ("approval_token");
CREATE INDEX "notifications_client_id_idx" ON "notifications" ("client_id");
CREATE INDEX "notifications_post_id_idx" ON "notifications" ("post_id");
CREATE INDEX "social_accounts_client_id_idx" ON "social_accounts" ("client_id");
CREATE UNIQUE INDEX "social_accounts_client_provider_idx" ON "social_accounts" ("client_id", "provider");
CREATE INDEX "edit_feedback_client_id_idx" ON "edit_feedback" ("client_id");
CREATE INDEX "edit_feedback_post_id_idx" ON "edit_feedback" ("post_id");
CREATE INDEX "weekly_ideas_client_id_idx" ON "weekly_ideas" ("client_id");
CREATE INDEX "weekly_ideas_status_idx" ON "weekly_ideas" ("status");
