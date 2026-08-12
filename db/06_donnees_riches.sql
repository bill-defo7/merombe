-- ============================================================
--  Jeu de donnees realiste : plusieurs agences, plusieurs
--  trajets, de quoi voir une vraie plateforme fonctionner.
-- ============================================================

-- Complete l'agence existante
UPDATE agence SET
  description = 'Plus de 30 ans sur les routes du Cameroun. Flotte moderne et departs garantis.',
  note = 4.2
WHERE id = 1;

UPDATE local SET adresse = 'Rue Joss, face a la BICEC', telephone = '+237699000011' WHERE id = 1;
UPDATE local SET adresse = 'Carrefour Bonaberi',        telephone = '+237699000012' WHERE id = 2;
UPDATE local SET adresse = 'Rond-point Ndokoti',        telephone = '+237699000013' WHERE id = 3;
UPDATE local SET adresse = 'Avenue Bonamoussadi',       telephone = '+237699000014' WHERE id = 4;

UPDATE horaire SET categorie = 'confort', climatise = TRUE, prise_usb = TRUE WHERE id = 1;
UPDATE horaire SET categorie = 'vip', climatise = TRUE, wifi = TRUE, prise_usb = TRUE WHERE id = 2;

-- ------------------------------------------------------------
-- Trois nouvelles agences
-- ------------------------------------------------------------
INSERT INTO agence (ville_id, nom, contact, statut, description, note) VALUES
  (1, 'Buca Voyages',        '+237677100200', 'active',
   'Le confort a prix juste. Departs frequents vers l''Ouest et le Centre.', 4.5),
  (1, 'Garanti Express',     '+237677100300', 'active',
   'Specialiste des liaisons cotieres. Bus climatises, wifi a bord.', 4.0),
  (2, 'Central Voyages',     '+237677100400', 'active',
   'Au depart de Yaounde vers tout le pays.', 3.8);

-- ------------------------------------------------------------
-- Leurs locaux, geolocalises sur de vrais quartiers
-- ------------------------------------------------------------
INSERT INTO local (agence_id, ville_id, quartier, position, adresse, telephone) VALUES
  -- Buca Voyages, Douala
  (2, 1, 'Bali',        ST_SetSRID(ST_MakePoint(9.6950, 4.0430), 4326),
   'Rue Sylvanie, Bali',              '+237677100201'),
  (2, 1, 'Deido',       ST_SetSRID(ST_MakePoint(9.7020, 4.0680), 4326),
   'Boulevard de la Liberte, Deido',  '+237677100202'),
  (2, 1, 'Makepe',      ST_SetSRID(ST_MakePoint(9.7580, 4.0790), 4326),
   'Carrefour Makepe Missoke',        '+237677100203'),

  -- Garanti Express, Douala
  (3, 1, 'Akwa',        ST_SetSRID(ST_MakePoint(9.7080, 4.0490), 4326),
   'Boulevard de la Republique',      '+237677100301'),
  (3, 1, 'Bepanda',     ST_SetSRID(ST_MakePoint(9.7400, 4.0620), 4326),
   'Carrefour Bepanda Omnisport',     '+237677100302'),

  -- Central Voyages, Yaounde
  (4, 2, 'Mvan',        ST_SetSRID(ST_MakePoint(11.5180, 3.8320), 4326),
   'Gare routiere de Mvan',           '+237677100401'),
  (4, 2, 'Etoudi',      ST_SetSRID(ST_MakePoint(11.5230, 3.9100), 4326),
   'Carrefour Etoudi',                '+237677100402');

-- ------------------------------------------------------------
-- Liaisons : Douala vers plusieurs destinations, et retour
-- ------------------------------------------------------------
INSERT INTO liaison (local_depart_id, ville_arrivee_id, duree_estimee) VALUES
  (5, 2, 210),   -- Bali    -> Yaounde
  (5, 3, 300),   -- Bali    -> Bafoussam
  (6, 2, 200),   -- Deido   -> Yaounde
  (7, 3, 290),   -- Makepe  -> Bafoussam
  (8, 4, 150),   -- Akwa    -> Kribi (Garanti)
  (8, 2, 195),   -- Akwa    -> Yaounde (Garanti)
  (9, 5, 90),    -- Bepanda -> Buea
  (10, 1, 200),  -- Mvan    -> Douala
  (10, 3, 280),  -- Mvan    -> Bafoussam
  (11, 1, 205);  -- Etoudi  -> Douala

-- ------------------------------------------------------------
-- Horaires varies : plusieurs departs par jour, trois gammes
-- ------------------------------------------------------------
INSERT INTO horaire (liaison_id, heure, jours, places, tarif, heure_garantie,
                     categorie, climatise, wifi, prise_usb) VALUES
  -- Buca Voyages, Bali -> Yaounde
  (3,  '06:00', 'tous',        20,  6500, TRUE,  'confort', TRUE,  FALSE, TRUE),
  (3,  '10:00', 'tous',        20,  6500, TRUE,  'confort', TRUE,  FALSE, TRUE),
  (3,  '14:30', 'tous',        14, 12000, TRUE,  'vip',     TRUE,  TRUE,  TRUE),
  -- Buca Voyages, Bali -> Bafoussam
  (4,  '07:00', 'tous',        20,  5500, TRUE,  'classique', FALSE, FALSE, FALSE),
  (4,  '15:00', 'lun,ven,dim', 20,  5500, TRUE,  'classique', FALSE, FALSE, FALSE),
  -- Buca Voyages, Deido -> Yaounde
  (5,  '08:00', 'tous',        20,  6000, TRUE,  'confort', TRUE,  FALSE, TRUE),
  -- Buca Voyages, Makepe -> Bafoussam
  (6,  '06:30', 'tous',        18,  5800, TRUE,  'confort', TRUE,  FALSE, FALSE),
  -- Garanti Express, Akwa -> Kribi
  (7,  '07:30', 'tous',        16,  4500, TRUE,  'confort', TRUE,  TRUE,  TRUE),
  (7,  '13:00', 'tous',        16,  4500, FALSE, 'classique', TRUE, FALSE, FALSE),
  -- Garanti Express, Akwa -> Yaounde
  (8,  '05:30', 'tous',        22,  6000, TRUE,  'classique', TRUE, FALSE, FALSE),
  (8,  '11:00', 'tous',        12, 11000, TRUE,  'vip',     TRUE,  TRUE,  TRUE),
  -- Garanti Express, Bepanda -> Buea
  (9,  '09:00', 'tous',        18,  3500, TRUE,  'confort', TRUE,  FALSE, TRUE),
  -- Central Voyages, Mvan -> Douala
  (10, '06:00', 'tous',        20,  6200, TRUE,  'confort', TRUE,  FALSE, TRUE),
  (10, '16:00', 'tous',        20,  6200, TRUE,  'confort', TRUE,  FALSE, TRUE),
  -- Central Voyages, Mvan -> Bafoussam
  (11, '08:30', 'mar,jeu,sam', 18,  6800, TRUE,  'confort', TRUE,  FALSE, FALSE),
  -- Central Voyages, Etoudi -> Douala
  (12, '07:00', 'tous',        20,  6200, TRUE,  'classique', TRUE, FALSE, FALSE);

-- ------------------------------------------------------------
-- Un guichetier par nouvelle agence
-- ------------------------------------------------------------
INSERT INTO utilisateur (agence_id, nom, telephone, role) VALUES
  (2, 'Sandrine Fotso',  '+237677100210', 'guichetier'),
  (3, 'Emmanuel Tchouta','+237677100310', 'guichetier'),
  (4, 'Clarisse Abena',  '+237677100410', 'guichetier');