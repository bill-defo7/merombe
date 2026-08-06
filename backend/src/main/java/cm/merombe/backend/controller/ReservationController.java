package cm.merombe.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.dto.NouvelleReservation;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.service.ContexteUtilisateur;
import cm.merombe.backend.service.ReservationService;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService service;
    private final ContexteUtilisateur contexte;

    public ReservationController(ReservationService service, ContexteUtilisateur contexte) {
        this.service = service;
        this.contexte = contexte;
    }

    @PostMapping
    public ResponseEntity<?> reserver(@RequestBody NouvelleReservation demande) {
        try {
            Reservation creee = service.reserver(
                    contexte.utilisateurCourant(),
                    demande.departId(),
                    demande.nbPlaces());

            return ResponseEntity.ok(Map.of(
                    "id", creee.getId(),
                    "montant", creee.getMontant(),
                    "statut", creee.getStatut(),
                    "delaiMinutes", ReservationService.DELAI_PAIEMENT_MINUTES,
                    "message", "Places bloquees, paiement attendu"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }
    }
}