# StayVisible

StayVisible is a personal LinkedIn assistant for busy professionals. An admin captures a real moment, generates three post directions in the client’s voice, and sends a secure no-login approval link. Client edits become feedback for future drafts.

The UI starts empty by default and can run in a $0 local testing mode with local Postgres storage, Gmail email, and built-in draft fallbacks.

## Tech stack

- Next.js App Router, React, and TypeScript
- Tailwind CSS and Radix-based ShadCN UI primitives
- Local Postgres with Drizzle for clients, posts, approvals, notifications, and voice profiles
- Optional OpenAI for stronger voice profiles and LinkedIn drafts
- Gmail for approval and reminder email, with optional SendGrid fallback
- Optional Twilio for approval SMS
- Official LinkedIn OAuth placeholder for future publishing

## $0 testing mode

The app is designed to stay free while you test the startup workflow.

- Use the local Postgres database in `.env.local`.
- Use Gmail app-password sending for email reminders and approvals.
- Leave `OPENAI_API_KEY` blank to use the built-in fallback generators.
- Leave `TWILIO_*` blank so SMS stays in placeholder mode.
- Leave `SENDGRID_*` blank because Gmail is the free-first email sender.
- Do not enable LinkedIn OAuth until you are ready for official publishing permissions.

In this mode, you can add clients, save their profiles, collect event info, generate simple draft options, send Gmail reminders, collect photo uploads, and use approval links without paid providers.

## Local setup

1. Install Node.js 20 or newer.
2. Install packages with `npm install`.
3. Copy `.env.example` to `.env.local`.
4. Add the credentials you want to test. No credentials are required to explore the empty local UI.
5. Run `npm run dev` and open [http://localhost:4000](http://localhost:4000).

Use `npm run build` for a production verification. The project is ready for Vercel’s standard Next.js deployment.

## Database setup

For $0 local testing, use the local Postgres database from the Conference Tracker-style backend setup.

1. Set `DB_CONNECTION_STRING` in `.env.local`.
2. Run `npm run migrate`.
3. Start the app with `npm run dev`.

The older Supabase schema files are still present as reference material from the original scaffold, but the current local MVP uses the Drizzle/Postgres tables in `drizzle/` and `src/lib/stay-visible/schema.ts`.

Production admin pages should enforce an admin session before launch. The MVP currently stays open locally so the product can be evaluated without credentials. The approval route is intentionally login-free and must resolve only the record matching its secure random token.

## OpenAI setup

For $0 testing, leave `OPENAI_API_KEY` blank. The app will use built-in fallback generators.

When you want higher-quality AI writing, create an API key and set `OPENAI_API_KEY`. The app uses it in server-only routes:

- `POST /api/generate-voice-profile`
- `POST /api/generate-linkedin-posts`

Prompts enforce the client voice profile, natural rhythm, no em dashes, restrained hashtags, and no emojis unless allowed.

## Gmail email setup

1. In your Google account, turn on 2-Step Verification.
2. Create a Gmail app password for this local app.
3. Set `GMAIL_USER` to your Gmail address.
4. Set `GMAIL_APP_PASSWORD` to the app password.
5. Optionally set `GMAIL_FROM_EMAIL`; otherwise the app uses `GMAIL_USER`.
6. Trigger “Send for approval” from a post review page, or run an event reminder.

Without these values the email route stays in placeholder mode unless SendGrid is configured.

## SendGrid fallback setup

1. Verify a sender in SendGrid.
2. Set `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL`.
3. Trigger “Send for approval” from a post review page.

Gmail is used first when configured. SendGrid is only used when Gmail settings are absent.

## Twilio setup

For $0 testing, leave Twilio blank. Text messages stay in placeholder mode and are still logged.

1. Create or select a Twilio phone number.
2. Set `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, and `TWILIO_PHONE_NUMBER`.
3. Set a client’s notification preference to Text or Both.

Gmail, SendGrid, and Twilio sends are written to `notifications`. Event reminders use the same providers.

## Event photo reminders

Scheduled Event Sheet items can trigger two reminder jobs:

- Morning photo reminder: `POST /api/notifications/event-reminders` with `{"reminderType":"event_photo_reminder"}`
- Evening upload prompt: `POST /api/notifications/event-reminders` with `{"reminderType":"photo_upload_prompt"}`

Both default to today’s events. You can pass `date` as `YYYY-MM-DD` for testing. The first reminder emails the client to take photos at the event. The second follows the client’s preferred notification method and links them to the client portal to upload photos or notes. Reminder sends are logged per event/type/channel so repeated job runs do not duplicate messages.

## Analytics backend

StayVisible includes a $0 analytics backend for manual tracking now and official LinkedIn analytics import later.

- `POST /api/analytics` saves post-level metrics such as impressions, reactions, comments, reposts, clicks, profile views, posting hour, and notes.
- `GET /api/analytics` returns saved analytics, engagement summaries, and active recommendations.
- `GET /api/analytics?clientId=...` scopes analytics and suggestions to one client.
- `/analytics` provides a manual entry and review page.

Suggestions are rule-based and free: the app looks for the best-performing posting hour, average engagement, and content patterns to recommend what to test next.

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
- `/client-login`, `/client-portal`
- `/event-sheet`
- `/content-calendar`
- `/analytics`
- `/weekly-ideas`
- `/settings`
