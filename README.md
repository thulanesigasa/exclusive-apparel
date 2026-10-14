# Exclusive Apparel

A full-stack apparel store for men, women and kids. Next-compatible React/TypeScript pages run on Vinext + Cloudflare Workers, with D1 commerce storage and R2 product photos. The existing crown branding, Home navigation and sliding bag are retained.

**Currently test mode.** Sample products and demonstration delivery prices remain until the owner replaces/approves them. Live payment and email require credentials and operational approval; no secret is stored in source.

## Included

1. Owner-only `/admin/`: product/photo editor, variants/SKUs, stock, delivery settings, business/policy editors, orders and notification queue.
2. Durable product/variant database with batched catalogue reads and schema migrations. Guest bags remain local; orders persist on the server.
3. Guest checkout validates contact/address/terms, recomputes catalogue prices and shipping on the server, reserves stock atomically and handles duplicate submissions. Test checkout is usable after sample catalogue import. Payfast hosted-payment and verified-notification adapters are included but fail closed until configured.
4. Delivery/collection methods, fees, free-delivery thresholds, province coverage and shipping/collection references.
5. Order lifecycle and history, private customer tracking using a hashed bearer key, staff packing/shipping updates and test payment/refund simulation. Pending reservations expire after 30 minutes when checkout or order endpoints are accessed; cancellation and test refunds release stock exactly once.
6. Transactional notification outbox; configured Resend delivery runs in Worker background tasks, with staff retry controls and provider idempotency keys. Test orders never send email.
7. Photo gallery/zoom, real-photo upload resized to 1600px and compressed to WebP, product fabric/care/fit/measurement fields and per-variant availability.
8. Contact, delivery, returns/exchanges, terms and privacy pages driven by editable settings. Initial policies are working drafts.

## Owner workflow

Open `/admin/` while signed in with the owner account. On Overview, **Import sample catalogue** adds the existing 12 products with demonstration stock once. Add/edit real products in Products. Supply business identity/contact, approved policies and actual courier rates in Settings and Delivery. Test the checkout and fulfilment flow before live trading.

## Development

Node 22.13+ and npm. `npm ci`, `npm run dev`, `npm run build`, `npm run typecheck`, `npm test`. Hosted packaging uses the Sites skill and tracked `.openai/hosting.json`. D1/R2 resources and migrations are provisioned by publication. The build produces `dist/server` + `dist/client`; the former static `out/` deployment is no longer used.

Generate append-only database migrations with `npm run db:generate`; inventory guards are in the separate custom schema migration. To test the local D1 runtime, build and apply migrations in order with Wrangler as described in `docs/COMMERCE.md`.

CI tests cart integrity, validation/shipping, authorization, server totals, checkout idempotency, private order access, rollback, concurrent last-unit purchase, fulfilment, reservation expiry and disabled live integrations. It then compiles and checks types. Browser QA and actual provider sandbox/production payments remain separate launch checks.

See [commerce configuration](docs/COMMERCE.md), [implementation plan](docs/PLAN.md) and [launch checklist](docs/LAUNCH.md).

The footer groups Explore, Good to know and Legal. Support/policy pages contain fuller editable content and an FAQ/measurement guide at `/size-guide/`. A contact inbox and order-linked size exchange requests are managed in the dashboard’s Requests tab. Real garment measurements remain pending until supplied by the owner. Returns/terms defaults are working drafts and preserve applicable statutory rights; business details, voluntary exchange terms and approved policies still need owner confirmation before live sales.
