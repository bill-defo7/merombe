package cm.merombe.backend.controller;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cm.merombe.backend.dto.DepartRechercheDto;
import cm.merombe.backend.repository.DepartRepository;

@RestController
@RequestMapping("/api/recherche")
public class RechercheController {

    private final DepartRepository departs;

    public RechercheController(DepartRepository departs) {
        this.departs = departs;
    }

    @GetMapping("/departs")
    public ResponseEntity<?> rechercher(
            @RequestParam Integer villeDepart,
            @RequestParam Integer villeArrivee,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "1") Integer places) {

        if (villeDepart.equals(villeArrivee)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "depart et arrivee identiques"));
        }
        if (places < 1) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "nombre de places invalide"));
        }
        if (date.isBefore(LocalDate.now())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "date dans le passe"));
        }

        List<DepartRechercheDto> resultats =
                departs.rechercher(villeDepart, villeArrivee, date, places);

        return ResponseEntity.ok(Map.of(
                "nombre", resultats.size(),
                "departs", resultats));
    }
}