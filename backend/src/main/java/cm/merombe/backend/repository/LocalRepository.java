package cm.merombe.backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cm.merombe.backend.entity.Local;

public interface LocalRepository extends JpaRepository<Local, Integer> {

    List<Local> findByQuartier(String quartier);

    // Requete native : ST_Distance n'existe pas en JPQL.
    // Attention a l'ordre PostGIS : longitude d'abord, latitude ensuite.
    @Query(value = """
            SELECT l.id, l.quartier,
                   a.nom AS agence_nom,
                   v.nom AS ville_nom,
                   ROUND(ST_Distance(l.position,
                         ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography)) AS distance_m,
                   ST_Y(l.position::geometry) AS latitude,
                   ST_X(l.position::geometry) AS longitude
            FROM local l
            JOIN agence a ON a.id = l.agence_id
            JOIN ville  v ON v.id = l.ville_id
            WHERE a.statut = 'active'
              AND ST_DWithin(l.position,
                    ST_SetSRID(ST_MakePoint(:longitude, :latitude), 4326)::geography,
                    :rayonMetres)
            ORDER BY distance_m
            """, nativeQuery = true)
    List<Object[]> trouverProches(@Param("longitude") double longitude,
                                  @Param("latitude") double latitude,
                                  @Param("rayonMetres") double rayonMetres);
}