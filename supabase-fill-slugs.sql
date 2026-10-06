-- ═══════════════════════════════════════════════════════════════════════════
-- ÉTAPE 1 — Remplir la colonne `slug` restée vide sur les produits
--
-- SÉCURITÉ : ce script ne contient AUCUN delete, drop ou truncate.
-- Il fait uniquement des UPDATE sur la colonne `slug`, et seulement là où
-- elle est vide. Aucun produit, prix, photo ou description n'est touché.
-- ═══════════════════════════════════════════════════════════════════════════

-- ── 0. AVANT : compter les produits (note bien ce chiffre) ─────────────────
SELECT count(*) AS total_produits,
       count(slug) FILTER (WHERE slug IS NOT NULL AND slug <> '') AS avec_slug
FROM public.products;


-- ── 1. Générer le slug depuis le nom français ──────────────────────────────
-- Les accents sont convertis (é → e) puis tout caractère non alphanumérique
-- devient un tiret.
UPDATE public.products
SET slug = trim(both '-' from
             regexp_replace(
               lower(translate(
                 name_fr,
                 'àáâãäåçèéêëìíîïñòóôõöùúûüýÿÀÁÂÃÄÅÇÈÉÊËÌÍÎÏÑÒÓÔÕÖÙÚÛÜÝ',
                 'aaaaaaceeeeiiiinooooouuuuyyAAAAAACEEEEIIIINOOOOOUUUUY'
               )),
               '[^a-z0-9]+', '-', 'g'
             ))
WHERE slug IS NULL OR slug = '';


-- ── 2. Filet de sécurité : nom vide ou non latin → utiliser le code produit ─
UPDATE public.products
SET slug = lower(regexp_replace(product_code, '[^A-Za-z0-9]+', '-', 'g'))
WHERE slug IS NULL OR slug = '';


-- ── 3. Rendre les slugs uniques (ajoute -2, -3… aux doublons) ──────────────
WITH doublons AS (
  SELECT id,
         slug,
         row_number() OVER (PARTITION BY slug ORDER BY created_at, id) AS rang
  FROM public.products
)
UPDATE public.products p
SET slug = d.slug || '-' || d.rang
FROM doublons d
WHERE p.id = d.id AND d.rang > 1;


-- ── 4. APRÈS : vérifier que tout est rempli et que le total n'a pas bougé ──
SELECT count(*) AS total_produits,
       count(*) FILTER (WHERE slug IS NULL OR slug = '') AS slugs_vides,
       count(DISTINCT slug) AS slugs_uniques
FROM public.products;
-- Attendu : total_produits identique à l'étape 0,
--           slugs_vides = 0, slugs_uniques = total_produits


-- ── 5. Aperçu du résultat ──────────────────────────────────────────────────
SELECT product_code, name_fr, slug
FROM public.products
ORDER BY created_at
LIMIT 15;
