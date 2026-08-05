package cm.merombe.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cm.merombe.backend.entity.Ville;
import cm.merombe.backend.repository.VilleRepository;

@RestController
@RequestMapping("/api/villes")
public class VilleController {

    private final VilleRepository villes;

    public VilleController(VilleRepository villes) {
        this.villes = villes;
    }

    @GetMapping
    public List<Ville> listerToutes() {
        return villes.findAll();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Ville> parIdentifiant(@PathVariable Integer id) {
        return villes.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}