package cm.merombe.backend.dto;

public record NouvelleAgence(
        String nom,
        Integer villeId,
        String contact,
        String description,
        String nomResponsable,
        String telephoneResponsable) {
}