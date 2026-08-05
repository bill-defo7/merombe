package cm.merombe.backend.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cm.merombe.backend.entity.CodeVerification;

public interface CodeVerificationRepository extends JpaRepository<CodeVerification, Integer> {

    // le code le plus recent et non encore utilise pour ce numero
    Optional<CodeVerification> findFirstByTelephoneAndUtiliseFalseOrderByCreeLeDesc(String telephone);
}