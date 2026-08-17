package cm.merombe.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.entity.Agence;
import cm.merombe.backend.entity.Paiement;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.paiement.EtatPaiement;
import cm.merombe.backend.repository.*;
import cm.merombe.backend.service.NotificationService;
import cm.merombe.backend.service.PaiementService;
import cm.merombe.backend.service.NotificationService;

/**
 * Supervision de la plateforme. Reserve au role admin
 * par la configuration de securite.
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AgenceRepository agences;
    private final PaiementRepository paiements;
    private final ReservationRepository reservations;
    private final UtilisateurRepository utilisateurs;
    private final DepartRepository departs;
    private final BilletRepository billets;
   private final PaiementService paiementService;
    private final NotificationService notifications;

    public AdminController(AgenceRepository agences,
                           PaiementRepository paiements,
                           ReservationRepository reservations,
                           UtilisateurRepository utilisateurs,
                           DepartRepository departs,
                           BilletRepository billets,
                           PaiementService paiementService,
                           NotificationService notifications) {
        this.agences = agences;
        this.paiements = paiements;
        this.reservations = reservations;
        this.utilisateurs = utilisateurs;
        this.departs = departs;
        this.billets = billets;
        this.paiementService = paiementService;
        this.notifications = notifications;
    }

    /** Chiffres generaux de la plateforme. */
    @GetMapping("/synthese")
    public Map<String, Object> synthese() {
        return Map.of(
                "agencesActives", agences.findByStatut("active").size(),
                "agencesEnAttente", agences.findByStatut("en_attente").size(),
                "voyageurs", utilisateurs.findByRole("voyageur").size(),
                "departsAVenir", departs.findAll().stream()
                        .filter(d -> !d.getDateDepart().isBefore(LocalDate.now()))
                        .count(),
                "billetsEmis", billets.count(),
                "paiementsALitiger", paiements.findByStatutOrderByCreeLeDesc("a_verifier").size());
    }

    /** Les agences qui attendent une validation. */
    @GetMapping("/agences")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> listerAgences(
            @RequestParam(defaultValue = "") String statut) {

        List<Agence> liste = statut.isBlank()
                ? agences.findAll()
                : agences.findByStatut(statut);

        return liste.stream().map(a -> Map.<String, Object>of(
                "id", a.getId(),
                "nom", a.getNom(),
                "contact", a.getContact() == null ? "" : a.getContact(),
                "ville", a.getVille().getNom(),
                "statut", a.getStatut(),
                "description", a.getDescription() == null ? "" : a.getDescription(),
                "logoUrl", a.getLogoUrl() == null ? "" : a.getLogoUrl(),
                "photoUrl", a.getPhotoUrl() == null ? "" : a.getPhotoUrl()))
                .toList();
    }

    /** Active, suspend ou remet en attente une agence. */
    @PostMapping("/agences/{id}/statut")
    @Transactional
    public ResponseEntity<?> changerStatut(@PathVariable Integer id,
                                           @RequestBody Map<String, String> corps) {
        String nouveau = corps.get("statut");
        if (!List.of("en_attente", "active", "suspendue").contains(nouveau)) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "statut inconnu"));
        }

        Agence agence = agences.findById(id).orElse(null);
        if (agence == null) {
            return ResponseEntity.status(404).body(Map.of("erreur", "agence inconnue"));
        }

        String ancien = agence.getStatut();
        agence.setStatut(nouveau);

        // notifie le responsable seulement si le statut change reellement
        if (!nouveau.equals(ancien)) {
            utilisateurs.findByAgenceIdAndRole(agence.getId(), "responsable")
                    .ifPresent(responsable -> {
                        if ("active".equals(nouveau)) {
                            notifications.notifierActivationAgence(agence, responsable);
                        } else if ("suspendue".equals(nouveau)) {
                            notifications.notifierSuspensionAgence(agence, responsable);
                        }
                    });
        }

        return ResponseEntity.ok(Map.of("id", id, "statut", nouveau));
    }

    /** Met a jour les liens des images d'une agence (logo, photo de couverture). */
    @PostMapping("/agences/{id}/photos")
    @Transactional
    public ResponseEntity<?> modifierPhotos(@PathVariable Integer id,
                                            @RequestBody Map<String, String> corps) {
        Agence agence = agences.findById(id).orElse(null);
        if (agence == null) {
            return ResponseEntity.status(404).body(Map.of("erreur", "agence inconnue"));
        }

        String logoUrl = corps.get("logoUrl");
        String photoUrl = corps.get("photoUrl");

        if (logoUrl != null) {
            agence.setLogoUrl(logoUrl.isBlank() ? null : logoUrl.trim());
        }
        if (photoUrl != null) {
            agence.setPhotoUrl(photoUrl.isBlank() ? null : photoUrl.trim());
        }

        return ResponseEntity.ok(Map.of("id", id, "message", "Photos mises a jour"));
    }

    /** Paiements sans reponse de l'agregateur, a rapprocher a la main. */
    @GetMapping("/paiements-litiges")
    @Transactional(readOnly = true)
    public List<Map<String, Object>> litiges() {
        return paiements.findByStatutOrderByCreeLeDesc("a_verifier").stream()
                .map(p -> {
                    Reservation r = p.getReservation();
                    return Map.<String, Object>of(
                            "paiementId", p.getId(),
                            "reference", p.getReference(),
                            "montant", p.getMontant(),
                            "moyen", p.getMoyen(),
                            "creeLe", p.getCreeLe().toString(),
                            "reservationId", r.getId(),
                            "voyageur", r.getVoyageur().getNom(),
                            "telephone", r.getVoyageur().getTelephone(),
                            "statutReservation", r.getStatut());
                })
                .toList();
    }

    /**
     * Tranche un litige apres verification aupres de l'agregateur.
     * REUSSI : le voyageur avait bien paye, on confirme et on emet le billet.
     * ECHOUE : aucun prelevement, la reservation reste annulee.
     */
    @PostMapping("/paiements-litiges/{reference}")
    @Transactional
    public ResponseEntity<?> trancher(@PathVariable String reference,
                                      @RequestBody Map<String, String> corps) {
        String decision = corps.get("decision");
        if (!List.of("REUSSI", "ECHOUE").contains(decision)) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "decision invalide"));
        }

        Paiement p = paiements.findByReference(reference).orElse(null);
        if (p == null) {
            return ResponseEntity.status(404).body(Map.of("erreur", "reference inconnue"));
        }
        if (!"a_verifier".equals(p.getStatut())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "ce paiement n'est plus en litige"));
        }

        // on repasse le paiement en attente pour que la machine a etats
        // puisse appliquer la decision normalement
        p.setStatut("en_attente");
        paiementService.appliquerResultat(reference, EtatPaiement.valueOf(decision));

        return ResponseEntity.ok(Map.of("reference", reference, "decision", decision));
    }
}