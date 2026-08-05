-- ============================================================
--  Projet MeRoMbe
--  Plateforme de vente et de reservation de billets
--  de transport routier interurbain
--
--  Script de creation de la base de donnees (10 tables)
--  Base : PostgreSQL 16 + PostGIS 3
-- ============================================================
--  Ordre de creation : on cree d'abord les tables de reference
--  (celles dont les autres dependent), puis les tables qui
--  pointent vers elles. On ne peut pas creer une table qui
--  reference une table qui n'existe pas encore.
-- ============================================================


-- ------------------------------------------------------------
-- 1. VILLE
--    Les villes desservies. Table de reference : tout pointe
--    vers elle. Ecrite une seule fois pour eviter les
--    incoherences d'orthographe (Douala, douala, DLA).
-- ------------------------------------------------------------
CREATE TABLE ville (
    id      SERIAL PRIMARY KEY,          -- identifiant unique, auto-incremente
    nom     VARCHAR(100) NOT NULL,       -- nom de la ville
    region  VARCHAR(100)                 -- region administrative
);


-- ------------------------------------------------------------
-- 2. AGENCE
--    L'identite des agences. La position n'est PAS ici :
--    elle est portee par les locaux (table suivante).
-- ------------------------------------------------------------
CREATE TABLE agence (
    id        SERIAL PRIMARY KEY,
    ville_id  INTEGER NOT NULL REFERENCES ville(id),  -- ville principale
    nom       VARCHAR(150) NOT NULL,
    contact   VARCHAR(100),
    statut    VARCHAR(20) NOT NULL DEFAULT 'en_attente'
              CHECK (statut IN ('en_attente', 'active', 'suspendue'))
);


-- ------------------------------------------------------------
-- 3. LOCAL
--    Les lieux physiques d'une agence, chacun geolocalise.
--    C'est CE qui rend possible "les agences proches de moi".
--    La position est stockee dans une colonne geographique
--    PostGIS (type geography, point sur la Terre).
-- ------------------------------------------------------------
CREATE TABLE local (
    id         SERIAL PRIMARY KEY,
    agence_id  INTEGER NOT NULL REFERENCES agence(id),
    ville_id   INTEGER NOT NULL REFERENCES ville(id),
    quartier   VARCHAR(120),
    position   GEOGRAPHY(POINT, 4326) NOT NULL   -- longitude/latitude (WGS84)
);
-- Index geographique : rend les recherches de proximite tres rapides
CREATE INDEX idx_local_position ON local USING GIST (position);


-- ------------------------------------------------------------
-- 4. UTILISATEUR
--    Toutes les personnes qui se connectent. Le role definit
--    ce que chacun a le droit de faire. agence_id est vide
--    pour un voyageur, rempli pour un guichetier ou un agent.
-- ------------------------------------------------------------
CREATE TABLE utilisateur (
    id         SERIAL PRIMARY KEY,
    agence_id  INTEGER REFERENCES agence(id),   -- vide pour un voyageur
    nom        VARCHAR(150) NOT NULL,
    telephone  VARCHAR(20) NOT NULL UNIQUE,      -- sert a la connexion
    role       VARCHAR(20) NOT NULL
               CHECK (role IN ('voyageur', 'guichetier', 'agent', 'admin'))
);


-- ------------------------------------------------------------
-- 5. LIAISON
--    Le fait qu'une agence dessert un trajet, d'un local de
--    depart vers une ville d'arrivee. L'ensemble des liaisons
--    forme le reseau (le graphe) pour les correspondances.
-- ------------------------------------------------------------
CREATE TABLE liaison (
    id                SERIAL PRIMARY KEY,
    local_depart_id   INTEGER NOT NULL REFERENCES local(id),
    ville_arrivee_id  INTEGER NOT NULL REFERENCES ville(id),
    duree_estimee     INTEGER                     -- duree en minutes
);


-- ------------------------------------------------------------
-- 6. HORAIRE
--    La regle recurrente saisie par l'agence : sur telle
--    liaison, un depart a telle heure, tels jours, avec tant
--    de places et tel tarif. Saisie une seule fois.
-- ------------------------------------------------------------
CREATE TABLE horaire (
    id              SERIAL PRIMARY KEY,
    liaison_id      INTEGER NOT NULL REFERENCES liaison(id),
    heure           TIME NOT NULL,               -- heure de depart prevue
    jours           VARCHAR(50) NOT NULL,        -- ex: 'tous', 'lun,mer,ven'
    places          INTEGER NOT NULL,            -- places cedees a la plateforme
    tarif           INTEGER NOT NULL,            -- prix en FCFA
    heure_garantie  BOOLEAN NOT NULL DEFAULT TRUE -- FALSE = depart au remplissage
);


-- ------------------------------------------------------------
-- 7. DEPART
--    Le bus reel d'un jour donne, genere a partir d'un horaire.
--    C'est CE que le voyageur reserve. places_dispo est mis a
--    jour a chaque reservation.
-- ------------------------------------------------------------
CREATE TABLE depart (
    id            SERIAL PRIMARY KEY,
    horaire_id    INTEGER NOT NULL REFERENCES horaire(id),
    date_depart   DATE NOT NULL,
    places_dispo  INTEGER NOT NULL,
    statut        VARCHAR(20) NOT NULL DEFAULT 'prevu'
                  CHECK (statut IN ('prevu', 'annule', 'parti'))
);


-- ------------------------------------------------------------
-- 8. RESERVATION
--    L'intention d'achat du voyageur sur un depart precis.
--    Le statut gere le moment du paiement (places bloquees,
--    puis confirmees ou relachees).
-- ------------------------------------------------------------
CREATE TABLE reservation (
    id           SERIAL PRIMARY KEY,
    depart_id    INTEGER NOT NULL REFERENCES depart(id),
    voyageur_id  INTEGER NOT NULL REFERENCES utilisateur(id),
    nb_places    INTEGER NOT NULL,
    montant      INTEGER NOT NULL,               -- montant total en FCFA
    statut       VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                 CHECK (statut IN ('en_attente', 'confirmee', 'echouee', 'annulee')),
    cree_le      TIMESTAMP NOT NULL DEFAULT NOW() -- date/heure de creation
);


-- ------------------------------------------------------------
-- 9. PAIEMENT
--    Chaque tentative de paiement, enregistree separement.
--    Une reservation peut avoir plusieurs tentatives, une
--    seule reussit. Utile pour la compta et les litiges.
-- ------------------------------------------------------------
CREATE TABLE paiement (
    id              SERIAL PRIMARY KEY,
    reservation_id  INTEGER NOT NULL REFERENCES reservation(id),
    montant         INTEGER NOT NULL,
    moyen           VARCHAR(20) NOT NULL
                    CHECK (moyen IN ('mtn_momo', 'orange_money')),
    reference       VARCHAR(100),                -- reference de l'agregateur
    statut          VARCHAR(20) NOT NULL DEFAULT 'en_attente'
                    CHECK (statut IN ('en_attente', 'reussi', 'echoue')),
    cree_le         TIMESTAMP NOT NULL DEFAULT NOW()
);


-- ------------------------------------------------------------
-- 10. BILLET
--     Le titre de transport, cree uniquement apres un
--     paiement reussi. Contient le QR code signe (infalsifiable)
--     et un code lisible pour la saisie manuelle de secours.
-- ------------------------------------------------------------
CREATE TABLE billet (
    id              SERIAL PRIMARY KEY,
    reservation_id  INTEGER NOT NULL UNIQUE REFERENCES reservation(id),
    code            VARCHAR(30) NOT NULL UNIQUE,  -- code lisible unique
    qr_signe        TEXT NOT NULL,                -- contenu signe du QR code
    statut          VARCHAR(20) NOT NULL DEFAULT 'valide'
                    CHECK (statut IN ('valide', 'utilise', 'annule'))
);


-- ============================================================
--  Fin du script. Les 10 tables sont creees dans l'ordre.
-- ============================================================
