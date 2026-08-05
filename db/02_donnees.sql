-- ============================================================
--  Projet MeRoMbe
--  Donnees d'essai pour tester la base et la geolocalisation
--
--  A executer APRES merombe.sql (les tables doivent exister)
-- ============================================================
--  Note sur les coordonnees : PostGIS attend le format
--  POINT(longitude latitude) -- la longitude D'ABORD.
--  C'est l'inverse de l'habitude GPS (latitude, longitude).
--  Les coordonnees ci-dessous sont de vrais quartiers de Douala.
-- ============================================================


-- ------------------------------------------------------------
-- 1. Quelques villes
-- ------------------------------------------------------------
INSERT INTO ville (nom, region) VALUES
    ('Douala',    'Littoral'),
    ('Yaounde',   'Centre'),
    ('Bafoussam', 'Ouest'),
    ('Kribi',     'Sud'),
    ('Buea',      'Sud-Ouest'),
    ('Bamenda',   'Nord-Ouest');


-- ------------------------------------------------------------
-- 2. Une agence, basee a Douala (ville_id = 1)
-- ------------------------------------------------------------
INSERT INTO agence (ville_id, nom, contact, statut) VALUES
    (1, 'General Express Voyages', '+237699000001', 'active');


-- ------------------------------------------------------------
-- 3. Des locaux de cette agence a Douala, avec vraies positions
--    agence_id = 1, ville_id = 1 (Douala)
--    Format : ST_MakePoint(longitude, latitude)
-- ------------------------------------------------------------
INSERT INTO local (agence_id, ville_id, quartier, position) VALUES
    (1, 1, 'Akwa',        ST_SetSRID(ST_MakePoint(9.7043, 4.0511), 4326)),
    (1, 1, 'Bonaberi',    ST_SetSRID(ST_MakePoint(9.6800, 4.0800), 4326)),
    (1, 1, 'Ndokoti',     ST_SetSRID(ST_MakePoint(9.7500, 4.0300), 4326)),
    (1, 1, 'Bonamoussadi',ST_SetSRID(ST_MakePoint(9.7350, 4.0900), 4326));


-- ------------------------------------------------------------
-- 4. Un utilisateur voyageur (pour tester plus tard)
-- ------------------------------------------------------------
INSERT INTO utilisateur (agence_id, nom, telephone, role) VALUES
    (NULL, 'Bill Defo', '+237690000000', 'voyageur');


-- ------------------------------------------------------------
-- 5. Une liaison Douala (local Akwa = 1) -> Yaounde (ville 2)
-- ------------------------------------------------------------
INSERT INTO liaison (local_depart_id, ville_arrivee_id, duree_estimee) VALUES
    (1, 2, 180);   -- 180 minutes = 3 heures estimees


-- ------------------------------------------------------------
-- 6. Un horaire recurrent sur cette liaison
-- ------------------------------------------------------------
INSERT INTO horaire (liaison_id, heure, jours, places, tarif, heure_garantie) VALUES
    (1, '09:00', 'tous', 10, 6000, TRUE);


-- ------------------------------------------------------------
-- 7. Un depart reel genere pour cet horaire
-- ------------------------------------------------------------
INSERT INTO depart (horaire_id, date_depart, places_dispo, statut) VALUES
    (1, CURRENT_DATE + 1, 10, 'prevu');   -- depart demain, 10 places


-- ============================================================
--  Fin des donnees d'essai.
-- ============================================================
