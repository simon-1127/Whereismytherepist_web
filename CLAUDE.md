# Where's My Therapist — web

Indian mental-health platform: clients find/book licensed therapists, pay via Razorpay, attend Daily.co video sessions. Next.js 16 App Router, React 19, TS, Tailwind v4, Supabase (auth+DB). No tests; verify with `npm run build` / `npm run lint`.

## Structure
- `app/` pages: home `page.tsx` (sections in `components/home/`), about, careers, contact (form → `api/contact` → Resend → support@), physiotherapy (public waitlist; home `PhysioPromo` section #physiotherapy links to it → `api/physio-waitlist` (service-role only writer, honeypot + `lib/rate-limit.ts`; signed-out = insert-only, unique per contact; claimed on sign-in by verified-email match) → `physio_waitlist`, backend migration 007; signed-out users sent to signup after), for-therapists, legal (terms, privacy, cookies, cancellation-refund-policy), sitemap, robots
- `app/therapists/` directory + `[id]` profile w/ `components/BookingWidget.tsx`
- `app/sessions/` client bookings; `[id]/room` = Daily video: room+token ONLY from backend `POST /sessions/:id/room` (token carries user_id → attendance attribution; web-minted tokens made web joiners anonymous → false "both absent"). `lib/daily.ts` = join window only. Missed sessions (`reschedule_state='required'`, `needsReschedule` in `lib/sessions.ts`) show a rebook card → `/therapists[/id]?reschedule=<sid>` → `BookingWidget` reschedule mode → `/api/sessions/[id]/reschedule|reschedule-quote|verify-topup` → backend RescheduleService (credit carries, top-up/refund diff).
- `app/quiz/` self-check quizzes (`components/quiz/QuizRunner.tsx`, `lib/quiz.ts`) → `api/quiz/insight` → Sarvam AI (`lib/sarvam.ts`, `lib/quiz-prompt.ts`)
- `app/provider/` therapist portal: dashboard, bookings, availability, payout, profile (`components/provider/`)
- Auth pages: login, forgot/reset-password, welcome (onboarding); `api/auth/finish`, `api/profile/phone`
- `lib/`: `supabase/{client,server,admin}.ts`, payments/razorpay/pricing/money, `env.ts` (required-env checks), `site.ts` (site constants), `sessions.ts` (display status), `onboarding.ts` (role + post-auth redirect), `policy.ts`
- `middleware.ts`: refreshes Supabase session; guards `/sessions /profile /provider /welcome`

## Flows
- **Auth:** Supabase email/OAuth → `api/auth/finish` → `onboarding.ts` (brand-new account with `as=provider` becomes provider, profile starts as draft pending team review) → redirect.
- **Booking:** BookingWidget → `api/bookings/create-order` (checks env, holds slot as unpaid session, creates Razorpay order) → client pays → `api/bookings/verify` + `api/webhooks/razorpay` (+ `bookings/[id]/reconcile`) confirm payment → session confirmed.
- **Session:** join window from `lib/daily.ts`; room open sets `in_progress`; nothing sets `completed` yet (display logic infers it).

## DB tables (Supabase)
Full dump: `/home/adi/full_backup.sql` (2.3 MB pg_dump) — only grep it when schema/data detail is needed; never read whole.
users, client_profiles, provider_profiles, sessions, availability_slots, payments, payment_webhook_log, subscription_tiers, specialties/languages/therapeutic_approaches + provider_* join tables.

## Ecosystem
- Hosting: this site on hostingial.com (cPanel Node app; server env read at runtime). Railway: NestJS backend + HR/superadmin dash (edits DB directly). Mobile app: Flutter, same features + extras (AI etc.), calls the backend.
- Backend repo: `/home/adi/dev/wheresmytherapist/wheresmytherapist-backend` (SQL migrations in `db/migrations/`, applied manually).
- HR dash repo: `/home/adi/dev/wheresmytherapist/wmt-hr-dashboard` (Express + EJS, supabase-js service role, super-admin only). Early access section `/early-access/physiotherapy` (`src/lib/earlyAccess.js` = field/option registry mirroring `lib/physio.ts` + migration 007): queue w/ follow-up status/team note, city demand, CSV export (audited).
- Provider KYC = payout bank + PAN. Web `/provider/payout` → `api/provider/kyc` → backend `POST /payments/payout-account` (user's Supabase JWT) → RazorpayX contact + fund account + penny drop; `fund_account.validation.*` webhook → `PayoutsService.applyValidation`. Masked details in owner-only `provider_payout_details` (provider_profiles is readable by any signed-in user for listed providers — never put PII there). No credential/document KYC.
- Self-check = Sarvam AI; credited in Footer bottom bar (links `/quiz`) and `SelfCheckPromo`.

## Env
NEXT_PUBLIC_SUPABASE_URL/ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, RAZORPAY_KEY_ID/KEY_SECRET/WEBHOOK_SECRET, DAILY_API_KEY, SARVAM_API_KEY, SARVAM_MODEL, NEXT_PUBLIC_SITE_URL, API_BASE_URL (Railway backend — REQUIRED: video calls, rescheduling, plans, KYC; DAILY_API_KEY no longer used by web), RESEND_API_KEY (+ optional CONTACT_FROM/CONTACT_TO). Never read/print `.env*`.

## Status (update at end of each session; keep ≤5 lines)
- 2026-10-25 (uncommitted, web + backend): web video joins via backend tokens (fixes anonymous web joiners → false "both absent"); backend no-show check never ends a room with unidentified participants (continues + needs_review); web reschedule flow; rebook emails via existing `common/lib/resend.ts`; Product Hunt badge in Footer; SQL helpers in backend `db/scripts/`. App needed no changes (already uses backend room + reschedule).
- Deploy order: backend first (stops session cut-offs) → web (API_BASE_URL now set in cPanel `.env.production`; restart Node app). KYC "Failed" on a provider = old attempt; retry after deploy, check Railway logs `RazorpayX POST … failed:` if it fails.
- Plans = Razorpay Subscriptions (migration 006), payouts = RazorpayX (migration 005, `PAYOUTS_ENABLED`). Run migrations 003/005/006/007 if not yet; enable Razorpay webhooks subscription.*, payout.*, fund_account.validation.*. Hold 004.
- Open: session f92689ca (25 Oct, cut at 12:30 by the bug) — client can rebook free; decide whether to also pay therapist for the 30 min. Product Hunt listing is titled "Google Docs". Starter AI cap 50/day vs "Unlimited"; partial provider-liable refunds forfeit whole share; full PAN for TDS.
- Tests: restore dump into local PG; add admin user 5559be5f… (missing from dump) or 4 old tests fail. Backend 42 integration + 44 unit green.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
