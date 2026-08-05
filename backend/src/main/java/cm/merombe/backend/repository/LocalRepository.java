package cm.merombe.backend.repository;

import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import cm.merombe.backend.entity.Local;

public interface LocalRepository extends JpaRepository<Local, Integer> {
    List<Local> findByQuartier(String quartier);
}