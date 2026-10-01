# Mailgun Confirmation Emails

## Setup (user provides values; agent must request them if missing)
1. Create a Mailgun account → **Sending → Domains**.
   - **Quick start:** use the auto-provisioned **sandbox domain** (`sandboxXXXX.mailgun.org`). Sandbox can only send to **Authorized Recipients** — add the test email addresses in the dashboard and have each recipient click the verification link.
   - **Production:** add and verify your own domain (DNS: SPF, DKIM, MX/CNAME as Mailgun instructs).
2. **API Keys** → create a **Sending API key** (or use the private API key).
3. Note the region: US → `https://api.mailgun.net`, EU → `https://api.eu.mailgun.net`.

## Env vars
```
MAILGUN_API_KEY=
MAILGUN_DOMAIN=
MAILGUN_API_BASE=https://api.mailgun.net
MAILGUN_FROM="Golden Crumb Bakery <orders@YOUR_DOMAIN>"
OWNER_NOTIFY_EMAIL=            # optional
```

## `src/lib/mailgun.ts`
```ts
import "server-only";

export async function sendMail(opts: { to: string; subject: string; html: string; text: string }) {
  const { MAILGUN_API_KEY, MAILGUN_DOMAIN, MAILGUN_FROM } = process.env;
  const base = process.env.MAILGUN_API_BASE ?? "https://api.mailgun.net";
  if (!MAILGUN_API_KEY || !MAILGUN_DOMAIN || !MAILGUN_FROM) throw new Error("Mailgun env vars missing");

  const body = new URLSearchParams({ from: MAILGUN_FROM, to: opts.to, subject: opts.subject, html: opts.html, text: opts.text });
  const res = await fetch(`${base}/v3/${MAILGUN_DOMAIN}/messages`, {
    method: "POST",
    headers: { Authorization: "Basic " + Buffer.from(`api:${MAILGUN_API_KEY}`).toString("base64") },
    body,
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`Mailgun ${res.status}: ${json.message ?? "unknown error"}`);
  return { id: json.id as string };
}
```

## Template (`src/lib/email-templates.ts`)
Export `orderConfirmationEmail(order, items)` returning `{ subject, html, text }`.
- Subject: `Your order {order_number} is confirmed — Golden Crumb Bakery`
- HTML: single-column, inline CSS only, max-width 600px, bakery colors from `DESIGN.md`, item table (name, qty, line total), totals, fulfillment block (pickup address or delivery address + requested date/time in Africa/Lagos), contact line.
- **Escape all user-provided strings** (name, address, notes) before interpolating into HTML.
- Always include a plain-text alternative.

## Sending logic (called from checkout route after order creation)
```ts
try {
  const { id } = await sendMail({ to: order.customer_email, ...orderConfirmationEmail(order, items) });
  await admin.from("orders").update({ email_sent_at: new Date().toISOString() }).eq("id", order.id);
  await admin.from("email_logs").insert({ order_id: order.id, to_email: order.customer_email, subject, provider_message_id: id, status: "sent" });
} catch (e) {
  await admin.from("email_logs").insert({ order_id: order.id, to_email: order.customer_email, subject, status: "failed", error: String(e) });
}
```
If `OWNER_NOTIFY_EMAIL` is set, send a second short email to the owner using the same pattern.

## Verification
- Place a test order using an authorized recipient address → email arrives; `email_logs.status = 'sent'`.
- Temporarily use a bad API key → order still saves, `email_logs.status = 'failed'`, response has `emailSent: false`.
