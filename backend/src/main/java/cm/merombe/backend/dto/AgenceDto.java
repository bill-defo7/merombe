package cm.merombe.backend.dto;

// Ce que l'API expose d'une agence. Distinct de l'entite,
// qui reflete la structure de la base.
public record AgenceDto(
        Integer id,
        String nom,
        String contact,
        String statut,
        String ville) {
}