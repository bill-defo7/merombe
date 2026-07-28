package cm.merombe.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cm.merombe.backend.entity.Ville;

public interface VilleRepository extends JpaRepository<Ville, Integer> {

    Optional<Ville> findByNom(String nom);

    List<Ville> findByRegion(String region);
}