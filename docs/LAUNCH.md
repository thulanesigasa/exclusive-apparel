# Performance, SEO and launch

## Implemented now
Static export moves catalogue page rendering out of request time. Every product has a generated HTML route, title, description and canonical URL. A sitemap enumerates routes. Duplicate filter combinations canonicalize to the shop; transactional routes are noindex. Product structured data identifies the brand and product without implying sample offers are available.

Next builds minified JavaScript/CSS and route-specific chunks. Below-fold images load lazily; hero and product detail images load eagerly. Intrinsic dimensions reserve image space. Logo is compressed WebP; apparel illustrations are vector SVG. No external font, analytics or non-critical script dependency. Search is debounced 250 ms, filtering is memoized and catalogue results paginate at eight products. Route loading provides skeletons. Cart and checkout are separate route bundles.

## Hosting configuration (required on the chosen host)
Serve hashed `/_next/static/` assets with `Cache-Control: public, max-age=31536000, immutable`. Give HTML short or revalidation-based caching so catalogue updates appear promptly. Version or invalidate public image assets when they change; do not mark unversioned paths immutable. Enable Brotli/gzip and CDN delivery with automatic TLS. Verify host response headers and compression after deployment; these are host capabilities, not claims about an unconfigured server. Configure CSP after testing Next's inline hydration scripts, plus nosniff and a suitable referrer policy. Private Sites previews are access-controlled and are not public SEO launches.

Static CDN delivery needs no application load balancer. If a dynamic backend is added, use managed horizontal runtime scaling and a provider-managed load balancer; do not install one solely to satisfy a checklist.

## When APIs and a database are added
- Cache public product/category GET responses at the edge with a bounded TTL, ETag and stale-while-revalidate; invalidate after staff updates. Keep authenticated/customer, order and payment responses `private, no-store`.
- Cache expensive public aggregations by a normalized filter/version key. Bound cardinality, monitor hit ratio and expire or invalidate on mutations. Never cache stock reservations as authoritative stock.
- Fetch product variants/media in one joined/batched query; do not query once per product. Index foreign keys and actual filter/sort columns. Inspect query plans on representative data, and paginate in SQL with stable cursor ordering.
- Select only necessary API fields, cap result/page sizes and let the gateway compress JSON. Use full text search when catalogue growth justifies it. Current client pagination loads all 12 sample products; it is not a large-catalogue database strategy.
- Revalidate stock/price during server checkout, using transactions and idempotent webhook handlers. Do not use client-side caches or local storage for authoritative commerce decisions.

## Remaining launch inputs
Actual products/photos, prices, stock by SKU, final domain, business/support identity, payment gateway account, courier and delivery rules, return terms, privacy notice and customer service process. No live checkout until these are integrated and end-to-end payment/stock/refund flows are tested.

## QA
CI tests storage corruption, invalid variants, quantity caps, variant separation and totals, then compiles all static pages and checks types. Browser verification should cover mobile menu, keyboard focus, navigation, zero-result search, filter combinations, sort, pagination, size requirement, variant bag merging, refresh persistence, removal and empty checkout. Measure Core Web Vitals with real product photography and production CDN headers; no performance scores are claimed without measurement.
