package cm.merombe.backend.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.DepartAgenceDto;
import cm.merombe.backend.dto.DepartRechercheDto;
import cm.merombe.backend.entity.Depart;
import jakarta.persistence.LockModeType;

public interface DepartRepository extends JpaRepository<Depart, Integer> {

    // sert a la generation automatique : ne pas creer deux fois le meme depart
    boolean existsByHoraireIdAndDateDepart(Integer horaireId, LocalDate dateDepart);

    List<Depart> findByDateDepart(LocalDate dateDepart);

    // recherche du voyageur : departs disponibles sur un trajet a une date donnee
    @Query("""
            SELECT new cm.merombe.backend.dto.DepartRechercheDto(
                d.id, d.dateDepart, h.heure, h.heureGarantie,
                a.id, a.nom, a.logoUrl, a.note,
                ld.quartier, ld.adresse, vd.nom, va.nom,
                h.tarif, d.placesDispo, l.dureeEstimee,
                h.categorie, h.climatise, h.wifi, h.priseUsb, h.photoBus)
            FROM Depart d
            JOIN d.horaire h
            JOIN h.liaison l
            JOIN l.localDepart ld
            JOIN ld.agence a
            JOIN ld.ville vd
            JOIN l.villeArrivee va
            WHERE vd.id = :villeDepartId
              AND va.id = :villeArriveeId
              AND d.dateDepart = :date
              AND d.statut = 'prevu'
              AND a.statut = 'active'
              AND d.placesDispo >= :nbPlaces
            ORDER BY h.heure
            """)
    List<DepartRechercheDto> rechercher(@Param("villeDepartId") Integer villeDepartId,
                                        @Param("villeArriveeId") Integer villeArriveeId,
                                        @Param("date") LocalDate date,
                                        @Param("nbPlaces") Integer nbPlaces);

    // SELECT ... FOR UPDATE : bloque la ligne jusqu'a la fin de la transaction.
    // C'est ce qui empeche deux voyageurs de vendre la meme derniere place.
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM Depart d WHERE d.id = :id")
    Optional<Depart> trouverEtVerrouiller(@Param("id") Integer id);

    // departs a venir de l'agence, avec les places offertes et restantes
    @Query("""
            SELECT new cm.merombe.backend.dto.DepartAgenceDto(
                d.id, d.dateDepart, h.heure, va.nom,
                h.places, d.placesDispo, h.tarif, d.statut)
            FROM Depart d
            JOIN d.horaire h
            JOIN h.liaison l
            JOIN l.localDepart ld
            JOIN l.villeArrivee va
            WHERE ld.agence.id = :agenceId
              AND d.dateDepart >= :depuis
            ORDER BY d.dateDepart, h.heure
            """)
    List<DepartAgenceDto> listerPourAgence(@Param("agenceId") Integer agenceId,
                                           @Param("depuis") LocalDate depuis);
}