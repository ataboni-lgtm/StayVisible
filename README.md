# StayVisible

StayVisible is a personal LinkedIn assistant for busy professionals. An admin captures a real moment, generates three post directions in the client’s voice, and sends a secure no-login approval link. Client edits become feedback for future drafts.

The UI starts empty by default. Connect Supabase to persist real clients, posts, approvals, notifications, and voice profiles.

## Tech stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Radix-based ShadCN UI primitives
- Supabase Auth, Postgres, Row Level Security, and private Storage
- OpenAI for voice profiles and LinkedIn drafts
- SendGrid for approval email
- Twilio for approval SMS
- Official LinkedIn OAuth placeholder for future publishing

## Local setup

1. Install Node.js 20 or newer.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the credentials you want to test. No credentials are required to explore the empty local UI.
5. Run `npm run dev` and open [http://localhost:4000](http://localhost:4000).

Use `npm run build` for a production verification. The project is ready for Vercel’s standard Next.js deployment.

## Supabase setup

1. Create a Supabase project.
2. Open the SQL editor and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Create the admin in Supabase Auth. Add the matching user UUID to `public.admins`.
4. Optionally add your own local records to [`supabase/seed.sql`](./supabase/seed.sql).
5. Copy the project URL, anon key, and server-only service role key into `.env.local`.

The schema enables RLS on every application table. Admin policies scope related data through `clients.admin_id`. Post photos live in the private `post-photos` bucket under an admin-ID folder. Never expose `SUPABASE_SERVICE_ROLE_KEY` to the browser.

Production admin pages should enforce a Supabase session before launch. The MVP currently stays open locally so the product can be evaluated without credentials. The approval route is intentionally login-free and must resolve only the record matching its secure random token.

## OpenAI setup

Create an API key and set `OPENAI_API_KEY`. The app uses it in server-only routes:

- `POST /api/generate-voice-profile`
- `POST /api/generate-linkedin-posts`

Prompts enforce the client voice profile, natural rhythm, no em dashes, restrained hashtags, and no emojis unless allowed.

## SendGrid setup

1. Verify a sender in SendGrid.
2. Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.
3. Trigger “Send for approval” from a post review page.

Without these values the route stays in placeholder mode and does not send an email.

## Twilio setup

1. Create or select a Twilio phone number.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
3. Set a client’s notification preference to Text or Both.

SendGrid and Twilio sends are written to `notifications` when Supabase is configured.

## Environment variables

All supported variables are documented in [`.env.example`](./.env.example). `NEXT_PUBLIC_*` values may reach the browser. Every other credential must remain server-only.

## Test the approval workflow locally

1. Open `/posts/new` and complete the opportunity form.
2. Generate three options and select one.
3. Review the caption and click “Send for approval.”
4. Open the generated approval link.
5. Edit the caption, try a quick refinement, and approve or request changes.

With Supabase configured, use a new 32-byte random token created by the database default. Responses update the post status, close the token, and add edit feedback.

## LinkedIn OAuth notes

[`src/lib/linkedin.ts`](./src/lib/linkedin.ts) contains intentionally disabled placeholders for authorization, token exchange, and posting. Publishing must use official LinkedIn OAuth and approved personal-profile permissions. StayVisible must never scrape LinkedIn, automate a browser, store a LinkedIn password, or publish before the client approves the exact post.

## Main routes

- `/dashboard`
- `/clients`, `/clients/new`, `/clients/[id]`
- `/clients/[id]/onboarding`, `/clients/[id]/voice-profile`
- `/posts/new`, `/posts/[id]`, `/posts/[id]/review`
- `/approve/[token]`
- `/weekly-ideas`
- `/settings`
