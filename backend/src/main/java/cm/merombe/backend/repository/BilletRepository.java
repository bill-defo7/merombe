package cm.merombe.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cm.merombe.backend.entity.Billet;

public interface BilletRepository extends JpaRepository<Billet, Integer> {

    Optional<Billet> findByCode(String code);

    Optional<Billet> findByReservationId(Integer reservationId);

    boolean existsByReservationId(Integer reservationId);
}