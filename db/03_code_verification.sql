-- ============================================================
--  Projet MeRoMbe
--  Table des codes de verification pour la connexion par SMS
--  A executer apres merombe.sql
-- ============================================================

CREATE TABLE code_verification (
    id          SERIAL PRIMARY KEY,
    telephone   VARCHAR(20) NOT NULL,
    code        VARCHAR(6)  NOT NULL,
    expire_le   TIMESTAMP   NOT NULL,
    utilise     BOOLEAN     NOT NULL DEFAULT FALSE,
    cree_le     TIMESTAMP   NOT NULL DEFAULT NOW()
);

-- retrouver rapidement les codes d'un numero donne
CREATE INDEX IF NOT EXISTS idx_code_telephone ON code_verification (telephone);