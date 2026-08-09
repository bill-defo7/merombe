package cm.merombe.backend.paiement;

/**
 * Contrat commun a toutes les passerelles de paiement.
 * Le coeur de l'application ne connait que cette interface :
 * changer d'agregateur ne demande qu'un nouvel adaptateur.
 */
public interface PasserellePaiement {

    /**
     * Demande l'encaissement. Retourne une reference de suivi.
     * L'encaissement n'est PAS termine au retour de cette methode :
     * le client doit encore confirmer sur son telephone.
     */
    ResultatPaiement encaisser(String telephone, int montant, String description);

    /**
     * Interroge l'agregateur sur l'etat d'une transaction.
     * Sert de filet quand le rappel (webhook) ne parvient jamais.
     */
    EtatPaiement verifier(String reference);

    /** Nom de la passerelle, pour la tracabilite. */
    String nom();
}