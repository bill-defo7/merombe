package cm.merombe.backend.controller;

import java.util.List;
import java.util.Map;

import org.locationtech.jts.geom.GeometryFactory;
import org.locationtech.jts.geom.PrecisionModel;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.dto.AgenceDto;
import cm.merombe.backend.dto.NouvelleAgence;
import cm.merombe.backend.entity.Agence;
import cm.merombe.backend.entity.Utilisateur;
import cm.merombe.backend.entity.Ville;
import cm.merombe.backend.repository.AgenceRepository;
import cm.merombe.backend.repository.UtilisateurRepository;
import cm.merombe.backend.repository.VilleRepository;
import cm.merombe.backend.util.Telephone;

@RestController
@RequestMapping("/api/agences")
public class AgenceController {

    private final AgenceRepository agences;
    private final VilleRepository villes;
    private final UtilisateurRepository utilisateurs;

    public AgenceController(AgenceRepository agences,
                            VilleRepository villes,
                            UtilisateurRepository utilisateurs) {
        this.agences = agences;
        this.villes = villes;
        this.utilisateurs = utilisateurs;
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

    /**
     * Inscription publique d'une nouvelle agence partenaire.
     * Cree l'agence en 'en_attente' et le compte responsable associe.
     * L'admin doit ensuite activer l'agence pour que le responsable
     * puisse utiliser son espace.
     */
    @PostMapping
    @Transactional
    public ResponseEntity<?> inscrire(@RequestBody NouvelleAgence demande) {
        if (demande.nom() == null || demande.nom().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "nom de l'agence requis"));
        }
        if (demande.villeId() == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "ville requise"));
        }
        if (demande.nomResponsable() == null || demande.nomResponsable().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "nom du responsable requis"));
        }
        if (demande.telephoneResponsable() == null || demande.telephoneResponsable().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "telephone du responsable requis"));
        }

        Ville ville = villes.findById(demande.villeId()).orElse(null);
        if (ville == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "ville inconnue"));
        }

        String telephoneResponsable;
        try {
            telephoneResponsable = Telephone.normaliser(demande.telephoneResponsable());
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("erreur", e.getMessage()));
        }

        if (utilisateurs.findByTelephone(telephoneResponsable).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "ce telephone est deja utilise"));
        }

        Agence agence = agences.save(
                new Agence(ville, demande.nom(), demande.contact(), demande.description()));

        Utilisateur responsable = new Utilisateur(telephoneResponsable);
        responsable.setNom(demande.nomResponsable());
        responsable.setRole("responsable");
        responsable.setAgence(agence);
        utilisateurs.save(responsable);

        return ResponseEntity.ok(Map.of(
                "agenceId", agence.getId(),
                "message", "Demande envoyee. Votre agence sera activee apres verification par l'equipe MeRoMbe."));
    }
}