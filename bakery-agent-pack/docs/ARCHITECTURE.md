# Architecture

## Stack
Next.js (App Router, TS strict) · Tailwind · Supabase (Postgres, Auth) · Mailgun REST · Zod · Vercel

## Folder layout
```
.
├── AGENT.md
├── README.md
├── .env.example
├── docs/
├── supabase/
│   ├── migrations/0001_init.sql
│   └── seed.sql
├── public/images/            # product + hero images (use local files or Unsplash URLs allowed in next.config)
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx
    │   ├── login/page.tsx
    │   ├── auth/callback/route.ts
    │   ├── menu/page.tsx
    │   ├── menu/[slug]/page.tsx
    │   ├── cart/page.tsx
    │   ├── checkout/page.tsx
    │   ├── orders/page.tsx
    │   ├── orders/[id]/confirmation/page.tsx
    │   ├── about/page.tsx
    │   ├── contact/page.tsx
    │   └── api/
    │       ├── cart/sync/route.ts       # merge local cart -> DB
    │       └── checkout/route.ts        # create order + send email
    ├── components/
    │   ├── layout/ (Navbar, Footer, UserMenu)
    │   ├── menu/ (ProductCard, ProductGrid, CategoryTabs, SearchBox)
    │   ├── cart/ (CartProvider, CartItemRow, CartSummary)
    │   └── checkout/ (CheckoutForm, OrderSummary)
    ├── lib/
    │   ├── supabase/ (client.ts, server.ts, admin.ts, middleware.ts)
    │   ├── mailgun.ts
    │   ├── email-templates.ts
    │   ├── orders.ts                    # order number, totals
    │   ├── validation.ts                # Zod schemas
    │   └── format.ts                    # formatNaira(kobo)
    ├── config/site.ts
    ├── types/db.ts
    └── middleware.ts                    # refresh Supabase session cookies
```

## Supabase clients
- `client.ts` — browser client (anon key)
- `server.ts` — server components/route handlers using cookies (anon key + user session)
- `admin.ts` — service role client, **server-only**, add `import "server-only"` at the top

## Data flow: checkout
`CheckoutForm` → `POST /api/checkout` → verify session → Zod validate → load products by id from DB → compute totals → insert order + items (via Postgres function `create_order`) → clear `cart_items` → send Mailgun email → update `orders.email_sent_at` / insert `email_logs` → return `{ orderId }` → redirect to confirmation.

## Conventions
- Money: integer kobo everywhere; format only at render with `formatNaira`.
- Dates: store `timestamptz` UTC; display in `Africa/Lagos`.
- Server actions are allowed for simple mutations, but checkout uses a route handler for explicit status codes.
- Errors: return `{ error: string, fieldErrors? }` JSON with proper HTTP codes (400 validation, 401 unauth, 409 duplicate, 500 server).
- No `any`. Generate DB types with `supabase gen types typescript` if the CLI is available, otherwise hand-write `types/db.ts` matching the migration.

## package.json scripts
`dev`, `build`, `start`, `lint`, `typecheck` (`tsc --noEmit`)

## Dependencies
`next react react-dom @supabase/ssr @supabase/supabase-js zod server-only`
Dev: `typescript tailwindcss postcss autoprefixer eslint eslint-config-next @types/node @types/react`
