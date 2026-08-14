package cm.merombe.backend.service;

import org.springframework.stereotype.Service;

import cm.merombe.backend.entity.Agence;
import cm.merombe.backend.entity.Utilisateur;

/**
 * Point centralise pour les notifications envoyees aux utilisateurs.
 * EN DEVELOPPEMENT : les messages s'affichent dans la console, comme
 * les codes de verification dans AuthService. A remplacer par un vrai
 * envoi SMS (Twilio ou un fournisseur local) en phase de production.
 */
@Service
public class NotificationService {

    public void notifierActivationAgence(Agence agence, Utilisateur responsable) {
        String message = String.format(
                "Bonjour %s, votre agence \"%s\" a ete validee sur MeRoMbe. "
                + "Vous pouvez desormais vous connecter et gerer votre offre.",
                responsable.getNom(), agence.getNom());

        envoyerSms(responsable.getTelephone(), message);
    }

    public void notifierSuspensionAgence(Agence agence, Utilisateur responsable) {
        String message = String.format(
                "Bonjour %s, votre agence \"%s\" a ete suspendue sur MeRoMbe. "
                + "Contactez le support pour plus d'informations.",
                responsable.getNom(), agence.getNom());

        envoyerSms(responsable.getTelephone(), message);
    }

    private void envoyerSms(String telephone, String message) {
        // EN DEVELOPPEMENT : affichage console uniquement.
        System.out.println(">>> SMS pour " + telephone + " : " + message);
    }
}