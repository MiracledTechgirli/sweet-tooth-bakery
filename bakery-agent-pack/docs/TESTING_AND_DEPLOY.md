# Testing and Deployment

## Manual E2E script
1. Signed out: browse menu, add 2 items → cart badge updates, refresh → cart persists.
2. Click Checkout → redirected to `/login?next=/checkout`.
3. Sign in with Google → returns to `/checkout`; local cart merged into DB (`cart_items` has rows).
4. Submit with invalid phone → inline error. Submit delivery without address → inline error. Time in the past → error.
5. Valid pickup order → redirect to confirmation; `orders` and `order_items` rows exist; `cart_items` empty.
6. Mailgun email received; `email_logs.status = 'sent'`; `orders.email_sent_at` set.
7. Double-click Place Order / replay same idempotency key → only one order.
8. `/orders` lists the order. A second Google account cannot see it (RLS) — verify via direct `/orders/<id>/confirmation` → 404.
9. Tamper test: send a modified price/total in the request body → ignored; DB total matches catalog prices.
10. Remove Mailgun key → order still succeeds, `emailSent: false`, failure logged.

## Commands that must pass
```
npm run lint
npm run typecheck
npm run build
```

## Deploy (Vercel)
1. Push to GitHub, import into Vercel.
2. Add all env vars from `.env.example` (production values).
3. Update Google Cloud Console **Authorized JavaScript origins** with the production domain.
4. Update Supabase **Site URL** and **Redirect URLs** with the production domain.
5. For real customers: verify a Mailgun custom domain and switch off the sandbox; move Google OAuth consent screen to *In production* when ready.
6. Re-run the E2E script against production.
