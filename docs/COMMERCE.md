# Commerce configuration and operations

## Hosting and owner access

The existing Site remains private. The manifest declares D1 `DB` and R2 `BUCKET`. Sites applies Drizzle migrations before deploying the Worker. Admin APIs require both platform-supplied user identity and an email present in `ADMIN_EMAILS`; hiding the dashboard is not the access control. No public request can become an administrator merely by calling the admin route. If sharing changes, revisit owner membership and authenticated write boundaries. Guest order access uses a random bearer key stored only as SHA-256 in the database. Do not share that key publicly.

## Current test state

`STORE_MODE=test`, store live setting false, no payment/email credentials. Import the sample catalogue through the owner dashboard. Sample prices and stock are for testing. Checkout labels the order as a test and requires acknowledgment. No payment or real fulfilment occurs. The dashboard can simulate paid/refunded statuses only for test orders. Test notifications are saved as `test_only` and never emailed.

## Integration keys (runtime only)

- `ADMIN_EMAILS`: comma-separated permitted owner/staff emails. Already configured for the Site owner.
- `STORE_MODE`: test by default; only explicitly set live after complete verification.
- `PAYFAST_MERCHANT_ID`, `PAYFAST_MERCHANT_KEY`, `PAYFAST_PASSPHRASE`: credential values from the owner's account, stored as secrets.
- `PAYFAST_SANDBOX`: defaults to sandbox; set false only after sandbox verification.
- `RESEND_API_KEY`, `EMAIL_FROM`: secret API key and approved sender identity.

The private preview cannot receive anonymous payment notifications from an external provider. A publicly reachable, secured callback and correct production domain must be arranged before live checkout. Do not change sharing automatically merely to connect a payment provider.

Live checkout requires STORE_MODE=live, live store setting, business name/contact/address and approved policy details, gateway and email credentials. Every ordered product also requires owner confirmation. Payment amount comes from the stored order, never the browser. ITN verifies signature/passphrase, merchant, amount and Payfast server validation before marking paid. Duplicate provider IDs are recorded once. A browser success return never marks payment complete.

The gateway adapter has been coded and validated for fail-closed behavior but has not been tested against a real merchant sandbox. Finish provider-origin checks required by the selected gateway, private-to-public callback setup, sandbox success/failure/cancellation/duplicate tests and settlement reconciliation before enabling live mode. Live refunds currently require a separately integrated/verified provider refund operation; staff cannot label an unverified live refund as completed.

## Data integrity

Product and variant updates preserve variant IDs and historical order snapshots. Each order request uses a client-generated idempotency key plus request hash and private access token. Repeat identical requests return the original order; changed contents reject reuse. D1 batches and inventory triggers ensure order/items/stock reservations roll back together. A database guard prevents negative stock. The order status transition guard rejects illegal jumps. Cancellation and test refunds release stock once. Pending-payment reservations expire after 30 minutes on checkout/order access; an unattended production cleanup schedule and late-payment reconciliation should be configured before public launch.

Checkout writes require same-origin requests and are rate-limited to ten per minute per source. Admin/order responses are no-store. Public catalogue/settings use bounded cache headers; stock is always checked again at checkout. The current catalogue reader batches products and variants, capped at 500 products/12,000 variants, with API page limits; SQL-level cursor pagination/search should replace this bounded whole-catalogue reader before substantially larger catalogues.

## Notifications

Order and status notifications are inserted with order transactions. Once email is configured, background Worker tasks dispatch queued live messages. Resend idempotency keys prevent retries from creating duplicate messages. Failed sends can be retried from Notifications, up to five attempts. Test notifications never dispatch. Monitor failed/stuck delivery and add an unattended queue retry schedule before live launch. Never mark queued or provider-accepted messages as read by a customer.

## Photos

The dashboard resizes uploads to at most 1600px and encodes WebP before sending. The server validates JPEG/PNG/WebP headers and a 5 MB size cap, stores files under random R2 names and serves immutable image URLs. Product and gallery URLs can also use HTTPS. Existing photo objects are retained to preserve links; media deletion/retention management is a later operational feature.

## Local migration commands

After `npm run build`, apply each generated SQL file once in order:

```
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0000_windy_blob.sql
node --import ./scripts/sites-env.mjs ./node_modules/wrangler/bin/wrangler.js d1 execute DB --local --config dist/server/wrangler.json --persist-to .wrangler/state --file drizzle/0001_inventory-safety.sql
```

Do not replay applied migrations or edit their SQL/metadata. Tests use isolated SQLite databases and the same schema/trigger SQL. The existing build helper packages the Worker, client assets and migrations for hosted deployment.
