# Backend CORS setup (required for the React app to call the API)

The React dev server runs on http://localhost:5173 and the Spring Boot API on
http://localhost:8080. Browsers block cross-origin calls unless the backend
explicitly allows them (CORS).

You have two options:

## Option A — Use the Vite proxy (already configured, simplest)
This project's `vite.config.js` proxies `/api` to `http://localhost:8080`, so the
browser sees same-origin requests and no backend change is needed **for local dev**.
Just run both servers and leave `VITE_API_BASE_URL=/api`. Nothing else to do.

## Option B — Enable CORS on the backend (needed for real deployment)
When the frontend is deployed to a different origin, add this class to the Spring
Boot project (package `com.fintech.bank.config`):

```java
package com.fintech.bank.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.cors.CorsConfigurationSource;
import java.util.List;

@Configuration
public class CorsConfig {
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration cfg = new CorsConfiguration();
        cfg.setAllowedOrigins(List.of("http://localhost:5173")); // add your prod URL too
        cfg.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        cfg.setAllowedHeaders(List.of("*"));
        cfg.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource src = new UrlBasedCorsConfigurationSource();
        src.registerCorsConfiguration("/**", cfg);
        return src;
    }
}
```

Then in `SecurityConfig.filterChain`, enable CORS (one line):

```java
http.cors(c -> {}); // picks up the CorsConfigurationSource bean above
```

(The `SecurityConfig` currently has `.csrf(csrf -> csrf.disable())` — add the
`.cors(...)` call right next to it.)
