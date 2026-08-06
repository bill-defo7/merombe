package cm.merombe.backend.dto;

import java.time.LocalTime;

public record HoraireDto(
        Integer id,
        Integer liaisonId,
        String villeArrivee,
        LocalTime heure,
        String jours,
        Integer places,
        Integer tarif,
        boolean heureGarantie) {
}