package cm.merombe.backend.dto;

public record NouveauLocal(
        Integer villeId,
        String quartier,
        String adresse,
        String telephone,
        Double latitude,
        Double longitude) {
}