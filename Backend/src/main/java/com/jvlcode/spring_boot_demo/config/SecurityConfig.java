package com.jvlcode.spring_boot_demo.config;

import com.jvlcode.spring_boot_demo.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(
            AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        
        // ✅ Allow your frontend origins
        config.setAllowedOriginPatterns(Arrays.asList(
            "http://localhost:*",
            "http://127.0.0.1:*",
            "https://admin-module-wuq1.vercel.app/*",
            "https://student-management-backend-iftd.onrender.com/*"
        ));
        
        // ✅ Allow all HTTP methods
        config.setAllowedMethods(Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"
        ));
        
        // ✅ Allow all headers
        config.setAllowedHeaders(Arrays.asList("*"));
        
        // ✅ CRITICAL: Expose headers needed for file downloads
        config.setExposedHeaders(Arrays.asList(
            "Authorization", 
            "Content-Type", 
            "Content-Disposition",  // ✅ For filename
            "Content-Length",        // ✅ For file size
            "Cache-Control",
            "Pragma",
            "Expires"
        ));
        
        config.setAllowCredentials(true);
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )
            .authorizeHttpRequests(auth -> auth
                // ✅ Allow OPTIONS requests (CORS preflight)
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                
                // ✅ Public endpoints
                .requestMatchers("/api/admin/login").permitAll()
                .requestMatchers("/api/teacher/login").permitAll()
                .requestMatchers("/api/student/login").permitAll()
                .requestMatchers("/api/setup/**").permitAll()
                
                // ✅ Admin routes
                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                
                // ✅ Teacher routes (including downloads)
                .requestMatchers("/api/teacher/**").hasRole("TEACHER")
                
                // ✅ Student routes
                .requestMatchers("/api/student/**").hasRole("STUDENT")
                
                // ✅ All other requests must be authenticated
                .anyRequest().authenticated()
            );

        http.addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}