package cm.merombe.backend.dto;

import java.time.LocalDate;
import java.time.LocalTime;

public record DepartAgenceDto(
        Integer departId,
        LocalDate dateDepart,
        LocalTime heure,
        String villeArrivee,
        Integer placesTotal,
        Integer placesDispo,
        Integer tarif,
        String statut) {

    // places effectivement cedees a la plateforme et deja prises
    public int placesVendues() {
        return placesTotal - placesDispo;
    }
}