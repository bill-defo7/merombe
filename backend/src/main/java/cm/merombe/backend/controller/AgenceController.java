package cm.merombe.backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cm.merombe.backend.dto.AgenceDto;
import cm.merombe.backend.repository.AgenceRepository;

@RestController
@RequestMapping("/api/agences")
public class AgenceController {

    private final AgenceRepository agences;

    public AgenceController(AgenceRepository agences) {
        this.agences = agences;
    }

    // seules les agences actives sont visibles du voyageur
    @GetMapping
    public List<AgenceDto> listerActives() {
        return agences.listerParStatut("active");
    }

    @GetMapping("/{id}")
    public ResponseEntity<AgenceDto> parIdentifiant(@PathVariable Integer id) {
        return agences.trouverDtoParId(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}