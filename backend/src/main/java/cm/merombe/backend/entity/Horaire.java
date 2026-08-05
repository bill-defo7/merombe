package cm.merombe.backend.entity;

import java.time.LocalTime;

import jakarta.persistence.*;

@Entity
@Table(name = "horaire")
public class Horaire {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "liaison_id", nullable = false)
    private Liaison liaison;

    @Column(nullable = false)
    private LocalTime heure;

    // 'tous' ou une liste : 'lun,mer,ven'
    @Column(nullable = false, length = 50)
    private String jours;

    // places cedees a la plateforme, pas la capacite du bus
    @Column(nullable = false)
    private Integer places;

    @Column(nullable = false)
    private Integer tarif;   // en FCFA

    // false = depart au remplissage, l'heure est indicative
    @Column(name = "heure_garantie", nullable = false)
    private boolean heureGarantie = true;

    protected Horaire() {
    }

    public Horaire(Liaison liaison, LocalTime heure, String jours,
                   Integer places, Integer tarif, boolean heureGarantie) {
        this.liaison = liaison;
        this.heure = heure;
        this.jours = jours;
        this.places = places;
        this.tarif = tarif;
        this.heureGarantie = heureGarantie;
    }

    public Integer getId() { return id; }
    public Liaison getLiaison() { return liaison; }
    public void setLiaison(Liaison liaison) { this.liaison = liaison; }
    public LocalTime getHeure() { return heure; }
    public void setHeure(LocalTime heure) { this.heure = heure; }
    public String getJours() { return jours; }
    public void setJours(String jours) { this.jours = jours; }
    public Integer getPlaces() { return places; }
    public void setPlaces(Integer places) { this.places = places; }
    public Integer getTarif() { return tarif; }
    public void setTarif(Integer tarif) { this.tarif = tarif; }
    public boolean isHeureGarantie() { return heureGarantie; }
    public void setHeureGarantie(boolean heureGarantie) { this.heureGarantie = heureGarantie; }
}