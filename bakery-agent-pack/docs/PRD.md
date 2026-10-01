# Product Requirements — Bakery Website

## Business
A small neighborhood bakery ("**Golden Crumb Bakery**" — placeholder name, keep it in one config file `src/config/site.ts` so it is easy to change) selling bread, pastries, cakes, and cookies. Customers order online for **pickup or local delivery**. Payment is **pay on pickup / pay on delivery** (no payment gateway required for this task; see "Stretch").

## Users
- **Customer** (signs in with Google): browses, carts, checks out, views own orders.
- **Owner** (stretch): views orders. Not required.

## Pages
| Route | Purpose |
|---|---|
| `/` | Hero, featured products, how it works, testimonials (static), footer |
| `/menu` | Product grid, category filter tabs, search |
| `/menu/[slug]` | Product detail, quantity picker, add to cart |
| `/cart` | Line items, qty update, remove, subtotal, proceed to checkout |
| `/checkout` | **Required.** Auth-gated. Contact + fulfillment form, order summary, place order |
| `/orders/[id]/confirmation` | Success page with order number and summary |
| `/orders` | Signed-in user's order history |
| `/login` | "Continue with Google" button |
| `/about`, `/contact` | Static content, hours, address, map link |
| `/auth/callback` | OAuth code exchange route handler |

## Functional requirements
**Catalog**
- Products have: name, slug, description, price (kobo), category, image URL, availability flag, featured flag.
- Seed at least 12 products across 4 categories (see `supabase/seed.sql`).

**Cart**
- Anonymous visitors: cart in `localStorage`.
- Signed-in users: cart persisted in the DB (`cart_items`); on login, merge the local cart into the DB cart (sum quantities, cap at 20 per item).
- Cart badge in navbar shows total quantity.

**Checkout (required)**
- Requires sign-in; redirect to `/login?next=/checkout` otherwise.
- Fields: full name, phone (Nigerian format validation), email (prefilled from Google, editable), fulfillment type (`pickup` | `delivery`), delivery address (required only if delivery), requested date + time slot (not in the past; at least 2 hours ahead), notes (optional, max 300 chars).
- Delivery fee: flat ₦1,500 for delivery, ₦0 for pickup (configurable in `site.ts`).
- Place Order button disabled while submitting; handle double-click safely (idempotency key).
- On success: order saved, cart cleared, confirmation email sent, redirect to confirmation page.

**Orders**
- Order number format: `GC-YYMMDD-XXXX` (4 random uppercase alphanumerics, unique).
- Statuses: `pending`, `confirmed`, `ready`, `completed`, `cancelled`. New orders are `pending`.

**Email (Mailgun)**
- Customer receives an HTML + plain-text confirmation immediately after order creation.
- Contents: greeting, order number, item table, subtotal, delivery fee, total, fulfillment details, bakery contact.
- Optional: notify owner at `OWNER_NOTIFY_EMAIL`.

**Auth (Google)**
- Google OAuth via Supabase Auth, using a client ID/secret created in Google Cloud Console.
- Profile row auto-created on first sign-in (DB trigger).
- Sign-out button in navbar menu.

## Non-functional
- Mobile-first responsive; Lighthouse performance ≥ 85, accessibility ≥ 90.
- Server components for data fetching; client components only where interactivity is needed.
- Error and empty states for every list and form (no blank screens).
- SEO basics: title/description per page, OpenGraph tags, `robots.txt`, `sitemap.xml`.

## Out of scope
Payment gateway, inventory counts, coupon codes, multi-language, admin dashboard (all stretch).

## Stretch (only after Definition of Done is met)
1. Paystack card payments
2. Simple `/admin/orders` page restricted by an `is_admin` flag on `profiles`
3. Order status-change emails via Mailgun
