package cm.merombe.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "liaison")
public class Liaison {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // d'ou part le bus : un local precis, donc geolocalise
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "local_depart_id", nullable = false)
    private Local localDepart;

    // ou il arrive : une ville, pas un local
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ville_arrivee_id", nullable = false)
    private Ville villeArrivee;

    @Column(name = "duree_estimee")
    private Integer dureeEstimee;   // en minutes

    protected Liaison() {
    }

    public Liaison(Local localDepart, Ville villeArrivee, Integer dureeEstimee) {
        this.localDepart = localDepart;
        this.villeArrivee = villeArrivee;
        this.dureeEstimee = dureeEstimee;
    }

    public Integer getId() { return id; }
    public Local getLocalDepart() { return localDepart; }
    public void setLocalDepart(Local localDepart) { this.localDepart = localDepart; }
    public Ville getVilleArrivee() { return villeArrivee; }
    public void setVilleArrivee(Ville villeArrivee) { this.villeArrivee = villeArrivee; }
    public Integer getDureeEstimee() { return dureeEstimee; }
    public void setDureeEstimee(Integer dureeEstimee) { this.dureeEstimee = dureeEstimee; }
}