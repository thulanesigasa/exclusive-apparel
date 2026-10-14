# Performance, SEO and launch checks

## Current architecture

Server-rendered Next-compatible routes run on Vinext/Workers. Public catalogue/settings APIs declare bounded cache lifetimes; authenticated admin, orders and payment responses are no-store. Product/variant records load in two batched queries, with React request memoization for server page/metadata reads. Database indexes cover product category/audience, SKU/variant choices, order status/date and item/event lookup. Current catalogue limits are documented in COMMERCE.md; they are not an unlimited search service.

Routes have metadata, canonicals and Product schema; sitemap reads the active database catalogue. Transactional/admin/order routes are noindex and excluded from robots. Product photos have dimensions, lazy loading below the fold, gallery/zoom support and browser-side resize/WebP encoding before upload. Random R2 media URLs have immutable caching. Build output includes minified chunks. Search remains debounced; route loading has skeletons and the bag drawer is lazy-loaded.

## Host verification

Configure and measure CDN caching/Brotli/gzip, TLS and production security headers on the final host. Never publicly cache order/customer responses. Stock/price validation bypasses client caches at checkout. Use managed scaling rather than introducing an unnecessary standalone load balancer. Evaluate Core Web Vitals with real photography and a production domain; no score is claimed without measurement.

## Launch gates

Keep the preview private and in test mode until actual products, prices/stock, business/support details, approved policies and real courier rules are supplied. Gateway/email credentials are absent. Verify a publicly reachable signed callback, merchant sandbox scenarios, order reconciliation/refunds and real email delivery before live mode. Add unattended reservation expiry and notification retry scheduling, error/uptime monitoring, database/media backups and restore procedures. Browser/mobile/keyboard/visual QA remains outstanding in this execution environment.

## Automated verification

Tests cover malformed bag storage, item variants, shipping thresholds/coverage, owner API authorization, server-derived totals, idempotency, private order token enforcement, transaction rollback, last-unit concurrent purchases, cancellation restocking, fulfillment transitions and missing integration credentials. The build compiles the Worker and client routes; types are checked separately. These do not substitute for provider sandbox and browser tests.
