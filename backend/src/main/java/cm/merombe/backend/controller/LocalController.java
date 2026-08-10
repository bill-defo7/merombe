package cm.merombe.backend.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cm.merombe.backend.repository.LocalRepository;

@RestController
@RequestMapping("/api/locaux")
public class LocalController {

    private final LocalRepository locaux;

    public LocalController(LocalRepository locaux) {
        this.locaux = locaux;
    }

    @GetMapping("/proches")
    public ResponseEntity<?> proches(@RequestParam double latitude,
                                     @RequestParam double longitude,
                                     @RequestParam(defaultValue = "10000") double rayon) {

        if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "coordonnees hors limites"));
        }

        List<Map<String, Object>> resultats = locaux
                .trouverProches(longitude, latitude, rayon)
                .stream()
                .map(ligne -> Map.of(
                        "id", ligne[0],
                        "quartier", ligne[1],
                        "agence", ligne[2],
                        "ville", ligne[3],
                        "distanceMetres", ligne[4],
                        "latitude", ligne[5],
                        "longitude", ligne[6]))
                .toList();

        return ResponseEntity.ok(resultats);
    }
}