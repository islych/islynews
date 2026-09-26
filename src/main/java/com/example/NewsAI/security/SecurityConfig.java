package com.example.NewsAI.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.*;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtFilter jwtFilter;

    @Value("${app.cors.allowed-origin}")
    private String allowedOrigin;

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowedOrigins(List.of(allowedOrigin.split(",")));
        config.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        config.setAllowedHeaders(List.of("*"));
        config.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http.csrf(csrf -> csrf.disable());
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()));

        http.authorizeHttpRequests(auth -> auth
                // Auth publique
                .requestMatchers("/auth/register/**", "/auth/login").permitAll()
                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**", "/swagger-ui.html").permitAll()
                .requestMatchers("/actuator/health").permitAll()
                .requestMatchers("/auth/me").authenticated()
                .requestMatchers("/notifications/**").authenticated()
                .requestMatchers(HttpMethod.GET, "/uploads/images/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/uploads/images").hasAnyRole("JOURNALIST", "ADMIN")

                // Workflow éditorial protégé (avant les routes GET publiques génériques)
                .requestMatchers(HttpMethod.GET, "/articles/admin/all", "/articles/review-queue").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/articles/my-articles").hasRole("JOURNALIST")
                .requestMatchers(HttpMethod.POST, "/articles/*/approve", "/articles/*/reject").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/articles/*/submit").hasRole("JOURNALIST")
                .requestMatchers(HttpMethod.GET, "/articles/*/summary").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/articles/*/analysis", "/articles/*/related").hasAnyRole("USER", "JOURNALIST", "ADMIN")

                // Consultation publique (Guest)
                .requestMatchers(HttpMethod.GET, "/articles").permitAll()
                .requestMatchers(HttpMethod.GET, "/articles/**").permitAll()
                .requestMatchers(HttpMethod.GET, "/comments/**").permitAll()

                // External News API (NewsAPI)
                .requestMatchers(HttpMethod.GET, "/api/external-news/**").permitAll()
                .requestMatchers(HttpMethod.POST, "/api/ai/analyze").hasAnyRole("USER", "JOURNALIST", "ADMIN")

                // Imported Articles : user connecté
                .requestMatchers(HttpMethod.POST, "/imported-articles").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/imported-articles/me").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/imported-articles/check").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/imported-articles/user/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/imported-articles/toggle").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/imported-articles/**").hasAnyRole("USER", "JOURNALIST", "ADMIN")

                // Journaliste : publier, modifier et supprimer SES articles
                .requestMatchers(HttpMethod.POST, "/articles").hasRole("JOURNALIST")
                .requestMatchers(HttpMethod.GET, "/articles/my-articles").hasRole("JOURNALIST")
                .requestMatchers(HttpMethod.PUT, "/articles/**").hasAnyRole("JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/articles/**").hasAnyRole("JOURNALIST", "ADMIN")

                // User connecté : liker, commenter, sauvegarder
                .requestMatchers(HttpMethod.POST, "/likes").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/likes/check/**").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/likes/count/**").permitAll()
                .requestMatchers(HttpMethod.DELETE, "/likes/**").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/comments").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.POST, "/saved-articles").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/saved-articles/**").hasAnyRole("USER", "JOURNALIST", "ADMIN")
                .requestMatchers(HttpMethod.GET, "/saved-articles/**").hasAnyRole("USER", "JOURNALIST", "ADMIN")

                // Admin uniquement
                .requestMatchers(HttpMethod.DELETE, "/comments/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.POST, "/users/journalist").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/users").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.PUT, "/users/me/bio").hasRole("JOURNALIST")
                .requestMatchers(HttpMethod.PUT, "/users/**").hasRole("ADMIN")
                .requestMatchers(HttpMethod.GET, "/admin/**").hasRole("ADMIN")

                .anyRequest().denyAll());

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
