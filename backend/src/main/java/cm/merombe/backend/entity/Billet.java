package cm.merombe.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "billet")
public class Billet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    // une reservation ne donne qu'un seul billet (UNIQUE en base)
    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "reservation_id", nullable = false, unique = true)
    private Reservation reservation;

    // code lisible, saisi a la main si le scanner tombe en panne
    @Column(nullable = false, length = 30, unique = true)
    private String code;

    // contenu signe du QR code : infalsifiable sans la clef du serveur
    @Column(name = "qr_signe", nullable = false, columnDefinition = "TEXT")
    private String qrSigne;

    // 'valide', 'utilise' ou 'annule'
    @Column(nullable = false, length = 20)
    private String statut = "valide";

    protected Billet() {
    }

    public Billet(Reservation reservation, String code, String qrSigne) {
        this.reservation = reservation;
        this.code = code;
        this.qrSigne = qrSigne;
    }

    public Integer getId() { return id; }
    public Reservation getReservation() { return reservation; }
    public String getCode() { return code; }
    public String getQrSigne() { return qrSigne; }
    public String getStatut() { return statut; }
    public void setStatut(String statut) { this.statut = statut; }
}