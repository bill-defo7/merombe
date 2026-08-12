package cm.merombe.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.entity.Billet;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.repository.BilletRepository;
import cm.merombe.backend.repository.ReservationRepository;
import cm.merombe.backend.service.BilletService;
import cm.merombe.backend.service.ContexteUtilisateur;

@RestController
@RequestMapping("/api/billets")
public class BilletController {

    private final BilletRepository billets;
    private final ReservationRepository reservations;
    private final BilletService service;
    private final ContexteUtilisateur contexte;

    public BilletController(BilletRepository billets,
                            ReservationRepository reservations,
                            BilletService service,
                            ContexteUtilisateur contexte) {
        this.billets = billets;
        this.reservations = reservations;
        this.service = service;
        this.contexte = contexte;
    }

    /** Les billets du voyageur connecte. */
    @GetMapping("/mes-billets")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> mesBillets() {
        Integer voyageurId = contexte.utilisateurCourant().getId();

        return reservations.findByVoyageurIdOrderByCreeLeDesc(voyageurId).stream()
                .filter(r -> "confirmee".equals(r.getStatut()))
                .map(r -> billets.findByReservationId(r.getId()).orElse(null))
                .filter(b -> b != null)
                .map(this::decrire)
                .toList();
    }

    /** Controle a l'embarquement : reserve aux agents. */
    @PostMapping("/controler")
    @Transactional
    public ResponseEntity<?> controler(@RequestBody Map<String, String> corps) {
        String qrSigne = corps.get("qr");
        String code = corps.get("code");

        Billet billet;

        if (qrSigne != null && !qrSigne.isBlank()) {
            if (!service.signatureValide(qrSigne)) {
                return ResponseEntity.status(403)
                        .body(Map.of("valide", false, "motif", "signature invalide — billet contrefait"));
            }
            // le code est le troisieme champ du contenu signe
            String[] champs = qrSigne.split("\\|");
            billet = billets.findByCode(champs[2]).orElse(null);
        } else if (code != null && !code.isBlank()) {
            billet = billets.findByCode(code.trim().toUpperCase()).orElse(null);
        } else {
            return ResponseEntity.badRequest().body(Map.of("erreur", "qr ou code manquant"));
        }

        if (billet == null) {
            return ResponseEntity.status(404)
                    .body(Map.of("valide", false, "motif", "billet inconnu"));
        }
        if ("utilise".equals(billet.getStatut())) {
            return ResponseEntity.status(409)
                    .body(Map.of("valide", false, "motif", "billet deja utilise"));
        }
        if (!"valide".equals(billet.getStatut())) {
            return ResponseEntity.status(409)
                    .body(Map.of("valide", false, "motif", "billet " + billet.getStatut()));
        }

        billet.setStatut("utilise");
        Map<String, Object> reponse = new java.util.HashMap<>(decrire(billet));
        reponse.put("valide", true);
        return ResponseEntity.ok(reponse);
    }

    private Map<String, Object> decrire(Billet b) {
        Reservation r = b.getReservation();
        var depart = r.getDepart();
        var horaire = depart.getHoraire();
        var liaison = horaire.getLiaison();
        var local = liaison.getLocalDepart();

        Map<String, Object> m = new java.util.HashMap<>();
        m.put("code", b.getCode());
        m.put("qr", b.getQrSigne());
        m.put("statut", b.getStatut());
        m.put("nbPlaces", r.getNbPlaces());
        m.put("montant", r.getMontant());
        m.put("tarifUnitaire", horaire.getTarif());
        m.put("dateDepart", depart.getDateDepart().toString());
        m.put("heure", horaire.getHeure().toString());
        m.put("heureGarantie", horaire.isHeureGarantie());
        m.put("destination", liaison.getVilleArrivee().getNom());
        m.put("villeDepart", local.getVille().getNom());
        m.put("quartierDepart", local.getQuartier());
        m.put("adresseDepart", local.getAdresse() == null ? "" : local.getAdresse());
        m.put("telephoneLocal", local.getTelephone() == null ? "" : local.getTelephone());
        m.put("agence", local.getAgence().getNom());
        m.put("contactAgence", local.getAgence().getContact() == null
                ? "" : local.getAgence().getContact());
        m.put("categorie", horaire.getCategorie());
        m.put("voyageur", r.getVoyageur().getNom());
        m.put("telephoneVoyageur", r.getVoyageur().getTelephone());
        m.put("reserveLe", r.getCreeLe().toString());
        m.put("dureeEstimee", liaison.getDureeEstimee() == null ? 0 : liaison.getDureeEstimee());
        return m;
    }
}