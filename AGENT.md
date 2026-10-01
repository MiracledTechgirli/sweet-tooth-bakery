# AGENT.md — Bakery Website Build Instructions

You are a coding agent building a **standard bakery e-commerce website**. Read this file fully, then read every file in `/docs` in the order listed below before writing code.

## Mission (Task 1: Individual Task)
Build a website for a shop (a bakery) that includes:
1. A **checkout page**
2. **Everything persisted in a database** (Supabase Postgres — Neon is an acceptable substitute, see `docs/DATABASE.md`)
3. **Confirmation emails sent via Mailgun**
4. **Google authentication** configured through Google Cloud Console

All four are mandatory. The site is not done until a user can: sign in with Google → browse → add to cart → check out → see the order in the DB → receive a Mailgun email.

## Read order
1. `docs/PRD.md` — what to build (pages, features, scope)
2. `docs/ARCHITECTURE.md` — stack, folder layout, conventions
3. `docs/DATABASE.md` + `supabase/migrations/0001_init.sql` — schema, RLS
4. `docs/AUTH_GOOGLE_SETUP.md` — Google OAuth wiring
5. `docs/CHECKOUT_FLOW.md` — order creation logic
6. `docs/EMAIL_MAILGUN.md` — email sending
7. `docs/DESIGN.md` — look and feel
8. `docs/TASKS.md` — ordered checklist; work through it top to bottom
9. `docs/TESTING_AND_DEPLOY.md` — verification and deployment

## Tech stack (do not deviate without asking)
- Next.js 14+ (App Router), TypeScript (strict), Tailwind CSS
- Supabase: Postgres + Auth (Google provider) via `@supabase/ssr` and `@supabase/supabase-js`
- Mailgun via plain `fetch` to the Mailgun REST API (no heavy SDK required)
- Zod for validation
- Deploy target: Vercel

## Hard rules
- **Never commit secrets.** Only `.env.example` is committed. Real values go in `.env.local`.
- **Server-side price authority.** Never trust prices or totals from the client. Recompute from the `products` table inside the checkout route.
- **Service role key is server-only.** Never import it in a client component or expose it with `NEXT_PUBLIC_`.
- **RLS on every table.** Users may only read/write their own rows. See `DATABASE.md`.
- **Email failure must not lose the order.** Save the order first, send the email after, log the result in `email_logs`.
- **Currency is NGN (₦)**, store money as integer kobo (`price_kobo`) — never floats.
- Validate all inputs with Zod on the server.
- Keep components small; no dead code; no placeholder lorem ipsum in final UI.
- Accessible by default: semantic HTML, alt text, labels, focus states, color contrast AA.

## Working method
1. Follow `docs/TASKS.md` in order. Tick items off (`[x]`) as you finish them.
2. After each phase: run `npm run lint`, `npm run typecheck`, `npm run build`.
3. If a required credential (Supabase URL/keys, Google client ID/secret, Mailgun key/domain) is missing, **stop and tell the user exactly which value is needed and where to get it** (see the setup docs). Do not invent values or mock the integration silently.
4. Small, conventional commits (`feat:`, `fix:`, `chore:`, `docs:`).
5. Finish by completing the Definition of Done below and writing the final summary in `README.md`.

## Definition of Done
- [ ] Home, Menu, Product detail, Cart, Checkout, Order confirmation, My Orders, About/Contact pages exist and work on mobile + desktop
- [ ] Google sign-in/sign-out works; checkout and orders require auth
- [ ] Products, profiles, carts, orders, order items, and email logs are all stored in Postgres
- [ ] Placing an order writes `orders` + `order_items` atomically and clears the cart
- [ ] A confirmation email arrives via Mailgun with order number, items, total, pickup/delivery details
- [ ] RLS verified: user A cannot read user B's orders
- [ ] `npm run build` passes with no type or lint errors
- [ ] `README.md` documents setup, env vars, and deployment
