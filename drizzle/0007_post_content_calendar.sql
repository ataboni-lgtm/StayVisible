ALTER TABLE "posts" ADD COLUMN IF NOT EXISTS "scheduled_for" date;
CREATE INDEX IF NOT EXISTS "posts_scheduled_for_idx" ON "posts" ("scheduled_for");
