/* ── Slug generation ──────────────────────────────────────────────────────────
 * Produces URL-safe slugs from product names.
 * Accents are transliterated (é → e) instead of being stripped, so
 * "Lait Éclat Lumière" becomes "lait-eclat-lumiere", not "lait-clat-lumire".
 * -------------------------------------------------------------------------- */
export function slugify(input: string): string {
  return input
    .normalize('NFD')                   // split accented chars into base + accent
    .replace(/[̀-ͯ]/g, '')    // drop the accent marks
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')        // anything else becomes a separator
    .replace(/^-+|-+$/g, '');           // trim leading/trailing separators
}

/* Slug for a product — falls back to the product code when the name yields
 * nothing usable (e.g. a name written entirely in non-latin characters). */
export function productSlug(nameFr: string, productCode: string): string {
  return slugify(nameFr) || slugify(productCode);
}
