package com.library.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;

    public JwtAuthFilter(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String token = jwtUtil.getTokenFromRequest(request);
        if (token != null && jwtUtil.isValid(token)) {
            Claims claims = jwtUtil.extractClaims(token);
            String role = claims.get("role", String.class);
            Long id = Long.parseLong(claims.getSubject());
            String name = claims.get("name", String.class);
            String email = claims.get("email", String.class);

            AuthUser authUser = new AuthUser(id, name, email, role);
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    authUser, null,
                    List.of(new SimpleGrantedAuthority("ROLE_" + role.toUpperCase()))
            );
            SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(request, response);
    }
}
