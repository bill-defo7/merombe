package cm.merombe.backend.entity;

import java.time.LocalDateTime;

import jakarta.persistence.*;

@Entity
@Table(name = "code_verification")
public class CodeVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, length = 20)
    private String telephone;

    @Column(nullable = false, length = 6)
    private String code;

    @Column(name = "expire_le", nullable = false)
    private LocalDateTime expireLe;

    @Column(nullable = false)
    private boolean utilise = false;

    @Column(name = "cree_le", nullable = false)
    private LocalDateTime creeLe = LocalDateTime.now();

    protected CodeVerification() {
    }

    public CodeVerification(String telephone, String code, LocalDateTime expireLe) {
        this.telephone = telephone;
        this.code = code;
        this.expireLe = expireLe;
    }

    public Integer getId() { return id; }
    public String getTelephone() { return telephone; }
    public String getCode() { return code; }
    public LocalDateTime getExpireLe() { return expireLe; }
    public boolean isUtilise() { return utilise; }
    public void setUtilise(boolean utilise) { this.utilise = utilise; }
    public LocalDateTime getCreeLe() { return creeLe; }

    public boolean estExpire() {
        return LocalDateTime.now().isAfter(expireLe);
    }
}