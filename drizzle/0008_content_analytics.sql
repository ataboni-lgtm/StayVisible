CREATE TABLE IF NOT EXISTS "post_analytics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL,
  "post_id" uuid,
  "captured_at" date NOT NULL,
  "posted_at" timestamp with time zone,
  "posting_hour" integer,
  "impressions" integer DEFAULT 0 NOT NULL,
  "reactions" integer DEFAULT 0 NOT NULL,
  "comments" integer DEFAULT 0 NOT NULL,
  "reposts" integer DEFAULT 0 NOT NULL,
  "profile_views" integer DEFAULT 0 NOT NULL,
  "link_clicks" integer DEFAULT 0 NOT NULL,
  "engagement_rate_bps" integer DEFAULT 0 NOT NULL,
  "source" text DEFAULT 'manual' NOT NULL,
  "notes" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "content_recommendations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "client_id" uuid NOT NULL,
  "recommendation_type" text NOT NULL,
  "title" text NOT NULL,
  "rationale" text NOT NULL,
  "suggested_action" text NOT NULL,
  "confidence_score" integer DEFAULT 50 NOT NULL,
  "source_metrics" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" text DEFAULT 'active' NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

DO $$ BEGIN
 ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "post_analytics" ADD CONSTRAINT "post_analytics_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
 ALTER TABLE "content_recommendations" ADD CONSTRAINT "content_recommendations_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

CREATE INDEX IF NOT EXISTS "post_analytics_client_id_idx" ON "post_analytics" ("client_id");
CREATE INDEX IF NOT EXISTS "post_analytics_post_id_idx" ON "post_analytics" ("post_id");
CREATE INDEX IF NOT EXISTS "post_analytics_captured_at_idx" ON "post_analytics" ("captured_at");
CREATE INDEX IF NOT EXISTS "content_recommendations_client_id_idx" ON "content_recommendations" ("client_id");
CREATE INDEX IF NOT EXISTS "content_recommendations_status_idx" ON "content_recommendations" ("status");
