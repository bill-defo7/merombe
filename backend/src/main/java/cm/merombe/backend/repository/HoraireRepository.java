package cm.merombe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cm.merombe.backend.entity.Horaire;

public interface HoraireRepository extends JpaRepository<Horaire, Integer> {
    List<Horaire> findByLiaisonId(Integer liaisonId);
}