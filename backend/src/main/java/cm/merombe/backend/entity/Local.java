package cm.merombe.backend.entity;

import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.locationtech.jts.geom.Point;

import jakarta.persistence.*;

@Entity
@Table(name = "local")
public class Local {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "agence_id", nullable = false)
    private Agence agence;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ville_id", nullable = false)
    private Ville ville;

    @Column(length = 120)
    private String quartier;

    @Column(length = 200)
    private String adresse;

    @Column(length = 20)
    private String telephone;

    // GEOGRAPHY et non GEOMETRY : les distances sortent en metres
    // sur la sphere terrestre, pas sur un plan
    @JdbcTypeCode(SqlTypes.GEOGRAPHY)
    @Column(nullable = false)
    private Point position;

    public Local(Agence agence, Ville ville, String quartier, String adresse,
                 String telephone, Point position) {
        this.agence = agence;
        this.ville = ville;
        this.quartier = quartier;
        this.adresse = adresse;
        this.telephone = telephone;
        this.position = position;
    }

    protected Local() {
    }

    public Integer getId() { return id; }
    public Agence getAgence() { return agence; }
    public void setAgence(Agence agence) { this.agence = agence; }
    public Ville getVille() { return ville; }
    public void setVille(Ville ville) { this.ville = ville; }
    public String getQuartier() { return quartier; }
    public void setQuartier(String quartier) { this.quartier = quartier; }
    public Point getPosition() { return position; }
    public void setPosition(Point position) { this.position = position; }
    public String getAdresse() { return adresse; }
    public String getTelephone() { return telephone; }
}