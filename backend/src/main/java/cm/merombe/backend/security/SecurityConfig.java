package cm.merombe.backend.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    public SecurityConfig(JwtFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    SecurityFilterChain chaineDeSecurite(HttpSecurity http) throws Exception {
        http
            // API sans formulaire HTML : la protection CSRF ne s'applique pas
            .csrf(csrf -> csrf.disable())

            // aucune session serveur : chaque requete porte son jeton
            .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

            .authorizeHttpRequests(regles -> regles
                // ouvert a tous : c'est la porte d'entree
                .requestMatchers("/api/auth/**").permitAll()

                // consultation libre pour le voyageur non connecte
                .requestMatchers(HttpMethod.GET, "/api/villes/**", "/api/agences/**", "/api/locaux/**", "/api/recherche/**").permitAll()

                // espaces reserves par role
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                .requestMatchers("/api/agence/**").hasAnyRole("GUICHETIER", "ADMIN")
                .requestMatchers("/api/embarquement/**").hasAnyRole("AGENT", "ADMIN")

                // tout le reste demande une connexion
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)

            // pas de formulaire de connexion ni de fenetre du navigateur
            .formLogin(f -> f.disable())
            .httpBasic(b -> b.disable());

        return http.build();
    }
}