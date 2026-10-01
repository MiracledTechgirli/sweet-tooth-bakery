# 🍰 Sweet Tooth Bakery & Confectionery

A sweet, pastel-styled artisan bakery store built with HTML5, CSS3, Vanilla JS, and pure Node.js.

## ✉️ Brevo (Sendinblue) Integration Implemented

Mailgun has been replaced with **Brevo (Sendinblue)** API v3:
- **300 FREE emails per day** (9,000 emails per month).
- Automatic HTML order receipt email dispatch via Brevo REST API (`POST https://api.brevo.com/v3/smtp/email`).
- Interactive Live Brevo Email Preview Modal directly in the UI.

---

## 🍓 Features Implemented

1. **Sweet Tooth Bakery Shop**:
   - Soft pastel aesthetic (Strawberry Pink, Soft Vanilla, Lavender Frosting, Mint) balanced with **high-contrast dark cocoa typography** (`#2d1822`) for crisp readability and vibrant dessert imagery.
   - Confections catalog featuring French Macarons, Strawberry Shortcakes, Belgian Truffles, Matcha Cupcakes, Double Chocolate Cookies, and Fresh Blueberry Tarts.
   - Interactive slide-over sweet basket with subtotal calculation, item quantity adjustments, and bakery promo codes (`SWEET10`, `BAKERY20`).

2. **Bakery Checkout Page**:
   - Multi-step checkout view (`#checkout-view`) with delivery destination fields, payment method selector (Credit Card, Google Pay, Sandbox mode), and order breakdown.
   - Interactive order confirmation view with reference number and receipt preview.

3. **Supabase / Neon DB Persistence**:
   - `schema.sql` database initialization script for `users`, `products`, `categories`, `orders`, and `order_items` tables with Row Level Security (RLS) policies.
   - Integrated client and server database saving with local storage fallback.

4. **Google Auth via Google Cloud Console**:
   - Google Identity Services (`https://accounts.google.com/gsi/client`) integration for Google Sign-In and auto-filling customer delivery details.

---

## 🚀 How to Set Up Brevo API Credentials

1. Sign up for a free account at [brevo.com](https://brevo.com).
2. Generate your API key at **SMTP & API** -> **API Keys**.
3. In your store:
   - Click **⚙️ Integrations** in the navbar -> Paste your **Brevo API Key** and your **Sender Email**.
   - Or add `BREVO_API_KEY=xkeysib-...` to your [.env](file:///home/techgirli/Music/store-website/.env) file.

### Run the Server:
```bash
npm start
```
or
```bash
node server.js
```

Open **`http://localhost:3000`** in your browser!

### Deploy to Vercel

Import the repository into Vercel with the project root as the Root Directory. The
Vercel function configuration includes the HTML, browser scripts, stylesheet, and
product images that the Node server reads from disk at runtime.
