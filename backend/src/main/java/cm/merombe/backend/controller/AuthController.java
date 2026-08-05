package cm.merombe.backend.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import cm.merombe.backend.service.AuthService;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/demander-code")
    public ResponseEntity<Map<String, String>> demanderCode(@RequestBody Map<String, String> corps) {
        String telephone = corps.get("telephone");
        if (telephone == null || telephone.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("erreur", "telephone manquant"));
        }
        authService.demanderCode(telephone);
        return ResponseEntity.ok(Map.of("message", "Code envoye"));
    }

    @PostMapping("/verifier-code")
    public ResponseEntity<Map<String, String>> verifierCode(@RequestBody Map<String, String> corps) {
        try {
            String jeton = authService.verifierCode(corps.get("telephone"), corps.get("code"));
            return ResponseEntity.ok(Map.of("jeton", jeton));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401).body(Map.of("erreur", e.getMessage()));
        }
    }
}