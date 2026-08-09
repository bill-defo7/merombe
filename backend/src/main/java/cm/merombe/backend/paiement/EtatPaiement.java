package cm.merombe.backend.paiement;

/**
 * Les seuls etats possibles d'un paiement, quel que soit l'agregateur.
 * A_VERIFIER couvre le cas ou l'agregateur ne repond pas : on ne sait
 * pas si l'argent a ete preleve, il faudra rapprocher manuellement.
 */
public enum EtatPaiement {
    EN_ATTENTE,
    REUSSI,
    ECHOUE,
    A_VERIFIER
}