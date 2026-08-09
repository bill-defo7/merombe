package cm.merombe.backend.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cm.merombe.backend.entity.Billet;
import cm.merombe.backend.entity.Depart;
import cm.merombe.backend.entity.Paiement;
import cm.merombe.backend.entity.Reservation;
import cm.merombe.backend.paiement.EtatPaiement;
import cm.merombe.backend.paiement.PasserellePaiement;
import cm.merombe.backend.paiement.ResultatPaiement;
import cm.merombe.backend.repository.DepartRepository;
import cm.merombe.backend.repository.PaiementRepository;
import cm.merombe.backend.repository.ReservationRepository;

/**
 * Machine a etats du paiement (section 7.4 du cahier des charges).
 *
 * en_attente -> reussi  : la reservation est confirmee, le billet est emis
 * en_attente -> echoue  : les places sont relachees immediatement
 * sans reponse          : reinterrogation periodique, puis a_verifier
 */
@Service
public class PaiementService {

    // au-dela, on considere qu'un paiement sans reponse ne repondra plus
    private static final int DELAI_ABANDON_MINUTES = 15;

    private final PasserellePaiement passerelle;
    private final PaiementRepository paiements;
    private final ReservationRepository reservations;
    private final DepartRepository departs;
    private final BilletService billetService;

    public PaiementService(PasserellePaiement passerelle,
                           PaiementRepository paiements,
                           ReservationRepository reservations,
                           DepartRepository departs,
                           BilletService billetService) {
        this.passerelle = passerelle;
        this.paiements = paiements;
        this.reservations = reservations;
        this.departs = departs;
        this.billetService = billetService;
    }

    /**
     * Lance l'encaissement d'une reservation. Le client devra confirmer
     * sur son telephone : au retour, rien n'est encore encaisse.
     */
    @Transactional
    public Paiement lancer(Integer reservationId, String telephone, String moyen) {

        Reservation reservation = reservations.findById(reservationId)
                .orElseThrow(() -> new IllegalArgumentException("reservation inconnue"));

        if (!"en_attente".equals(reservation.getStatut())) {
            throw new IllegalArgumentException(
                    "cette reservation n'est plus payable (statut : " + reservation.getStatut() + ")");
        }
        if (!"mtn_momo".equals(moyen) && !"orange_money".equals(moyen)) {
            throw new IllegalArgumentException("moyen de paiement non supporte");
        }

        Paiement paiement = paiements.save(
                new Paiement(reservation, reservation.getMontant(), moyen));

        ResultatPaiement resultat = passerelle.encaisser(
                telephone, reservation.getMontant(),
                "MeRoMbe reservation " + reservation.getId());

        if (!resultat.accepte()) {
            paiement.setStatut("echoue");
            return paiement;
        }

        paiement.setReference(resultat.reference());
        return paiement;
    }

    /**
     * Applique le resultat d'un paiement. Appelee par le rappel de
     * l'agregateur (webhook) ou par la reinterrogation de secours.
     * Idempotente : un rappel recu deux fois ne produit rien la seconde fois.
     */
    @Transactional
    public void appliquerResultat(String reference, EtatPaiement etat) {

        Paiement paiement = paiements.findByReference(reference)
                .orElseThrow(() -> new IllegalArgumentException("reference inconnue"));

        if (!"en_attente".equals(paiement.getStatut())) {
            return;   // deja traite
        }

        switch (etat) {
            case REUSSI -> {
                paiement.setStatut("reussi");
                Reservation r = paiement.getReservation();
                if ("en_attente".equals(r.getStatut())) {
                    r.setStatut("confirmee");
                }
                Billet billet = billetService.emettre(r);
                System.out.println(">>> Paiement reussi : reservation "
                        + r.getId() + " confirmee — billet " + billet.getCode());
            }
            case ECHOUE -> {
                paiement.setStatut("echoue");
                relacherPlaces(paiement.getReservation());
                System.out.println(">>> Paiement echoue : places relachees");
            }
            case A_VERIFIER -> {
                // l'agregateur ne repond plus : on ignore si l'argent a ete
                // preleve. Ni confirmer ni annuler ne serait correct.
                paiement.setStatut("a_verifier");
                System.out.println(">>> Paiement a verifier : " + reference
                        + " — rapprochement manuel necessaire");
            }
            case EN_ATTENTE -> {
                // toujours sans reponse, on repassera
            }
        }
    }

    /**
     * Reinterroge l'agregateur pour les paiements restes sans reponse.
     * Filet de securite : un rappel peut se perdre.
     */
    @Scheduled(fixedDelay = 120_000)   // toutes les deux minutes
    @Transactional
    public void reinterrogerSansReponse() {
        LocalDateTime limite = LocalDateTime.now().minusMinutes(2);
        List<Paiement> enAttente = paiements.trouverSansReponse(limite);

        for (Paiement p : enAttente) {
            EtatPaiement etat = passerelle.verifier(p.getReference());

            boolean tropVieux = p.getCreeLe()
                    .isBefore(LocalDateTime.now().minusMinutes(DELAI_ABANDON_MINUTES));

            if (etat == EtatPaiement.EN_ATTENTE && tropVieux) {
                // l'agregateur ne repondra plus : on ne sait pas si l'argent
                // a ete preleve, il faut un rapprochement humain
                etat = EtatPaiement.A_VERIFIER;
            }
            if (etat != EtatPaiement.EN_ATTENTE) {
                appliquerResultat(p.getReference(), etat);
            }
        }
    }

    /** Rend les places au depart, sous verrou. */
    private void relacherPlaces(Reservation reservation) {
        if (!"en_attente".equals(reservation.getStatut())) {
            return;
        }
        reservation.setStatut("echouee");
        Depart depart = departs.trouverEtVerrouiller(reservation.getDepart().getId()).orElse(null);
        if (depart != null) {
            depart.setPlacesDispo(depart.getPlacesDispo() + reservation.getNbPlaces());
        }
    }
}