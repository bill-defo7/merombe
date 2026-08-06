package cm.merombe.backend.dto;

import java.time.LocalTime;

public record NouvelHoraire(
        Integer liaisonId,
        LocalTime heure,
        String jours,
        Integer places,
        Integer tarif,
        Boolean heureGarantie) {
}