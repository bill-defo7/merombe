package cm.merombe.backend.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public record ReservationDto(
        Integer id,
        Integer departId,
        LocalDate dateDepart,
        LocalTime heure,
        String agence,
        String villeDepart,
        String villeArrivee,
        Integer nbPlaces,
        Integer montant,
        String statut,
        LocalDateTime creeLe) {
}