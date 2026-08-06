package cm.merombe.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.entity.Reservation;

public interface ReservationRepository extends JpaRepository<Reservation, Integer> {

    List<Reservation> findByVoyageurIdOrderByCreeLeDesc(Integer voyageurId);

    // reservations non payees dont le delai est ecoule
    @Query("""
            SELECT r FROM Reservation r
            WHERE r.statut = 'en_attente'
              AND r.creeLe < :limite
            """)
    List<Reservation> trouverExpirees(@Param("limite") LocalDateTime limite);
}