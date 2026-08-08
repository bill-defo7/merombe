package cm.merombe.backend.dto;

import java.time.LocalDateTime;

public record PassagerDto(
        Integer reservationId,
        String nom,
        String telephone,
        Integer nbPlaces,
        Integer montant,
        String statut,
        LocalDateTime creeLe) {
}