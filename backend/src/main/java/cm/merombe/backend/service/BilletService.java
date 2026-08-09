package cm.merombe.backend.service;

import java.nio.charset.StandardCharsets;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.Optional;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cm.merombe.backend.entity.Billet;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.repository.BilletRepository;

/**
 * Emission et controle des titres de transport.
 * Le QR code porte un contenu signe : le recopier est possible,
 * en fabriquer un nouveau ne l'est pas sans la clef du serveur.
 */
@Service
public class BilletService {

    private static final String ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    private final SecureRandom aleatoire = new SecureRandom();
    private final BilletRepository billets;
    private final String secret;

    public BilletService(BilletRepository billets,
                         @Value("${merombe.jwt.secret}") String secret) {
        this.billets = billets;
        this.secret = secret;
    }

    /**
     * Cree le billet d'une reservation confirmee. Idempotent :
     * rappeler la methode ne cree pas un second billet.
     */
    @Transactional
    public Billet emettre(Reservation reservation) {
        if (!"confirmee".equals(reservation.getStatut())) {
            throw new IllegalStateException("la reservation n'est pas confirmee");
        }
        Optional<Billet> existant = billets.findByReservationId(reservation.getId());
        if (existant.isPresent()) {
            return existant.get();
        }

        String code = genererCode();
        String contenu = "MRB|" + reservation.getId() + "|" + code
                + "|" + reservation.getDepart().getId()
                + "|" + reservation.getNbPlaces();
        String signe = contenu + "|" + signer(contenu);

        return billets.save(new Billet(reservation, code, signe));
    }

    /**
     * Verifie qu'un contenu de QR code a bien ete emis par nous
     * et n'a pas ete modifie.
     */
    public boolean signatureValide(String qrSigne) {
        int separateur = qrSigne.lastIndexOf('|');
        if (separateur < 0) {
            return false;
        }
        String contenu = qrSigne.substring(0, separateur);
        String signature = qrSigne.substring(separateur + 1);
        return signer(contenu).equals(signature);
    }

    /** Code lisible : 8 caracteres sans O/0 ni I/1, ambigus a l'oeil. */
    private String genererCode() {
        StringBuilder sb = new StringBuilder("MRB-");
        for (int i = 0; i < 8; i++) {
            sb.append(ALPHABET.charAt(aleatoire.nextInt(ALPHABET.length())));
        }
        return sb.toString();
    }

    /** Signature HMAC-SHA256 : impossible a produire sans le secret. */
    private String signer(String contenu) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] brut = mac.doFinal(contenu.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(brut);
        } catch (Exception e) {
            throw new IllegalStateException("signature impossible", e);
        }
    }
}