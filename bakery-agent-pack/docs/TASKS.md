# Build Checklist (work top to bottom; tick as you go)

## Phase 0 — Setup
- [ ] `npx create-next-app@latest bakery --ts --tailwind --eslint --app --src-dir --import-alias "@/*"` (or init in the current repo)
- [ ] Install deps: `@supabase/ssr @supabase/supabase-js zod server-only`
- [ ] Add scripts (`typecheck`), `.gitignore`, copy `.env.example` → `.env.local`
- [ ] Tailwind theme tokens + fonts per `DESIGN.md`
- [ ] `src/config/site.ts` (name, address, phone, hours, deliveryFeeKobo, minLeadHours)

## Phase 1 — Database
- [ ] **ASK USER** for Supabase project URL, anon key, service role key
- [ ] Run `0001_init.sql` then `seed.sql`
- [ ] `types/db.ts`, Supabase clients (`client`, `server`, `admin`), `middleware.ts`

## Phase 2 — Auth
- [ ] **ASK USER** to complete `AUTH_GOOGLE_SETUP.md` section A/B (or confirm done)
- [ ] `/login`, `/auth/callback`, `UserMenu`, route protection
- [ ] Verify profile row is created

## Phase 3 — Catalog UI
- [ ] Layout, Navbar, Footer
- [ ] Home, `/menu` (filter + search), `/menu/[slug]`
- [ ] `formatNaira`, ProductCard, loading + empty states

## Phase 4 — Cart
- [ ] `CartProvider` (localStorage for guests, DB for signed-in)
- [ ] `/api/cart/sync` merge on login
- [ ] `/cart` page with qty controls and remove

## Phase 5 — Checkout
- [ ] Zod schema, `CheckoutForm`, `OrderSummary`
- [ ] `POST /api/checkout` per `CHECKOUT_FLOW.md`
- [ ] Confirmation page, `/orders` history

## Phase 6 — Email
- [ ] **ASK USER** for Mailgun API key, domain, region, from address
- [ ] `mailgun.ts`, `email-templates.ts`, logging
- [ ] Test success and failure paths

## Phase 7 — Polish and QA
- [ ] About, Contact, 404, error boundary, metadata, sitemap, robots
- [ ] Accessibility pass (keyboard, labels, contrast)
- [ ] Run everything in `TESTING_AND_DEPLOY.md`
- [ ] Final `README.md`
