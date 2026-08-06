package cm.merombe.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "reservation")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "depart_id", nullable = false)
    private Depart depart;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "voyageur_id", nullable = false)
    private Utilisateur voyageur;

    @Column(name = "nb_places", nullable = false)
    private Integer nbPlaces;

    @Column(nullable = false)
    private Integer montant;   // total en FCFA

    // 'en_attente', 'confirmee', 'echouee' ou 'annulee'
    @Column(nullable = false, length = 20)
    private String statut = "en_attente";

    @Column(name = "cree_le", nullable = false)
    private LocalDateTime creeLe = LocalDateTime.now();

    protected Reservation() {
    }

    public Reservation(Depart depart, Utilisateur voyageur, Integer nbPlaces, Integer montant) {
        this.depart = depart;
        this.voyageur = voyageur;
        this.nbPlaces = nbPlaces;
        this.montant = montant;
    }

    public Integer getId() { return id; }
    public Depart getDepart() { return depart; }
    public Utilisateur getVoyageur() { return voyageur; }
    public Integer getNbPlaces() { return nbPlaces; }
    public Integer getMontant() { return montant; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getCreeLe() { return creeLe; }
}