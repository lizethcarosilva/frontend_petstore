# 🔒 Configuración de Spring Security - Solución al Error 403

## 🎯 Problema Actual

El frontend funciona perfectamente y envía el token JWT en cada petición con el header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

Sin embargo, **Spring Security está bloqueando todas las peticiones protegidas** porque:
1. ❌ Los endpoints están protegidos por defecto
2. ❌ No hay configuración para validar el token JWT
3. ❌ Resultado: `403 Forbidden` en todas las peticiones

---

## ✅ Solución Rápida (Para Pruebas Inmediatas)

### Opción A: Deshabilitar Spring Security Temporalmente

**Archivo:** `src/main/resources/application.properties`

Agrega esta línea:
```properties
spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration
```

**Resultado:** El backend permitirá todas las peticiones sin autenticación.

⚠️ **IMPORTANTE:** Esta solución es SOLO para desarrollo/pruebas. NO usar en producción.

---

## 🏗️ Solución Completa (Producción)

### 1. Agregar Dependencias

**Archivo:** `pom.xml`

```xml
<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- JWT -->
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-api</artifactId>
    <version>0.11.5</version>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-impl</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
<dependency>
    <groupId>io.jsonwebtoken</groupId>
    <artifactId>jjwt-jackson</artifactId>
    <version>0.11.5</version>
    <scope>runtime</scope>
</dependency>
```

### 2. Configuración en application.properties

```properties
# JWT Configuration
jwt.secret=TuClaveSecretaSuperSeguraDeAlMenos256BitsParaHS256AlgorithmDeJWT2024
jwt.expiration=86400000
# 86400000 ms = 24 horas

# CORS Configuration
cors.allowed.origins=http://localhost:5173,http://localhost:3000
```

### 3. Crear JwtUtil.java

**Archivo:** `src/main/java/com/yourpackage/security/JwtUtil.java`

```java
package com.yourpackage.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String generateToken(String correo, Long userId, String rolId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        return Jwts.builder()
                .setSubject(correo)
                .claim("userId", userId)
                .claim("rolId", rolId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String getEmailFromToken(String token) {
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
        return claims.getSubject();
    }

    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }
}
```

### 4. Crear JwtAuthenticationFilter.java

**Archivo:** `src/main/java/com/yourpackage/security/JwtAuthenticationFilter.java`

```java
package com.yourpackage.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        String authHeader = request.getHeader("Authorization");
        
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            
            try {
                if (jwtUtil.validateToken(token)) {
                    String email = jwtUtil.getEmailFromToken(token);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                    
                    UsernamePasswordAuthenticationToken authentication = 
                            new UsernamePasswordAuthenticationToken(
                                    userDetails, null, userDetails.getAuthorities());
                    
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                }
            } catch (Exception e) {
                logger.error("Could not set user authentication in security context", e);
            }
        }
        
        filterChain.doFilter(request, response);
    }
}
```

### 5. Crear CustomUserDetailsService.java

**Archivo:** `src/main/java/com/yourpackage/security/CustomUserDetailsService.java`

```java
package com.yourpackage.security;

import com.yourpackage.model.User;
import com.yourpackage.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        User user = userRepository.findByCorreo(correo)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + correo));

        return new org.springframework.security.core.userdetails.User(
                user.getCorreo(),
                user.getPassword(),
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRolId()))
        );
    }
}
```

### 6. Crear SecurityConfig.java

**Archivo:** `src/main/java/com/yourpackage/config/SecurityConfig.java`

```java
package com.yourpackage.config;

import com.yourpackage.security.JwtAuthenticationFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @Value("${cors.allowed.origins}")
    private String allowedOrigins;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Endpoints públicos (sin autenticación)
                .requestMatchers("/api/users/login").permitAll()
                .requestMatchers("/api/users/create").permitAll()
                
                // Todos los demás endpoints requieren autenticación
                .anyRequest().authenticated()
            )
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins.split(",")));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(Arrays.asList("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);
        
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }
}
```

### 7. Actualizar UserController.java (Login)

**Archivo:** `src/main/java/com/yourpackage/controller/UserController.java`

```java
@Autowired
private JwtUtil jwtUtil;

@Autowired
private PasswordEncoder passwordEncoder;

@PostMapping("/login")
public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
    try {
        User user = userRepository.findByCorreo(loginRequest.getCorreo())
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("Contraseña incorrecta");
        }

        if (!user.isActivo()) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("Usuario inactivo");
        }

        // Generar token JWT
        String token = jwtUtil.generateToken(
                user.getCorreo(),
                user.getUserId(),
                user.getRolId()
        );

        // Crear respuesta
        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("userId", user.getUserId());
        response.put("name", user.getName());
        response.put("ident", user.getIdent());
        response.put("correo", user.getCorreo());
        response.put("telefono", user.getTelefono());
        response.put("direccion", user.getDireccion());
        response.put("rolId", user.getRolId());
        response.put("activo", user.isActivo());
        response.put("created_on", user.getCreatedOn());

        return ResponseEntity.ok(response);
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body("Error en el login: " + e.getMessage());
    }
}
```

### 8. Crear UserRepository con findByCorreo

**Archivo:** `src/main/java/com/yourpackage/repository/UserRepository.java`

```java
package com.yourpackage.repository;

import com.yourpackage.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByCorreo(String correo);
}
```

---

## 🚀 Pasos para Implementar

### Si quieres probar RÁPIDO (5 minutos):
1. Abre `application.properties`
2. Agrega: `spring.autoconfigure.exclude=org.springframework.boot.autoconfigure.security.servlet.SecurityAutoConfiguration`
3. Reinicia el backend
4. ✅ ¡Listo! El frontend funcionará perfectamente

### Si quieres implementar SEGURIDAD REAL (30-45 minutos):
1. Agrega las dependencias en `pom.xml`
2. Actualiza `application.properties` con la configuración JWT
3. Crea los archivos de seguridad:
   - `JwtUtil.java`
   - `JwtAuthenticationFilter.java`
   - `CustomUserDetailsService.java`
   - `SecurityConfig.java`
4. Actualiza `UserController.java` para generar tokens
5. Actualiza `UserRepository.java` con el método `findByCorreo`
6. Reinicia el backend
7. ✅ ¡Seguridad completa implementada!

---

## 🔍 Verificación

Después de implementar, verifica que:
- ✅ Login devuelve un token JWT
- ✅ El token se envía en las peticiones con `Authorization: Bearer {token}`
- ✅ Los endpoints protegidos aceptan el token
- ✅ No hay errores 403 Forbidden

---

## 📝 Notas Importantes

1. **El frontend YA está listo** - No necesita cambios
2. **El problema está 100% en el backend** - Falta configurar Spring Security
3. **Usa la solución rápida** para probar inmediatamente
4. **Implementa la solución completa** para producción
5. **La clave secreta** en production debe ser segura y estar en variables de entorno

---

## 🆘 Problemas Comunes

### Error: "Cannot find symbol: class JwtUtil"
- Solución: Crea el archivo `JwtUtil.java` en el paquete correcto

### Error: "Bean not found"
- Solución: Verifica que todas las clases tengan las anotaciones correctas (@Component, @Service, @Configuration)

### Error: "Failed to configure a DataSource"
- Solución: Verifica la configuración de tu base de datos en `application.properties`

### Sigue dando 403
- Solución: Verifica que el `SecurityConfig` tenga `.requestMatchers("/api/users/login").permitAll()`

---

## ✅ Estado Actual

- ✅ Frontend: **100% Funcional**
- ❌ Backend: **Necesita configurar Spring Security**
- 🎯 Objetivo: **Validar tokens JWT en el backend**

---

**Frontend está perfecto. Backend necesita la configuración de seguridad.**
