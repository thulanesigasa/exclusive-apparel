# Supplied cap photography

All 11 supplied photographs are available in `public/photos/caps/` as WebP assets. The originals remain in the user's uploaded archives; generated images were not substituted for these files. `adult-*`, `women-*`, and `kids-*` prefixes avoid the repeated source filenames colliding.

The standalone `adult-1.webp` is the Everyday Cap's main product image. The complete 11-image gallery includes the adult, women's and kids' shoots, with image selection and enlarged viewing. The adult cap remains one existing Unisex product: no separate women's SKU or unverified kids' size/stock has been invented. Pricing, measurements and live product approval remain unchanged.

Homepage photography replaces the previous hero illustrations and the three collection-card images. The Men, Women and Kids collection pages each have an audience-specific cap banner linked to the product.

Full-size files retain the source pixel dimensions (768 × 1365 or 768 × 1376). Each has a 384px-wide derivative for thumbnails and responsive image sources. Alt text describes the cap or model; thumbnails use descriptive button labels. Below-fold images and thumbnails load lazily. Native product-gallery zoom uses the full-size file.

Original PNGs: 14,445,836 bytes. All full-size and responsive WebPs combined: 929,628 bytes, approximately 94% less. Assets were visually inspected after compression.

`lib/product-photography.ts` upgrades only the Everyday Cap's legacy demo image paths when reading the catalogue from D1. This ensures already-seeded inventory uses the new media. Owner-uploaded primary images and explicitly saved galleries are preserved. The admin editor accepts the new paths and up to 20 gallery images.

Browser interaction/visual QA was unavailable in this managed environment. Type checking, automated catalogue/editing tests, production build, and hosted page/API/asset checks verify the implementation within that limit.

Hosting limitation: this host's static-asset service currently labels WebP responses as `application/octet-stream`, even when Worker-first asset routing and a Worker MIME override are configured. The files still contain valid WebP data. Hosted verification checks the actual format, HTTP availability and SHA-256 equality against every committed full-size and responsive image, rather than claiming that the host's MIME label has been corrected. A provider-side MIME correction remains desirable, particularly for direct image navigation.

## Additional apparel photographs

The six additional uploaded archives supply 26 photographs, committed as 52 WebP assets in `public/photos/apparel/`: a 768 px version for product views/zoom and a 384 px version for thumbnails/cards. Their combined size is 2,261,414 bytes versus 67,415,902 bytes for the source JPEGs (96.6% smaller, including both sizes). Original archives remain unchanged. Dimensions and descriptive alt text are recorded in `lib/apparel-photo-assets.json`.

| Photo group | Existing product | Gallery images |
| --- | --- | --- |
| Men’s T-shirts | Signature Tee | 5 |
| Women’s T-shirts | Boxy Tee | 5 |
| Kids’ T-shirts | Junior Crown Tee | 3 |
| Beanies | Crown Beanie | 4 |
| Sweatpants | Relaxed Sweatpants | 6 |
| Track pants | Track Pants | 3 |

Collection cards and banners now use the corresponding T-shirt photos. Legacy seeded database records receive the same media as the fallback catalogue; owner-selected replacement images and galleries remain editable and are preserved. These media assignments do not confirm fit, fabric, available colours, size measurements, stock or prices. Photos were not assigned to the distinct Heavyweight Tee, Wide Leg Sweats, Junior Joggers or Junior Beanie without matching product references.

Catalogue integration tests cover each group, gallery persistence and owner replacements. Production build and TypeScript checks are required before publication. Browser interaction and mobile visual QA remain unavailable in this environment. The previously recorded native hosting MIME limitation also applies to these static WebP files.

## Final catalogue handoff

At the owner's request, the five unphotographed entries were removed: Junior Beanie, Junior Joggers, Heavyweight Tee, Wide Leg Sweats, and Sport Cap. The seven remaining starter products have supplied primary photos and galleries directly in `lib/products.json`. Obsolete media for those five withdrawn entries was removed from the repository. Server catalogue and checkout guards also block old database records for these IDs. Migration `0004_retire-unphotographed-products.sql` marks existing rows inactive while preserving historical order/variant references; apply it on the owner's final database deployment.

This final change is GitHub-only. No new website publication was requested. The previously published private Sites preview still requires manual removal because the available Sites connector has no unpublish/delete operation. No custom domains were attached. The Supabase project and database data have not been deleted.

## Additional cap lifestyle photographs — 26 October 2026

Five supplied JPEGs are included as responsive 768px and 384px WebP images under `public/photos/lifestyle/`, with descriptive alt text and dimensions recorded in `lib/lifestyle-photo-assets.json`. Originals remain unchanged.

- `1128061.jpg`: Men’s category cover and homepage hero (`men-street`).
- `1128060.jpg`: Women’s category cover (`women-bench`).
- `1128058.jpg`, `1128055.jpg`, `1128054.jpg`: Men’s styling gallery (close-up, monochrome and overhead).
- All five also appear in the existing unisex Everyday Cap gallery, with zoom. Kids retains its existing supplied photos.

These are cap styling photographs, not new listings for the jackets, jeans or footwear shown. No prices, purchase controls or stock claims have been introduced. Existing database records using bundled media receive the expanded gallery; owner-uploaded replacement cover images are preserved.
