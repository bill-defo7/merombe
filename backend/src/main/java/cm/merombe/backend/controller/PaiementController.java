package cm.merombe.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.entity.Paiement;
import cm.merombe.backend.paiement.EtatPaiement;
import cm.merombe.backend.service.ContexteUtilisateur;
import cm.merombe.backend.service.PaiementService;

@RestController
@RequestMapping("/api/paiements")
public class PaiementController {

    private final PaiementService service;
    private final ContexteUtilisateur contexte;

    public PaiementController(PaiementService service, ContexteUtilisateur contexte) {
        this.service = service;
        this.contexte = contexte;
    }

    @PostMapping
    public ResponseEntity<?> payer(@RequestBody Map<String, Object> corps) {
        try {
            Integer reservationId = (Integer) corps.get("reservationId");
            String moyen = (String) corps.get("moyen");

            // le paiement part du numero du voyageur connecte
            String telephone = contexte.utilisateurCourant().getTelephone();

            Paiement p = service.lancer(reservationId, telephone, moyen);

            if ("echoue".equals(p.getStatut())) {
                return ResponseEntity.badRequest()
                        .body(Map.of("erreur", "l'agregateur a refuse la demande"));
            }
            return ResponseEntity.ok(Map.of(
                    "paiementId", p.getId(),
                    "reference", p.getReference(),
                    "montant", p.getMontant(),
                    "statut", p.getStatut(),
                    "message", "Confirmez le paiement sur votre telephone"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }

    /**
     * Rappel de l'agregateur. Route publique : c'est un serveur
     * exterieur qui l'appelle, il n'a pas de jeton.
     * En production, il faudra verifier une signature.
     */
    @PostMapping("/rappel")
    public ResponseEntity<?> rappel(@RequestBody Map<String, String> corps) {
        try {
            String reference = corps.get("reference");
            String etat = corps.get("etat");
            service.appliquerResultat(reference, EtatPaiement.valueOf(etat.toUpperCase()));
            return ResponseEntity.ok(Map.of("recu", true));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }
}