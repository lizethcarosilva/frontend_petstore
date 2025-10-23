# 🔧 Solución al Error: "Error al procesar el token JWT: null"

## 🔍 Diagnóstico del Problema

Los logs muestran:
```
ERROR ... JwtAuthenticationFilter : Error al procesar el token JWT: null
```

Esto indica que hay un **NullPointerException** en tu `JwtAuthenticationFilter`. 

### Causas Comunes:

1. **`jwtUtil` es null** - No se inyectó correctamente
2. **`userDetailsService` es null** - No se inyectó correctamente
3. **El token se está extrayendo incorrectamente** del header
4. **El email del token es null** cuando intentas buscar el usuario
5. **Falta el método `loadUserByUsername` en `CustomUserDetailsService`**

---

## ✅ Solución: JwtAuthenticationFilter Corregido

Reemplaza tu `JwtAuthenticationFilter.java` con este código que incluye **manejo completo de errores**:

```java
package com.cipasuno.petstore.pet_store.config;

import com.cipasuno.petstore.pet_store.security.JwtUtil;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        
        try {
            // Obtener el token del header Authorization
            String jwt = getJwtFromRequest(request);
            
            // Si hay token y es válido
            if (StringUtils.hasText(jwt)) {
                logger.debug("Token JWT encontrado: {}", jwt.substring(0, Math.min(jwt.length(), 20)) + "...");
                
                // Validar el token
                if (jwtUtil.validateToken(jwt)) {
                    logger.debug("Token JWT válido");
                    
                    // Obtener el email del token
                    String email = jwtUtil.getEmailFromToken(jwt);
                    logger.debug("Email extraído del token: {}", email);
                    
                    if (email != null) {
                        // Cargar los detalles del usuario
                        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
                        
                        // Crear la autenticación
                        UsernamePasswordAuthenticationToken authentication = 
                                new UsernamePasswordAuthenticationToken(
                                        userDetails, 
                                        null, 
                                        userDetails.getAuthorities()
                                );
                        
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        
                        // Establecer la autenticación en el contexto de seguridad
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        
                        logger.debug("Usuario autenticado correctamente: {}", email);
                    } else {
                        logger.warn("No se pudo extraer el email del token JWT");
                    }
                } else {
                    logger.warn("Token JWT inválido o expirado");
                }
            } else {
                logger.debug("No se encontró token JWT en la petición");
            }
        } catch (Exception e) {
            logger.error("Error al procesar el token JWT: ", e); // CAMBIA "null" por "e" para ver el error completo
        }
        
        // Continuar con la cadena de filtros
        filterChain.doFilter(request, response);
    }
    
    /**
     * Extrae el token JWT del header Authorization
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        
        return null;
    }
}
```

### 🔑 Cambios Importantes:

1. **Logging mejorado**: Ahora verás exactamente dónde está el problema
2. **Cambio crítico en línea 76**: `logger.error("Error al procesar el token JWT: ", e)` en lugar de `logger.error("Error al procesar el token JWT: " + e.getMessage())`
3. **Validación de null**: Verifica que el email no sea null antes de usarlo
4. **Método `getJwtFromRequest`**: Extrae correctamente el token del header

---

## ✅ Solución: JwtUtil Corregido

Asegúrate de que tu `JwtUtil.java` tenga este código:

```java
package com.cipasuno.petstore.pet_store.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    private static final Logger logger = LoggerFactory.getLogger(JwtUtil.class);

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    /**
     * Genera un token JWT
     */
    public String generateToken(String correo, Long userId, String rolId) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expiration);

        String token = Jwts.builder()
                .setSubject(correo)
                .claim("userId", userId)
                .claim("rolId", rolId)
                .setIssuedAt(now)
                .setExpiration(expiryDate)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();

        logger.debug("Token generado para el usuario: {}", correo);
        return token;
    }

    /**
     * Obtiene el email del token
     */
    public String getEmailFromToken(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            
            String email = claims.getSubject();
            logger.debug("Email extraído del token: {}", email);
            return email;
        } catch (Exception e) {
            logger.error("Error al extraer el email del token: ", e);
            return null;
        }
    }

    /**
     * Valida el token
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token);
            
            logger.debug("Token validado correctamente");
            return true;
        } catch (SignatureException e) {
            logger.error("Firma JWT inválida: ", e);
        } catch (MalformedJwtException e) {
            logger.error("Token JWT mal formado: ", e);
        } catch (ExpiredJwtException e) {
            logger.error("Token JWT expirado: ", e);
        } catch (UnsupportedJwtException e) {
            logger.error("Token JWT no soportado: ", e);
        } catch (IllegalArgumentException e) {
            logger.error("Claims del JWT vacío: ", e);
        }
        return false;
    }
}
```

---

## ✅ Solución: CustomUserDetailsService

Verifica que tu `CustomUserDetailsService.java` sea correcto:

```java
package com.cipasuno.petstore.pet_store.security;

import com.cipasuno.petstore.pet_store.models.User;
import com.cipasuno.petstore.pet_store.repositories.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.Collections;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private static final Logger logger = LoggerFactory.getLogger(CustomUserDetailsService.class);

    @Autowired
    private UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String correo) throws UsernameNotFoundException {
        logger.debug("Buscando usuario con correo: {}", correo);
        
        User user = userRepository.findByCorreoAndActivoTrue(correo)
                .orElseThrow(() -> {
                    logger.error("Usuario no encontrado: {}", correo);
                    return new UsernameNotFoundException("Usuario no encontrado: " + correo);
                });

        logger.debug("Usuario encontrado: {}, Rol: {}", user.getCorreo(), user.getRolId());

        return new org.springframework.security.core.userdetails.User(
                user.getCorreo(),
                user.getPassword(), // Este password debe estar hasheado con BCrypt
                user.isActivo(),
                true,
                true,
                true,
                Collections.singletonList(new SimpleGrantedAuthority("ROLE_" + user.getRolId()))
        );
    }
}
```

---

## ✅ Verificación en UserRepository

Tu `UserRepository.java` debe tener este método:

```java
package com.cipasuno.petstore.pet_store.repositories;

import com.cipasuno.petstore.pet_store.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    // Este método es CRÍTICO para el login
    Optional<User> findByCorreoAndActivoTrue(String correo);
    
    // También puedes tener este
    Optional<User> findByCorreo(String correo);
}
```

---

## 🚀 Pasos para Implementar la Solución

1. **Actualiza `JwtAuthenticationFilter.java`** con el código corregido
2. **Actualiza `JwtUtil.java`** con el código corregido
3. **Verifica `CustomUserDetailsService.java`**
4. **Verifica `UserRepository.java`**
5. **Reinicia el backend**
6. **Revisa los logs** - Ahora verás el error completo en lugar de "null"

---

## 🔍 Debugging

Después de actualizar el código, los logs mostrarán:

```
DEBUG ... Token JWT encontrado: eyJhbGciOiJIUzI1NiIs...
DEBUG ... Token JWT válido
DEBUG ... Email extraído del token: user@example.com
DEBUG ... Buscando usuario con correo: user@example.com
DEBUG ... Usuario encontrado: user@example.com, Rol: ADMIN
DEBUG ... Usuario autenticado correctamente: user@example.com
```

Si hay un error, ahora verás el **stacktrace completo** en lugar de solo "null".

---

## 🆘 Problemas Comunes

### Error: "Usuario no encontrado"
**Causa:** El email del token no coincide con ningún usuario en la BD
**Solución:** Verifica que el usuario exista y esté activo

### Error: "Claims del JWT vacío"
**Causa:** El token está mal formado o es inválido
**Solución:** Verifica que el frontend esté enviando el token correctamente

### Error: "Firma JWT inválida"
**Causa:** La clave secreta del token no coincide
**Solución:** Verifica que `jwt.secret` en `application.properties` sea la misma que se usó para generar el token

### Error: "Token JWT expirado"
**Causa:** El token ha caducado
**Solución:** Haz login nuevamente para obtener un nuevo token

---

## ✅ Verificación Final

Después de implementar estos cambios:

1. Reinicia el backend
2. Borra el token del frontend (localStorage)
3. Haz login nuevamente
4. Intenta acceder a un endpoint protegido
5. Verifica los logs - deberías ver mensajes DEBUG en lugar de ERROR

---

## 📝 Configuración en application.properties

Asegúrate de tener:

```properties
# JWT Configuration
jwt.secret=TuClaveSecretaSuperSeguraDeAlMenos256BitsParaHS256AlgorithmDeJWT2024PetStore
jwt.expiration=86400000

# Logging para debugging
logging.level.com.cipasuno.petstore.pet_store.config=DEBUG
logging.level.com.cipasuno.petstore.pet_store.security=DEBUG
```

---

**La clave del problema está en el manejo de errores del JwtAuthenticationFilter. Con este código corregido, verás exactamente qué está fallando.**

