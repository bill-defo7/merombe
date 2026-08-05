package cm.merombe.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "utilisateur")
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // null pour un voyageur, renseigne pour un guichetier ou un agent
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "agence_id")
    private Agence agence;

    @Column(nullable = false, length = 150)
    private String nom;

    // sert d'identifiant de connexion, unique en base
    @Column(nullable = false, length = 20, unique = true)
    private String telephone;

    // 'voyageur', 'guichetier', 'agent' ou 'admin'
    @Column(nullable = false, length = 20)
    private String role;

    protected Utilisateur() {
    }

    public Integer getId() { return id; }
    public Agence getAgence() { return agence; }
    public void setAgence(Agence agence) { this.agence = agence; }
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }
    public String getTelephone() { return telephone; }
    public void setTelephone(String telephone) { this.telephone = telephone; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}