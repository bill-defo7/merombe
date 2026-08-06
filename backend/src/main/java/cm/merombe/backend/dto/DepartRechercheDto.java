package cm.merombe.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

// Ce que le voyageur voit d'un depart disponible
public record DepartRechercheDto(
        Integer departId,
        LocalDate dateDepart,
        LocalTime heure,
        boolean heureGarantie,
        String agence,
        String quartierDepart,
        String villeDepart,
        String villeArrivee,
        Integer tarif,
        Integer placesDispo,
        Integer dureeEstimee) {
}