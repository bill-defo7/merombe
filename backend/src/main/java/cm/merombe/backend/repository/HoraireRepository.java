package cm.merombe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.HoraireDto;
import cm.merombe.backend.entity.Horaire;

public interface HoraireRepository extends JpaRepository<Horaire, Integer> {

    List<Horaire> findByLiaisonId(Integer liaisonId);

    @Query("""
            SELECT new cm.merombe.backend.dto.HoraireDto(
                h.id, l.id, va.nom, h.heure, h.jours, h.places, h.tarif, h.heureGarantie)
            FROM Horaire h
            JOIN h.liaison l
            JOIN l.villeArrivee va
            WHERE l.localDepart.agence.id = :agenceId
            ORDER BY h.heure
            """)
    List<HoraireDto> listerDtoParAgence(@Param("agenceId") Integer agenceId);
}