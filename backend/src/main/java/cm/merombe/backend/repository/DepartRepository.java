package cm.merombe.backend.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import cm.merombe.backend.entity.Depart;

public interface DepartRepository extends JpaRepository<Depart, Integer> {

    // sert a la generation automatique : ne pas creer deux fois le meme depart
    boolean existsByHoraireIdAndDateDepart(Integer horaireId, LocalDate dateDepart);

    List<Depart> findByDateDepart(LocalDate dateDepart);
}