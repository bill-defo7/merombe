package cm.merombe.backend.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.dto.AgenceDto;
import cm.merombe.backend.entity.Agence;

public interface AgenceRepository extends JpaRepository<Agence, Integer> {

    List<Agence> findByStatut(String statut);

    // Une seule requete, avec jointure : la ville est chargee en meme temps
    @Query("""
            SELECT new cm.merombe.backend.dto.AgenceDto(
                a.id, a.nom, a.contact, a.statut, v.nom)
            FROM Agence a JOIN a.ville v
            WHERE a.statut = :statut
            """)
    List<AgenceDto> listerParStatut(@Param("statut") String statut);

    @Query("""
            SELECT new cm.merombe.backend.dto.AgenceDto(
                a.id, a.nom, a.contact, a.statut, v.nom)
            FROM Agence a JOIN a.ville v
            WHERE a.id = :id
            """)
    Optional<AgenceDto> trouverDtoParId(@Param("id") Integer id);
}