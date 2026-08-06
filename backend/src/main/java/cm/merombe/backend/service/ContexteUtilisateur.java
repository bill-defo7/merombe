package cm.merombe.backend.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import cm.merombe.backend.entity.Agence;
import cm.merombe.backend.entity.Utilisateur;
import cm.merombe.backend.repository.UtilisateurRepository;

/**
 * Retrouve, a chaque requete, l'utilisateur connecte et son agence
 * en relisant la base. Un guichetier revoque ou reaffecte est ainsi
 * pris en compte immediatement, sans attendre l'expiration du jeton.
 */
@Service
public class ContexteUtilisateur {

    private final UtilisateurRepository utilisateurs;

    public ContexteUtilisateur(UtilisateurRepository utilisateurs) {
        this.utilisateurs = utilisateurs;
    }

    public Utilisateur utilisateurCourant() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (!(principal instanceof Integer id)) {
            throw new IllegalStateException("Aucun utilisateur authentifie");
        }
        return utilisateurs.trouverAvecAgence(id)
                .orElseThrow(() -> new IllegalStateException("Compte introuvable ou supprime"));
    }

    public Agence agenceCourante() {
        Utilisateur u = utilisateurCourant();
        Agence agence = u.getAgence();
        if (agence == null) {
            throw new IllegalStateException("Ce compte n'est rattache a aucune agence");
        }
        if (!"active".equals(agence.getStatut())) {
            throw new IllegalStateException("Agence non active");
        }
        return agence;
    }
}