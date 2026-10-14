# Store implementation plan

## Implemented

The eight commerce priorities now have application surfaces and server support: owner dashboard, durable catalogue/stock, guest checkout and gateway adapters, editable delivery/collection rules, order history/fulfilment/private tracking, notification outbox/email adapter, product photo/detail fields, and business/support/policy pages. The private deployment runs in test mode. Import sample data in the owner dashboard to exercise order/stock flows. Product galleries accept the owner's real photos when available.

## Complete before live sales

Approve actual product descriptions, photos, fabric/care details and measurements, prices, SKU inventory, business identity/support contact, returns and privacy/terms policies, delivery areas and courier rates. Add payment/email credentials in hosted runtime settings. Arrange a public callback and final domain. Test actual merchant sandbox payments, cancellation, late/duplicate notifications, reconciliation/refunds, email delivery, fulfilment and customer support. Configure unattended reservation/outbox maintenance, production monitoring/backups and browser/accessibility verification before public trading.

## Later enhancements

Optional customer accounts, wishlists, verified reviews, promotions, courier label APIs, automated stock alerts, customer self-service returns and staff auditing/roles. Add SQL cursor/full-text catalogue pagination as inventory expands past the current bounded batched reader.
