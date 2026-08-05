package cm.merombe.backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import cm.merombe.backend.entity.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    Optional<Utilisateur> findByTelephone(String telephone);
    List<Utilisateur> findByRole(String role);
}