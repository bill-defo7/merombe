package cm.merombe.backend.controller;

import java.time.LocalTime;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.dto.*;
import cm.merombe.backend.entity.*;
import cm.merombe.backend.repository.*;
import cm.merombe.backend.service.ContexteUtilisateur;
import cm.merombe.backend.service.GenerationDeparts;
import jakarta.transaction.Transactional;

@RestController
@RequestMapping("/api/agence")
public class AgenceBackOfficeController {

    private final ContexteUtilisateur contexte;
    private final LiaisonRepository liaisons;
    private final HoraireRepository horaires;
    private final LocalRepository locaux;
    private final VilleRepository villes;
    private final GenerationDeparts generation;
    

    public AgenceBackOfficeController(ContexteUtilisateur contexte,
                                      LiaisonRepository liaisons,
                                      HoraireRepository horaires,
                                      LocalRepository locaux,
                                      VilleRepository villes,
                                      GenerationDeparts generation) {
        this.contexte = contexte;
        this.liaisons = liaisons;
        this.horaires = horaires;
        this.locaux = locaux;
        this.villes = villes;
        this.generation = generation;
    }

    @GetMapping("/liaisons")
    public List<LiaisonDto> mesLiaisons() {
        return liaisons.listerDtoParAgence(contexte.agenceCourante().getId());
    }

    @PostMapping("/liaisons")
    @Transactional
    public ResponseEntity<?> declarerLiaison(@RequestBody NouvelleLiaison demande) {
        Agence agence = contexte.agenceCourante();

        Local depart = locaux.findById(demande.localDepartId()).orElse(null);
        if (depart == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "local de depart inconnu"));
        }
        // le local doit appartenir a l'agence du guichetier
        if (!depart.getAgence().getId().equals(agence.getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("erreur", "ce local n'appartient pas a votre agence"));
        }

        Ville arrivee = villes.findById(demande.villeArriveeId()).orElse(null);
        if (arrivee == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "ville d'arrivee inconnue"));
        }
        if (depart.getVille().getId().equals(arrivee.getId())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("erreur", "depart et arrivee dans la meme ville"));
        }

        Liaison creee = liaisons.save(
                new Liaison(depart, arrivee, demande.dureeEstimee()));
        return ResponseEntity.ok(Map.of("id", creee.getId(), "message", "Liaison creee"));
    }

    @GetMapping("/horaires")
    public List<HoraireDto> mesHoraires() {
        return horaires.listerDtoParAgence(contexte.agenceCourante().getId());
    }

    @PostMapping("/horaires")
    @Transactional
    public ResponseEntity<?> declarerHoraire(@RequestBody NouvelHoraire demande) {
        Agence agence = contexte.agenceCourante();

        Liaison liaison = liaisons.findById(demande.liaisonId()).orElse(null);
        if (liaison == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "liaison inconnue"));
        }
        if (!liaison.getLocalDepart().getAgence().getId().equals(agence.getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("erreur", "cette liaison n'appartient pas a votre agence"));
        }
        if (demande.places() == null || demande.places() < 1) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "nombre de places invalide"));
        }
        if (demande.tarif() == null || demande.tarif() < 0) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "tarif invalide"));
        }

        LocalTime heure = demande.heure();
        String jours = demande.jours() == null ? "tous" : demande.jours();
        boolean garantie = demande.heureGarantie() == null || demande.heureGarantie();

        Horaire cree = horaires.save(new Horaire(
                liaison, heure, jours, demande.places(), demande.tarif(), garantie));
        return ResponseEntity.ok(Map.of("id", cree.getId(), "message", "Horaire cree"));
    }

    // declenchement manuel, utile en developpement et apres une declaration
    @PostMapping("/generer-departs")
    public ResponseEntity<?> genererDeparts() {
        contexte.agenceCourante();   // verifie que l'appelant est bien un guichetier actif
        int crees = generation.genererProchainsJours();
        return ResponseEntity.ok(Map.of("crees", crees));
    }
}