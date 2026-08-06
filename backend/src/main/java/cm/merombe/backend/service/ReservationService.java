package cm.merombe.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cm.merombe.backend.entity.Depart;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.entity.Utilisateur;
import cm.merombe.backend.repository.DepartRepository;
import cm.merombe.backend.repository.ReservationRepository;

@Service
public class ReservationService {

    // duree pendant laquelle les places restent bloquees en attente de paiement
    public static final int DELAI_PAIEMENT_MINUTES = 10;

    private final DepartRepository departs;
    private final ReservationRepository reservations;

    public ReservationService(DepartRepository departs, ReservationRepository reservations) {
        this.departs = departs;
        this.reservations = reservations;
    }

    /**
     * Bloque des places sur un depart. La ligne du depart est verrouillee
     * le temps de la transaction : aucune survente n'est possible.
     */
    @Transactional
    public Reservation reserver(Utilisateur voyageur, Integer departId, Integer nbPlaces) {

        if (nbPlaces == null || nbPlaces < 1) {
            throw new IllegalArgumentException("nombre de places invalide");
        }

        Depart depart = departs.trouverEtVerrouiller(departId)
                .orElseThrow(() -> new IllegalArgumentException("depart inconnu"));

        if (!"prevu".equals(depart.getStatut())) {
            throw new IllegalArgumentException("ce depart n'est plus reservable");
        }
        if (depart.getPlacesDispo() < nbPlaces) {
            throw new IllegalArgumentException(
                    "places insuffisantes : " + depart.getPlacesDispo() + " restante(s)");
        }

        // decrement sous verrou : c'est ici que la regle 7.3 est tenue
        depart.setPlacesDispo(depart.getPlacesDispo() - nbPlaces);

        int montant = depart.getHoraire().getTarif() * nbPlaces;
        return reservations.save(new Reservation(depart, voyageur, nbPlaces, montant));
    }

    /**
     * Relache les places des reservations non payees dans le delai.
     */
    @Scheduled(fixedDelay = 60_000)   // toutes les minutes
    @Transactional
    public int libererExpirees() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(DELAI_PAIEMENT_MINUTES);
        List<Reservation> expirees = reservations.trouverExpirees(limite);

        for (Reservation r : expirees) {
            Depart depart = departs.trouverEtVerrouiller(r.getDepart().getId()).orElse(null);
            if (depart != null) {
                depart.setPlacesDispo(depart.getPlacesDispo() + r.getNbPlaces());
            }
            r.setStatut("echouee");
        }

        if (!expirees.isEmpty()) {
            System.out.println(">>> Places relachees : " + expirees.size() + " reservation(s)");
        }
        return expirees.size();
    }
}