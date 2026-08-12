package cm.merombe.backend.service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Optional;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cm.merombe.backend.entity.CodeVerification;
import cm.merombe.backend.entity.Utilisateur;
import cm.merombe.backend.repository.CodeVerificationRepository;
import cm.merombe.backend.repository.UtilisateurRepository;
import cm.merombe.backend.security.JwtService;

@Service
public class AuthService {

    private static final int DUREE_VALIDITE_MINUTES = 5;

    private final CodeVerificationRepository codes;
    private final UtilisateurRepository utilisateurs;
    private final JwtService jwtService;
    private final SecureRandom aleatoire = new SecureRandom();

    public AuthService(CodeVerificationRepository codes,
                       UtilisateurRepository utilisateurs,
                       JwtService jwtService) {
        this.codes = codes;
        this.utilisateurs = utilisateurs;
        this.jwtService = jwtService;
    }

    @Transactional
    public void demanderCode(String telephone) {
        String code = String.format("%06d", aleatoire.nextInt(1_000_000));
        LocalDateTime expiration = LocalDateTime.now().plusMinutes(DUREE_VALIDITE_MINUTES);

        codes.save(new CodeVerification(telephone, code, expiration));

        // EN DEVELOPPEMENT : le code s'affiche dans la console.
        // A remplacer par un envoi SMS reel en phase 5.
        System.out.println(">>> Code de verification pour " + telephone + " : " + code);
    }

    @Transactional
    public String verifierCode(String telephone, String codeSaisi) {
        CodeVerification enregistre = codes
                .findFirstByTelephoneAndUtiliseFalseOrderByCreeLeDesc(telephone)
                .orElseThrow(() -> new IllegalArgumentException("Aucun code en attente pour ce numero"));

        if (enregistre.estExpire()) {
            throw new IllegalArgumentException("Code expire, demandez-en un nouveau");
        }
        if (!enregistre.getCode().equals(codeSaisi)) {
            throw new IllegalArgumentException("Code incorrect");
        }

        // un code ne sert qu'une seule fois
        enregistre.setUtilise(true);

        // premier passage : on cree le compte voyageur.
        // Le numero de telephone suffit, pas d'inscription separee.
        Utilisateur utilisateur = utilisateurs.findByTelephone(telephone)
                .orElseGet(() -> {
                    Utilisateur nouveau = new Utilisateur(telephone);
                    System.out.println(">>> Nouveau compte voyageur : " + telephone);
                    return utilisateurs.save(nouveau);
                });

        return jwtService.genererJeton(
                utilisateur.getId(), utilisateur.getTelephone(), utilisateur.getRole());
    }
}