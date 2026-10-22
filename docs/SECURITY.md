> The current pre-launch waiting-list controls and management authentication are documented in [WAITLIST-LAUNCH.md](WAITLIST-LAUNCH.md). Existing customer/Supabase/commerce controls below are retained for the future store; those public entry points are blocked in pre-launch mode.

# Customer accounts and security

Customer accounts are optional. `/account/` supports sign-up, email-code verification, sign-in, password recovery, profile-name changes and sign-out. Guest checkout does not depend on the account provider and remains available when accounts are disabled. The site is still owner-private and live commerce is still disabled.

## What is active and what needs setup

The dedicated `exclusive-apparel` Supabase project (`vasdsmzsmquvpepaxzog`, London region) now exists. On 14 October 2026, both customer-profile and helper-permission migrations were applied. Customer profiles have enabled/forced RLS, column-level write grants and ownership policies; the profile-creation trigger runs in the non-exposed `private` schema. Live database role tests passed, all fixtures were rolled back, and security/performance advisors returned no findings. The project URL, publishable key and generated session-encryption key are configured as hosted server secrets. Email delivery and live signup/recovery remain unverified; `CUSTOMER_AUTH_READY` stays false until those checks pass. Other Supabase projects were not changed.

Before enabling accounts:

1. Use the existing dedicated `exclusive-apparel` project. Its URL and **publishable** key are already connected through hosted runtime configuration. No service-role/secret Supabase key is needed by this implementation.
2. Already applied: `supabase/migrations/20261014141417_customer_profiles.sql` and `20261014141501_harden_rls_event_trigger.sql`. Local filenames match remote migration history. They create private profiles, enforce ownership and restrict helper execution. `tests/customer-rls.sql` verifies profile creation, anonymous denial, customer isolation, own-profile updates, ownership protection and missing-identity denial using actual database roles, inside a rolled-back transaction.
3. Enable email/password authentication with **Confirm email ON**. Set the password minimum to 12 characters. Configure a verified production SMTP sender and provider email/OTP rate limits. Default Supabase trial mail is not sufficient for a production storefront.
4. Customize both signup confirmation and password-recovery templates to show `{{ .Token }}` as a code. The UI accepts 6–10 digits. Set OTP lifetime to a short duration (for example, 10 minutes). This code flow deliberately keeps verification tokens out of URLs, browser history and redirect logs. Set the site URL to the actual HTTPS storefront origin; no OAuth callback replaces Sites' native owner authentication.
5. `AUTH_SESSION_KEY` is already configured as a hosted secret with 32 cryptographically random bytes encoded as 64 lowercase hex characters. Keep it server-only. Rotating this key invalidates existing encrypted sessions. Set `CUSTOMER_AUTH_READY=true` only after the following provider checks pass.
6. Verify a real test signup, delivered verification code, rejected unverified login, confirmed login, recovery-code expiry, password reset, sign-out and session expiry. Run two-user RLS checks with actual authenticated JWTs: anonymous users cannot read profiles; A cannot read/update B; A can update only their own name and cannot change profile ownership. Run Supabase security and performance advisors before launch.

RLS applies to Supabase customer profiles. D1 does **not** support native PostgreSQL RLS: catalogue, inventory, guest orders, support requests and encrypted sessions remain server-only D1 records guarded by parameterized SQL and explicit authorization. This is not a full migration of commerce records to Postgres. Orders are not automatically claimed by matching an account email, and this release does not add account-linked order history.

## Requested security controls

| Requirement | Implementation / limit |
| --- | --- |
| Protect admin routes | Server-rendered management page requires platform identity and the server `ADMIN_EMAILS` allowlist. Every management API repeats the check. Customer metadata and customer cookies confer no admin role. |
| Server-side access | Sensitive reads/writes are authorized on the Worker. Totals, stock and fulfilment transitions are computed/validated there. |
| Row-level security | Ownership policies are applied to Supabase profiles; live database role-isolation tests passed. D1 uses application authorization, not native RLS. |
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

Run `npm run typecheck`, `npm test`, and the Sites production build. Account API tests use the real pinned SDK against a mocked provider transport and the real D1 SQL migrations in SQLite. They cover confirmed/unconfirmed identity, secure cookies, encrypted tokens, ownership propagation, recovery restrictions, all-session logout after reset, expiry, rate limits and admin isolation. The separate `tests/customer-rls.sql` ran against the hosted Postgres database and verified its policies. Neither test suite proves real SMTP delivery.

Guest cookies expire after seven days and depend on the browser retaining them. The previous manual private-key route remains available for keys already held by a customer. No unsafe email-only order recovery was added; support must verify ownership before granting cross-device access. Existing keys created by an older release may remain in that browser's session storage until the session ends; this release does not write new ones.

Actual browser interaction, mobile rendering, Core Web Vitals, live SMTP/Auth and payment-provider tests remain required before public trading. Live API requests with real authenticated JWTs remain an additional integration check; the database role and claim isolation tests already passed.

### Dependency audit result (14 October 2026)

After upgrades, `npm audit` reports **six high findings, zero moderate and zero critical**. All six follow one remaining `braces <=3.0.3` advisory through `micromatch → fast-glob → vite-plugin-dynamic-import → vite-plugin-commonjs → vinext`. The registry currently offers no patched braces release; even the current Vinext release retains that build-tool chain. Its deeply nested pattern denial-of-service advisory must be resolved upstream or the tooling replaced before declaring a clean audit. The store does not accept user-supplied build glob patterns; this observation does not replace a full exploit assessment. The full machine-readable audit is in `docs/DEPENDENCY-AUDIT.json`. No automatic downgrade/force-fix was applied.
