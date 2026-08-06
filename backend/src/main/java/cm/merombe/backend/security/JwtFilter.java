package cm.merombe.backend.security;

import java.io.IOException;
import java.util.List;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtService jwtService;

    public JwtFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest requete,
                                    HttpServletResponse reponse,
                                    FilterChain chaine) throws ServletException, IOException {

        String entete = requete.getHeader("Authorization");

        if (entete != null && entete.startsWith("Bearer ")) {
            String jeton = entete.substring(7);
            try {
               Claims donnees = jwtService.lireJeton(jeton);
                Integer utilisateurId = donnees.get("id", Integer.class);
                String role = donnees.get("role", String.class);

                var autorites = List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()));

                // on place l'identifiant comme principal : le controleur
                // pourra relire l'utilisateur en base a chaque requete
                var authentification = new UsernamePasswordAuthenticationToken(
                        utilisateurId, null, autorites);
                SecurityContextHolder.getContext().setAuthentication(authentification);

            } catch (Exception e) {
                // jeton invalide ou expire : on laisse passer sans authentifier,
                // la configuration de securite refusera l'acces plus loin
                SecurityContextHolder.clearContext();
            }
        }

        chaine.doFilter(requete, reponse);
    }
}