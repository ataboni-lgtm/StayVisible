ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "post_opportunity_id" uuid REFERENCES "post_opportunities"("id") ON DELETE cascade;
ALTER TABLE "notifications" ADD COLUMN IF NOT EXISTS "notification_type" text DEFAULT 'general' NOT NULL;
CREATE INDEX IF NOT EXISTS "notifications_opportunity_id_idx" ON "notifications" ("post_opportunity_id");
