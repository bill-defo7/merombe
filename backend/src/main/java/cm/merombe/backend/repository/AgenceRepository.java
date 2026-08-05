package cm.merombe.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import cm.merombe.backend.entity.Agence;

public interface AgenceRepository extends JpaRepository<Agence, Integer> {
    List<Agence> findByStatut(String statut);
}