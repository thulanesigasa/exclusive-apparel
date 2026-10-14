# Supplied cap photography

All 11 supplied photographs are available in `public/photos/caps/` as WebP assets. The originals remain in the user's uploaded archives; generated images were not substituted for these files. `adult-*`, `women-*`, and `kids-*` prefixes avoid the repeated source filenames colliding.

The standalone `adult-1.webp` is the Everyday Cap's main product image. The complete 11-image gallery includes the adult, women's and kids' shoots, with image selection and enlarged viewing. The adult cap remains one existing Unisex product: no separate women's SKU or unverified kids' size/stock has been invented. Pricing, measurements and live product approval remain unchanged.

Homepage photography replaces the previous hero illustrations and the three collection-card images. The Men, Women and Kids collection pages each have an audience-specific cap banner linked to the product.

Full-size files retain the source pixel dimensions (768 × 1365 or 768 × 1376). Each has a 384px-wide derivative for thumbnails and responsive image sources. Alt text describes the cap or model; thumbnails use descriptive button labels. Below-fold images and thumbnails load lazily. Native product-gallery zoom uses the full-size file.

Original PNGs: 14,445,836 bytes. All full-size and responsive WebPs combined: 929,628 bytes, approximately 94% less. Assets were visually inspected after compression.

`lib/product-photography.ts` upgrades only the Everyday Cap's legacy demo image paths when reading the catalogue from D1. This ensures already-seeded inventory uses the new media. Owner-uploaded primary images and explicitly saved galleries are preserved. The admin editor accepts the new paths and up to 20 gallery images.

Browser interaction/visual QA was unavailable in this managed environment. Type checking, automated catalogue/editing tests, production build, and hosted page/API/asset checks verify the implementation within that limit.
