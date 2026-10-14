# Exclusive Apparel

A Next.js / TypeScript storefront for men, women and kids. Black-and-white crown branding, warm neutrals and olive collection artwork. South African rand pricing. **Development preview: sample products, illustrations and prices; no live orders or payments.**

## Run

Node 22+ and npm. `npm ci`, `npm run dev`. Verify with `npm test`, `npm run build`, `npm run typecheck`. The build exports static pages to `out/`. Host on a static CDN or use the supplied Sites manifest. Configure `NEXT_PUBLIC_SITE_URL` before building for your final domain. An `npm start` server is not used for static exports; serve `out/` with your host.

## Included

- Home-first desktop/mobile navigation, responsive home, shop, collection filters, 250 ms debounced search, sorting and pagination.
- Pre-rendered product routes, size/colour selection, persistent local bag, a sliding shopping bag sidebar, quantity controls and review route.
- Input validation for corrupted bag storage, variant matching and quantity caps. Prices come from catalogue data, never saved bag values.
- Original logo in WebP, favicon/Apple/app icons and a web manifest. Platform-generated splash behavior; no artificial splash screen delaying content.
- Metadata, canonical URLs, Open Graph, Product JSON-LD without invented offer/stock ratings, sitemap and robots. Cart/review excluded from indexing.
- Responsive vector product illustrations, below-fold lazy loading, eager hero/product images, skeletons, reduced-motion support and accessible focus controls.
- Next.js route chunks/minification, memoized filtering, static rendering, no third-party fonts, trackers or heavy unused UI frameworks.
- CI build, type checks and cart integrity tests.

See [implementation plan](docs/PLAN.md) and [launch and performance guide](docs/LAUNCH.md). Edit `lib/products.json` to change catalogue data. Source logo is supplied by the owner. Illustrations are product concepts, not photographs of saleable inventory.
