package cm.merombe.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;

public record DepartRechercheDto(
        Integer departId,
        LocalDate dateDepart,
        LocalTime heure,
        boolean heureGarantie,
        Integer agenceId,
        String agence,
        String logoUrl,
        BigDecimal note,
        String quartierDepart,
        String adresseDepart,
        String villeDepart,
        String villeArrivee,
        Integer tarif,
        Integer placesDispo,
        Integer dureeEstimee,
        String categorie,
        boolean climatise,
        boolean wifi,
        boolean priseUsb,
        String photoBus) {
}