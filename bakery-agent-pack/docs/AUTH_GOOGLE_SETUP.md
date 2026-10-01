# Google Authentication (Google Cloud Console + Supabase)

## A. Create the OAuth client (user does this once; agent must ask for the resulting values)
1. Go to https://console.cloud.google.com → create/select a project (e.g. `bakery-site`).
2. **APIs & Services → OAuth consent screen**: User type *External*, app name, support email, developer email. Scopes: `openid`, `email`, `profile`. Add yourself as a test user while in Testing mode.
3. **APIs & Services → Credentials → Create Credentials → OAuth client ID** → type **Web application**.
4. **Authorized JavaScript origins**:
   - `http://localhost:3000`
   - `https://<your-production-domain>`
5. **Authorized redirect URIs** (this is Supabase's callback, not your app's):
   - `https://<SUPABASE_PROJECT_REF>.supabase.co/auth/v1/callback`
6. Copy **Client ID** and **Client Secret**.

## B. Enable in Supabase
1. Supabase dashboard → **Authentication → Providers → Google** → enable, paste Client ID + Secret.
2. **Authentication → URL Configuration**:
   - Site URL: `http://localhost:3000` (change to production URL on deploy)
   - Redirect URLs: `http://localhost:3000/auth/callback`, `https://<prod-domain>/auth/callback`

## C. App implementation (agent builds this)
- `/login`: client component with button calling
  ```ts
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
  });
  ```
- `/auth/callback/route.ts`: read `code`, call `supabase.auth.exchangeCodeForSession(code)`, then redirect to `next` (validate it starts with `/` to prevent open redirects).
- `src/middleware.ts`: refresh session on every request using `@supabase/ssr` (`updateSession` pattern), and protect `/checkout` and `/orders*` by redirecting unauthenticated users to `/login?next=<path>`.
- Navbar `UserMenu`: show avatar + name, "My Orders", "Sign out" (`supabase.auth.signOut()` then `router.refresh()`).
- After login, call `POST /api/cart/sync` with the local cart to merge it into `cart_items`.

## D. Checks
- Signing in creates a row in `auth.users` and `public.profiles`.
- Visiting `/checkout` signed out redirects to `/login`.
- Sign-out clears the session and the navbar updates.
