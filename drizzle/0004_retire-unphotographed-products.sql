-- Preserve variants and historical order references while withdrawing unphotographed products.
UPDATE products SET active=0, updated_at=strftime('%Y-%m-%dT%H:%M:%fZ','now')
WHERE id IN ('junior-beanie','junior-joggers','heavyweight-tee','wide-leg-sweats','sport-cap');
