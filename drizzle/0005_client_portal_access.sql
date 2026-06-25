ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "portal_access_enabled" boolean DEFAULT false NOT NULL;
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "portal_password_hash" text;
