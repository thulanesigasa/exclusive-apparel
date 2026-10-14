# Customer accounts and security

Customer accounts are optional. `/account/` supports sign-up, email-code verification, sign-in, password recovery, profile-name changes and sign-out. Guest checkout does not depend on the account provider and remains available when accounts are disabled. The site is still owner-private and live commerce is still disabled.

## What is active and what needs setup

The server integration, UI, D1 session migration and ownership-policy SQL are implemented. Supabase project provisioning and production email setup are not complete: no dedicated Exclusive Apparel project exists yet and the connector's cost-check operation returned `UNAVAILABLE`. The existing unrelated Supabase projects were not changed. `CUSTOMER_AUTH_READY` defaults to false; the account screen explains that accounts are unavailable and links to guest checkout. No account credentials or real customer accounts have been created.

Before enabling accounts:

1. Create a dedicated project in the selected `thulanesigasa` organization after confirming its actual project cost. Connect its URL and **publishable** key through hosted runtime configuration. No service-role/secret Supabase key is needed by this implementation.
2. Apply `supabase/migrations/20261014110601_customer_profiles.sql` through the migration workflow. It creates private profiles, enables and forces RLS, revokes anonymous access, grants only the required columns and checks `auth.uid() = id` for reads, inserts and updates. Do not apply it to an unrelated project.
3. Enable email/password authentication with **Confirm email ON**. Set the password minimum to 12 characters. Configure a verified production SMTP sender and provider email/OTP rate limits. Default Supabase trial mail is not sufficient for a production storefront.
4. Customize both signup confirmation and password-recovery templates to show `{{ .Token }}` as a code. The UI accepts 6–10 digits. Set OTP lifetime to a short duration (for example, 10 minutes). This code flow deliberately keeps verification tokens out of URLs, browser history and redirect logs. Set the site URL to the actual HTTPS storefront origin; no OAuth callback replaces Sites' native owner authentication.
5. Configure `AUTH_SESSION_KEY` with 32 cryptographically random bytes encoded as 64 lowercase hex characters. Keep it server-only. Rotating this key invalidates existing encrypted sessions. Set `CUSTOMER_AUTH_READY=true` only after the following provider checks pass.
6. Verify a real test signup, delivered verification code, rejected unverified login, confirmed login, recovery-code expiry, password reset, sign-out and session expiry. Run two-user RLS checks with actual authenticated JWTs: anonymous users cannot read profiles; A cannot read/update B; A can update only their own name and cannot change profile ownership. Run Supabase security and performance advisors before launch.

RLS applies to Supabase customer profiles. D1 does **not** support native PostgreSQL RLS: catalogue, inventory, guest orders, support requests and encrypted sessions remain server-only D1 records guarded by parameterized SQL and explicit authorization. This is not a full migration of commerce records to Postgres. Orders are not automatically claimed by matching an account email, and this release does not add account-linked order history.

## Requested security controls

| Requirement | Implementation / limit |
| --- | --- |
| Protect admin routes | Server-rendered management page requires platform identity and the server `ADMIN_EMAILS` allowlist. Every management API repeats the check. Customer metadata and customer cookies confer no admin role. |
| Server-side access | Sensitive reads/writes are authorized on the Worker. Totals, stock and fulfilment transitions are computed/validated there. |
| Row-level security | Ownership policies prepared for Supabase profiles, pending dedicated project application and live isolation tests. D1 uses application authorization, not native RLS. |
| Verify email | Provider-confirmed email is mandatory before creating or using a customer session. Sign-up refuses an immediate session caused by disabled email confirmation. Provider configuration and real mail tests remain pending. |
| Hash passwords | Passwords are handled by managed Supabase Auth; the store does not persist passwords or build its own password hashing system. Pending provider activation. |
| No local auth tokens | Provider tokens never reach browser JavaScript. The browser receives only an opaque, random `__Host-` session cookie with HttpOnly, Secure, SameSite=Lax, Path=/ and seven-day expiry. Provider access/refresh tokens are AES-256-GCM encrypted in D1; cookie values are SHA-256 hashed in D1. Guest order access also uses per-order HttpOnly cookies. No new authentication/order keys are written to localStorage or sessionStorage; bag contents may still use localStorage. |
| Server-side secrets | Runtime values are supplied through native hosting configuration. No provider service-role key is used. |
| Keep .env off GitHub | `.env*` ignored, `.env.example` contains names/placeholders only. |
| No secrets in logs | Authentication failures use generic responses without provider payloads; commerce logs a generic failure rather than raw exception objects. No credentials/passwords/request bodies are logged by these handlers. Platform/provider logging settings still need operational review. |
| Parameterized SQL | User-controlled values are bound to D1 statements. Supabase profile writes use structured SDK calls with the user's token, preserving RLS. |
| Validate form inputs | Server validates email, name, password length, verification purpose/code, terms acceptance, order quantities, addresses and product edits. Body reads are bounded, including multipart uploads. |
| Block XSS | React escapes text; JSON-LD escapes script delimiters; media types and URLs are restricted. Baseline CSP blocks object embedding and foreign base URLs and restricts form destinations. This is not a strict nonce-based script CSP. |
| Validate uploads | Owner-only, ≤5 MB raster uploads. Container signatures/structure and dimensions checked; SVG/HTML rejected. ≤10,000 pixels per dimension and ≤40 million pixels. This is container validation, not antivirus or a complete image decoder. |
| Verify webhooks | Payfast callback validates configured signature, merchant, amount, provider confirmation and duplicate events. Live provider end-to-end tests are still pending payment setup and a reachable callback. |
| Rate-limit requests | Persistent D1 limits for auth attempts (per IP and hashed email), verification/resends, checkout, order access and support. No raw email stored in rate-limit keys. Infrastructure-wide bot/WAF limits are separate. |
| Tighten CORS | No wildcard CORS. Browser mutations require matching Origin; payment webhook has its independent signature/provider checks. |
| Production debug off | Generic server errors, no browser secrets, build source maps not served by the hosting archive. Debug/analytics payloads do not include customer credentials. |
| Patch dependencies | Framework, RSC/React, Cloudflare tooling, image decoder, esbuild and compression packages updated/pinned with lockfile and build tests. Remaining audit findings recorded below; no claim of a clean audit. |
| Claude security scan | No Claude scanner was exposed by plugin searches. Local tests, dependency audit and source review ran instead; these are not a Claude scan or an independent penetration test. |

## Verification

Run `npm run typecheck`, `npm test`, and the Sites production build. Account API tests use the real pinned SDK against a mocked provider transport and the real D1 SQL migrations in SQLite. They cover confirmed/unconfirmed identity, secure cookies, encrypted tokens, ownership propagation, recovery restrictions, all-session logout after reset, expiry, rate limits and admin isolation. They do not prove SMTP delivery or live Postgres policy behavior.

Guest cookies expire after seven days and depend on the browser retaining them. The previous manual private-key route remains available for keys already held by a customer. No unsafe email-only order recovery was added; support must verify ownership before granting cross-device access. Existing keys created by an older release may remain in that browser's session storage until the session ends; this release does not write new ones.

Actual browser interaction, mobile rendering, Core Web Vitals, live SMTP/Auth, Postgres RLS and payment-provider tests remain required before public trading.

### Dependency audit result (14 October 2026)

After upgrades, `npm audit` reports **six high findings, zero moderate and zero critical**. All six follow one remaining `braces <=3.0.3` advisory through `micromatch → fast-glob → vite-plugin-dynamic-import → vite-plugin-commonjs → vinext`. The registry currently offers no patched braces release; even the current Vinext release retains that build-tool chain. Its deeply nested pattern denial-of-service advisory must be resolved upstream or the tooling replaced before declaring a clean audit. The store does not accept user-supplied build glob patterns; this observation does not replace a full exploit assessment. The full machine-readable audit is in `docs/DEPENDENCY-AUDIT.json`. No automatic downgrade/force-fix was applied.
