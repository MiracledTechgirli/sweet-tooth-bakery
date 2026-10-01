# Design Guide

**Vibe:** warm, inviting, artisanal, clean. Lots of food photography, generous whitespace.

## Palette (define as Tailwind theme tokens in `tailwind.config.ts`)
| Token | Hex | Use |
|---|---|---|
| `cream` | `#FFF8EE` | page background |
| `crust` | `#C8812B` | primary buttons, accents |
| `crust-dark` | `#9A5F18` | hover |
| `cocoa` | `#3E2A1D` | headings, body text |
| `butter` | `#F6D58E` | highlights, badges |
| `berry` | `#B33A4F` | sale/error accents |
| `sage` | `#6B8F71` | success states |

Check text/background contrast ≥ 4.5:1 (cocoa on cream passes; verify crust text on cream and use cocoa/white where it fails).

## Typography
- Headings: a serif display (e.g. `Playfair Display` via `next/font/google`)
- Body: `Inter` or `DM Sans`
- Scale: 14/16/18/24/32/48; line-height 1.5 body, 1.15 headings

## Components
- Cards: rounded-2xl, soft shadow, image 4:3, price in `crust-dark`, "Add to cart" button full-width on mobile
- Buttons: rounded-full, min-height 44px, visible focus ring
- Navbar: sticky, logo left, links (Menu, About, Contact), cart icon with badge, user avatar/menu or "Sign in"
- Footer: hours, address, phone, social links, copyright
- Toasts for add-to-cart, errors; skeleton loaders on menu grid

## Home page sections
1. Hero (headline, subcopy, "Order Now" → `/menu`, hero image)
2. Featured products (`is_featured`)
3. How it works (Choose → Checkout → Pickup/Delivery)
4. About teaser
5. Testimonials (3 static)
6. CTA banner + footer

## Imagery
Use real files in `/public/images` named as in `seed.sql`, or royalty-free remote images (add the host to `images.remotePatterns` in `next.config.mjs`). Always provide meaningful `alt`.
