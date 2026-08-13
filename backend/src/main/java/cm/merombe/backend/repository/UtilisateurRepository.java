package cm.merombe.backend.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.entity.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, Integer> {
    @Query("SELECT u FROM Utilisateur u LEFT JOIN FETCH u.agence WHERE u.id = :id")
    Optional<Utilisateur> trouverAvecAgence(@Param("id") Integer id);
    Optional<Utilisateur> findByTelephone(String telephone);
    List<Utilisateur> findByRole(String role);
    List<Utilisateur> findByAgenceIdOrderByRoleAscNomAsc(Integer agenceId);
}