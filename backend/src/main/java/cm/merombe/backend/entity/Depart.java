package cm.merombe.backend.entity;

import java.time.LocalDate;

import jakarta.persistence.*;

@Entity
@Table(name = "depart")
public class Depart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "horaire_id", nullable = false)
    private Horaire horaire;

    @Column(name = "date_depart", nullable = false)
    private LocalDate dateDepart;

    // mis a jour a chaque reservation confirmee
    @Column(name = "places_dispo", nullable = false)
    private Integer placesDispo;

    // 'prevu', 'annule' ou 'parti'
    @Column(nullable = false, length = 20)
    private String statut = "prevu";

    protected Depart() {
    }

    public Depart(Horaire horaire, LocalDate dateDepart, Integer placesDispo) {
        this.horaire = horaire;
        this.dateDepart = dateDepart;
        this.placesDispo = placesDispo;
    }

    public Integer getId() { return id; }
    public Horaire getHoraire() { return horaire; }
    public void setHoraire(Horaire horaire) { this.horaire = horaire; }
    public LocalDate getDateDepart() { return dateDepart; }
    public void setDateDepart(LocalDate dateDepart) { this.dateDepart = dateDepart; }
    public Integer getPlacesDispo() { return placesDispo; }
    public void setPlacesDispo(Integer placesDispo) { this.placesDispo = placesDispo; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}