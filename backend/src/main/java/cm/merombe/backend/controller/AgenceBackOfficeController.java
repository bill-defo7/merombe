package cm.merombe.backend.controller;

import java.time.LocalDate;
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
    private final DepartRepository departs;
    private final ReservationRepository reservations;
    private final UtilisateurRepository utilisateurs;

    public AgenceBackOfficeController(ContexteUtilisateur contexte,
                                      LiaisonRepository liaisons,
                                      HoraireRepository horaires,
                                      LocalRepository locaux,
                                      VilleRepository villes,
                                      GenerationDeparts generation,
                                      DepartRepository departs,
                                      ReservationRepository reservations,
                                      UtilisateurRepository utilisateurs) {
        this.contexte = contexte;
        this.liaisons = liaisons;
        this.horaires = horaires;
        this.locaux = locaux;
        this.villes = villes;
        this.generation = generation;
        this.departs = departs;
        this.reservations = reservations;
        this.utilisateurs = utilisateurs;
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

    // --- Etape 3.4 : suivi des reservations et tableau de bord ---

    @GetMapping("/departs")
    public List<DepartAgenceDto> mesDeparts() {
        return departs.listerPourAgence(contexte.agenceCourante().getId(), LocalDate.now());
    }

    @GetMapping("/departs/{departId}/passagers")
    @Transactional
    public ResponseEntity<?> passagers(@PathVariable Integer departId) {
        Agence agence = contexte.agenceCourante();

        Depart depart = departs.findById(departId).orElse(null);
        if (depart == null) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "depart inconnu"));
        }
        // le depart doit appartenir a l'agence du guichetier
        Integer proprietaire = depart.getHoraire().getLiaison()
                .getLocalDepart().getAgence().getId();
        if (!proprietaire.equals(agence.getId())) {
            return ResponseEntity.status(403)
                    .body(Map.of("erreur", "ce depart n'appartient pas a votre agence"));
        }

        return ResponseEntity.ok(reservations.listerPassagers(departId));
    }

    @GetMapping("/tableau-de-bord")
    public Map<String, Object> tableauDeBord() {
        Agence agence = contexte.agenceCourante();
       // la requete renvoie une seule ligne de trois valeurs
        Object[] chiffres = reservations.chiffresAgence(agence.getId()).get(0);

        List<DepartAgenceDto> aVenir = departs.listerPourAgence(agence.getId(), LocalDate.now());
        int offertes = aVenir.stream().mapToInt(DepartAgenceDto::placesTotal).sum();
        int vendues = aVenir.stream().mapToInt(DepartAgenceDto::placesVendues).sum();

        return Map.of(
                "agence", agence.getNom(),
                "recettesFCFA", chiffres[0],
                "placesPayees", chiffres[1],
                "reservationsConfirmees", chiffres[2],
                "departsAVenir", aVenir.size(),
                "tauxRemplissage", offertes == 0 ? 0 : Math.round(vendues * 100.0 / offertes));
    }

    @GetMapping("/locaux")
    @Transactional
    public List<Map<String, Object>> mesLocaux() {
        Integer agenceId = contexte.agenceCourante().getId();
        return locaux.findAll().stream()
                .filter(l -> l.getAgence().getId().equals(agenceId))
                .map(l -> Map.<String, Object>of(
                        "id", l.getId(),
                        "quartier", l.getQuartier(),
                        "ville", l.getVille().getNom()))
                .toList();
    }

    // --- gestion du personnel (reserve au responsable) ---

    private void verifierResponsable() {
        String role = contexte.utilisateurCourant().getRole();
        if (!"responsable".equals(role) && !"admin".equals(role)) {
            throw new org.springframework.security.access.AccessDeniedException(
                    "Reserve au responsable de l'agence");
        }
    }

    @GetMapping("/personnel")
    public ResponseEntity<?> mesMembres() {
        verifierResponsable();
        Agence agence = contexte.agenceCourante();
        List<Map<String, Object>> membres = utilisateurs
                .findByAgenceIdOrderByRoleAscNomAsc(agence.getId()).stream()
                .map(u -> Map.<String, Object>of(
                        "id", u.getId(),
                        "nom", u.getNom(),
                        "telephone", u.getTelephone(),
                        "role", u.getRole()))
                .toList();
        return ResponseEntity.ok(membres);
    }

    @PostMapping("/personnel")
    @Transactional
    public ResponseEntity<?> creerMembre(@RequestBody NouveauMembre demande) {
        verifierResponsable();
        Agence agence = contexte.agenceCourante();

        if (demande.nom() == null || demande.nom().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "nom requis"));
        }
        if (demande.telephone() == null || demande.telephone().isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "telephone requis"));
        }
        if (!List.of("guichetier", "agent").contains(demande.role())) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "role invalide"));
        }
        if (utilisateurs.findByTelephone(demande.telephone()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "ce telephone est deja utilise"));
        }

        Utilisateur membre = new Utilisateur(demande.telephone());
        membre.setNom(demande.nom());
        membre.setRole(demande.role());
        membre.setAgence(agence);
        utilisateurs.save(membre);

        return ResponseEntity.ok(Map.of("id", membre.getId(), "message", "Membre ajoute"));
    }

    @DeleteMapping("/personnel/{id}")
    @Transactional
    public ResponseEntity<?> supprimerMembre(@PathVariable Integer id) {
        verifierResponsable();
        Agence agence = contexte.agenceCourante();

        Utilisateur membre = utilisateurs.findById(id).orElse(null);
        if (membre == null || membre.getAgence() == null
                || !membre.getAgence().getId().equals(agence.getId())) {
            return ResponseEntity.status(404).body(Map.of("erreur", "membre introuvable dans votre agence"));
        }
        if ("responsable".equals(membre.getRole())) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "impossible de supprimer un responsable"));
        }

        utilisateurs.delete(membre);
        return ResponseEntity.ok(Map.of("message", "Membre retire"));
    }
}