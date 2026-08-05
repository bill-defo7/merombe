package cm.merombe.backend.security;

import java.util.Date;

import javax.crypto.SecretKey;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

@Service
public class JwtService {

    private final SecretKey clef;
    private final long dureeMs;

    public JwtService(@Value("${merombe.jwt.secret}") String secret,
                      @Value("${merombe.jwt.duree-ms}") long dureeMs) {
        this.clef = Keys.hmacShaKeyFor(secret.getBytes());
        this.dureeMs = dureeMs;
    }

    public String genererJeton(Integer utilisateurId, String telephone, String role) {
        Date maintenant = new Date();
        return Jwts.builder()
                .subject(telephone)
                .claim("id", utilisateurId)
                .claim("role", role)
                .issuedAt(maintenant)
                .expiration(new Date(maintenant.getTime() + dureeMs))
                .signWith(clef)
                .compact();
    }

    public Claims lireJeton(String jeton) {
        return Jwts.parser()
                .verifyWith(clef)
                .build()
                .parseSignedClaims(jeton)
                .getPayload();
    }
}