-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 — Remplir la colonne `slug` restée vide sur les produits
--
-- SÉCURITÉ : ce script ne contient AUCUN delete, drop ou truncate.
-- Il fait uniquement des UPDATE sur la colonne `slug`, et seulement là où
-- elle est vide. Aucun produit, prix, photo ou description n'est touché.
--
-- La table a un index unique `idx_products_slug`, donc les slugs uniques
-- sont calculés en une seule passe (les doublons de nom reçoivent -2, -3…).
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. AVANT : compter les produits (note bien ce chiffre) ─────────────────
SELECT count(*) AS total_produits,
       count(*) FILTER (WHERE slug IS NOT NULL AND slug <> '') AS avec_slug
FROM public.products;


-- ── 1. Générer des slugs uniques pour les produits qui n'en ont pas ────────
WITH cible AS (
  -- Slug de base : nom français sans accents ; à défaut, le code produit.
  SELECT
    id,
    created_at,
    coalesce(
      nullif(
        trim(both '-' from
          regexp_replace(
            lower(translate(
              name_fr,
              'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
              'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
            )),
            '[^a-z0-9]+', '-', 'g'
          )),
        ''),
      lower(regexp_replace(product_code, '[^A-Za-z0-9]+', '-', 'g'))
    ) AS base
  FROM public.products
  WHERE slug IS NULL OR slug = ''
),
numerote AS (
  SELECT
    c.id,
    c.base,
    -- rang parmi les produits de ce lot qui partagent le même slug de base
    row_number() OVER (PARTITION BY c.base ORDER BY c.created_at, c.id) AS rang,
    -- nombre de produits portant déjà ce slug en base (décalage de sécurité)
    (SELECT count(*) FROM public.products x WHERE x.slug = c.base) AS deja
  FROM cible c
)
UPDATE public.products p
SET slug = CASE WHEN n.rang + n.deja = 1
                THEN n.base
                ELSE n.base || '-' || (n.rang + n.deja) END
FROM numerote n
WHERE p.id = n.id;


-- ── 2. APRÈS : vérifier que tout est rempli et que le total n'a pas bougé ──
SELECT count(*) AS total_produits,
       count(*) FILTER (WHERE slug IS NULL OR slug = '') AS slugs_vides,
       count(DISTINCT slug) AS slugs_uniques
FROM public.products;
-- Attendu : total_produits identique à l'étape 0,
--           slugs_vides = 0, slugs_uniques = total_produits


-- ── 3. Aperçu du résultat ──────────────────────────────────────────────────
SELECT product_code, name_fr, slug
FROM public.products
ORDER BY created_at
LIMIT 15;
