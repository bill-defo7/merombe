package cm.merombe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.entity.Liaison;

public interface LiaisonRepository extends JpaRepository<Liaison, Integer> {

    // toutes les liaisons d'une agence donnee
    @Query("SELECT l FROM Liaison l WHERE l.localDepart.agence.id = :agenceId")
    List<Liaison> listerParAgence(@Param("agenceId") Integer agenceId);

    List<Liaison> findByVilleArriveeId(Integer villeArriveeId);
}