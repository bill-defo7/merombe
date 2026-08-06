package cm.merombe.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.DepartRechercheDto;
import cm.merombe.backend.entity.Depart;

public interface DepartRepository extends JpaRepository<Depart, Integer> {

    // sert a la generation automatique : ne pas creer deux fois le meme depart
    boolean existsByHoraireIdAndDateDepart(Integer horaireId, LocalDate dateDepart);

    List<Depart> findByDateDepart(LocalDate dateDepart);

    // recherche du voyageur : departs disponibles sur un trajet a une date donnee
    @Query("""
            SELECT new cm.merombe.backend.dto.DepartRechercheDto(
                d.id, d.dateDepart, h.heure, h.heureGarantie,
                a.nom, ld.quartier, vd.nom, va.nom,
                h.tarif, d.placesDispo, l.dureeEstimee)
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
}