ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "client_type" text DEFAULT 'Individual' NOT NULL;
CREATE INDEX IF NOT EXISTS "clients_client_type_idx" ON "clients" ("client_type");
