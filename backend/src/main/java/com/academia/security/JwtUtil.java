package com.academia.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    // TODO mover a application.properties algún día
    private static final String SECRET = "academia-secret-key-2024-must-be-at-least-256-bits-long-for-hmac-sha";
    private static final long EXPIRACION = 86400000; // 24 horas

    private SecretKey obtenerClave() {
        return Keys.hmacShaKeyFor(SECRET.getBytes(StandardCharsets.UTF_8));
    }

    public String generarToken(String username, String rol) {
        return Jwts.builder()
                .subject(username)
                .claim("rol", rol)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + EXPIRACION))
                .signWith(obtenerClave())
                .compact();
    }

    public String obtenerUsername(String token) {
        return leerClaims(token).getSubject();
    }

    public String obtenerRol(String token) {
        return leerClaims(token).get("rol", String.class);
    }

    public boolean esValido(String token) {
        try {
            leerClaims(token);
            return true;
        } catch (JwtException e) {
            return false;
        }
    }

    private Claims leerClaims(String token) {
        return Jwts.parser()
                .verifyWith(obtenerClave())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
