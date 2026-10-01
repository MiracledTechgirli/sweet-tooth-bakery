# Database

Primary: **Supabase Postgres**. The SQL in `supabase/migrations/0001_init.sql` is the source of truth; run it in the Supabase SQL editor (or `supabase db push`). Then run `supabase/seed.sql`.

**Neon alternative:** if the user chooses Neon, use the same schema, but Supabase Auth is then unavailable — replace with Auth.js (NextAuth) Google provider + `@neondatabase/serverless`, drop the `auth.users` trigger and RLS policies, and enforce ownership in queries by `user_id`. Default to Supabase unless told otherwise.

## Tables
| Table | Purpose |
|---|---|
| `profiles` | One row per auth user (name, avatar, phone). Created by trigger on sign-up. |
| `categories` | Bread, Pastries, Cakes, Cookies |
| `products` | Catalog |
| `cart_items` | Persisted cart for signed-in users, unique per (user, product) |
| `orders` | Order header, fulfillment, totals, status, email tracking |
| `order_items` | Snapshot of product name + unit price at order time |
| `email_logs` | Every Mailgun send attempt and result |

## Security model (RLS)
- `categories`, `products`: public `select` where available; no public writes.
- `profiles`: user can select/update own row.
- `cart_items`: user full CRUD on own rows.
- `orders`, `order_items`: user can `select` own; **inserts happen only via the `create_order` function / service role**. No client updates or deletes.
- `email_logs`: no client access (service role only).

## Order creation
Use the Postgres function `create_order(...)` (in the migration) so header + items are written in **one transaction**. Call it from the checkout route with the service role client. It accepts a JSON array of `{product_id, quantity}`, looks up current prices itself, and returns the new order row.

## Idempotency
`orders.idempotency_key` is unique per user. The client generates a UUID when the checkout page loads; a retried request returns the existing order instead of duplicating.
