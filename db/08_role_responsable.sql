-- Autorise le role 'responsable', qui gere le personnel d'une agence
DO $$
DECLARE
    nom_contrainte text;
BEGIN
    SELECT conname INTO nom_contrainte
    FROM pg_constraint
    WHERE conrelid = 'utilisateur'::regclass
      AND contype = 'c'
      AND pg_get_constraintdef(oid) LIKE '%role%';

    EXECUTE format('ALTER TABLE utilisateur DROP CONSTRAINT %I', nom_contrainte);
END $$;

ALTER TABLE utilisateur
    ADD CONSTRAINT utilisateur_role_check
    CHECK (role IN ('voyageur', 'guichetier', 'agent', 'admin', 'responsable'));