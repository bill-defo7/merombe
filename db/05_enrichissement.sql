-- ============================================================
--  Enrichissement du modele pour une presentation realiste
-- ============================================================

-- Identite visuelle de l'agence
ALTER TABLE agence ADD COLUMN IF NOT EXISTS logo_url    VARCHAR(300);
ALTER TABLE agence ADD COLUMN IF NOT EXISTS photo_url   VARCHAR(300);
ALTER TABLE agence ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE agence ADD COLUMN IF NOT EXISTS note        NUMERIC(2,1);

-- Confort du vehicule, decrit au niveau de l'horaire
-- (une agence peut faire du VIP le matin et du classique l'apres-midi)
ALTER TABLE horaire ADD COLUMN IF NOT EXISTS categorie    VARCHAR(20) DEFAULT 'classique';
ALTER TABLE horaire ADD COLUMN IF NOT EXISTS photo_bus    VARCHAR(300);
ALTER TABLE horaire ADD COLUMN IF NOT EXISTS climatise    BOOLEAN DEFAULT FALSE;
ALTER TABLE horaire ADD COLUMN IF NOT EXISTS wifi         BOOLEAN DEFAULT FALSE;
ALTER TABLE horaire ADD COLUMN IF NOT EXISTS prise_usb    BOOLEAN DEFAULT FALSE;

ALTER TABLE horaire DROP CONSTRAINT IF EXISTS horaire_categorie_check;
ALTER TABLE horaire ADD CONSTRAINT horaire_categorie_check
  CHECK (categorie IN ('classique', 'confort', 'vip'));

-- Adresse lisible du local, pour l'affichage
ALTER TABLE local ADD COLUMN IF NOT EXISTS adresse   VARCHAR(200);
ALTER TABLE local ADD COLUMN IF NOT EXISTS telephone VARCHAR(20);