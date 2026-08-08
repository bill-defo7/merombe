package cm.merombe.backend.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.PassagerDto;
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

    // liste des passagers d'un depart, pour l'agence
    @Query("""
            SELECT new cm.merombe.backend.dto.PassagerDto(
                r.id, u.nom, u.telephone, r.nbPlaces, r.montant, r.statut, r.creeLe)
            FROM Reservation r
            JOIN r.voyageur u
            WHERE r.depart.id = :departId
              AND r.statut IN ('en_attente', 'confirmee')
            ORDER BY r.creeLe
            """)
    List<PassagerDto> listerPassagers(@Param("departId") Integer departId);

    // chiffres du tableau de bord, sur les reservations payees uniquement
    @Query("""
            SELECT COALESCE(SUM(r.montant), 0), COALESCE(SUM(r.nbPlaces), 0), COUNT(r)
            FROM Reservation r
            JOIN r.depart d
            JOIN d.horaire h
            JOIN h.liaison l
            WHERE l.localDepart.agence.id = :agenceId
              AND r.statut = 'confirmee'
            """)
    List<Object[]> chiffresAgence(@Param("agenceId") Integer agenceId);
}