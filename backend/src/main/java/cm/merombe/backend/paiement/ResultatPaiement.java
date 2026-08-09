package cm.merombe.backend.paiement;

public record ResultatPaiement(
        boolean accepte,
        String reference,
        String message) {

    public static ResultatPaiement accepte(String reference) {
        return new ResultatPaiement(true, reference, "Demande transmise");
    }

    public static ResultatPaiement refuse(String message) {
        return new ResultatPaiement(false, null, message);
    }
}