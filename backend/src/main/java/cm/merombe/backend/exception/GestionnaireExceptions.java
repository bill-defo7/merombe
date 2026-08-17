package cm.merombe.backend.exception;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Convertit les exceptions courantes en reponses JSON exploitables
 * par le frontend, plutot que la page d'erreur 500 par defaut de Spring.
 */
@RestControllerAdvice
public class GestionnaireExceptions {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<?> etatIllegal(IllegalStateException e) {
        // ces messages viennent de ContexteUtilisateur : ils signalent
        // un probleme d'acces (compte, agence), pas une erreur serveur
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accesRefuse(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(Map.of("erreur", e.getMessage()));
    }

    @ExceptionHandler(org.springframework.http.converter.HttpMessageNotReadableException.class)
    public ResponseEntity<?> corpsIllisible(org.springframework.http.converter.HttpMessageNotReadableException e) {
        return ResponseEntity.badRequest()
                .body(Map.of("erreur", "Donnees invalides : verifiez les valeurs saisies (nombre trop grand ?)"));
    }
}