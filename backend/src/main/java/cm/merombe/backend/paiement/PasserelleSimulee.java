package cm.merombe.backend.paiement;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * Passerelle de developpement. Aucun argent ne circule.
 * Le numero de telephone decide du comportement, ce qui permet
 * de tester les cas difficiles de l'etape 6.2 :
 *   - se terminant par 00 : echec immediat
 *   - se terminant par 99 : aucune reponse (reste en attente)
 *   - tout le reste       : succes apres confirmation
 */
@Component
// @Profile("!production")  // desactive temporairement : simulation active aussi en production
public class PasserelleSimulee implements PasserellePaiement {

    private final Map<String, EtatPaiement> transactions = new ConcurrentHashMap<>();

    @Override
    public ResultatPaiement encaisser(String telephone, int montant, String description) {
        if (telephone == null || telephone.isBlank()) {
            return ResultatPaiement.refuse("numero de telephone manquant");
        }
        if (montant <= 0) {
            return ResultatPaiement.refuse("montant invalide");
        }

        String reference = "SIM-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        EtatPaiement etatFinal;
        if (telephone.endsWith("00")) {
            etatFinal = EtatPaiement.ECHOUE;
        } else if (telephone.endsWith("99")) {
            etatFinal = EtatPaiement.EN_ATTENTE;   // ne repondra jamais
        } else {
            etatFinal = EtatPaiement.REUSSI;
        }
        transactions.put(reference, etatFinal);

        System.out.println(">>> [SIMULATION] Encaissement " + montant + " FCFA sur "
                + telephone + " -> " + reference + " (" + etatFinal + ")");
        return ResultatPaiement.accepte(reference);
    }

    @Override
    public EtatPaiement verifier(String reference) {
        return transactions.getOrDefault(reference, EtatPaiement.A_VERIFIER);
    }

    @Override
    public String nom() {
        return "simulation";
    }
}