package com.clothing.gateway.filter;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.gateway.filter.GatewayFilterChain;
import org.springframework.cloud.gateway.filter.GlobalFilter;
import org.springframework.core.Ordered;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;
import org.springframework.http.HttpCookie;
import reactor.core.publisher.Mono;

import java.security.Key;
import java.util.List;

@Component
public class JwtAuthFilter implements GlobalFilter, Ordered {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${internal.api.key}")
    private String internalApiKey;

    /**
     * Paths that do NOT require authentication.
     */
    private static final List<String> OPEN_PATHS = List.of(
            "/auth/",
            "/v3/api-docs",
            "/swagger-ui",
            "/actuator",
            "/store/");

    @Override
    public Mono<Void> filter(ServerWebExchange exchange, GatewayFilterChain chain) {
        String path = exchange.getRequest().getURI().getPath();

        // Always inject the Internal API Key into the request headers for downstream authentication
        ServerHttpRequest.Builder requestBuilder = exchange.getRequest().mutate()
                .header("X-Internal-Api-Key", internalApiKey);

        // For open paths, skip mandatory JWT auth but still forward the token if present
        // This is needed for endpoints like /auth/me which are open at the gateway level
        // but require auth at the downstream service level
        if (isOpenPath(path) || path.matches("/media/.+/view")) {
            HttpCookie openPathCookie = exchange.getRequest().getCookies().getFirst("accessToken");
            if (openPathCookie != null) {
                requestBuilder.header(HttpHeaders.AUTHORIZATION, "Bearer " + openPathCookie.getValue());
            }
            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
        }

        // Allow OPTIONS requests for CORS preflight
        if (exchange.getRequest().getMethod().name().equals("OPTIONS")) {
            return chain.filter(exchange);
        }

        // Extract token from Cookies or Authorization header
        String token = null;
        HttpCookie cookie = exchange.getRequest().getCookies().getFirst("accessToken");
        if (cookie != null) {
            token = cookie.getValue();
        }
        
        if (token == null) {
            String authHeader = exchange.getRequest().getHeaders().getFirst(HttpHeaders.AUTHORIZATION);
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                token = authHeader.substring(7);
            }
        }

        if (token == null) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }

        try {
            Claims claims = extractAllClaims(token);

            // Enrich the request with user info headers for downstream services
            requestBuilder
                    .header("X-User-Email", claims.getSubject())
                    .header("X-User-Role", claims.get("role", String.class))
                    .header("X-Shop-Id", claims.get("shopId", String.class))
                    .header("X-User-Id", claims.get("userId", String.class));

            return chain.filter(exchange.mutate().request(requestBuilder.build()).build());
        } catch (Exception e) {
            exchange.getResponse().setStatusCode(HttpStatus.UNAUTHORIZED);
            return exchange.getResponse().setComplete();
        }
    }

    private boolean isOpenPath(String path) {
        return OPEN_PATHS.stream().anyMatch(path::startsWith);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private Key getSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        return Keys.hmacShaKeyFor(keyBytes);
    }

    @Override
    public int getOrder() {
        return -1; // Run before route filters
    }
}
