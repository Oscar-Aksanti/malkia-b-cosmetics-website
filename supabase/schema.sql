-- =============================================================================
-- MALKIA B COSMETICS — Supabase Schema
-- Run this in the Supabase SQL Editor
-- =============================================================================

-- ── Extensions ────────────────────────────────────────────────────────────
create extension if not exists "pgcrypto";

-- ── Sequence for auto product codes (MKB-XXXX) ────────────────────────────
create sequence if not exists product_code_seq start 1 increment 1;

-- =============================================================================
-- TABLE: products
-- =============================================================================
create table if not exists public.products (
  id            uuid        primary key default gen_random_uuid(),
  product_code  text        unique not null,
  slug          text        unique,
  name_fr       text        not null,
  name_en       text        not null,
  description_fr text,
  description_en text,
  category      text        not null check (category in ('body','face','fragrance','wellness')),
  price_usd     numeric(10,2) not null check (price_usd >= 0),
  images        text[]      default '{}',
  stock_status  text        not null default 'in_stock'
                              check (stock_status in ('in_stock','low_stock','out_of_stock')),
  is_active     boolean     not null default true,
  is_featured   boolean     not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Auto-generate product_code (MKB-0001, MKB-0002, …)
create or replace function public.set_product_code()
returns trigger language plpgsql as $$
begin
  if new.product_code is null or new.product_code = '' then
    new.product_code := 'MKB-' || lpad(nextval('product_code_seq')::text, 4, '0');
  end if;
  -- Auto-generate slug from product_code if not set
  if new.slug is null or new.slug = '' then
    new.slug := lower(replace(new.product_code, '-', '')) || '-' ||
                lower(regexp_replace(new.name_en, '[^a-zA-Z0-9]+', '-', 'g'));
  end if;
  return new;
end;
$$;

create trigger trg_products_code
  before insert on public.products
  for each row execute function public.set_product_code();

-- Updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.touch_updated_at();

-- =============================================================================
-- TABLE: order_attempts
-- =============================================================================
create table if not exists public.order_attempts (
  id         uuid        primary key default gen_random_uuid(),
  items      jsonb       not null default '[]',
  total_usd  numeric(10,2) not null default 0,
  language   text        not null check (language in ('fr','en')),
  device     text        not null check (device in ('mobile','desktop')),
  status     text        not null default 'pending'
               check (status in ('pending','confirmed','delivered','cancelled')),
  notes      text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger trg_orders_updated_at
  before update on public.order_attempts
  for each row execute function public.touch_updated_at();

-- Index for admin dashboard queries
create index if not exists idx_orders_created_at  on public.order_attempts(created_at desc);
create index if not exists idx_orders_status      on public.order_attempts(status);

-- =============================================================================
-- TABLE: site_settings
-- =============================================================================
create table if not exists public.site_settings (
  key        text        primary key,
  value      text        not null default '',
  updated_at timestamptz not null default now()
);

-- =============================================================================
-- ROW LEVEL SECURITY
-- =============================================================================
alter table public.products       enable row level security;
alter table public.order_attempts enable row level security;
alter table public.site_settings  enable row level security;

-- Products: public read, authenticated write
create policy "products_public_read"
  on public.products for select using (is_active = true);

create policy "products_admin_all"
  on public.products for all
  using (auth.role() = 'authenticated');

-- Order attempts: insert for all, read/update for authenticated
create policy "orders_insert_public"
  on public.order_attempts for insert with check (true);

create policy "orders_admin_read"
  on public.order_attempts for select
  using (auth.role() = 'authenticated');

create policy "orders_admin_update"
  on public.order_attempts for update
  using (auth.role() = 'authenticated');

-- Site settings: public read, authenticated write
create policy "settings_public_read"
  on public.site_settings for select using (true);

create policy "settings_admin_write"
  on public.site_settings for all
  using (auth.role() = 'authenticated');

-- =============================================================================
-- SEED: Default site settings
-- =============================================================================
insert into public.site_settings (key, value) values
  ('whatsapp_number',    '243971601855'),
  ('store1_name',        'Boutique Kigali'),
  ('store1_address',     'Nyamirambo-Kigali, Rwanda'),
  ('store1_phone',       '+250788450058'),
  ('store2_name',        'Boutique Bukavu'),
  ('store2_address',     'Mosquée Nyawera-Bukavu, DRCongo'),
  ('store2_phone',       '+243995945889'),
  ('instagram_handle',   '@malkiabcosmetics'),
  ('hero_headline_fr',   'Votre Beauté, Notre Priorité'),
  ('hero_headline_en',   'Your Beauty, Our Priority')
on conflict (key) do nothing;

-- =============================================================================
-- SEED: 20 products (sequence starts at 1 → MKB-0001)
-- =============================================================================
-- NOTE: We explicitly set product_code to skip the trigger for seed data
alter sequence product_code_seq restart with 1;

insert into public.products
  (product_code, slug, name_fr, name_en, description_fr, description_en,
   category, price_usd, images, is_featured, stock_status) values

-- ── CORPS / BODY ──────────────────────────────────────────────────────────
('MKB-0001','mkb0001-almond-glow-body-lotion',
 'Almond Glow — Lotion Clarifiante Corps (Vitamine C)',
 'Almond Glow — Clarifying Body Lotion (Vitamin C)',
 'Une lotion corps éclaircissante enrichie en Vitamine C pour une peau lumineuse et unifiée. Formule légère à absorption rapide.',
 'A brightening body lotion enriched with Vitamin C for a radiant and even complexion. Lightweight, fast-absorbing formula.',
 'body', 18.00,
 ARRAY['/images/products/almond-glow-single.png','/images/products/almond-glow-korea-glow.png'],
 false, 'in_stock'),

('MKB-0002','mkb0002-korea-glow-skin-gel-wash',
 'Korea Glow Skin — Gel Nettoyant Blanchissant (Dr. Davey)',
 'Korea Glow Skin — Whitening & Clear Body Gel Wash (Dr. Davey)',
 'Gel douche corps blanchissant et purifiant à la formule coréenne. Laisse la peau douce, claire et fraîche.',
 'Korean-formula whitening and purifying body gel wash. Leaves skin soft, clear and refreshed.',
 'body', 20.00,
 ARRAY['/images/products/almond-glow-korea-glow.png','/images/products/almond-glow-korea-glow-2.png'],
 false, 'in_stock'),

('MKB-0003','mkb0003-vitamin-c-body-lotion-3days',
 'Lotion Corps Vitamine C 3 Jours (Lovska)',
 'Vitamin C Body Lotion 3 Days (Lovska)',
 'Duo lotion + sérum Vitamine C. Résultats visibles en seulement 3 jours. Peau lumineuse et éclatante garantie.',
 'Vitamin C lotion + serum duo. Visible results in just 3 days. Radiant and glowing skin guaranteed.',
 'body', 15.00,
 ARRAY['/images/products/vitamin-c-body-lotion-3days.png'],
 false, 'in_stock'),

('MKB-0004','mkb0004-aha-body-lotion-3days',
 'Lotion Corps AHA 3 Jours (Lovska)',
 'AHA Body Lotion 3 Days (Lovska)',
 'Grande bouteille lotion corps aux acides AHA. Exfolie en douceur pour une peau plus douce et lumineuse dès 3 jours.',
 'Large-format AHA body lotion. Gently exfoliates for softer, more radiant skin from day 3.',
 'body', 15.00,
 ARRAY['/images/products/aha-body-lotion-3days.png'],
 true, 'in_stock'),

('MKB-0005','mkb0005-thai-whitening-body-cream-500g',
 'Thai Whitening Body Cream 500g',
 'Thai Whitening Body Cream 500g',
 'Crème corps blanchissante format 500g. Hydrate, illumine et unifie le teint en profondeur. Idéale pour une utilisation quotidienne.',
 '500g whitening body cream. Deeply hydrates, brightens and evens skin tone. Perfect for daily use.',
 'body', 22.00,
 ARRAY['/images/products/thai-whitening-body-cream.png'],
 false, 'in_stock'),

('MKB-0006','mkb0006-fonce-body-lotion',
 'Fonce Body Lotion',
 'Fonce Body Lotion',
 'Lotion corps nourrissante pour une peau souple et hydratée. Parfum délicat et texture légère.',
 'Nourishing body lotion for supple and hydrated skin. Delicate fragrance and light texture.',
 'body', 16.00,
 ARRAY['/images/products/almond-glow-korea-glow-2.png'],
 false, 'in_stock'),

('MKB-0007','mkb0007-glycolic-acid-body-lotion',
 'Lotion Corps Acide Glycolique',
 'Glycolic Acid Body Lotion',
 'Lotion corps professionnelle à l''acide glycolique. Exfolie, lisse et uniformise la peau pour un résultat clinique.',
 'Professional glycolic acid body lotion. Exfoliates, smooths and evens skin for clinical results.',
 'body', 19.00,
 ARRAY['/images/products/glycolic-acid-body-lotion.png'],
 false, 'in_stock'),

('MKB-0008','mkb0008-cindella-vitamin-c-100',
 'Cindella Vitamine C 100% (Grand Flacon)',
 'Cindella Vitamin C 100% (Large Bottle)',
 'Grand flacon de lotion Vitamine C 100% pure. Action éclaircissante et anti-taches puissante.',
 'Large bottle of 100% pure Vitamin C lotion. Powerful brightening and anti-dark spot action.',
 'body', 24.00,
 ARRAY['/images/products/banners/cindella-vitamin-c-shop.png'],
 false, 'in_stock'),

('MKB-0009','mkb0009-makari-naturalle-body-cream',
 'Makari Naturalle Crème Corps',
 'Makari Naturalle Body Cream',
 'Crème corps Makari Naturalle aux extraits naturels. Nourrit et illumine la peau pour un éclat naturel.',
 'Makari Naturalle body cream with natural extracts. Nourishes and brightens skin for a natural glow.',
 'body', 20.00,
 ARRAY['/images/products/banners/makari-naturalle-shop.png'],
 false, 'in_stock'),

-- ── VISAGE / FACE ─────────────────────────────────────────────────────────
('MKB-0010','mkb0010-biovene-eclat-supreme',
 'Biovène Éclat Suprême — Soin de Luxe',
 'Biovène Éclat Suprême — Luxury Skincare',
 'L''apogée du luxe en matière de soin de la peau. Formule premium au pot violet et or. Hydratation intense, éclat extraordinaire.',
 'The pinnacle of luxury skincare. Premium formula in violet and gold pot. Intense hydration, extraordinary radiance.',
 'face', 35.00,
 ARRAY['/images/products/banners/biovene-eclat-supreme-shop.png'],
 true, 'in_stock'),

('MKB-0011','mkb0011-biovene-concentre-de-luxe',
 'Biovène Concentré de Luxe (Sérum)',
 'Biovène Concentré de Luxe (Serum)',
 'Sérum visage haut de gamme en flacon vertical élégant. Concentré d''actifs pour une peau parfaite.',
 'Premium face serum in elegant vertical bottle. Concentrated actives for perfect skin.',
 'face', 28.00,
 ARRAY['/images/products/banners/biovene-concentre-shop.png'],
 false, 'in_stock'),

('MKB-0012','mkb0012-kojic-glow-skin-complete-set',
 'Kojic Glow Skin — Set Complet',
 'Kojic Glow Skin — Complete Set',
 'Set complet Kojic : lotion, savon, crème visage et sérum. Solution tout-en-un pour une peau éclatante.',
 'Complete Kojic set: lotion, soap, face cream and serum. All-in-one solution for radiant skin.',
 'face', 45.00,
 ARRAY['/images/products/kojic-glow-skin-set.png'],
 false, 'in_stock'),

('MKB-0013','mkb0013-bride-cream',
 'Bride Cream — Crème Mariées',
 'Bride Cream — Bridal Cream',
 'Crème spécialement formulée pour les mariées. Peau parfaitement lisse et lumineuse pour votre grand jour.',
 'Specially formulated cream for brides. Perfectly smooth and radiant skin for your big day.',
 'face', 25.00,
 ARRAY['/images/products/banners/bride-cream-shop.png'],
 false, 'in_stock'),

('MKB-0014','mkb0014-dreamwhite-beauty-cream',
 'DreamWhite Beauty Cream',
 'DreamWhite Beauty Cream',
 'Crème beauté DreamWhite pour un teint clarifié et unifié. Texture onctueuse à absorption rapide.',
 'DreamWhite beauty cream for a clarified and even complexion. Creamy texture, fast-absorbing.',
 'face', 18.00,
 ARRAY['/images/products/banners/dreamwhite-shop.png'],
 false, 'in_stock'),

('MKB-0015','mkb0015-anti-acne-complete-set',
 'Anti-Acné — Set Complet',
 'Anti-Acne — Complete Set',
 'Coffret complet anti-acné. Traitement en plusieurs étapes pour une peau nette et purifiée.',
 'Complete anti-acne kit. Multi-step treatment for clear and purified skin.',
 'face', 40.00,
 ARRAY['/images/ceo/ceo-anti-acne-set.png'],
 false, 'in_stock'),

-- ── EXFOLIANT ─────────────────────────────────────────────────────────────
('MKB-0016','mkb0016-extra-strong-whitening-molato-scrub',
 'Extra Strong Whitening Molato Scrub',
 'Extra Strong Whitening Molato Scrub',
 'Gommage corps blanchissant extra-fort en pot transparent. Texture orange vif pour une exfoliation intense.',
 'Extra-strong whitening body scrub in clear jar. Vibrant orange texture for intense exfoliation.',
 'body', 20.00,
 ARRAY['/images/products/extra-strong-molato-scrub.png'],
 true, 'in_stock'),

-- ── PARFUMS / FRAGRANCES ──────────────────────────────────────────────────
('MKB-0017','mkb0017-malkia-intense-parfum',
 'Malkia Intense — Parfum',
 'Malkia Intense — Perfume',
 'Le parfum signature de la marque. Une fragrance intense et envoûtante qui fait votre journée fraîche.',
 'The brand''s signature fragrance. An intense and captivating scent that makes your day fresh.',
 'fragrance', 30.00,
 ARRAY['/images/ceo/ceo-malkia-intense.png'],
 true, 'in_stock'),

('MKB-0018','mkb0018-la-tchadienne-parfum',
 'La Tchadienne — Parfum de Niche',
 'La Tchadienne — Niche Perfume',
 'Parfum de niche aux notes africaines envoûtantes. Un hommage à la beauté et à l''élégance africaine.',
 'Niche perfume with captivating African notes. A tribute to African beauty and elegance.',
 'fragrance', 28.00,
 ARRAY['/images/ceo/ceo-la-tchadienne.png'],
 false, 'in_stock'),

('MKB-0019','mkb0019-white-premium-parfum',
 'Parfum Blanc Premium',
 'White Premium Parfum',
 'Flacon classique de parfum blanc premium. Fragrance fraîche et sophistiquée pour toutes les occasions.',
 'Classic white premium perfume bottle. Fresh and sophisticated fragrance for all occasions.',
 'fragrance', 25.00,
 ARRAY['/images/products/banners/white-parfum-shop.png'],
 false, 'in_stock'),

-- ── BIEN-ÊTRE / WELLNESS ──────────────────────────────────────────────────
('MKB-0020','mkb0020-flat-tummy-tea-28-sachets',
 'Flat Tummy Tea (28 sachets)',
 'Flat Tummy Tea (28 sachets)',
 'Thé minceur en 28 sachets pour un ventre plat. Formule naturelle pour drainer et purifier l''organisme.',
 '28-sachet slimming tea for a flat tummy. Natural formula to drain and purify the body.',
 'wellness', 15.00,
 ARRAY['/images/models/avatar-flat-tummy-tea.png'],
 false, 'in_stock');

-- Update sequence to continue after seed
select setval('product_code_seq', 20);
