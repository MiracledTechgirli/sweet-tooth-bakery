# Checkout Flow

## UI (`/checkout`)
Two columns on desktop (form left, summary right); stacked on mobile.
- **Contact**: full name, phone, email (prefilled from session)
- **Fulfillment**: radio `Pickup` / `Delivery`; address textarea shown only for delivery
- **When**: date input (min = today) + time slot select (e.g. 08:00–18:00, hourly); must be ≥ 2h from now (Africa/Lagos)
- **Notes**: optional
- **Summary**: items, subtotal, delivery fee, total; "Pay on pickup/delivery" note
- Generate `idempotencyKey = crypto.randomUUID()` once per page load (`useRef`).
- Empty cart → redirect to `/cart` with a message.

## Validation (`lib/validation.ts`, shared by client + server)
```ts
export const checkoutSchema = z.object({
  idempotencyKey: z.string().uuid(),
  customerName: z.string().trim().min(2).max(100),
  customerEmail: z.string().trim().email(),
  customerPhone: z.string().trim().regex(/^(\+234|0)[789][01]\d{8}$/, "Enter a valid Nigerian phone number"),
  fulfillment: z.enum(["pickup", "delivery"]),
  deliveryAddress: z.string().trim().max(300).optional(),
  requestedFor: z.string().datetime(),
  notes: z.string().trim().max(300).optional(),
}).refine(v => v.fulfillment === "pickup" || (v.deliveryAddress && v.deliveryAddress.length >= 8), {
  path: ["deliveryAddress"], message: "Delivery address is required",
});
```

## `POST /api/checkout`
1. Get user via server Supabase client; if none → `401`.
2. Parse body with `checkoutSchema`; invalid → `400 { fieldErrors }`.
3. Check `requestedFor` ≥ now + 2h → else `400`.
4. Load the user's `cart_items` from DB (**cart in DB is the source of truth**, not the request body). Empty → `400`.
5. Delivery fee from `site.ts` (`deliveryFeeKobo`) if delivery, else 0.
6. Call `admin.rpc("create_order", {...})` with the items. Map `PRODUCT_UNAVAILABLE` → `409` with a clear message.
7. Fetch order + items; send confirmation email (see `EMAIL_MAILGUN.md`). Wrap in try/catch — **never fail the response because of email**.
8. Return `200 { orderId, orderNumber, emailSent: boolean }`.
9. Client clears local cart state and navigates to `/orders/{id}/confirmation`.

## Confirmation page
Server component. Fetch the order with the user's session (RLS ensures ownership); `notFound()` if absent. Show order number, status, items, totals, fulfillment info, and links to Menu and My Orders. If `email_sent_at` is null, show a gentle note that the email may be delayed.
