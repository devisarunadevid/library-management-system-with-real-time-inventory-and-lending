package com.library.lms.librario.config;

import com.library.lms.librario.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    @Autowired
    private CustomUserDetailsService userDetailsService;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider();
        provider.setUserDetailsService(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return provider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                // ✅ Disable CSRF only for payment APIs (needed for Razorpay webhooks)
                .csrf(csrf -> csrf
                        .ignoringRequestMatchers("/api/payments/**")
                        .disable()
                )

                .cors(cors -> cors.configurationSource(corsConfigurationSource()))

                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))

                .authorizeHttpRequests(auth -> auth
                        // ✅ Public endpoints
                        .requestMatchers(
                                "/api/auth/**",
                                "/api/members/**",
                                "/api/membership-plans/**",
                                "/api/payments/**", // 👈 allow payment + webhook without login
                                "/api/books/count",
                                "/api/books/availability"

                        ).permitAll()

                        // ✅ Role-based secured endpoints
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")
                        .requestMatchers("/api/librarian/**").hasAnyRole("LIBRARIAN","ADMIN")
                        .requestMatchers("/api/books/**").hasAnyRole("ADMIN","LIBRARIAN","MEMBER")

                        // ✅ Everything else requires login
                        .anyRequest().authenticated()
                )

                .authenticationProvider(authenticationProvider())
                .formLogin(Customizer.withDefaults())
                .httpBasic(Customizer.withDefaults()); // 👈 add basic auth (optional)

        return http.build();
    }

    @Bean
    public WebSecurityCustomizer webSecurityCustomizer() {
        return web -> web.ignoring()
                .requestMatchers("/favicon.ico", "/error");
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();

    configuration.setAllowedOrigins(List.of(
            "http://localhost:5173",
            "https://library-management-system-with-real.vercel.app"
    ));

    configuration.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
    configuration.setAllowedHeaders(List.of("*"));
    configuration.setAllowCredentials(true);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);

    return source;
}
}
