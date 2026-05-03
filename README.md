# Booking Pitch — Football Pitch Booking (Next.js 16)

Bilingual (Arabic RTL / English) football pitch booking platform for Kuwait (KWD).
Admin manages pitches; customers browse, pick a slot, verify by SMS OTP, pay via Stripe.

## Stack
- Next.js 16 (App Router, Turbopack) + TypeScript + Tailwind v4
- PostgreSQL + Prisma 7 (driver-adapter for `pg`)
- Auth.js v5 (credentials login for admin)
- Twilio Verify (SMS OTP)
- Stripe Checkout + webhook
- Cloudinary (signed image upload)
- Resend (confirmation email)
- next-intl (Arabic default, RTL)

## Setup

```bash
# 1. Configure env
cp .env.example .env
# Fill DATABASE_URL, ADMIN_EMAIL, ADMIN_PASSWORD, and (when ready) Twilio/Stripe/Cloudinary/Resend keys.

# 2. Migrate + seed
npx prisma migrate dev --name init
npx prisma db seed

# 3. Run
npm run dev
# Open http://localhost:3000  (will redirect to /ar)
```

## Dev mode without external services
- **No Twilio key** → OTP step is bypassed (any 6-digit code works on the verify page).
- **No Stripe key** → checkout auto-confirms the booking and redirects to success.
- **No Cloudinary** → admin pitch form falls back to pasting image URLs manually.
- **No Resend** → email is logged to stdout instead of sent.

## Going live
1. **Twilio Verify**: create a Verify service, copy `TWILIO_VERIFY_SERVICE_SID`, plus account SID and auth token.
2. **Stripe**: enable KWD in your Stripe dashboard, add publishable + secret keys, set up a webhook to `https://YOURDOMAIN/api/webhooks/stripe` for `checkout.session.completed` and `checkout.session.expired`. For local testing: `stripe listen --forward-to localhost:3000/api/webhooks/stripe`.
3. **Cloudinary**: add cloud name + API key + secret. Signed uploads from the admin form.
4. **Resend**: add API key, set `RESEND_FROM_EMAIL` to a verified sender.
5. **Postgres**: any provider (Neon, Supabase, RDS) — set `DATABASE_URL`.

## Routes

### Public (locale-prefixed: `/ar/*`, `/en/*`)
- `/` — landing
- `/pitches` — list
- `/pitches/[id]` — details + booking flow
- `/verify-otp` — phone verification
- `/checkout/success`, `/checkout/cancel`, `/checkout/start`

### Admin (`/[locale]/admin/*`, role-guarded by middleware)
- `/admin/login`
- `/admin` — dashboard (today bookings, week + month revenue, recent bookings)
- `/admin/pitches`, `/admin/pitches/new`, `/admin/pitches/[id]/edit`
- `/admin/bookings`

### API
- `POST /api/otp/send`, `POST /api/otp/verify`
- `POST /api/checkout` (creates Stripe session)
- `POST /api/webhooks/stripe`
- `POST /api/cloudinary/sign` (admin-only signed upload params)

## Booking flow
1. Customer picks date, slot, duration (1–3 h), enters name/phone/email.
2. Server action creates a `PENDING` booking with a 15-min `expiresAt` (slot is reserved).
3. Server triggers Twilio SMS OTP. Customer verifies on `/verify-otp`.
4. Client calls `/api/checkout` → Stripe Checkout URL.
5. After payment, Stripe webhook flips booking to `CONFIRMED`, sends Resend confirmation email.
6. Double-booking prevented at DB level by overlap query inside a transaction (`lib/booking.ts`).

## Default admin
Seed creates an admin from `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `.env`. Sign in at `/[locale]/admin/login`.
