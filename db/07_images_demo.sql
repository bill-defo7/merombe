-- ============================================================
--  Images de demonstration (Unsplash, libres de droits).
--  A remplacer par les vraies photos des agences en production.
-- ============================================================

-- Photos de facade / gare routiere
UPDATE agence SET
  photo_url = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800&q=80'
WHERE id = 1;

UPDATE agence SET
  photo_url = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=800&q=80'
WHERE id = 2;

UPDATE agence SET
  photo_url = 'https://images.unsplash.com/photo-1509118796018-b1b2b8f2b0b1?w=800&q=80'
WHERE id = 3;

UPDATE agence SET
  photo_url = 'https://images.unsplash.com/photo-1494515843206-f3117d3f51b7?w=800&q=80'
WHERE id = 4;

-- Photos de bus selon la gamme
UPDATE horaire SET
  photo_bus = 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80'
WHERE categorie = 'classique';

UPDATE horaire SET
  photo_bus = 'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?w=600&q=80'
WHERE categorie = 'confort';

UPDATE horaire SET
  photo_bus = 'https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=600&q=80'
WHERE categorie = 'vip';