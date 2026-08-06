package cm.merombe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.LiaisonDto;
import cm.merombe.backend.entity.Liaison;

public interface LiaisonRepository extends JpaRepository<Liaison, Integer> {

    @Query("SELECT l FROM Liaison l WHERE l.localDepart.agence.id = :agenceId")
    List<Liaison> listerParAgence(@Param("agenceId") Integer agenceId);

    List<Liaison> findByVilleArriveeId(Integer villeArriveeId);

    @Query("""
            SELECT new cm.merombe.backend.dto.LiaisonDto(
                l.id, ld.id, ld.quartier, vd.nom, va.id, va.nom, l.dureeEstimee)
            FROM Liaison l
            JOIN l.localDepart ld
            JOIN ld.ville vd
            JOIN l.villeArrivee va
            WHERE ld.agence.id = :agenceId
            ORDER BY va.nom
            """)
    List<LiaisonDto> listerDtoParAgence(@Param("agenceId") Integer agenceId);
}