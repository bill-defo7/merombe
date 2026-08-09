package cm.merombe.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "paiement")
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false)
    private Reservation reservation;

    @Column(nullable = false)
    private Integer montant;

    // 'mtn_momo' ou 'orange_money' (voir le CHECK dans merombe.sql)
    @Column(nullable = false, length = 20)
    private String moyen;

    // reference retournee par l'agregateur, sert au rapprochement
    @Column(length = 100)
    private String reference;

    // 'en_attente', 'reussi' ou 'echoue'
    @Column(nullable = false, length = 20)
    private String statut = "en_attente";

    @Column(name = "cree_le", nullable = false)
    private LocalDateTime creeLe = LocalDateTime.now();

    protected Paiement() {
    }

    public Paiement(Reservation reservation, Integer montant, String moyen) {
        this.reservation = reservation;
        this.montant = montant;
        this.moyen = moyen;
    }

    public Integer getId() { return id; }
    public Reservation getReservation() { return reservation; }
    public Integer getMontant() { return montant; }
    public String getMoyen() { return moyen; }
    public String getReference() { return reference; }
    public void setReference(String reference) { this.reference = reference; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
    public LocalDateTime getCreeLe() { return creeLe; }
}