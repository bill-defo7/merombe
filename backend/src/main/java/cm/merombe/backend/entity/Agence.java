package cm.merombe.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "agence")
public class Agence {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "ville_id", nullable = false)
    private Ville ville;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(length = 100)
    private String contact;

    // 'en_attente', 'active' ou 'suspendue' (voir le CHECK dans merombe.sql)
    @Column(nullable = false, length = 20)
    private String statut;

    @Column(name = "logo_url", length = 300)
    private String logoUrl;

    @Column(name = "photo_url", length = 300)
    private String photoUrl;

    @Column(columnDefinition = "TEXT")
    private String description;

    private java.math.BigDecimal note;

    public Agence(Ville ville, String nom, String contact, String description) {
        this.ville = ville;
        this.nom = nom;
        this.contact = contact;
        this.description = description;
        this.statut = "en_attente";
    }

    protected Agence() {
    }

    public Integer getId() { return id; }
    public Ville getVille() { return ville; }
    public void setVille(Ville ville) { this.ville = ville; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getContact() { return contact; }
    public void setContact(String contact) { this.contact = contact; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public String getLogoUrl() { return logoUrl; }
    public String getPhotoUrl() { return photoUrl; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public java.math.BigDecimal getNote() { return note; }
    public void setLogoUrl(String logoUrl) { this.logoUrl = logoUrl; }
    public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
}