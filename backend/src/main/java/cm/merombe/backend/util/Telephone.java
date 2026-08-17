package cm.merombe.backend.util;

/**
 * Normalise les numeros camerounais vers un format unique : +237XXXXXXXXX.
 * Quelle que soit la facon dont l'utilisateur ou le frontend l'a saisi
 * (avec ou sans +237, avec des espaces), le meme numero produit toujours
 * la meme chaine en sortie. C'est ce qui garantit qu'un compte cree via
 * un formulaire et retrouve via un autre pointent vers le meme utilisateur.
 */
public final class Telephone {

    private Telephone() {
    }

    public static String normaliser(String saisie) {
        if (saisie == null) {
            throw new IllegalArgumentException("Numero de telephone requis");
        }

        // enleve tout ce qui n'est pas un chiffre ou un +
        String nettoye = saisie.replaceAll("[^0-9+]", "");

        String chiffres;
        if (nettoye.startsWith("+237")) {
            chiffres = nettoye.substring(4);
        } else if (nettoye.startsWith("237")) {
            chiffres = nettoye.substring(3);
        } else {
            chiffres = nettoye;
        }

        if (!chiffres.matches("[26]\\d{8}")) {
            throw new IllegalArgumentException(
                    "Numero de telephone invalide : attendu 9 chiffres commencant par 6 ou 2");
        }

        return "+237" + chiffres;
    }
}