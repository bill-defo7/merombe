package cm.merombe.backend.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.entity.Paiement;

public interface PaiementRepository extends JpaRepository<Paiement, Integer> {

    Optional<Paiement> findByReference(String reference);

    List<Paiement> findByReservationIdOrderByCreeLeDesc(Integer reservationId);

    // paiements restes sans reponse : c'est eux qu'on ira reinterroger
    @Query("""
            SELECT p FROM Paiement p
            WHERE p.statut = 'en_attente'
              AND p.creeLe < :limite
              AND p.reference IS NOT NULL
            """)
    List<Paiement> trouverSansReponse(@Param("limite") LocalDateTime limite);

    // paiements qui attendent un arbitrage humain
    List<Paiement> findByStatutOrderByCreeLeDesc(String statut);
}