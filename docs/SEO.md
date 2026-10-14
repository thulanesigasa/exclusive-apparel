# SEO implementation and verification

## Implemented

1. `/sitemap.xml` enumerates canonical public pages, clean collection routes and active product URLs. Product last-modified timestamps come from the database; no artificial fresh date is generated on every request.
2. `/robots.txt` references the sitemap. APIs and auth endpoints are excluded. Public store pages are crawlable when hosting access is public.
3. Explicit noindex meta tags were removed. Public pages declare index/follow. Admin, bag, checkout and private order pages retain `X-Robots-Tag: noindex, nofollow` HTTP protection and no-store; personal/transactional pages are not SEO landing pages. The existing private hosting boundary is unchanged.
4–6. Public routes have absolute HTTPS canonicals, unique titles and unique descriptions. Product pages generate their metadata from current catalogue data. Private page descriptions describe the task without exposing order records.
7–8. Heading hierarchy has been improved with product-list section headings. Informative images have meaningful alt text; duplicate decorative thumbnails have empty alt because the image-choice button already has an accessible name. Image dimensions/aspect ratios reserve space.
9. Organization/WebSite, Product and BreadcrumbList JSON-LD use existing brand/product information. Live Offer markup appears only for an enabled live store and a confirmed product/size chart. No invented ratings, reviews, addresses or live offers are emitted for sample products.
10–11. Navigation/footer/campaign links use clean collection paths. Aliases redirect to the existing canonical policy routes, and legacy audience queries redirect to collections. Hosted crawl checks validate internal links, fragments and image resources separately from browser interaction checks.
12. Legacy sample SVGs retain their URLs, but embedded logo bytes are compressed. Home/campaign images use WebP derivatives. Small header branding and a JPEG social card are included; app icon PNGs use palette compression. Uploaded photos retain the existing 1600px WebP conversion. Preserve uploaded media URLs and immutable random names.
13. Core Web Vitals instrumentation is deferred and stores LCP, INP and CLS locally in `window.__exclusiveVitals`; it also emits `exclusive:vital` events. No data is sent to an analytics server. Targets: LCP ≤2.5 seconds, INP ≤200ms, CLS ≤0.1. This is measurement support and implementation work, not evidence that a performance score has passed.
14. The mobile menu now expands in document flow rather than overlapping the page. It scrolls on small-height screens, closes with Escape, and uses larger touch targets. Form text sizes avoid mobile input zoom. Grids/headings/tables adapt without relying on hiding horizontal overflow.
15. HTTPS redirects are enforced for production Worker requests, with HSTS on HTTPS responses. Hosting TLS and HTTP redirects are verified separately; local development hosts are exempt.
16. Lowercase hyphenated product IDs remain stable. Men/women/kids have `/collections/men/`, `/collections/women/` and `/collections/kids/`. Uppercase/redundant-slash public paths normalize, and known policy aliases redirect. Unknown routes remain genuine 404s rather than false home-page redirects.
17. Public metadata uses an absolute 1200×630 JPEG `og:image` and summary-large-image Twitter metadata. It is a branded social card, not fabricated product photography.
18. Both `/llm.txt` (requested spelling) and `/llms.txt` (conventional spelling) return a curated Markdown/text index and explain test-mode limitations. They do not grant access, override crawler rules or guarantee AI/search inclusion.

## Verification boundaries

The site remains owner-private. Search engines cannot crawl the authenticated preview, regardless of otherwise indexable metadata. A separate public launch and final canonical domain configuration are required for indexing. Do not make the site public merely to run an SEO test without owner authorization.

Automated tests verify metadata uniqueness, canonical slugs, safe JSON-LD, truthful offers, redirects, HTTPS handling and private response headers, alongside the commerce tests. Hosted HTML checks validate actual metadata, headings, alt text, sitemap links and crawl resources. Browser automation is unavailable in this managed execution environment, so rendered mobile layout and interaction performance cannot be certified here. No Lighthouse/CrUX/Core Web Vitals pass is claimed. Run mobile/desktop browser tests and measure the final public site with actual photography before launch.

Re-run Core Web Vitals on representative home, catalogue and product pages. In a real browser, use `window.__exclusiveVitals` after loading and interacting. Official `web-vitals` callbacks may report final values when the page becomes hidden; an absent INP value without interaction is not a pass. Validate social previews once the site is publicly accessible.

## Primary references

- Google Search: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Canonicals: https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Web Vitals: https://web.dev/articles/vitals
- Measurement library: https://github.com/GoogleChrome/web-vitals
- LLM index proposal: https://llmstxt.org/
