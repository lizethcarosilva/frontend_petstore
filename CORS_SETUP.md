# Configuración de CORS para el Backend

Para que el frontend pueda comunicarse correctamente con el backend, es necesario configurar CORS en el servidor Spring Boot.

## Error Actual

```
Access to XMLHttpRequest at 'http://localhost:8090/api/users' from origin 'http://localhost:5173' 
has been blocked by CORS policy: Response to preflight request doesn't pass access control check: 
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

## Solución

Agrega la siguiente configuración al backend de Spring Boot:

### 1. Crear clase de configuración CORS

Crea un archivo `CorsConfig.java` en tu paquete de configuración:

```java
package com.tuapp.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

import java.util.Arrays;

@Configuration
public class CorsConfig {
    
    @Bean
    public CorsFilter corsFilter() {
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        CorsConfiguration config = new CorsConfiguration();
        
        // Permitir credenciales
        config.setAllowCredentials(true);
        
        // Permitir el origen del frontend
        config.addAllowedOrigin("http://localhost:5173");
        
        // Permitir todos los headers
        config.addAllowedHeader("*");
        
        // Permitir todos los métodos HTTP
        config.addAllowedMethod("*");
        
        // Exponer el header Authorization
        config.setExposedHeaders(Arrays.asList("Authorization"));
        
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
```

### 2. Configuración Alternativa (Si tienes Spring Security)

Si estás usando Spring Security, agrega esto a tu `SecurityConfig`:

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors().and()
            .csrf().disable()
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/users/login").permitAll()
                .anyRequest().authenticated()
            )
            .sessionManagement()
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS);
                
        return http.build();
    }
    
    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setExposedHeaders(Arrays.asList("Authorization"));
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
```

### 3. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto frontend:

```env
VITE_API_URL=http://localhost:8090
```

## Verificación

Después de aplicar estos cambios:

1. Reinicia el servidor backend
2. Reinicia el servidor frontend
3. Verifica que las llamadas al API funcionen correctamente

## Headers de Autorización

El frontend ya está configurado para enviar el token de autorización en el header:

```javascript
Authorization: Bearer {token}
```

El interceptor de Axios automáticamente agrega este header a todas las peticiones cuando el usuario está autenticado.

