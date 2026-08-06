package cm.merombe.backend.dto;

public record LiaisonDto(
        Integer id,
        Integer localDepartId,
        String quartierDepart,
        String villeDepart,
        Integer villeArriveeId,
        String villeArrivee,
        Integer dureeEstimee) {
}